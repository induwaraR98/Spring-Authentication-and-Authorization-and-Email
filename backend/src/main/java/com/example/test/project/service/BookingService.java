package com.example.test.project.service;

import com.example.test.project.emaildemo.EmailService;
import com.example.test.project.model.Booking;
import com.example.test.project.model.Event;
import com.example.test.project.model.Ticket;
import com.example.test.project.model.Users;
import com.example.test.project.repo.BookingRepo;
import com.example.test.project.repo.EventRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepo bookingRepo;

    @Autowired
    private EventRepo eventRepo;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PromoService promoService;

    @Transactional
    public synchronized Booking createBooking(Users user, int eventId, int seatCount) {
        return createBooking(user, eventId, seatCount, null);
    }

    @Transactional
    public synchronized Booking createBooking(Users user, int eventId, int seatCount, String promoCode) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!"UPCOMING".equalsIgnoreCase(event.getStatus())) {
            throw new RuntimeException("Event is not open for bookings (Status: " + event.getStatus() + ")");
        }

        if (event.getDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot book tickets for a past event");
        }

        if (event.getAvailableSeats() < seatCount) {
            throw new RuntimeException("Not enough seats available. Only " + event.getAvailableSeats() + " left.");
        }

        // Deduct seats
        event.setAvailableSeats(event.getAvailableSeats() - seatCount);
        eventRepo.save(event);

        // Calculate pricing
        double baseTotal = seatCount * event.getTicketPrice();
        double discount = 0.0;
        
        if (promoCode != null && !promoCode.trim().isEmpty()) {
            try {
                discount = promoService.validateAndCalculateDiscount(promoCode, eventId, baseTotal, user.getUsername());
            } catch (Exception e) {
                // If invalid promo, rollback seat reservation and throw exception to user
                event.setAvailableSeats(event.getAvailableSeats() + seatCount);
                eventRepo.save(event);
                throw new RuntimeException("Promo validation error: " + e.getMessage());
            }
        }

        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setSeatCount(seatCount);
        booking.setTotalPrice(baseTotal - discount);
        booking.setStatus("BOOKED");
        booking = bookingRepo.save(booking);

        // Log usage if applicable
        if (promoCode != null && !promoCode.trim().isEmpty() && discount > 0) {
            promoService.logPromoUsage(promoCode, booking, discount, user);
        }

        // Generate ticket
        Ticket ticket = ticketService.generateTicket(booking);

        // Generate PDF ticket
        byte[] pdfBytes = ticketService.generateTicketPdfBytes(ticket);

        // Send notification
        notificationService.createNotification(user, "Booking confirmed for " + event.getTitle() + " (" + seatCount + " tickets). Discount applied: $" + String.format("%.2f", discount));

        // Send email confirmation
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            String subject = "Booking Confirmation: " + event.getTitle();
            String htmlContent = String.format(
                "<h3>Dear %s,</h3>" +
                "<p>Your booking for the event <b>%s</b> is confirmed!</p>" +
                "<ul>" +
                "  <li><b>Venue:</b> %s</li>" +
                "  <li><b>Date:</b> %s</li>" +
                "  <li><b>Time:</b> %s</li>" +
                "  <li><b>Seats:</b> %d</li>" +
                "  <li><b>Total Price:</b> $%.2f (Promo Discount: $%.2f Applied)</li>" +
                "  <li><b>Ticket Number:</b> %s</li>" +
                "</ul>" +
                "<p>Please find your entry ticket PDF attached to this email. Present the QR code on the ticket at the gate.</p>" +
                "<p>Best regards,<br/>Smart Event Management System Team</p>",
                user.getUsername(), event.getTitle(), event.getVenue(), event.getDate().toString(), 
                event.getTime().toString(), seatCount, booking.getTotalPrice(), discount, ticket.getTicketNumber()
            );
            
            try {
                emailService.sendEmailWithAttachment(user.getEmail(), subject, htmlContent, "Ticket-" + ticket.getTicketNumber() + ".pdf", pdfBytes);
            } catch (Exception e) {
                System.err.println("Failed to send booking email: " + e.getMessage());
            }
        }

        return booking;
    }

    @Transactional
    public synchronized Booking cancelBooking(int bookingId, Users currentUser) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"BOOKED".equalsIgnoreCase(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled or processed");
        }

        // Auth check: User can only cancel their own booking, Admin can cancel any
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole()) && booking.getUser().getId() != currentUser.getId()) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        Event event = booking.getEvent();
        if (event.getDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot cancel booking for a past event");
        }

        // Restore seats
        event.setAvailableSeats(event.getAvailableSeats() + booking.getSeatCount());
        eventRepo.save(event);

        // Cancel booking
        booking.setStatus("CANCELLED");
        booking = bookingRepo.save(booking);

        // Send notification
        notificationService.createNotification(booking.getUser(), "Booking cancelled for " + event.getTitle());

        // Send cancellation email
        if (booking.getUser().getEmail() != null && !booking.getUser().getEmail().isEmpty()) {
            String subject = "Booking Cancelled: " + event.getTitle();
            String htmlContent = String.format(
                "<h3>Dear %s,</h3>" +
                "<p>Your booking for the event <b>%s</b> has been successfully cancelled.</p>" +
                "<p>Any paid amount will be refunded according to the refund policy.</p>" +
                "<p>Best regards,<br/>Smart Event Management System Team</p>",
                booking.getUser().getUsername(), event.getTitle()
            );
            try {
                emailService.sendSimpleEmail(booking.getUser().getEmail(), subject, htmlContent);
            } catch (Exception e) {
                System.err.println("Failed to send cancellation email: " + e.getMessage());
            }
        }

        return booking;
    }

    public List<Booking> getBookingHistory(int userId) {
        return bookingRepo.findByUserIdOrderByBookingDateDesc(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepo.findAll();
    }

    public Optional<Booking> getBookingById(int id) {
        return bookingRepo.findById(id);
    }
}
