package com.example.test.project.model;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String employeeNumber;

    private String profilePhoto;
    private String fullName;
    private String email;
    private String phone;
    private String department;
    private String position;
    private LocalTime shiftStart;
    private LocalTime shiftEnd;
    private boolean availability;
    private String emergencyContact;
    private String notes;
    private String status; // ACTIVE, SUSPENDED

    @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToMany
    @JoinTable(
        name = "staff_assigned_events",
        joinColumns = @JoinColumn(name = "staff_id"),
        inverseJoinColumns = @JoinColumn(name = "event_id")
    )
    private List<Event> assignedEvents;

    public Staff() {}

    @PrePersist
    protected void onCreate() {
        if (this.status == null) {
            this.status = "ACTIVE";
        }
        this.availability = true;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getEmployeeNumber() { return employeeNumber; }
    public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public LocalTime getShiftStart() { return shiftStart; }
    public void setShiftStart(LocalTime shiftStart) { this.shiftStart = shiftStart; }

    public LocalTime getShiftEnd() { return shiftEnd; }
    public void setShiftEnd(LocalTime shiftEnd) { this.shiftEnd = shiftEnd; }

    public boolean isAvailability() { return availability; }
    public void setAvailability(boolean availability) { this.availability = availability; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }

    public List<Event> getAssignedEvents() { return assignedEvents; }
    public void setAssignedEvents(List<Event> assignedEvents) { this.assignedEvents = assignedEvents; }
}
