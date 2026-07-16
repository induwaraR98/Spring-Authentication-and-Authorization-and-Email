package com.example.test.project.service;

import com.example.test.project.model.Staff;
import com.example.test.project.model.StaffAssignment;
import com.example.test.project.model.IncidentReport;
import com.example.test.project.model.AttendanceLog;
import com.example.test.project.model.Booking;
import com.example.test.project.model.Event;
import com.example.test.project.model.Users;
import com.example.test.project.repo.StaffRepo;
import com.example.test.project.repo.StaffAssignmentRepo;
import com.example.test.project.repo.IncidentReportRepo;
import com.example.test.project.repo.AttendanceLogRepo;
import com.example.test.project.repo.BookingRepo;
import com.example.test.project.repo.EventRepo;
import com.example.test.project.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StaffService {

    @Autowired
    private StaffRepo staffRepo;

    @Autowired
    private StaffAssignmentRepo assignmentRepo;

    @Autowired
    private IncidentReportRepo incidentRepo;

    @Autowired
    private AttendanceLogRepo logRepo;

    @Autowired
    private BookingRepo bookingRepo;

    @Autowired
    private EventRepo eventRepo;

    @Autowired
    private UserRepo userRepo;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

    public List<Staff> getAllStaff() {
        return staffRepo.findAll();
    }

    public Staff getStaffById(int id) {
        return staffRepo.findById(id).orElseThrow(() -> new RuntimeException("Staff member not found"));
    }

    public Staff getStaffByUsername(String username) {
        Users u = userRepo.findByUsername(username);
        if (u == null) return null;
        return staffRepo.findByUserId(u.getId());
    }

    @Transactional
    public Staff createStaff(Staff staff, String username, String password) {
        if (staffRepo.existsByEmployeeNumber(staff.getEmployeeNumber())) {
            throw new RuntimeException("Employee number already exists: " + staff.getEmployeeNumber());
        }
        if (userRepo.existsByUsername(username)) {
            throw new RuntimeException("Username is already taken: " + username);
        }
        if (userRepo.existsByEmail(staff.getEmail())) {
            throw new RuntimeException("Email is already taken: " + staff.getEmail());
        }

        // Create linked User account with EVENT_STAFF role
        Users user = new Users();
        user.setUsername(username);
        user.setEmail(staff.getEmail());
        user.setPhoneNumber(staff.getPhone());
        user.setPassword(encoder.encode(password));
        user.setRole("EVENT_STAFF");
        Users savedUser = userRepo.save(user);

        staff.setUser(savedUser);
        return staffRepo.save(staff);
    }

    @Transactional
    public Staff updateStaff(int id, Staff updatedData) {
        Staff existing = getStaffById(id);
        
        existing.setFullName(updatedData.getFullName());
        existing.setPhone(updatedData.getPhone());
        existing.setDepartment(updatedData.getDepartment());
        existing.setPosition(updatedData.getPosition());
        existing.setShiftStart(updatedData.getShiftStart());
        existing.setShiftEnd(updatedData.getShiftEnd());
        existing.setAvailability(updatedData.isAvailability());
        existing.setEmergencyContact(updatedData.getEmergencyContact());
        existing.setNotes(updatedData.getNotes());
        existing.setStatus(updatedData.getStatus());
        existing.setProfilePhoto(updatedData.getProfilePhoto());

        // Sync details to linked user account
        if (existing.getUser() != null) {
            Users linkedUser = existing.getUser();
            linkedUser.setPhoneNumber(updatedData.getPhone());
            if (updatedData.getStatus().equalsIgnoreCase("SUSPENDED")) {
                // We can suspend credentials or change role to guest, or just suspend in staff dashboard
            }
            userRepo.save(linkedUser);
        }

        return staffRepo.save(existing);
    }

    @Transactional
    public void deleteStaff(int id) {
        Staff staff = getStaffById(id);
        staffRepo.delete(staff);
        
        // Remove linked user account too
        if (staff.getUser() != null) {
            userRepo.delete(staff.getUser());
        }
    }

    public StaffAssignment assignStaffToEvent(int staffId, int eventId, String area, String responsibility) {
        Staff staff = getStaffById(staffId);
        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        if (staff.getAssignedEvents() == null) {
            staff.setAssignedEvents(new ArrayList<>());
        }
        if (!staff.getAssignedEvents().contains(event)) {
            staff.getAssignedEvents().add(event);
            staffRepo.save(staff);
        }

        StaffAssignment assignment = new StaffAssignment(staff, event, area, responsibility);
        return assignmentRepo.save(assignment);
    }

    @Transactional
    public void removeStaffFromEvent(int staffId, int eventId) {
        Staff staff = getStaffById(staffId);
        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        if (staff.getAssignedEvents() != null && staff.getAssignedEvents().contains(event)) {
            staff.getAssignedEvents().remove(event);
            staffRepo.save(staff);
        }

        assignmentRepo.deleteByStaffIdAndEventId(staffId, eventId);
    }

    public List<StaffAssignment> getStaffAssignments(int staffId) {
        return assignmentRepo.findByStaffId(staffId);
    }

    public List<StaffAssignment> getEventStaffAllocations(int eventId) {
        return assignmentRepo.findByEventId(eventId);
    }

    @Transactional
    public AttendanceLog checkInAttendee(int bookingId, int eventId, String scannedByUsername) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Invalid ticket code. Booking record not found."));

        if (booking.getEvent().getId() != eventId) {
            throw new RuntimeException("Invalid ticket. This ticket is for a different event: " + booking.getEvent().getTitle());
        }

        if (!"BOOKED".equalsIgnoreCase(booking.getStatus())) {
            throw new RuntimeException("Ticket check-in failed. Booking is cancelled or invalid.");
        }

        if (logRepo.existsByBookingId(bookingId)) {
            throw new RuntimeException("Check-in failed. This ticket has already been scanned!");
        }

        Users scannerUser = userRepo.findByUsername(scannedByUsername);
        
        AttendanceLog log = new AttendanceLog();
        log.setBooking(booking);
        log.setEvent(booking.getEvent());
        log.setScannedBy(scannerUser);

        return logRepo.save(log);
    }

    public List<AttendanceLog> getAttendanceLogsForEvent(int eventId) {
        return logRepo.findByEventId(eventId);
    }

    public List<IncidentReport> getAllIncidents() {
        return incidentRepo.findAll();
    }

    public IncidentReport fileIncidentReport(IncidentReport report, String staffUsername) {
        Staff staff = getStaffByUsername(staffUsername);
        report.setReportedBy(staff);
        return incidentRepo.save(report);
    }

    public IncidentReport resolveIncident(int id, Users admin) {
        IncidentReport incident = incidentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        incident.setResolved(true);
        incident.setResolvedAt(LocalDateTime.now());
        incident.setAssignedAdmin(admin);
        return incidentRepo.save(incident);
    }

    public Map<String, Object> getStaffDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Staff> allStaff = staffRepo.findAll();

        long totalStaff = allStaff.size();
        long availableStaff = allStaff.stream().filter(Staff::isAvailability).count();
        
        // Assigned Staff (at least one assigned event)
        long assignedStaff = allStaff.stream()
                .filter(s -> s.getAssignedEvents() != null && !s.getAssignedEvents().isEmpty())
                .count();

        List<IncidentReport> incidents = incidentRepo.findAll();
        long totalIncidents = incidents.size();
        long pendingIncidents = incidents.stream().filter(i -> !i.isResolved()).count();

        stats.put("totalStaff", totalStaff);
        stats.put("availableStaff", availableStaff);
        stats.put("assignedStaff", assignedStaff);
        stats.put("totalIncidents", totalIncidents);
        stats.put("pendingIncidents", pendingIncidents);

        return stats;
    }
}
