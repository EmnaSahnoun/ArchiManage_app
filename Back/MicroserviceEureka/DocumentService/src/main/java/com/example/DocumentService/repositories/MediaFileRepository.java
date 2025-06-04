package com.example.DocumentService.repositories;

import com.example.DocumentService.model.MediaFile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaFileRepository extends MongoRepository<MediaFile, String> {
    Optional<MediaFile> findByStorageFilename(String storageFilename);
    List<MediaFile> findByTaskId(String taskId);
}
