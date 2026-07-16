package com.example.test.project.service;

import com.example.test.project.model.Booking;
import com.example.test.project.model.Event;
import com.example.test.project.model.Category;
import com.example.test.project.model.Users;
import com.example.test.project.model.PromoUsage;
import com.example.test.project.repo.BookingRepo;
import com.example.test.project.repo.EventRepo;
import com.example.test.project.repo.CategoryRepo;
import com.example.test.project.repo.UserRepo;
import com.example.test.project.repo.FavouriteRepo;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private BookingRepo bookingRepo;

    @Autowired
    private EventRepo eventRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private FavouriteRepo favouriteRepo;

    public byte[] generateBookingReportPdf(List<Booking> bookings) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Paragraph title = new Paragraph("BOOKING REPORT SUMMARY", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1f, 2f, 2.5f, 1f, 1.5f, 1.5f});

            // Headers
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"ID", "User", "Event Title", "Seats", "Price", "Status"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(41, 128, 185)); // Sleek Blue
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            for (Booking b : bookings) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(b.getId()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(b.getUser().getUsername(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(b.getEvent().getTitle(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(b.getSeatCount()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase("$" + String.format("%.2f", b.getTotalPrice()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(b.getStatus(), bodyFont)));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return out.toByteArray();
    }

    public byte[] generateBookingReportExcel(List<Booking> bookings) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Bookings Data");

            // Header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Booking ID", "User Name", "Email", "Event Title", "Venue", "Seats Booked", "Total Price", "Status", "Booking Date"};
            
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Booking b : bookings) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(b.getId());
                row.createCell(1).setCellValue(b.getUser().getUsername());
                row.createCell(2).setCellValue(b.getUser().getEmail() != null ? b.getUser().getEmail() : "N/A");
                row.createCell(3).setCellValue(b.getEvent().getTitle());
                row.createCell(4).setCellValue(b.getEvent().getVenue());
                row.createCell(5).setCellValue(b.getSeatCount());
                row.createCell(6).setCellValue(b.getTotalPrice());
                row.createCell(7).setCellValue(b.getStatus());
                row.createCell(8).setCellValue(b.getBookingDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }

    public byte[] generatePromoReportPdf(List<PromoUsage> usages) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.DARK_GRAY);
            Paragraph title = new Paragraph("PROMO CODES CAMPAIGNS USAGE REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 1.5f, 2f, 1.2f, 1.2f, 2.5f});

            // Headers
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"Promo Code", "User", "Event Title", "Discount", "Booking ID", "Used Date"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(39, 174, 96)); // Green
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            for (PromoUsage u : usages) {
                table.addCell(new PdfPCell(new Phrase(u.getPromoCode().getCode(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(u.getUser().getUsername(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(u.getEvent().getTitle(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase("$" + String.format("%.2f", u.getDiscountGiven()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(u.getBooking().getId()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(u.getUsedDate().format(formatter), bodyFont)));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return out.toByteArray();
    }

    public byte[] generatePromoReportExcel(List<PromoUsage> usages) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Promo Usages Data");

            // Header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Promo Code", "Campaign Name", "Username", "Email", "Event Title", "Booking ID", "Discount Given", "Used Date"};
            
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (PromoUsage u : usages) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(u.getPromoCode().getCode());
                row.createCell(1).setCellValue(u.getPromoCode().getCampaignName());
                row.createCell(2).setCellValue(u.getUser().getUsername());
                row.createCell(3).setCellValue(u.getUser().getEmail() != null ? u.getUser().getEmail() : "N/A");
                row.createCell(4).setCellValue(u.getEvent().getTitle());
                row.createCell(5).setCellValue(u.getBooking().getId());
                row.createCell(6).setCellValue(u.getDiscountGiven());
                row.createCell(7).setCellValue(u.getUsedDate().format(formatter));
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }

    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepo.count();
        long totalEvents = eventRepo.count();
        long totalBookings = bookingRepo.countActiveBookings();
        Double rawRevenue = bookingRepo.calculateTotalRevenue();
        double totalRevenue = rawRevenue != null ? rawRevenue : 0.0;

        stats.put("totalUsers", totalUsers);
        stats.put("totalEvents", totalEvents);
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue);

        // Upcoming Events (top 5)
        List<Event> upcoming = eventRepo.findTop5ByOrderByDateAsc();
        stats.put("upcomingEvents", upcoming);

        // Recent Bookings (top 5)
        List<Booking> recent = bookingRepo.findTop5ByOrderByBookingDateDesc();
        stats.put("recentBookings", recent);

        // Chart 1: Popular Event Categories
        List<Category> categories = categoryRepo.findAll();
        List<Event> allEvents = eventRepo.findAll();
        Map<String, Long> categoryDistribution = allEvents.stream()
                .filter(e -> e.getCategory() != null)
                .collect(Collectors.groupingBy(e -> e.getCategory().getName(), Collectors.counting()));
        stats.put("categoryDistribution", categoryDistribution);

        // Chart 2: Monthly Booking Counts (Last 6 Months)
        List<Booking> allBookings = bookingRepo.findAll();
        Map<String, Long> monthlyBookings = allBookings.stream()
                .filter(b -> "BOOKED".equalsIgnoreCase(b.getStatus()))
                .collect(Collectors.groupingBy(b -> b.getBookingDate().format(DateTimeFormatter.ofPattern("MMM yyyy")), Collectors.counting()));
        stats.put("monthlyBookings", monthlyBookings);

        // Chart 3: Monthly Revenue (Last 6 Months)
        Map<String, Double> monthlyRevenue = allBookings.stream()
                .filter(b -> "BOOKED".equalsIgnoreCase(b.getStatus()))
                .collect(Collectors.groupingBy(b -> b.getBookingDate().format(DateTimeFormatter.ofPattern("MMM yyyy")), 
                        Collectors.summingDouble(Booking::getTotalPrice)));
        stats.put("monthlyRevenue", monthlyRevenue);

        return stats;
    }

    public Map<String, Object> getUserDashboardStats(Users user) {
        Map<String, Object> stats = new HashMap<>();

        List<Booking> userBookings = bookingRepo.findByUserIdOrderByBookingDateDesc(user.getId());
        
        List<Booking> upcomingBookings = userBookings.stream()
                .filter(b -> "BOOKED".equalsIgnoreCase(b.getStatus()) && !b.getEvent().getDate().isBefore(java.time.LocalDate.now()))
                .collect(Collectors.toList());

        List<Booking> previousBookings = userBookings.stream()
                .filter(b -> "BOOKED".equalsIgnoreCase(b.getStatus()) && b.getEvent().getDate().isBefore(java.time.LocalDate.now()))
                .collect(Collectors.toList());

        stats.put("upcomingBookings", upcomingBookings);
        stats.put("previousBookings", previousBookings);

        // Favourite events
        List<Event> favourites = favouriteRepo.findByUserId(user.getId()).stream()
                .map(f -> f.getEvent())
                .collect(Collectors.toList());
        stats.put("favourites", favourites);

        // Recommended events: Events in categories favorited by user, or upcoming events
        Set<Integer> favoritedCategoryIds = favourites.stream()
                .filter(e -> e.getCategory() != null)
                .map(e -> e.getCategory().getId())
                .collect(Collectors.toSet());

        List<Event> recommended;
        if (!favoritedCategoryIds.isEmpty()) {
            recommended = eventRepo.findAll().stream()
                    .filter(e -> "UPCOMING".equalsIgnoreCase(e.getStatus()))
                    .filter(e -> e.getCategory() != null && favoritedCategoryIds.contains(e.getCategory().getId()))
                    .limit(5)
                    .collect(Collectors.toList());
        } else {
            recommended = eventRepo.findTop5ByOrderByDateAsc();
        }
        stats.put("recommended", recommended);

        return stats;
    }
}
