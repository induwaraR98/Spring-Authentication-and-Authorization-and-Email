package com.example.test.project.repo;

import com.example.test.project.model.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentReportRepo extends JpaRepository<IncidentReport, Integer> {
    List<IncidentReport> findByEventId(int eventId);
    List<IncidentReport> findByReportedById(int staffId);
    List<IncidentReport> findByResolved(boolean resolved);
}
