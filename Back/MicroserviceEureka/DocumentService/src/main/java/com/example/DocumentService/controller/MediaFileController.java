package com.example.DocumentService.controller;

import com.example.DocumentService.dto.request.MediaFileRequest;
import com.example.DocumentService.dto.response.MediaFileResponse;
import com.example.DocumentService.model.MediaFile;
import com.example.DocumentService.service.MediaFileService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/media")
public class MediaFileController {
    private final MediaFileService mediaFileService;

    public MediaFileController(MediaFileService mediaFileService) {
        this.mediaFileService = mediaFileService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MediaFileResponse> uploadFile(
            @RequestPart("file") MultipartFile file,
            @RequestPart("description") String description,
            @RequestPart("taskId") String taskId,
            @RequestPart(value = "projectId", required = false) String projectId,
            @RequestPart(value = "phaseId", required = false) String phaseId,
            @RequestHeader("Authorization") String authToken,
            @RequestHeader("X-User-ID") String uploadedBy) throws IOException {
        MediaFileRequest request = new MediaFileRequest();
        request.setFile(file);
        request.setDescription(description);
        request.setTaskId(taskId);
        request.setProjectId(projectId);
        request.setPhaseId(phaseId);
        request.setUploadedBy(uploadedBy);
        MediaFile mediaFile = mediaFileService.uploadFile(request, authToken);
        return ResponseEntity.ok(mapToResponse(mediaFile));
    }

    @GetMapping("/files/{filename}")
    public ResponseEntity<InputStreamResource> serveFile(@PathVariable String filename) throws IOException {
        MediaFile mediaFile = mediaFileService.findByStorageFilename(filename)
                .orElseThrow(() -> new RuntimeException("File not found"));

        Path filePath = Paths.get(mediaFileService.getStorageDirectory(), filename);
        System.out.println("Trying to access file at: " + filePath.toAbsolutePath());
        if (!Files.exists(filePath)) {
            throw new RuntimeException("Physical file not found at: " + filePath);
        }
        InputStream inputStream = new FileInputStream(filePath.toFile());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mediaFile.getContentType()))
                .header("Content-Disposition", "inline; filename=\"" + mediaFile.getFilename() + "\"")
                .body(new InputStreamResource(inputStream));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InputStreamResource> downloadFile(@PathVariable String id) throws IOException {
        InputStream inputStream = mediaFileService.downloadFile(id);
        MediaFile mediaFile = mediaFileService.getMediaFileById(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mediaFile.getContentType()))
                .header("Content-Disposition", "attachment; filename=\"" + mediaFile.getFilename() + "\"")
                .body(new InputStreamResource(inputStream));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<MediaFileResponse>> getFilesByTask(@PathVariable String taskId) {
        List<MediaFile> files = mediaFileService.getFilesByTask(taskId);
        List<MediaFileResponse> responses = files.stream().map(this::mapToResponse).toList();
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable String id, @RequestHeader("Authorization") String authToken) {
        mediaFileService.deleteFile(id, authToken);
        return ResponseEntity.noContent().build();
    }

    private MediaFileResponse mapToResponse(MediaFile mediaFile) {
        MediaFileResponse response = new MediaFileResponse();
        response.setId(mediaFile.getId());
        response.setTaskId(mediaFile.getTaskId());
        response.setProjectId(mediaFile.getProjectId());
        response.setPhaseId(mediaFile.getPhaseId());
        response.setFilename(mediaFile.getFilename());
        response.setDescription(mediaFile.getDescription());
        response.setMediaType(mediaFile.getMediaType());
        response.setContentType(mediaFile.getContentType());
        response.setSize(mediaFile.getSize());
        response.setUploadedBy(mediaFile.getUploadedBy());
        response.setUploadDate(mediaFile.getUploadDate());
        response.setDownloadUrl(mediaFile.getFileUrl());
        return response;
    }
}
