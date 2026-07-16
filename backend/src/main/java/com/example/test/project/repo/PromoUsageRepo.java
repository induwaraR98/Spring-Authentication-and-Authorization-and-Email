package com.example.test.project.repo;

import com.example.test.project.model.PromoUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PromoUsageRepo extends JpaRepository<PromoUsage, Integer> {
    List<PromoUsage> findByUserId(int userId);
    List<PromoUsage> findByPromoCodeId(int promoId);
    long countByPromoCodeIdAndUserId(int promoId, int userId);
    long countByPromoCodeId(int promoId);
    
    @Query("SELECT COALESCE(SUM(u.discountGiven), 0.0) FROM PromoUsage u")
    double sumTotalDiscountsGiven();
}
