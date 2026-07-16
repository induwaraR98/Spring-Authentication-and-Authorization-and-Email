package com.example.test.project.repo;

import com.example.test.project.model.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttendanceLogRepo extends JpaRepository<AttendanceLog, Integer> {
    List<AttendanceLog> findByEventId(int eventId);
    List<AttendanceLog> findByBookingId(int bookingId);
    boolean existsByBookingId(int bookingId);
    long countByEventId(int eventId);
}
