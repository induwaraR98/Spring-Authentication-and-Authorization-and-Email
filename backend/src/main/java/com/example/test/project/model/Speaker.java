package com.example.test.project.model;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "speakers")
public class Speaker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String fullName;
    private String profilePhoto;

    @Column(length = 2000)
    private String biography;

    private String designation;
    private String organization;
    private String email;
    private String phone;
    private String website;
    private String linkedin;
    private String facebook;
    private String twitter;
    private String instagram;
    private int yearsOfExperience;
    
    @Column(length = 1000)
    private String areasOfExpertise;
    
    private String languages;
    private String sessionTitle;
    
    @Column(length = 2000)
    private String sessionDescription;
    
    private LocalTime sessionStartTime;
    private LocalTime sessionEndTime;
    private int speakingOrder;
    private String sessionHall;
    private String status; // ACTIVE, INACTIVE

    @ManyToMany
    @JoinTable(
        name = "speaker_events",
        joinColumns = @JoinColumn(name = "speaker_id"),
        inverseJoinColumns = @JoinColumn(name = "event_id")
    )
    private List<Event> events;

    public Speaker() {}

    @PrePersist
    protected void onCreate() {
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public String getBiography() { return biography; }
    public void setBiography(String biography) { this.biography = biography; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }

    public String getFacebook() { return facebook; }
    public void setFacebook(String facebook) { this.facebook = facebook; }

    public String getTwitter() { return twitter; }
    public void setTwitter(String twitter) { this.twitter = twitter; }

    public String getInstagram() { return instagram; }
    public void setInstagram(String instagram) { this.instagram = instagram; }

    public int getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(int yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public String getAreasOfExpertise() { return areasOfExpertise; }
    public void setAreasOfExpertise(String areasOfExpertise) { this.areasOfExpertise = areasOfExpertise; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

    public String getSessionDescription() { return sessionDescription; }
    public void setSessionDescription(String sessionDescription) { this.sessionDescription = sessionDescription; }

    public LocalTime getSessionStartTime() { return sessionStartTime; }
    public void setSessionStartTime(LocalTime sessionStartTime) { this.sessionStartTime = sessionStartTime; }

    public LocalTime getSessionEndTime() { return sessionEndTime; }
    public void setSessionEndTime(LocalTime sessionEndTime) { this.sessionEndTime = sessionEndTime; }

    public int getSpeakingOrder() { return speakingOrder; }
    public void setSpeakingOrder(int speakingOrder) { this.speakingOrder = speakingOrder; }

    public String getSessionHall() { return sessionHall; }
    public void setSessionHall(String sessionHall) { this.sessionHall = sessionHall; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<Event> getEvents() { return events; }
    public void setEvents(List<Event> events) { this.events = events; }
}
