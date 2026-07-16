package com.example.test.project.controller;

import com.example.test.project.model.PromoCode;
import com.example.test.project.model.PromoUsage;
import com.example.test.project.service.PromoService;
import com.example.test.project.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
public class PromoController {

    @Autowired
    private PromoService promoService;

    @Autowired
    private ReportService reportService;

    // Admin Mappings
    @GetMapping("/api/admin/promos")
    public ResponseEntity<List<PromoCode>> getAllPromos() {
        return ResponseEntity.ok(promoService.getAllPromos());
    }

    @GetMapping("/api/admin/promos/{id}")
    public ResponseEntity<PromoCode> getPromoById(@PathVariable int id) {
        try {
            return ResponseEntity.ok(promoService.getPromoById(id));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/api/admin/promos")
    public ResponseEntity<?> createPromo(@RequestBody PromoCode promo) {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
            promo.setCreatedBy(username);
            
            PromoCode created = promoService.createPromo(promo);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/api/admin/promos/{id}")
    public ResponseEntity<?> updatePromo(@PathVariable int id, @RequestBody PromoCode promo) {
        try {
            PromoCode updated = promoService.updatePromo(id, promo);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/api/admin/promos/{id}")
    public ResponseEntity<?> deletePromo(@PathVariable int id) {
        try {
            promoService.deletePromo(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/api/admin/promos/{id}/duplicate")
    public ResponseEntity<?> duplicatePromo(@PathVariable int id) {
        try {
            PromoCode duplicated = promoService.duplicatePromo(id);
            return new ResponseEntity<>(duplicated, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/api/admin/promos/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(promoService.getPromoDashboardStats());
    }

    @GetMapping("/api/admin/promos/report/pdf")
    public ResponseEntity<byte[]> downloadPromoReportPdf() {
        List<PromoUsage> usages = promoService.getAllPromoUsageHistory();
        byte[] pdfBytes = reportService.generatePromoReportPdf(usages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Promo-Campaigns-Report.pdf");
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/api/admin/promos/report/excel")
    public ResponseEntity<byte[]> downloadPromoReportExcel() {
        List<PromoUsage> usages = promoService.getAllPromoUsageHistory();
        byte[] excelBytes = reportService.generatePromoReportExcel(usages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Promo-Campaigns-Report.xlsx");
        
        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }

    // Public / User Mappings
    @PostMapping("/api/promos/validate")
    public ResponseEntity<?> validatePromo(@RequestBody Map<String, Object> req) {
        try {
            String code = (String) req.get("code");
            int eventId = (Integer) req.get("eventId");
            double amount = Double.parseDouble(req.get("purchaseAmount").toString());
            
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();

            double discount = promoService.validateAndCalculateDiscount(code, eventId, amount, username);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("discountAmount", discount);
            response.put("originalAmount", amount);
            response.put("finalAmount", amount - discount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/api/promos/active")
    public ResponseEntity<List<PromoCode>> getActivePromos() {
        List<PromoCode> all = promoService.getAllPromos();
        List<PromoCode> active = new ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        for (PromoCode p : all) {
            if (p.isActive() 
                && (p.getStartDate() == null || now.isAfter(p.getStartDate())) 
                && (p.getExpirationDate() == null || now.isBefore(p.getExpirationDate()))
                && (p.getMaxTotalUses() == 0 || p.getCurrentUsageCount() < p.getMaxTotalUses())) {
                active.add(p);
            }
        }
        return ResponseEntity.ok(active);
    }
}
