package com.example.test.project.repo;

import com.example.test.project.model.SpeakerRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SpeakerRatingRepo extends JpaRepository<SpeakerRating, Integer> {
    List<SpeakerRating> findBySpeakerId(int speakerId);
    
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM SpeakerRating r WHERE r.speaker.id = :speakerId")
    double getAverageRatingForSpeaker(int speakerId);
}
