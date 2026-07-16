package com.example.test.project.repo;

import com.example.test.project.model.AnnouncementAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementAttachmentRepo extends JpaRepository<AnnouncementAttachment, Integer> {
}
