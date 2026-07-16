package com.example.test.project.controller;

import com.example.test.project.model.Announcement;
import com.example.test.project.model.Users;
import com.example.test.project.service.AnnouncementService;
import com.example.test.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private UserService userService;

    // Public / Authenticated Feed Mappings
    @GetMapping("/api/announcements")
    public ResponseEntity<List<Map<String, Object>>> getMyNotificationFeed() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
        Users user = userService.getUserByUsername(username);

        return ResponseEntity.ok(announcementService.getNotificationFeedForUser(user));
    }

    @PostMapping("/api/announcements/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable int id) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
            Users user = userService.getUserByUsername(username);

            announcementService.markAsRead(id, user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/api/announcements/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
        Users user = userService.getUserByUsername(username);

        long unreadCount = announcementService.getUnreadCountForUser(user);
        Map<String, Object> res = new HashMap<>();
        res.put("unreadCount", unreadCount);
        return ResponseEntity.ok(res);
    }

    // Admin Mappings
    @PostMapping("/api/admin/announcements")
    public ResponseEntity<?> createAnnouncement(@RequestBody Announcement announcement) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
            announcement.setAuthor(username);

            Announcement created = announcementService.createAnnouncement(announcement);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/api/admin/announcements/{id}")
    public ResponseEntity<?> updateAnnouncement(@PathVariable int id, @RequestBody Announcement announcement) {
        try {
            Announcement updated = announcementService.updateAnnouncement(id, announcement);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/api/admin/announcements/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable int id) {
        try {
            announcementService.deleteAnnouncement(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/api/admin/announcements/{id}/publish")
    public ResponseEntity<?> publishAnnouncement(@PathVariable int id) {
        try {
            Announcement published = announcementService.publishAnnouncement(id);
            return ResponseEntity.ok(published);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/api/admin/announcements/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(announcementService.getAnnouncementDashboardStats());
    }
}
