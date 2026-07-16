package com.example.test.project.model;

import jakarta.persistence.*;

@Entity
@Table(name = "favorite_speakers")
public class FavoriteSpeaker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne
    @JoinColumn(name = "speaker_id")
    private Speaker speaker;

    public FavoriteSpeaker() {}

    public FavoriteSpeaker(Users user, Speaker speaker) {
        this.user = user;
        this.speaker = speaker;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }

    public Speaker getSpeaker() { return speaker; }
    public void setSpeaker(Speaker speaker) { this.speaker = speaker; }
}
