package com.example.instantstack.service;

import com.example.instantstack.entities.Environment;
import com.example.instantstack.entities.Project;
import com.example.instantstack.repositories.EnvironmentRepository;
import com.example.instantstack.repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {



    @Autowired
    private EnvironmentRepository environmentRepository;


    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private EnvironmentService environmentService;

    public List<Project> getAllProjects() {
        List<Project> projects = projectRepository.findAll();
        return projects;
    }

    public Project getProjectByID(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(()->new RuntimeException("project not found"));
    }

    public void addProject(Project project) {
        if (projectRepository.existsByName(project.getName()))
            throw new RuntimeException("project already exists");
        projectRepository.save(project);
    }

    public void deleteEnvironmentFromProject(Long environmentId, Long projectId) {
        Project project = getProjectByID(projectId);

        // כאן אנחנו מוצאים את האובייקט כדי שנוכל לבדוק אותו ולמחוק אותו מהרשימה
        Environment environment = environmentService.getEnvironmentByID(environmentId);

        // בדיקת שייכות
        if (environment.getProject() == null || !environment.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Environment with id " + environmentId + " does not belong to project " + projectId);
        }

        // 1. הסרה מהרשימה של הפרויקט
        project.getEnvironments().remove(environment);
        projectRepository.save(project);

        // 2. קריאה למחיקה הסופית (תוודאי שבסרביס השני הפונקציה מקבלת Long)
        environmentService.deleteEnvironment(environmentId);
    }
    public void updateProject(Project project) {
        if(!projectRepository.existsById(project.getId()))
            throw new RuntimeException("project not found");
        projectRepository.save(project);
    }

    public void addEnvironmentToProject(Environment environment, Long projectId) {
        Project project = getProjectByID(projectId);
        project.getEnvironments().add(environment);
        environment.setProject(project);
        projectRepository.save(project);
    }

    public Project getProjectByName(String name) {
        return projectRepository.findByName(name);
    }

    public List<Environment> getEnvironmentsByProject(Project project) {
        if(!projectRepository.existsById(project.getId()))
            throw new RuntimeException("project not found");
        return project.getEnvironments();
    }


    public Environment getEnvironmentByID(Long environmentId) {
        return environmentService.getEnvironmentByID(environmentId);
   }

    public void createAndStartEnvironment(Long projectId) {
        // 1. נמצא את הפרויקט
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("project not found"));

        // 2. ניצור אובייקט סביבה חדש
        Environment env = new Environment();
        env.setPort(environmentService.findNextAvailablePort());
        env.setStatus(Environment.Status.STARTING);
        env.setProject(project);

        // 3. קודם כל נשמור בבסיס הנתונים! (כאן נוצר ה-ID)
        env = environmentRepository.save(env);

        // 4. רק עכשיו נקרא לדוקר, כשיש לנו ID ביד
        try {
            environmentService.startDockerContainer(env);
        } catch (Exception e) {
            // אם דוקר נכשל, נעדכן את הסטטוס ב-DB לטעות
            env.setStatus(Environment.Status.ERROR);
            environmentRepository.save(env);
            throw new RuntimeException("Docker failed: " + e.getMessage());
        }
    }
}
