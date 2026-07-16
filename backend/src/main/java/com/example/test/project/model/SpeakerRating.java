package com.example.test.project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "speaker_ratings")
public class SpeakerRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "speaker_id")
    private Speaker speaker;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    private int rating;
    
    @Column(length = 1000)
    private String review;
    
    private LocalDateTime createdAt;

    public SpeakerRating() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Speaker getSpeaker() { return speaker; }
    public void setSpeaker(Speaker speaker) { this.speaker = speaker; }

    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
