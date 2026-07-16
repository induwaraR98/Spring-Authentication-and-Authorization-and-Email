package com.example.test.project.controller;

import com.example.test.project.model.Speaker;
import com.example.test.project.model.SpeakerRating;
import com.example.test.project.model.Users;
import com.example.test.project.service.SpeakerService;
import com.example.test.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
public class SpeakerController {

    @Autowired
    private SpeakerService speakerService;

    @Autowired
    private UserService userService;

    // Public endpoints
    @GetMapping("/api/speakers")
    public ResponseEntity<List<Speaker>> getSpeakers(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(speakerService.searchSpeakers(search));
    }

    @GetMapping("/api/speakers/{id}")
    public ResponseEntity<Speaker> getSpeakerById(@PathVariable int id) {
        try {
            return ResponseEntity.ok(speakerService.getSpeakerById(id));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/api/events/{eventId}/schedule")
    public ResponseEntity<List<Speaker>> getEventTimeline(@PathVariable int eventId) {
        return ResponseEntity.ok(speakerService.getSpeakersForEvent(eventId));
    }

    @GetMapping("/api/speakers/{id}/ratings")
    public ResponseEntity<List<SpeakerRating>> getSpeakerRatings(@PathVariable int id) {
        return ResponseEntity.ok(speakerService.getRatingsForSpeaker(id));
    }

    // User endpoints
    @PostMapping("/api/speakers/{id}/rate")
    public ResponseEntity<?> rateSpeaker(@PathVariable int id, @RequestBody Map<String, Object> req) {
        try {
            int ratingVal = (Integer) req.get("rating");
            String review = (String) req.get("review");

            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
            Users user = userService.getUserByUsername(username);

            SpeakerRating rating = speakerService.rateSpeaker(id, user, ratingVal, review);
            return new ResponseEntity<>(rating, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/api/speakers/{id}/favorite")
    public ResponseEntity<?> favoriteSpeaker(@PathVariable int id) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
            Users user = userService.getUserByUsername(username);

            speakerService.addFavorite(user, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/api/speakers/{id}/favorite")
    public ResponseEntity<?> unfavoriteSpeaker(@PathVariable int id) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
            Users user = userService.getUserByUsername(username);

            speakerService.removeFavorite(user, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/api/speakers/favorites")
    public ResponseEntity<List<Speaker>> getFavorites() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
        Users user = userService.getUserByUsername(username);

        return ResponseEntity.ok(speakerService.getFavorites(user));
    }

    // Admin endpoints
    @PostMapping("/api/admin/speakers")
    public ResponseEntity<?> createSpeaker(@RequestBody Speaker speaker) {
        try {
            Speaker created = speakerService.createSpeaker(speaker);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/api/admin/speakers/{id}")
    public ResponseEntity<?> updateSpeaker(@PathVariable int id, @RequestBody Speaker speaker) {
        try {
            Speaker updated = speakerService.updateSpeaker(id, speaker);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/api/admin/speakers/{id}")
    public ResponseEntity<?> deleteSpeaker(@PathVariable int id) {
        try {
            speakerService.deleteSpeaker(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/api/admin/speakers/{id}/assign/{eventId}")
    public ResponseEntity<?> assignSpeaker(@PathVariable int id, @PathVariable int eventId) {
        try {
            Speaker speaker = speakerService.assignSpeakerToEvent(id, eventId);
            return ResponseEntity.ok(speaker);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/api/admin/speakers/{id}/remove/{eventId}")
    public ResponseEntity<?> removeSpeaker(@PathVariable int id, @PathVariable int eventId) {
        try {
            Speaker speaker = speakerService.removeSpeakerFromEvent(id, eventId);
            return ResponseEntity.ok(speaker);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/api/admin/speakers/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(speakerService.getSpeakerDashboardStats());
    }
}
