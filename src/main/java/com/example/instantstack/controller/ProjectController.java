package com.example.instantstack.controller;

import com.example.instantstack.entities.Environment;
import com.example.instantstack.entities.Project;
import com.example.instantstack.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    @PostMapping
    public ResponseEntity<String> createProject(@RequestBody com.example.instantstack.entities.Project project) {
        projectService.addProject(project);
        return ResponseEntity.ok("Project '" + project.getName() + "' created successfully!");
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<String> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok("Project " + projectId + " and all its resources were cleared.");
    }

    // הצגת כל הפרויקטים (מעולה לבדיקה בפוסטמן לראות מה ה-ID שנוצר)
    // GET http://localhost:8080/api/projects
    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }



    // 1. יצירת סביבה חדשה (והפעלת דוקר)
    // אם projectId לא קיים, ה-Service יזרוק Exception שייתפס ב-GlobalHandler.
    @PostMapping("/{projectId}/environments")
    public ResponseEntity<Environment> createEnvironment(@PathVariable Long projectId) {
        Environment env= projectService.createAndStartEnvironment(projectId);
        return ResponseEntity.status(HttpStatus.CREATED).body(env);
    }

    // 2. מחיקת סביבה (מחיקה מה-DB וגם עצירת דוקר)
    @DeleteMapping("/{projectId}/environments/{envId}")
    public ResponseEntity<String> deleteEnvironment(@PathVariable Long projectId, @PathVariable Long envId) {
        projectService.deleteEnvironmentFromProject(envId, projectId);
        return ResponseEntity.ok("Environment " + envId + " deleted successfully from project " + projectId);
    }

    // 3. הצגת כל הסביבות של פרויקט מסוים (בונוס - עוזר לבדיקות)
    @GetMapping("/{projectId}/environments")
    public ResponseEntity<List<Environment>> getProjectEnvironments(@PathVariable Long projectId) {
        Project project = projectService.getProjectByID(projectId);
        List<Environment> envs = projectService.getEnvironmentsByProject(project);
        return ResponseEntity.ok(envs);
    }
}