package com.example.test.project.service;

import com.example.test.project.model.Speaker;
import com.example.test.project.model.SpeakerRating;
import com.example.test.project.model.FavoriteSpeaker;
import com.example.test.project.model.Event;
import com.example.test.project.model.Users;
import com.example.test.project.repo.SpeakerRepo;
import com.example.test.project.repo.SpeakerRatingRepo;
import com.example.test.project.repo.FavoriteSpeakerRepo;
import com.example.test.project.repo.EventRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SpeakerService {

    @Autowired
    private SpeakerRepo speakerRepo;

    @Autowired
    private SpeakerRatingRepo ratingRepo;

    @Autowired
    private FavoriteSpeakerRepo favoriteRepo;

    @Autowired
    private EventRepo eventRepo;

    public List<Speaker> getAllSpeakers() {
        return speakerRepo.findAll();
    }

    public List<Speaker> searchSpeakers(String name) {
        if (name == null || name.trim().isEmpty()) {
            return speakerRepo.findAll();
        }
        return speakerRepo.findByFullNameContainingIgnoreCase(name);
    }

    public Speaker getSpeakerById(int id) {
        return speakerRepo.findById(id).orElseThrow(() -> new RuntimeException("Speaker not found"));
    }

    public Speaker createSpeaker(Speaker speaker) {
        return speakerRepo.save(speaker);
    }

    public Speaker updateSpeaker(int id, Speaker updatedData) {
        Speaker existing = getSpeakerById(id);
        
        existing.setFullName(updatedData.getFullName());
        existing.setProfilePhoto(updatedData.getProfilePhoto());
        existing.setBiography(updatedData.getBiography());
        existing.setDesignation(updatedData.getDesignation());
        existing.setOrganization(updatedData.getOrganization());
        existing.setEmail(updatedData.getEmail());
        existing.setPhone(updatedData.getPhone());
        existing.setWebsite(updatedData.getWebsite());
        existing.setLinkedin(updatedData.getLinkedin());
        existing.setFacebook(updatedData.getFacebook());
        existing.setTwitter(updatedData.getTwitter());
        existing.setInstagram(updatedData.getInstagram());
        existing.setYearsOfExperience(updatedData.getYearsOfExperience());
        existing.setAreasOfExpertise(updatedData.getAreasOfExpertise());
        existing.setLanguages(updatedData.getLanguages());
        existing.setSessionTitle(updatedData.getSessionTitle());
        existing.setSessionDescription(updatedData.getSessionDescription());
        existing.setSessionStartTime(updatedData.getSessionStartTime());
        existing.setSessionEndTime(updatedData.getSessionEndTime());
        existing.setSpeakingOrder(updatedData.getSpeakingOrder());
        existing.setSessionHall(updatedData.getSessionHall());
        existing.setStatus(updatedData.getStatus());

        return speakerRepo.save(existing);
    }

    public void deleteSpeaker(int id) {
        if (speakerRepo.existsById(id)) {
            speakerRepo.deleteById(id);
        } else {
            throw new RuntimeException("Speaker not found");
        }
    }

    public Speaker assignSpeakerToEvent(int speakerId, int eventId) {
        Speaker speaker = getSpeakerById(speakerId);
        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        
        if (speaker.getEvents() == null) {
            speaker.setEvents(new ArrayList<>());
        }
        
        if (!speaker.getEvents().contains(event)) {
            speaker.getEvents().add(event);
            speakerRepo.save(speaker);
        }
        return speaker;
    }

    public Speaker removeSpeakerFromEvent(int speakerId, int eventId) {
        Speaker speaker = getSpeakerById(speakerId);
        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        
        if (speaker.getEvents() != null && speaker.getEvents().contains(event)) {
            speaker.getEvents().remove(event);
            speakerRepo.save(speaker);
        }
        return speaker;
    }

    public List<Speaker> getSpeakersForEvent(int eventId) {
        return speakerRepo.findSpeakersByEventId(eventId);
    }

    public SpeakerRating rateSpeaker(int speakerId, Users user, int ratingValue, String review) {
        Speaker speaker = getSpeakerById(speakerId);
        
        SpeakerRating rating = new SpeakerRating();
        rating.setSpeaker(speaker);
        rating.setUser(user);
        rating.setRating(ratingValue);
        rating.setReview(review);

        return ratingRepo.save(rating);
    }

    public double getAverageRating(int speakerId) {
        return ratingRepo.getAverageRatingForSpeaker(speakerId);
    }

    public List<SpeakerRating> getRatingsForSpeaker(int speakerId) {
        return ratingRepo.findBySpeakerId(speakerId);
    }

    public void addFavorite(Users user, int speakerId) {
        Speaker speaker = getSpeakerById(speakerId);
        if (!favoriteRepo.existsByUserIdAndSpeakerId(user.getId(), speakerId)) {
            FavoriteSpeaker fav = new FavoriteSpeaker(user, speaker);
            favoriteRepo.save(fav);
        }
    }

    public void removeFavorite(Users user, int speakerId) {
        FavoriteSpeaker fav = favoriteRepo.findByUserIdAndSpeakerId(user.getId(), speakerId);
        if (fav != null) {
            favoriteRepo.delete(fav);
        }
    }

    public List<Speaker> getFavorites(Users user) {
        return favoriteRepo.findByUserId(user.getId()).stream()
                .map(FavoriteSpeaker::getSpeaker)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getSpeakerDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Speaker> speakers = speakerRepo.findAll();

        long totalSpeakers = speakers.size();
        
        // Compute upcoming session counts
        LocalDate today = LocalDate.now();
        long upcomingSessions = speakers.stream()
                .flatMap(s -> s.getEvents().stream())
                .filter(e -> e.getDate() != null && !e.getDate().isBefore(today))
                .distinct()
                .count();

        // Calculate most popular speakers based on average rating
        List<Map<String, Object>> popularSpeakers = speakers.stream()
                .map(s -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("speaker", s);
                    double avg = ratingRepo.getAverageRatingForSpeaker(s.getId());
                    item.put("averageRating", avg);
                    return item;
                })
                .sorted((m1, m2) -> Double.compare((Double) m2.get("averageRating"), (Double) m1.get("averageRating")))
                .limit(5)
                .collect(Collectors.toList());

        stats.put("totalSpeakers", totalSpeakers);
        stats.put("upcomingSessions", upcomingSessions);
        stats.put("popularSpeakers", popularSpeakers);

        return stats;
    }
}
