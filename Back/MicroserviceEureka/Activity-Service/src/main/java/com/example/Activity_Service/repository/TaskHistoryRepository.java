package com.example.Activity_Service.repository;

import com.example.Activity_Service.model.TaskHistory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class TaskHistoryRepository {
    private final Path storagePath;
    private final ObjectMapper objectMapper; // Injecté

    @Autowired
    public TaskHistoryRepository(@Value("${storage.location}") String storageLocation, ObjectMapper objectMapper) {
        this.storagePath = Paths.get(storageLocation).resolve("history");
        this.objectMapper = objectMapper;
        try {
            Files.createDirectories(storagePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create history directory", e);
        }
    }

    public TaskHistory save(TaskHistory history) {
        String id = UUID.randomUUID().toString();
        history.setId(id);
        history.setCreatedAt(LocalDateTime.now());

        Path historyFile = storagePath.resolve(history.getTaskId() + ".hist.json");
        List<TaskHistory> histories = new ArrayList<>();

        // 1. Lire les historiques existants de manière sécurisée
        if (Files.exists(historyFile)) {
            try {
                histories = objectMapper.readValue(
                        historyFile.toFile(),
                        new TypeReference<List<TaskHistory>>() {}
                );
            } catch (IOException e) {
                // Fichier vide ou corrompu - on recommence avec une nouvelle liste
                histories = new ArrayList<>();
            } }  // 2. Ajouter le nouvel historique
        histories.add(history);

        // 3. Sauvegarder en JSON
        try {
            objectMapper.writeValue(historyFile.toFile(), histories);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save task histories", e);
        }

        return history;
    }

    public List<TaskHistory> findByTaskId(String taskId) {
        Path historyFile = storagePath.resolve(taskId + ".hist");

        if (!Files.exists(historyFile)) {
            return new ArrayList<>();
        }

        try (ObjectInputStream ois = new ObjectInputStream(
                new BufferedInputStream(new FileInputStream(historyFile.toFile())))) {

            Object obj = ois.readObject();
            if (obj instanceof List) {
                return ((List<TaskHistory>) obj).stream()
                        .sorted((h1, h2) -> h2.getCreatedAt().compareTo(h1.getCreatedAt()))
                        .collect(Collectors.toList());
            }
            return new ArrayList<>();
        } catch (EOFException e) {
            return new ArrayList<>();
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException("Failed to read task histories for task: " + taskId, e);
        }
    }
}
