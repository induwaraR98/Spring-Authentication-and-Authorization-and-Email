package com.example.test.project.controller;

import com.example.test.project.model.Staff;
import com.example.test.project.model.StaffAssignment;
import com.example.test.project.model.IncidentReport;
import com.example.test.project.model.AttendanceLog;
import com.example.test.project.model.Users;
import com.example.test.project.service.StaffService;
import com.example.test.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
public class StaffController {

    @Autowired
    private StaffService staffService;

    @Autowired
    private UserService userService;

    // Admin endpoints
    @GetMapping("/api/admin/staff")
    public ResponseEntity<List<Staff>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    @PostMapping("/api/admin/staff")
    public ResponseEntity<?> createStaff(@RequestBody Map<String, Object> req) {
        try {
            String username = (String) req.get("username");
            String password = (String) req.get("password");
            
            // Map the staff object
            Map<String, Object> staffMap = (Map<String, Object>) req.get("staff");
            Staff staff = new Staff();
            staff.setEmployeeNumber((String) staffMap.get("employeeNumber"));
            staff.setFullName((String) staffMap.get("fullName"));
            staff.setEmail((String) staffMap.get("email"));
            staff.setPhone((String) staffMap.get("phone"));
            staff.setDepartment((String) staffMap.get("department"));
            staff.setPosition((String) staffMap.get("position"));
            staff.setEmergencyContact((String) staffMap.get("emergencyContact"));
            staff.setNotes((String) staffMap.get("notes"));
            
            if (staffMap.get("shiftStart") != null) {
                staff.setShiftStart(java.time.LocalTime.parse((String) staffMap.get("shiftStart")));
            }
            if (staffMap.get("shiftEnd") != null) {
                staff.setShiftEnd(java.time.LocalTime.parse((String) staffMap.get("shiftEnd")));
            }
            staff.setProfilePhoto((String) staffMap.get("profilePhoto"));

            Staff created = staffService.createStaff(staff, username, password);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/api/admin/staff/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable int id, @RequestBody Staff staff) {
        try {
            Staff updated = staffService.updateStaff(id, staff);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/api/admin/staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable int id) {
        try {
            staffService.deleteStaff(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/api/admin/staff/{id}/assign/{eventId}")
    public ResponseEntity<?> assignStaff(@PathVariable int id, @PathVariable int eventId, @RequestBody Map<String, String> body) {
        try {
            String area = body.getOrDefault("area", "General");
            String responsibility = body.getOrDefault("responsibility", "Gate duty");
            StaffAssignment assignment = staffService.assignStaffToEvent(id, eventId, area, responsibility);
            return ResponseEntity.ok(assignment);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/api/admin/staff/{id}/remove/{eventId}")
    public ResponseEntity<?> removeStaffAssignment(@PathVariable int id, @PathVariable int eventId) {
        try {
            staffService.removeStaffFromEvent(id, eventId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/api/admin/staff/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(staffService.getStaffDashboardStats());
    }

    @GetMapping("/api/admin/incidents")
    public ResponseEntity<List<IncidentReport>> getIncidents() {
        return ResponseEntity.ok(staffService.getAllIncidents());
    }

    @PutMapping("/api/admin/incidents/{id}/resolve")
    public ResponseEntity<?> resolveIncident(@PathVariable int id) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
            Users adminUser = userService.getUserByUsername(username);

            IncidentReport resolved = staffService.resolveIncident(id, adminUser);
            return ResponseEntity.ok(resolved);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    // Staff Portal endpoints
    @GetMapping("/api/staff-portal/assigned")
    public ResponseEntity<?> getAssignedEvents() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
            
            Staff staff = staffService.getStaffByUsername(username);
            if (staff == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            Map<String, Object> res = new HashMap<>();
            res.put("staff", staff);
            res.put("assignments", staffService.getStaffAssignments(staff.getId()));
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/api/staff-portal/check-in")
    public ResponseEntity<?> checkInTicket(@RequestBody Map<String, Object> req) {
        try {
            int bookingId = (Integer) req.get("bookingId");
            int eventId = (Integer) req.get("eventId");

            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();

            AttendanceLog log = staffService.checkInAttendee(bookingId, eventId, username);
            
            Map<String, Object> res = new HashMap<>();
            res.put("status", "SUCCESS");
            res.put("attendeeName", log.getBooking().getUser().getUsername());
            res.put("seatCount", log.getBooking().getSeatCount());
            res.put("eventTitle", log.getEvent().getTitle());
            res.put("checkInTime", log.getCheckInTime());
            
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "FAILED");
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/api/staff-portal/incidents")
    public ResponseEntity<?> reportIncident(@RequestBody IncidentReport report) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();

            IncidentReport created = staffService.fileIncidentReport(report, username);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }
}
