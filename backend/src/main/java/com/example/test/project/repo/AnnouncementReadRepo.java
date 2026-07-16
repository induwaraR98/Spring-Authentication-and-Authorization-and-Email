package com.example.test.project.repo;

import com.example.test.project.model.AnnouncementRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnnouncementReadRepo extends JpaRepository<AnnouncementRead, Integer> {
    List<AnnouncementRead> findByUserId(int userId);
    boolean existsByAnnouncementIdAndUserId(int announcementId, int userId);
    long countByAnnouncementId(int announcementId);
}
