package com.example.instantstack.controller;

import com.example.instantstack.entities.Environment;
import com.example.instantstack.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects") // הכתובת הראשית של הקונטרולר
@CrossOrigin(origins = "*")    // מאפשר לפתח דף אינטרנט שיתחבר לקוד הזה
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    // יצירת פרויקט חדש - חובה להריץ את זה פעם אחת בכל פעם שהשרת עולה!
    // POST http://localhost:8080/api/projects
    @PostMapping
    public ResponseEntity<String> createProject(@RequestBody com.example.instantstack.entities.Project project) {
        projectService.addProject(project);
        return ResponseEntity.ok("Project '" + project.getName() + "' created successfully!");
    }

    // הצגת כל הפרויקטים (מעולה לבדיקה בפוסטמן לראות מה ה-ID שנוצר)
    // GET http://localhost:8080/api/projects
    @GetMapping
    public ResponseEntity<List<com.example.instantstack.entities.Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }



    // 1. יצירת סביבה חדשה (והפעלת דוקר)
    // הכתובת תהיה: POST http://localhost:8080/api/projects/{id}/environments
    @PostMapping("/{projectId}/environments")
    public ResponseEntity<String> createEnvironment(@PathVariable Long projectId) {
        projectService.createAndStartEnvironment(projectId);
        return ResponseEntity.ok("Environment creation started for project " + projectId);
    }

    // 2. מחיקת סביבה (מחיקה מה-DB וגם עצירת דוקר)
    // הכתובת תהיה: DELETE http://localhost:8080/api/projects/{id}/environments/{envId}
    @DeleteMapping("/{projectId}/environments/{envId}")
    public ResponseEntity<String> deleteEnvironment(@PathVariable Long projectId, @PathVariable Long envId) {
        projectService.deleteEnvironmentFromProject(envId, projectId);
        return ResponseEntity.ok("Environment " + envId + " deleted successfully from project " + projectId);
    }

    // 3. הצגת כל הסביבות של פרויקט מסוים (בונוס - עוזר לבדיקות)
    @GetMapping("/{projectId}/environments")
    public ResponseEntity<List<Environment>> getProjectEnvironments(@PathVariable Long projectId) {
        List<Environment> envs = projectService.getEnvironmentsByProject(projectService.getProjectByID(projectId));
        return ResponseEntity.ok(envs);
    }
}