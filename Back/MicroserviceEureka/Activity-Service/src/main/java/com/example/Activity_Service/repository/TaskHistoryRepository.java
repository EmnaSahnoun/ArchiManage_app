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
    public TaskHistoryRepository(@Value("${storage.location}") String storageLocation) {
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

        Path historyFile = storagePath.resolve(history.getTaskId() + ".hist");
        List<TaskHistory> histories = new ArrayList<>();

        // 1. Lire les historiques existants de manière sécurisée
        if (Files.exists(historyFile)) {
            try (ObjectInputStream ois = new ObjectInputStream(
                    new BufferedInputStream(new FileInputStream(historyFile.toFile())))) {

                Object obj = ois.readObject();
                if (obj instanceof List) {
                    histories = (List<TaskHistory>) obj;
                }
            } catch (EOFException e) {
                // Fichier vide ou corrompu - on recommence avec une nouvelle liste
                histories = new ArrayList<>();
            } catch (IOException | ClassNotFoundException e) {
                // Renommer le fichier corrompu et créer un nouveau fichier
                Path corruptedFile = storagePath.resolve(history.getTaskId() + ".hist.corrupted");
                try {
                    Files.move(historyFile, corruptedFile);
                } catch (IOException ex) {
                    throw new RuntimeException("Failed to handle corrupted history file", ex);
                }
                histories = new ArrayList<>();
            }
        }

        // 2. Ajouter le nouvel historique
        histories.add(history);

        // 3. Sauvegarder la liste mise à jour
        try (ObjectOutputStream oos = new ObjectOutputStream(
                new BufferedOutputStream(new FileOutputStream(historyFile.toFile())))) {

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
