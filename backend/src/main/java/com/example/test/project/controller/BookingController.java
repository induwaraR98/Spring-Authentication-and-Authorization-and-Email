package com.example.test.project.controller;

import com.example.test.project.model.Booking;
import com.example.test.project.model.Ticket;
import com.example.test.project.model.Users;
import com.example.test.project.repo.TicketRepo;
import com.example.test.project.service.BookingService;
import com.example.test.project.service.TicketService;
import com.example.test.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private TicketRepo ticketRepo;

    private Users getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userService.getUserByUsername(username);
    }

    @PostMapping
    public ResponseEntity<?> bookTickets(@RequestBody Map<String, Object> request) {
        try {
            Users user = getCurrentUser();
            int eventId = Integer.parseInt(request.get("eventId").toString());
            int seatCount = Integer.parseInt(request.get("seatCount").toString());
            String promoCode = request.get("promoCode") != null ? request.get("promoCode").toString() : null;
            
            Booking booking = bookingService.createBooking(user, eventId, seatCount, promoCode);
            return new ResponseEntity<>(booking, HttpStatus.CREATED);
        } catch (Exception ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", ex.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable int id) {
        try {
            Users user = getCurrentUser();
            Booking booking = bookingService.cancelBooking(id, user);
            return ResponseEntity.ok(booking);
        } catch (Exception ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", ex.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Booking>> getBookingHistory() {
        Users user = getCurrentUser();
        List<Booking> bookings = bookingService.getBookingHistory(user.getId());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        // Admin only path checked by SecurityConfig
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable int id) {
        Users user = getCurrentUser();
        return bookingService.getBookingById(id).map(booking -> {
            // Auth check: only admin or the user who booked can view
            if (!"ADMIN".equalsIgnoreCase(user.getRole()) && booking.getUser().getId() != user.getId()) {
                return new ResponseEntity<Booking>(HttpStatus.FORBIDDEN);
            }
            return ResponseEntity.ok(booking);
        }).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/{id}/ticket/pdf")
    public ResponseEntity<?> downloadTicketPdf(@PathVariable int id) {
        Users user = getCurrentUser();
        return bookingService.getBookingById(id).map(booking -> {
            if (!"ADMIN".equalsIgnoreCase(user.getRole()) && booking.getUser().getId() != user.getId()) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            
            Ticket ticket = ticketRepo.findByBookingId(booking.getId())
                    .orElseGet(() -> ticketService.generateTicket(booking));
            
            byte[] pdfBytes = ticketService.generateTicketPdfBytes(ticket);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Ticket-" + ticket.getTicketNumber() + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        }).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
