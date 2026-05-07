package com.example.instantstack.service;

import com.example.instantstack.entities.Environment;
import com.example.instantstack.entities.Project;
import com.example.instantstack.repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EnvironmentService environmentService;

    // ניהול פרויקטים
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectByID(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project with ID " + id + " was not found."));
    }

    public void addProject(Project project) {
        // 1. בדיקת שם
        if (project.getName() == null || project.getName().trim().isEmpty()) {
            throw new RuntimeException("Project name cannot be empty.");
        }

        // 2. בדיקה שהוזן מנהל (חשוב!)
        if (project.getManagerId() == null) {
            throw new RuntimeException("Project must have a Manager ID.");
        }

        // 3. בדיקת כפילות שם
        if (projectRepository.existsByName(project.getName())) {
            throw new RuntimeException("Project with name '" + project.getName() + "' already exists.");
        }

        // 4. שמירה (ה-managerId כבר בפנים)
        projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Project project = getProjectByID(projectId);

        /*
         * 2. ניקוי משאבים חיצוניים (Docker):

         */
        if (project.getEnvironments() != null) {
            // יצירת עותק של הרשימה כדי למנוע ConcurrentModificationException בזמן מחיקה
            List<Environment> envsToDelete = new ArrayList<>(project.getEnvironments());
            for (Environment env : envsToDelete) {
                environmentService.deleteEnvironment(env.getId());
            }
        }

        /*
         * 3. מחיקת הפרויקט עצמו:
         * בגלל שהשתמשנו ב-environmentService.deleteEnvironment לכל סביבה,
         * הקשרים כבר נותקו. כעת נמחק את הפרויקט מה-Repository.
         */
        projectRepository.delete(project);
    }

    public void updateProject(Project project) {
        if (!projectRepository.existsById(project.getId())) {
            throw new RuntimeException("project not found");
        }
        projectRepository.save(project);
    }

    // ניהול סביבות בתוך פרויקט
    @Transactional
    public Environment createAndStartEnvironment(Long projectId,Long workerId) {
        Project project = getProjectByID(projectId);
        Environment env= environmentService.createAndStartEnvironment(project,workerId);
        return env;
    }

    @Transactional
    public void deleteEnvironmentFromProject(Long environmentId, Long projectId) {
        // 1. נביא את הסביבה - אם לא קיימת, environmentService יזרוק שגיאה
        Environment environment = environmentService.getEnvironmentByID(environmentId);

        // 2. וידוא שהסביבה באמת שייכת לפרויקט שצוין ב-URL
        if (environment.getProject() == null || !environment.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Environment " + environmentId + " does not belong to project " + projectId);
        }

        // 3. מחיקה
        environmentService.deleteEnvironment(environmentId);
    }

    public List<Environment> getEnvironmentsByProject(Project project) {
        Project p = getProjectByID(project.getId());
        return p.getEnvironments();
    }

    // פונקציית עזר שקיימת ב-Controller
    public Environment getEnvironmentByID(Long environmentId) {
        return environmentService.getEnvironmentByID(environmentId);
    }

    // מנהל חברה רואה רק את הפרויקטים שלו
    public List<Project> getProjectsByManager(Long managerId) {
        return projectRepository.findByManagerId(managerId);
    }


}