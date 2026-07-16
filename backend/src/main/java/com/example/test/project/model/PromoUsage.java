package com.example.test.project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "promo_usages")
public class PromoUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "promo_id")
    private PromoCode promoCode;

    private double discountGiven;
    private LocalDateTime usedDate;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    public PromoUsage() {}

    @PrePersist
    protected void onCreate() {
        this.usedDate = LocalDateTime.now();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public PromoCode getPromoCode() { return promoCode; }
    public void setPromoCode(PromoCode promoCode) { this.promoCode = promoCode; }

    public double getDiscountGiven() { return discountGiven; }
    public void setDiscountGiven(double discountGiven) { this.discountGiven = discountGiven; }

    public LocalDateTime getUsedDate() { return usedDate; }
    public void setUsedDate(LocalDateTime usedDate) { this.usedDate = usedDate; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
}
