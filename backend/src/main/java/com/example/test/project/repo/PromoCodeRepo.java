package com.example.test.project.repo;

import com.example.test.project.model.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromoCodeRepo extends JpaRepository<PromoCode, Integer> {
    PromoCode findByCode(String code);
    boolean existsByCode(String code);
}
