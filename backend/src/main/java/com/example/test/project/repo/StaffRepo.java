package com.example.test.project.repo;

import com.example.test.project.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepo extends JpaRepository<Staff, Integer> {
    Staff findByEmployeeNumber(String employeeNumber);
    Staff findByUserId(int userId);
    Staff findByEmail(String email);
    boolean existsByEmployeeNumber(String employeeNumber);
}
