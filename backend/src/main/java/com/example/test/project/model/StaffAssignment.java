package com.example.test.project.model;

import jakarta.persistence.*;

@Entity
@Table(name = "staff_assignments")
public class StaffAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    private String assignedArea;
    private String responsibility;

    public StaffAssignment() {}

    public StaffAssignment(Staff staff, Event event, String assignedArea, String responsibility) {
        this.staff = staff;
        this.event = event;
        this.assignedArea = assignedArea;
        this.responsibility = responsibility;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Staff getStaff() { return staff; }
    public void setStaff(Staff staff) { this.staff = staff; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public String getAssignedArea() { return assignedArea; }
    public void setAssignedArea(String assignedArea) { this.assignedArea = assignedArea; }

    public String getResponsibility() { return responsibility; }
    public void setResponsibility(String responsibility) { this.responsibility = responsibility; }
}
