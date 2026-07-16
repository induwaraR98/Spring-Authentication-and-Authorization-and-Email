package com.example.test.project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcement_reads")
public class AnnouncementRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "announcement_id")
    private Announcement announcement;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    private LocalDateTime readAt;

    public AnnouncementRead() {}

    public AnnouncementRead(Announcement announcement, Users user) {
        this.announcement = announcement;
        this.user = user;
        this.readAt = LocalDateTime.now();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Announcement getAnnouncement() { return announcement; }
    public void setAnnouncement(Announcement announcement) { this.announcement = announcement; }

    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}
