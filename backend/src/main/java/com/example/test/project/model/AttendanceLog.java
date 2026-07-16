package com.example.test.project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_logs")
public class AttendanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "scanned_by_user_id")
    private Users scannedBy;

    private LocalDateTime checkInTime;
    private String status;

    public AttendanceLog() {}

    @PrePersist
    protected void onCreate() {
        this.checkInTime = LocalDateTime.now();
        this.status = "CHECKED_IN";
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public Users getScannedBy() { return scannedBy; }
    public void setScannedBy(Users scannedBy) { this.scannedBy = scannedBy; }

    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
