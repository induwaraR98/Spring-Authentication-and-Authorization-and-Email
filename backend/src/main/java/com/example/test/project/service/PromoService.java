package com.example.test.project.service;

import com.example.test.project.model.PromoCode;
import com.example.test.project.model.PromoUsage;
import com.example.test.project.model.Event;
import com.example.test.project.model.Category;
import com.example.test.project.model.Users;
import com.example.test.project.model.Booking;
import com.example.test.project.repo.PromoCodeRepo;
import com.example.test.project.repo.PromoUsageRepo;
import com.example.test.project.repo.EventRepo;
import com.example.test.project.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PromoService {

    @Autowired
    private PromoCodeRepo promoRepo;

    @Autowired
    private PromoUsageRepo usageRepo;

    @Autowired
    private EventRepo eventRepo;

    @Autowired
    private UserRepo userRepo;

    public List<PromoCode> getAllPromos() {
        return promoRepo.findAll();
    }

    public PromoCode getPromoById(int id) {
        return promoRepo.findById(id).orElseThrow(() -> new RuntimeException("Promo code not found"));
    }

    public PromoCode getPromoByCode(String code) {
        return promoRepo.findByCode(code);
    }

    public PromoCode createPromo(PromoCode promo) {
        if (promoRepo.existsByCode(promo.getCode())) {
            throw new RuntimeException("Promo code already exists: " + promo.getCode());
        }
        return promoRepo.save(promo);
    }

    public PromoCode updatePromo(int id, PromoCode updatedData) {
        PromoCode existing = getPromoById(id);
        
        if (!existing.getCode().equalsIgnoreCase(updatedData.getCode()) && promoRepo.existsByCode(updatedData.getCode())) {
            throw new RuntimeException("Promo code already exists: " + updatedData.getCode());
        }

        existing.setCode(updatedData.getCode().toUpperCase());
        existing.setCampaignName(updatedData.getCampaignName());
        existing.setDescription(updatedData.getDescription());
        existing.setDiscountType(updatedData.getDiscountType());
        existing.setDiscountValue(updatedData.getDiscountValue());
        existing.setMaxDiscountAmount(updatedData.getMaxDiscountAmount());
        existing.setMinPurchaseAmount(updatedData.getMinPurchaseAmount());
        existing.setStartDate(updatedData.getStartDate());
        existing.setExpirationDate(updatedData.getExpirationDate());
        existing.setMaxTotalUses(updatedData.getMaxTotalUses());
        existing.setMaxUsesPerUser(updatedData.getMaxUsesPerUser());
        existing.setApplicableEvents(updatedData.getApplicableEvents());
        existing.setApplicableCategories(updatedData.getApplicableCategories());
        existing.setActive(updatedData.isActive());

        return promoRepo.save(existing);
    }

    public void deletePromo(int id) {
        if (promoRepo.existsById(id)) {
            promoRepo.deleteById(id);
        } else {
            throw new RuntimeException("Promo code not found");
        }
    }

    public PromoCode duplicatePromo(int id) {
        PromoCode source = getPromoById(id);
        PromoCode copy = new PromoCode();
        
        String newCode = source.getCode() + "_DUP_" + (int)(Math.random() * 1000);
        while (promoRepo.existsByCode(newCode)) {
            newCode = source.getCode() + "_DUP_" + (int)(Math.random() * 1000);
        }
        
        copy.setCode(newCode);
        copy.setCampaignName(source.getCampaignName() + " (Copy)");
        copy.setDescription(source.getDescription());
        copy.setDiscountType(source.getDiscountType());
        copy.setDiscountValue(source.getDiscountValue());
        copy.setMaxDiscountAmount(source.getMaxDiscountAmount());
        copy.setMinPurchaseAmount(source.getMinPurchaseAmount());
        copy.setStartDate(source.getStartDate());
        copy.setExpirationDate(source.getExpirationDate());
        copy.setMaxTotalUses(source.getMaxTotalUses());
        copy.setMaxUsesPerUser(source.getMaxUsesPerUser());
        copy.setApplicableEvents(new ArrayList<>(source.getApplicableEvents()));
        copy.setApplicableCategories(new ArrayList<>(source.getApplicableCategories()));
        copy.setActive(source.isActive());
        copy.setCreatedBy(source.getCreatedBy());

        return promoRepo.save(copy);
    }

    public double validateAndCalculateDiscount(String codeStr, int eventId, double purchaseAmount, String username) {
        PromoCode promo = promoRepo.findByCode(codeStr.toUpperCase());
        if (promo == null) {
            throw new RuntimeException("Promo code does not exist.");
        }
        if (!promo.isActive()) {
            throw new RuntimeException("Promo code is inactive.");
        }
        LocalDateTime now = LocalDateTime.now();
        if (promo.getStartDate() != null && now.isBefore(promo.getStartDate())) {
            throw new RuntimeException("Promo campaign has not started yet.");
        }
        if (promo.getExpirationDate() != null && now.isAfter(promo.getExpirationDate())) {
            throw new RuntimeException("Promo code has expired.");
        }
        if (promo.getMaxTotalUses() > 0 && promo.getCurrentUsageCount() >= promo.getMaxTotalUses()) {
            throw new RuntimeException("Promo code maximum limit reached.");
        }

        Users user = userRepo.findByUsername(username);
        if (user != null && promo.getMaxUsesPerUser() > 0) {
            long userUsageCount = usageRepo.countByPromoCodeIdAndUserId(promo.getId(), user.getId());
            if (userUsageCount >= promo.getMaxUsesPerUser()) {
                throw new RuntimeException("You have reached your personal usage limit for this promo code.");
            }
        }

        if (purchaseAmount < promo.getMinPurchaseAmount()) {
            throw new RuntimeException("Minimum purchase amount of $" + String.format("%.2f", promo.getMinPurchaseAmount()) + " not reached.");
        }

        Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Validate eligibility of event and category
        if (promo.getApplicableEvents() != null && !promo.getApplicableEvents().isEmpty()) {
            boolean eligible = promo.getApplicableEvents().stream().anyMatch(e -> e.getId() == eventId);
            if (!eligible) {
                throw new RuntimeException("Promo code is not eligible for this event.");
            }
        }

        if (promo.getApplicableCategories() != null && !promo.getApplicableCategories().isEmpty() && event.getCategory() != null) {
            boolean eligible = promo.getApplicableCategories().stream().anyMatch(c -> c.getId() == event.getCategory().getId());
            if (!eligible) {
                throw new RuntimeException("Promo code is not eligible for this category.");
            }
        }

        // Calculate discount
        double discount = 0.0;
        if ("PERCENTAGE".equalsIgnoreCase(promo.getDiscountType())) {
            discount = purchaseAmount * (promo.getDiscountValue() / 100.0);
            if (promo.getMaxDiscountAmount() > 0 && discount > promo.getMaxDiscountAmount()) {
                discount = promo.getMaxDiscountAmount();
            }
        } else if ("FIXED".equalsIgnoreCase(promo.getDiscountType())) {
            discount = promo.getDiscountValue();
        }

        if (discount > purchaseAmount) {
            discount = purchaseAmount;
        }

        return discount;
    }

    public void logPromoUsage(String codeStr, Booking booking, double discountGiven, Users user) {
        PromoCode promo = promoRepo.findByCode(codeStr.toUpperCase());
        if (promo == null) return;

        PromoUsage usage = new PromoUsage();
        usage.setPromoCode(promo);
        usage.setBooking(booking);
        usage.setDiscountGiven(discountGiven);
        usage.setUser(user);
        usage.setEvent(booking.getEvent());

        usageRepo.save(usage);

        // Update usages counter
        promo.setCurrentUsageCount(promo.getCurrentUsageCount() + 1);
        promoRepo.save(promo);
    }

    public Map<String, Object> getPromoDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        List<PromoCode> promos = promoRepo.findAll();

        long activePromotions = promos.stream().filter(PromoCode::isActive).count();
        long expiredPromotions = promos.stream().filter(p -> p.getExpirationDate() != null && LocalDateTime.now().isAfter(p.getExpirationDate())).count();
        
        double totalDiscounts = usageRepo.sumTotalDiscountsGiven();

        // Sort by usages
        List<PromoCode> topPromos = promos.stream()
                .sorted((p1, p2) -> Integer.compare(p2.getCurrentUsageCount(), p1.getCurrentUsageCount()))
                .limit(5)
                .collect(java.util.stream.Collectors.toList());

        stats.put("activePromotions", activePromotions);
        stats.put("expiredPromotions", expiredPromotions);
        stats.put("totalDiscountsGiven", totalDiscounts);
        stats.put("topPromoCodes", topPromos);

        return stats;
    }

    public List<PromoUsage> getAllPromoUsageHistory() {
        return usageRepo.findAll();
    }
}
