package com.example.test.project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;
    
    @Column(length = 4000)
    private String content;
    
    private String summary;
    private String category;
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    private LocalDateTime publishDate;
    private LocalDateTime expirationDate;
    private String status; // DRAFT, PUBLISHED, ARCHIVED
    private String author;
    private String targetAudience; // EVERYONE, ATTENDEES, VIP, STAFF, ADMIN
    
    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    private boolean pinned;
    private boolean sendEmail;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "announcement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnnouncementAttachment> attachments;

    public Announcement() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "DRAFT";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDateTime getPublishDate() { return publishDate; }
    public void setPublishDate(LocalDateTime publishDate) { this.publishDate = publishDate; }

    public LocalDateTime getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDateTime expirationDate) { this.expirationDate = expirationDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getTargetAudience() { return targetAudience; }
    public void setTargetAudience(String targetAudience) { this.targetAudience = targetAudience; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public boolean isPinned() { return pinned; }
    public void setPinned(boolean pinned) { this.pinned = pinned; }

    public boolean isSendEmail() { return sendEmail; }
    public void setSendEmail(boolean sendEmail) { this.sendEmail = sendEmail; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<AnnouncementAttachment> getAttachments() { return attachments; }
    public void setAttachments(List<AnnouncementAttachment> attachments) { this.attachments = attachments; }
}
