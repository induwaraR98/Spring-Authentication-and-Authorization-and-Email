package com.example.test.project.repo;

import com.example.test.project.model.Speaker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SpeakerRepo extends JpaRepository<Speaker, Integer> {
    List<Speaker> findByFullNameContainingIgnoreCase(String name);
    List<Speaker> findByStatus(String status);
    
    @Query("SELECT s FROM Speaker s JOIN s.events e WHERE e.id = :eventId ORDER BY s.speakingOrder ASC, s.sessionStartTime ASC")
    List<Speaker> findSpeakersByEventId(int eventId);
}
