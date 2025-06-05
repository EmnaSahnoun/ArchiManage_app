package com.example.DocumentService.service;

import com.example.DocumentService.config.FileStorageProperties;
import com.example.DocumentService.dto.request.MediaFileRequest;
import com.example.DocumentService.model.MediaFile;
import com.example.DocumentService.publisher.FileEventProducer;
import com.example.DocumentService.repositories.MediaFileRepository;
import com.mongodb.BasicDBObject;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MediaFileService {
    private final MediaFileRepository mediaFileRepository;
    private final FileEventProducer eventProducer;
    private final String storageDirectory; // Directory where files will be stored

    public MediaFileService(MediaFileRepository mediaFileRepository,
                            FileEventProducer eventProducer,
                            @Value("${file.storage.directory}") String storageDirectory) {
        this.mediaFileRepository = mediaFileRepository;
        this.eventProducer = eventProducer;
        this.storageDirectory = storageDirectory;

        // Ensure storage directory exists
        new File(storageDirectory).mkdirs();
    }

    public MediaFile uploadFile(MediaFileRequest request, String authToken) throws IOException {
        MultipartFile file = request.getFile();

        // Generate unique filename to prevent collisions
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Create storage path
        Path filePath = Paths.get(storageDirectory, uniqueFilename);

        // Save file to disk
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create and save MediaFile entity
        MediaFile mediaFile = new MediaFile();
        mediaFile.setTaskId(request.getTaskId());
        mediaFile.setProjectId(request.getProjectId());
        mediaFile.setPhaseId(request.getPhaseId());
        mediaFile.setFilename(originalFilename);
        mediaFile.setStorageFilename(uniqueFilename); // Store the unique filename
        mediaFile.setDescription(request.getDescription());
        mediaFile.setMediaType(determineMediaType(file.getContentType()));
        mediaFile.setContentType(file.getContentType());
        mediaFile.setSize(file.getSize());
        mediaFile.setUploadedBy(request.getUploadedBy());
        mediaFile.setIdUser(request.getIdUser());
        mediaFile.setUploadDate(new Date());
        mediaFile.setFileUrl("/DocumentService/media/files/" + uniqueFilename); // URL to access the file
        mediaFile.setAction("CREATE");

        MediaFile savedMediaFile = mediaFileRepository.save(mediaFile);
        eventProducer.sendFileinMessage(savedMediaFile, authToken);
        return savedMediaFile;
    }

    public InputStream downloadFile(String id) throws IOException {
        MediaFile mediaFile = mediaFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));

        Path filePath = Paths.get(storageDirectory, mediaFile.getStorageFilename());
        return new FileInputStream(filePath.toFile());
    }

    public void deleteFile(String id, String authToken) {
        MediaFile mediaFile = mediaFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));

        try {
            // Delete file from disk
            Path filePath = Paths.get(storageDirectory, mediaFile.getStorageFilename());
            Files.deleteIfExists(filePath);

            // Delete record from MongoDB
            mediaFileRepository.delete(mediaFile);

            // Send deletion event
            mediaFile.setAction("DELETE");
            eventProducer.sendFileinMessage(mediaFile, authToken);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    public MediaFile getMediaFileById(String id) {
        return mediaFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));
    }
    public Optional<MediaFile> findByStorageFilename(String filename) {
        return mediaFileRepository.findByStorageFilename(filename);
    }

    public List<MediaFile> getFilesByTask(String taskId) {
        return mediaFileRepository.findByTaskId(taskId);
    }

    public String getStorageDirectory() {
        return storageDirectory;
    }
    // Helper method to determine media type
    private String determineMediaType(String contentType) {
        if (contentType == null) return "OTHER";
        if (contentType.startsWith("image/")) return "IMAGE";
        if (contentType.startsWith("video/")) return "VIDEO";
        if (contentType.startsWith("audio/")) return "AUDIO";
        if (contentType.equals("application/pdf")) return "DOCUMENT";
        if (contentType.startsWith("text/")) return "TEXT";
        return "OTHER";
    }
}

