package com.example.test.project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "promo_codes")
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String code;

    private String campaignName;
    private String description;
    private String discountType; // PERCENTAGE, FIXED
    private double discountValue;
    private double maxDiscountAmount;
    private double minPurchaseAmount;
    private LocalDateTime startDate;
    private LocalDateTime expirationDate;
    private int maxTotalUses;
    private int maxUsesPerUser;
    private int currentUsageCount;
    private boolean active;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToMany
    @JoinTable(
        name = "promo_applicable_events",
        joinColumns = @JoinColumn(name = "promo_id"),
        inverseJoinColumns = @JoinColumn(name = "event_id")
    )
    private List<Event> applicableEvents;

    @ManyToMany
    @JoinTable(
        name = "promo_applicable_categories",
        joinColumns = @JoinColumn(name = "promo_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> applicableCategories;

    public PromoCode() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.active = true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCampaignName() { return campaignName; }
    public void setCampaignName(String campaignName) { this.campaignName = campaignName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public double getDiscountValue() { return discountValue; }
    public void setDiscountValue(double discountValue) { this.discountValue = discountValue; }

    public double getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(double maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public double getMinPurchaseAmount() { return minPurchaseAmount; }
    public void setMinPurchaseAmount(double minPurchaseAmount) { this.minPurchaseAmount = minPurchaseAmount; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDateTime expirationDate) { this.expirationDate = expirationDate; }

    public int getMaxTotalUses() { return maxTotalUses; }
    public void setMaxTotalUses(int maxTotalUses) { this.maxTotalUses = maxTotalUses; }

    public int getMaxUsesPerUser() { return maxUsesPerUser; }
    public void setMaxUsesPerUser(int maxUsesPerUser) { this.maxUsesPerUser = maxUsesPerUser; }

    public int getCurrentUsageCount() { return currentUsageCount; }
    public void setCurrentUsageCount(int currentUsageCount) { this.currentUsageCount = currentUsageCount; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Event> getApplicableEvents() { return applicableEvents; }
    public void setApplicableEvents(List<Event> applicableEvents) { this.applicableEvents = applicableEvents; }

    public List<Category> getApplicableCategories() { return applicableCategories; }
    public void setApplicableCategories(List<Category> applicableCategories) { this.applicableCategories = applicableCategories; }
}
