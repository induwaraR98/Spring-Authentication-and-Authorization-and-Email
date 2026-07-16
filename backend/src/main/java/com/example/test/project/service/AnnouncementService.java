package com.example.test.project.service;

import com.example.test.project.model.Announcement;
import com.example.test.project.model.AnnouncementRead;
import com.example.test.project.model.AnnouncementAttachment;
import com.example.test.project.model.Event;
import com.example.test.project.model.Users;
import com.example.test.project.model.Booking;
import com.example.test.project.repo.AnnouncementRepo;
import com.example.test.project.repo.AnnouncementReadRepo;
import com.example.test.project.repo.AnnouncementAttachmentRepo;
import com.example.test.project.repo.UserRepo;
import com.example.test.project.repo.BookingRepo;
import com.example.test.project.emaildemo.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepo announcementRepo;

    @Autowired
    private AnnouncementReadRepo readRepo;

    @Autowired
    private AnnouncementAttachmentRepo attachmentRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private BookingRepo bookingRepo;

    @Autowired
    private EmailService emailService;

    public List<Announcement> getAllAnnouncements() {
        return announcementRepo.findAll();
    }

    public Announcement getAnnouncementById(int id) {
        return announcementRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
    }

    public Announcement createAnnouncement(Announcement announcement) {
        announcement.setStatus("DRAFT");
        return announcementRepo.save(announcement);
    }

    public Announcement updateAnnouncement(int id, Announcement updatedData) {
        Announcement existing = getAnnouncementById(id);

        existing.setTitle(updatedData.getTitle());
        existing.setContent(updatedData.getContent());
        existing.setSummary(updatedData.getSummary());
        existing.setCategory(updatedData.getCategory());
        existing.setPriority(updatedData.getPriority());
        existing.setPublishDate(updatedData.getPublishDate());
        existing.setExpirationDate(updatedData.getExpirationDate());
        existing.setStatus(updatedData.getStatus());
        existing.setTargetAudience(updatedData.getTargetAudience());
        existing.setEvent(updatedData.getEvent());
        existing.setPinned(updatedData.isPinned());
        existing.setSendEmail(updatedData.isSendEmail());

        // Update attachments
        if (existing.getAttachments() != null) {
            existing.getAttachments().clear();
        } else {
            existing.setAttachments(new ArrayList<>());
        }
        if (updatedData.getAttachments() != null) {
            for (AnnouncementAttachment attachment : updatedData.getAttachments()) {
                attachment.setAnnouncement(existing);
                existing.getAttachments().add(attachment);
            }
        }

        return announcementRepo.save(existing);
    }

    public void deleteAnnouncement(int id) {
        if (announcementRepo.existsById(id)) {
            announcementRepo.deleteById(id);
        } else {
            throw new RuntimeException("Announcement not found");
        }
    }

    public Announcement publishAnnouncement(int id) {
        Announcement announcement = getAnnouncementById(id);
        announcement.setStatus("PUBLISHED");
        announcement.setPublishDate(LocalDateTime.now());
        
        Announcement saved = announcementRepo.save(announcement);
        
        if (announcement.isSendEmail()) {
            sendEmailsAsync(announcement);
        }
        
        return saved;
    }

    private void sendEmailsAsync(Announcement announcement) {
        CompletableFuture.runAsync(() -> {
            try {
                List<String> recipients = getTargetEmailAddresses(announcement);
                String subject = "[" + announcement.getPriority() + " Alert] " + announcement.getTitle();
                String content = "Hello,\n\n" +
                        "A new announcement has been published on SmartEvents for your audience target:\n\n" +
                        "Campaign/Summary: " + announcement.getSummary() + "\n\n" +
                        announcement.getContent() + "\n\n" +
                        "Regards,\nSmartEvents Notification Center";
                
                for (String email : recipients) {
                    if (email != null && !email.trim().isEmpty()) {
                        try {
                            emailService.sendSimpleEmail(email, subject, content);
                        } catch (Exception e) {
                            System.err.println("Failed to send email to " + email + ": " + e.getMessage());
                        }
                    }
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        });
    }

    private List<String> getTargetEmailAddresses(Announcement announcement) {
        String target = announcement.getTargetAudience();
        List<Users> users = userRepo.findAll();
        
        if ("EVERYONE".equalsIgnoreCase(target)) {
            return users.stream().map(Users::getEmail).collect(Collectors.toList());
        } else if ("ADMIN".equalsIgnoreCase(target)) {
            return users.stream().filter(u -> "ADMIN".equalsIgnoreCase(u.getRole())).map(Users::getEmail).collect(Collectors.toList());
        } else if ("STAFF".equalsIgnoreCase(target)) {
            return users.stream().filter(u -> "EVENT_STAFF".equalsIgnoreCase(u.getRole())).map(Users::getEmail).collect(Collectors.toList());
        } else if ("ATTENDEES".equalsIgnoreCase(target)) {
            if (announcement.getEvent() != null) {
                // Find all bookings for specific event
                List<Booking> bookings = bookingRepo.findByEventId(announcement.getEvent().getId());
                return bookings.stream()
                        .filter(b -> "BOOKED".equalsIgnoreCase(b.getStatus()))
                        .map(b -> b.getUser().getEmail())
                        .distinct()
                        .collect(Collectors.toList());
            } else {
                // Find all unique attendee emails
                List<Booking> bookings = bookingRepo.findAll();
                return bookings.stream()
                        .filter(b -> "BOOKED".equalsIgnoreCase(b.getStatus()))
                        .map(b -> b.getUser().getEmail())
                        .distinct()
                        .collect(Collectors.toList());
            }
        }
        return new ArrayList<>();
    }

    @Transactional
    public void markAsRead(int announcementId, Users user) {
        Announcement announcement = getAnnouncementById(announcementId);
        if (!readRepo.existsByAnnouncementIdAndUserId(announcementId, user.getId())) {
            AnnouncementRead readLog = new AnnouncementRead(announcement, user);
            readRepo.save(readLog);
        }
    }

    public List<Map<String, Object>> getNotificationFeedForUser(Users user) {
        String mappedAudience = "USER";
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            mappedAudience = "ADMIN";
        } else if ("EVENT_STAFF".equalsIgnoreCase(user.getRole())) {
            mappedAudience = "STAFF";
        }

        List<Announcement> activeAnnouncements = announcementRepo.findActiveAnnouncementsByAudience(mappedAudience);
        
        return activeAnnouncements.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("title", a.getTitle());
            map.put("content", a.getContent());
            map.put("summary", a.getSummary());
            map.put("category", a.getCategory());
            map.put("priority", a.getPriority());
            map.put("pinned", a.isPinned());
            map.put("publishDate", a.getPublishDate());
            map.put("event", a.getEvent());
            map.put("attachments", a.getAttachments());
            
            boolean isRead = readRepo.existsByAnnouncementIdAndUserId(a.getId(), user.getId());
            map.put("read", isRead);
            return map;
        }).collect(Collectors.toList());
    }

    public long getUnreadCountForUser(Users user) {
        String mappedAudience = "USER";
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            mappedAudience = "ADMIN";
        } else if ("EVENT_STAFF".equalsIgnoreCase(user.getRole())) {
            mappedAudience = "STAFF";
        }

        List<Announcement> activeAnnouncements = announcementRepo.findActiveAnnouncementsByAudience(mappedAudience);
        long readCount = activeAnnouncements.stream()
                .filter(a -> readRepo.existsByAnnouncementIdAndUserId(a.getId(), user.getId()))
                .count();

        return activeAnnouncements.size() - readCount;
    }

    public Map<String, Object> getAnnouncementDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Announcement> all = announcementRepo.findAll();

        long totalAnnouncements = all.size();
        long activeCount = all.stream().filter(a -> "PUBLISHED".equalsIgnoreCase(a.getStatus()) && (a.getExpirationDate() == null || LocalDateTime.now().isBefore(a.getExpirationDate()))).count();
        long scheduledCount = all.stream().filter(a -> "PUBLISHED".equalsIgnoreCase(a.getStatus()) && a.getPublishDate() != null && LocalDateTime.now().isBefore(a.getPublishDate())).count();
        long expiredCount = all.stream().filter(a -> a.getExpirationDate() != null && LocalDateTime.now().isAfter(a.getExpirationDate())).count();

        stats.put("totalAnnouncements", totalAnnouncements);
        stats.put("activeAnnouncements", activeCount);
        stats.put("scheduledAnnouncements", scheduledCount);
        stats.put("expiredAnnouncements", expiredCount);

        return stats;
    }
}
