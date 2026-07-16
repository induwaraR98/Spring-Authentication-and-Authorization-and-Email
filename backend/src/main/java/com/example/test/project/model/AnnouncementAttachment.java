package com.example.test.project.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "announcement_attachments")
public class AnnouncementAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "announcement_id")
    @JsonIgnore
    private Announcement announcement;

    private String fileName;
    private String fileUrl;

    public AnnouncementAttachment() {}

    public AnnouncementAttachment(Announcement announcement, String fileName, String fileUrl) {
        this.announcement = announcement;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Announcement getAnnouncement() { return announcement; }
    public void setAnnouncement(Announcement announcement) { this.announcement = announcement; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
}
