package com.example.instantstack.service;

import com.example.instantstack.entities.Environment;
import com.example.instantstack.repositories.EnvironmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EnvironmentService {

    private static final int MIN_PORT = 8000;
    private static final int MAX_PORT = 9000;
    @Autowired
    private EnvironmentRepository environmentRepository;

    // פונקציה חדשה: עוצרת ומוחקת פיזית מהמחשב
    private void stopAndRemoveContainer(Long envId) {
        try {
            String containerName = "env_" + envId;
            // הפקודה rm -f גם עוצרת וגם מוחקת את הקונטיינר
            ProcessBuilder pb = new ProcessBuilder("docker", "rm", "-f", containerName);
            pb.start();
        } catch (Exception e) {
            System.err.println("Note: Docker container for env_" + envId + " was not found or couldn't be deleted.");
        }
    }

    // פונקציית המחיקה המעודכנת
    // בתוך EnvironmentService - תשני את הפונקציה לזו:
    public void deleteEnvironment(Long id) {
        if(!environmentRepository.existsById(id)) {
            throw new RuntimeException("environment not found");
        }

        // כאן כדאי להוסיף את עצירת הדוקר כפי שדיברנו
        stopAndRemoveContainer(id);

        environmentRepository.deleteById(id);
    }
    public Environment getEnvironmentByID(Long id) {
        return environmentRepository.findById(id)
                .orElseThrow(()->new RuntimeException("environment not found"));
    }

    // בדיקה: האם פורט מסוים חוקי ופנוי?
    public boolean isPortAvailable(int port) {
        // 1. בדיקת טווח
        if(port < MIN_PORT || port > MAX_PORT) {
            return false;
        }
        // 2. בדיקת קיום בבסיס הנתונים
        if(environmentRepository.existsByPort(port)) {
            return false;
        }
        return true;
    }

    // חיפוש: מציאת הפורט הראשון שעובר את הבדיקה של הפונקציה למעלה
    public int findNextAvailablePort() {
        for(int port = MIN_PORT; port <= MAX_PORT; port++) {
            if(isPortAvailable(port)) {
                return port;
            }
        }
        throw new RuntimeException("No available ports in the range " + MIN_PORT + "-" + MAX_PORT);
    }

    public void updateStatus(Long id, Environment.Status newStatus) {
        Environment env = getEnvironmentByID(id);
        env.setStatus(newStatus);
        environmentRepository.save(env);
    }


    public void startDockerContainer(Environment env) {
        try {
            // פקודת דוקר שמריצה קונטיינר עם השם של הסביבה והפורט הייחודי שלה
            String containerName = "env_" + env.getId();
            String portMapping = env.getPort() + ":80"; // ממפה את הפורט שמצאנו לפורט 80 בתוך הקונטיינר

            ProcessBuilder pb = new ProcessBuilder(
                    "docker", "run", "-d",
                    "--name", containerName,
                    "-p", portMapping,
                    "nginx" // או האימג' שבו אתן משתמשות
            );

            pb.start();
            updateStatus(env.getId(), Environment.Status.RUNNING);
        } catch (Exception e) {
            updateStatus(env.getId(), Environment.Status.ERROR);
            throw new RuntimeException("Failed to start Docker container: " + e.getMessage());
        }
    }
}
