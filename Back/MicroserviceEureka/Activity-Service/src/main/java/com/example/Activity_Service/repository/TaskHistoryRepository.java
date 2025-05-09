package com.example.Activity_Service.repository;

import com.example.Activity_Service.model.TaskHistory;
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

    @Autowired
    public TaskHistoryRepository(@Value("./activity-storage") String storageLocation) {
        this.storagePath = Paths.get(storageLocation).resolve("history");
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

        // Créer le nom de fichier basé sur taskId
        Path historyFile = storagePath.resolve(history.getTaskId() + ".hist");

        // Lire les historiques existants
        List<TaskHistory> histories = new ArrayList<>();
        if (Files.exists(historyFile)) {
            try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(historyFile.toFile()))) {
                histories = (List<TaskHistory>) ois.readObject();
            } catch (IOException | ClassNotFoundException e) {
                throw new RuntimeException("Failed to read existing histories", e);
            }
        }

        // Ajouter le nouvel historique
        histories.add(history);

        // Sauvegarder la liste mise à jour
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(historyFile.toFile()))) {
            oos.writeObject(histories);
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

        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(historyFile.toFile()))) {
            List<TaskHistory> histories = (List<TaskHistory>) ois.readObject();
            return histories.stream()
                    .sorted((h1, h2) -> h2.getCreatedAt().compareTo(h1.getCreatedAt()))
                    .collect(Collectors.toList());
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException("Failed to read task histories for task: " + taskId, e);
        }
    }
}
