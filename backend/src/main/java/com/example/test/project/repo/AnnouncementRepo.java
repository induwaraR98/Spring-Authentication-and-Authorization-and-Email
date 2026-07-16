package com.example.test.project.repo;

import com.example.test.project.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnnouncementRepo extends JpaRepository<Announcement, Integer> {
    List<Announcement> findByStatusOrderByPinnedDescPublishDateDesc(String status);
    List<Announcement> findByEventIdAndStatusOrderByPinnedDescPublishDateDesc(int eventId, String status);
    
    @Query("SELECT a FROM Announcement a WHERE a.status = 'PUBLISHED' AND a.publishDate <= CURRENT_TIMESTAMP AND (a.expirationDate IS NULL OR a.expirationDate >= CURRENT_TIMESTAMP) ORDER BY a.pinned DESC, a.publishDate DESC")
    List<Announcement> findActiveAnnouncements();
    
    @Query("SELECT a FROM Announcement a WHERE a.status = 'PUBLISHED' AND a.publishDate <= CURRENT_TIMESTAMP AND (a.expirationDate IS NULL OR a.expirationDate >= CURRENT_TIMESTAMP) AND (a.targetAudience = 'EVERYONE' OR a.targetAudience = :audience) ORDER BY a.pinned DESC, a.publishDate DESC")
    List<Announcement> findActiveAnnouncementsByAudience(String audience);
}
