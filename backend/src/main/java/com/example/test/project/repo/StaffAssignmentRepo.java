package com.example.test.project.repo;

import com.example.test.project.model.StaffAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StaffAssignmentRepo extends JpaRepository<StaffAssignment, Integer> {
    List<StaffAssignment> findByStaffId(int staffId);
    List<StaffAssignment> findByEventId(int eventId);
    void deleteByStaffIdAndEventId(int staffId, int eventId);
}
