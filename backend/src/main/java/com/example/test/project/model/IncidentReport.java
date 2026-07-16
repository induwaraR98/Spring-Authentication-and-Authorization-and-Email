package com.example.test.project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_reports")
public class IncidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;
    
    @Column(length = 2000)
    private String description;
    
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    private String photoUrl;
    private boolean resolved;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "reported_by_staff_id")
    private Staff reportedBy;

    @ManyToOne
    @JoinColumn(name = "assigned_admin_user_id")
    private Users assignedAdmin;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public IncidentReport() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.resolved = false;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public Staff getReportedBy() { return reportedBy; }
    public void setReportedBy(Staff reportedBy) { this.reportedBy = reportedBy; }

    public Users getAssignedAdmin() { return assignedAdmin; }
    public void setAssignedAdmin(Users assignedAdmin) { this.assignedAdmin = assignedAdmin; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
