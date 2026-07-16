package com.example.test.project.repo;

import com.example.test.project.model.FavoriteSpeaker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FavoriteSpeakerRepo extends JpaRepository<FavoriteSpeaker, Integer> {
    List<FavoriteSpeaker> findByUserId(int userId);
    FavoriteSpeaker findByUserIdAndSpeakerId(int userId, int speakerId);
    boolean existsByUserIdAndSpeakerId(int userId, int speakerId);
}
