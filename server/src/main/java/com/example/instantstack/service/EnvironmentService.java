
//package com.example.instantstack.service;
//
//import com.example.instantstack.entities.AppUser;
//import com.example.instantstack.entities.Environment;
//import com.example.instantstack.entities.Project;
//import com.example.instantstack.exception.AuthException;
//import com.example.instantstack.repositories.EnvironmentRepository;
//import jakarta.annotation.PostConstruct;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import java.io.File;
//import java.io.IOException;
//import java.nio.file.Files;
//import java.util.List;
//
//@Service
//public class EnvironmentService {
//
//    private static final int MIN_PORT = 8000;
//    private static final int MAX_PORT = 9000;
//
//    @Autowired
//    private EnvironmentRepository environmentRepository;
//
//    @Autowired
//    private AppUserService appUserService;
//
//    @PostConstruct
//    public void initDockerNetwork() {
//        try {
//            System.out.println("[InstantStack] Checking/Creating Docker Network...");
//            ProcessBuilder pb = new ProcessBuilder("docker", "network", "create", "instantstack-net");
//            Process process = pb.start();
//            process.waitFor();
//            System.out.println("[InstantStack] Docker Network 'instantstack-net' is ready!");
//        } catch (Exception e) {
//            System.out.println("[InstantStack] Network might already exist or Docker is not running: " + e.getMessage());
//        }
//    }
//
//    @Transactional
//    public Environment createAndStartEnvironment(Project project, Long workerId) {
//        AppUser currentUser = appUserService.getCurrentUser();
//        if (currentUser.getRole() == AppUser.Role.Employee) {
//            workerId = currentUser.getId();
//        }
//        Environment env = new Environment();
//        env.setPort(findNextAvailablePort());
//        env.setStatus(Environment.Status.STARTING);
//        env.setProject(project);
//        env.setWorkerId(workerId);
//
//        env = environmentRepository.save(env);
//
//        try {
//            String gitUrl = project.getGitUrl();
//            if (gitUrl == null || gitUrl.isEmpty()) {
//                throw new RuntimeException("No Git URL defined for this project.");
//            }
//
//            String localFolderPath = System.getProperty("user.home") + "/instantstack/projects/project_" + project.getId();
//            cloneOrPullProjectFromGit(gitUrl, localFolderPath);
//
//            // הפעלת המערך המשולש בדוקר (FE + BE + Router)
//            startDockerContainer(env);
//
//        } catch (Exception e) {
//            env.setStatus(Environment.Status.ERROR);
//            environmentRepository.save(env);
//            throw new RuntimeException("Environment creation failed: " + e.getMessage());
//        }
//
//        return env;
//    }
//    /**
//     * 🚀 הפעלת האקו-סיסטם תוך עקיפת שגיאות Git וקומפילציה
//     */
//    public void startDockerContainer(Environment env) {
//        try {
//            long envId = env.getId();
//            long projId = env.getProject().getId();
//
//            String feContainer = "env_" + envId + "_frontend";
//            String beContainer = "env_" + envId + "_backend";
//            String routerContainer = "env_" + envId + "_router";
//
//            String feImageName = "img_project_" + projId + "_fe";
//            String beImageName = "img_project_" + projId + "_be";
//
//            String baseFolderPath = System.getProperty("user.home") + "/instantstack/projects/project_" + projId;
//            File projectDir = new File(baseFolderPath);
//
//            // ------------------------------------------
//            // 🎯 שלב א': בניית ה-Frontend (Angular)
//            // ------------------------------------------
//            generateAutomaticDockerfile(projectDir);
//            File feBuildDir = projectDir;
//            if (searchForFile(projectDir, "package.json") != null) {
//                feBuildDir = searchForFile(projectDir, "package.json");
//            }
//
//            System.out.println("[InstantStack] Building Frontend Image...");
//            ProcessBuilder buildFePb = new ProcessBuilder("docker", "build", "-t", feImageName, ".");
//            buildFePb.directory(feBuildDir);
//            buildFePb.inheritIO();
//            buildFePb.start().waitFor();
//
//            // ------------------------------------------
//            // 🎯 שלב ב': טיפול חכם ב-Backend
//            // ------------------------------------------
//            System.out.println("[InstantStack] Locating Backend folder...");
//            File actualCsprojFile = findFileRecursively(projectDir, "API.csproj");
//            if (actualCsprojFile == null) {
//                throw new RuntimeException("CRITICAL: API.csproj not found!");
//            }
//
//            File beBuildDir = actualCsprojFile.getParentFile();
//            File publishDir = new File(beBuildDir, "my_publish");
//
//            // 🔥 הגנה קריטית: אם כבר קימפלנו קודם או ש-Git נכשל, נשתמש במה שיש ולא נעצור!
//            if (publishDir.exists() && publishDir.isDirectory() && publishDir.list().length > 0) {
//                System.out.println("[InstantStack] Pre-compiled assets found in my_publish! Skipping local dotnet publish step...");
//            } else {
//                System.out.println("[InstantStack] Compiling Backend locally on Windows...");
//                ProcessBuilder localPublish = new ProcessBuilder(
//                        "dotnet", "publish", actualCsprojFile.getName(), "-c", "Release", "-o", "my_publish", "-r", "linux-x64", "--self-contained", "false"
//                );
//                localPublish.directory(beBuildDir);
//                localPublish.inheritIO();
//                localPublish.start().waitFor();
//            }
//
//            // מייצרים Dockerfile פשוט שמבוסס על התיקייה המוכנה
//            generateBackendDockerfile(beBuildDir, "API.csproj");
//
//            System.out.println("[InstantStack] Building lightweight Backend image...");
//            ProcessBuilder buildBePb = new ProcessBuilder("docker", "build", "-t", beImageName, ".");
//            buildBePb.directory(beBuildDir);
//            buildBePb.inheritIO();
//
//            int beExitCode = buildBePb.start().waitFor();
//            if (beExitCode != 0) {
//                throw new RuntimeException("Backend Docker build failed.");
//            }
//
//            // ------------------------------------------
//            // 🎯 שלב ג': הרמת הקונטיינרים וחיבור הנתב
//            // ------------------------------------------
//            ProcessBuilder runFe = new ProcessBuilder(
//                    "docker", "run", "-d", "--name", feContainer, "--network", "instantstack-net", feImageName
//            );
//            runFe.start().waitFor();
//
//            ProcessBuilder runBe = new ProcessBuilder(
//                    "docker", "run", "-d", "--name", beContainer, "--network", "instantstack-net", beImageName
//            );
//            runBe.start().waitFor();
//
//            generateNginxRouterConfig(projectDir, feContainer, beContainer);
//
//            File routerConfigDir = new File(projectDir, "nginx_router");
//            String routerImageName = "img_router_env_" + envId;
//
//            ProcessBuilder buildRouterPb = new ProcessBuilder("docker", "build", "-t", routerImageName, ".");
//            buildRouterPb.directory(routerConfigDir);
//            buildRouterPb.start().waitFor();
//
//            String portMapping = env.getPort() + ":80";
//            ProcessBuilder runRouter = new ProcessBuilder(
//                    "docker", "run", "-d", "--name", routerContainer, "--network", "instantstack-net", "-p", portMapping, routerImageName
//            );
//            runRouter.start().waitFor();
//
//            updateStatus(env.getId(), Environment.Status.RUNNING);
//            System.out.println("[InstantStack] SUCCESS! Ecosystem is fully UP on http://localhost:" + env.getPort());
//
//        } catch (Exception e) {
//            updateStatus(env.getId(), Environment.Status.ERROR);
//            throw new RuntimeException("Failed to start Docker workflow: " + e.getMessage());
//        }
//    }
//    /**
//     * 🛠️ מייצרת קובץ הגדרות ניתוח דינמי עבור Nginx בתיקייה מבודדת
//     */
//    private void generateNginxRouterConfig(File projectDir, String feContainerName, String beContainerName) throws IOException {
//        File routerConfigDir = new File(projectDir, "nginx_router");
//        if (!routerConfigDir.exists()) {
//            routerConfigDir.mkdirs();
//        }
//
//        File configFile = new File(routerConfigDir, "nginx.conf");
//        String configContent =
//                "events { worker_connections 1024; }\n" +
//                        "http {\n" +
//                        "    resolver 127.0.0.11 valid=30s;\n" +
//                        "    server {\n" +
//                        "        listen 80;\n" +
//                        "        \n" +
//                        "        location /api/ {\n" +
//                        "            set $backend_url http://" + beContainerName + ":5000;\n" +
//                        "            proxy_pass $backend_url;\n" +
//                        "            proxy_set_header Host $host;\n" +
//                        "        }\n" +
//                        "        \n" +
//                        "        location / {\n" +
//                        "            set $frontend_url http://" + feContainerName + ":4200;\n" +
//                        "            proxy_pass $frontend_url;\n" +
//                        "            proxy_set_header Host $host;\n" +
//                        "        }\n" +
//                        "    }\n" +
//                        "}\n";
//        Files.writeString(configFile.toPath(), configContent);
//
//        File routerDockerfile = new File(routerConfigDir, "Dockerfile");
//        String routerDockerContent =
//                "FROM nginx:alpine\n" +
//                        "COPY nginx.conf /etc/nginx/nginx.conf\n";
//        Files.writeString(routerDockerfile.toPath(), routerDockerContent);
//
//        System.out.println("[InstantStack] Router isolation directory generated successfully.");
//    }
//
//    private void generateBackendDockerfile(File beBuildDir, String csprojFileName) throws IOException {
//        File dockerfile = new File(beBuildDir, "Dockerfile");
//        String dllName = csprojFileName.replace(".csproj", ".dll");
//
//        // Dockerfile סופר רזה שלא מנסה לקמפל כלום, רק מריץ את מה שווינדוס קמפל בהצלחה
//        String dockerfileContent =
//                "FROM mcr.microsoft.com/dotnet/aspnet:8.0\n" +
//                        "WORKDIR /app\n" +
//                        "COPY my_publish/ .\n" +
//                        "EXPOSE 5000\n" +
//                        "ENTRYPOINT [\"dotnet\", \"" + dllName + "\"]\n";
//
//        Files.writeString(dockerfile.toPath(), dockerfileContent);
//    }
//    private File findFileRecursively(File dir, String fileName) {
//        if (dir == null || !dir.isDirectory()) return null;
//        File target = new File(dir, fileName);
//        if (target.exists()) return target;
//        File[] files = dir.listFiles();
//        if (files != null) {
//            for (File file : files) {
//                if (file.isDirectory() && !file.getName().equals(".git") && !file.getName().equals("node_modules")) {
//                    File found = findFileRecursively(file, fileName);
//                    if (found != null) return found;
//                }
//            }
//        }
//        return null;
//    }
//    private void generateAutomaticDockerfile(File projectDir) throws IOException {
//        if (!projectDir.exists()) {
//            projectDir.mkdirs();
//        }
//
//        StringBuilder dockerContent = new StringBuilder();
//        File targetBuildDir = projectDir;
//
//        if (new File(projectDir, "pom.xml").exists()) {
//            dockerContent.append("FROM openjdk:17-jdk-slim\n")
//                    .append("COPY target/*.jar app.jar\n")
//                    .append("ENTRYPOINT [\"java\", \"-jar\", \"/app.jar\"]\n");
//            System.out.println("[InstantStack] Auto-detected: Java (Maven) project.");
//        }
//        else if (searchForFile(projectDir, "package.json") != null) {
//            targetBuildDir = searchForFile(projectDir, "package.json");
//
//            dockerContent.append("FROM node:20-alpine\n")
//                    .append("WORKDIR /app\n")
//                    .append("COPY package*.json ./\n")
//                    .append("RUN npm install --legacy-peer-deps\n")
//                    .append("COPY . .\n")
//                    .append("EXPOSE 4200\n")
//                    .append("ENV CI=true\n")
//                    .append("CMD [\"npm\", \"start\", \"--\", \"--host\", \"0.0.0.0\"]\n");
//
//            System.out.println("[InstantStack] Auto-detected Angular/Node in folder: " + targetBuildDir.getAbsolutePath());
//        }
//        else {
//            File foundHtmlDir = searchForIndexHtml(projectDir);
//            if (foundHtmlDir != null) {
//                targetBuildDir = foundHtmlDir;
//            }
//            dockerContent.append("FROM nginx:alpine\n")
//                    .append("COPY . /usr/share/nginx/html\n")
//                    .append("EXPOSE 80\n");
//            System.out.println("[InstantStack] Auto-detected: Static HTML project.");
//        }
//
//        File dockerfile = new File(targetBuildDir, "Dockerfile");
//        Files.writeString(dockerfile.toPath(), dockerContent.toString());
//        System.out.println("[InstantStack] Dockerfile successfully created at: " + dockerfile.getAbsolutePath());
//    }
//
//    /**
//     * 🔍 פונקציית סריקה משודרגת: תומכת בשם מלא או בסיומת (כמו .csproj) ומדלגת על תיקיות זמניות של C#
//     */
//    private File searchForFile(File dir, String fileNameOrExtension) {
//        if (dir == null || !dir.isDirectory()) return null;
//        String name = dir.getName();
//
//        // התעלמות מתיקיות קוד זמניות ותיקיות מערכת
//        if (name.equals(".git") || name.equals("node_modules") || name.equals(".idea") ||
//                name.equals("target") || name.equals("bin") || name.equals("obj") || name.equals("nginx_router")) {
//            return null;
//        }
//
//        // בדיקה האם הקובץ הנוכחי מתאים לשם או לסיומת המבוקשת
//        File[] files = dir.listFiles();
//        if (files != null) {
//            for (File file : files) {
//                if (!file.isDirectory()) {
//                    if (file.getName().equalsIgnoreCase(fileNameOrExtension) || file.getName().endsWith(fileNameOrExtension)) {
//                        return dir; // מחזיר את תיקיית האב שבה נמצא הקובץ
//                    }
//                }
//            }
//            // סריקה רקורסיבית לעומק
//            for (File file : files) {
//                if (file.isDirectory()) {
//                    File found = searchForFile(file, fileNameOrExtension);
//                    if (found != null) return found;
//                }
//            }
//        }
//        return null;
//    }
//
//    private File searchForIndexHtml(File dir) {
//        if (dir == null || !dir.isDirectory()) return null;
//        String name = dir.getName();
//        if (name.equals(".git") || name.equals("node_modules") || name.equals(".idea") || name.equals("target")) return null;
//
//        File indexFile = new File(dir, "index.html");
//        if (indexFile.exists()) return dir;
//
//        File[] files = dir.listFiles();
//        if (files != null) {
//            for (File file : files) {
//                if (file.isDirectory()) {
//                    File found = searchForIndexHtml(file);
//                    if (found != null) return found;
//                }
//            }
//        }
//        return null;
//    }
//
//    private void cloneOrPullProjectFromGit(String gitUrl, String targetPath) throws Exception {
//        File targetDir = new File(targetPath);
//        File gitFolder = new File(targetDir, ".git");
//        ProcessBuilder pb;
//        if (targetDir.exists() && gitFolder.exists()) {
//            pb = new ProcessBuilder("git", "pull");
//            pb.directory(targetDir);
//        } else {
//            if (!targetDir.exists()) targetDir.mkdirs();
//            pb = new ProcessBuilder("git", "clone", gitUrl, ".");
//            pb.directory(targetDir);
//        }
//        Process process = pb.start();
//        int exitCode = process.waitFor();
//        if (exitCode != 0) throw new RuntimeException("Git failed.");
//    }
//
//    /**
//     * 🧹 מחיקת כל שלושת הקונטיינרים והאימג'ים של הסביבה בבת אחת
//     */
//    private void stopAndRemoveContainer(Long envId, Long projectId) {
//        try {
//            String[] containers = {
//                    "env_" + envId + "_frontend",
//                    "env_" + envId + "_backend",
//                    "env_" + envId + "_router"
//            };
//
//            for (String container : containers) {
//                ProcessBuilder rmPb = new ProcessBuilder("docker", "rm", "-f", container);
//                rmPb.start().waitFor();
//            }
//
//            ProcessBuilder rmiFe = new ProcessBuilder("docker", "rmi", "-f", "img_fe_project_" + projectId);
//            rmiFe.start();
//
//            ProcessBuilder rmiBe = new ProcessBuilder("docker", "rmi", "-f", "img_be_project_" + projectId);
//            rmiBe.start();
//
//            ProcessBuilder rmiRouter = new ProcessBuilder("docker", "rmi", "-f", "img_router_env_" + envId);
//            rmiRouter.start();
//
//            System.out.println("[InstantStack] Cleaned up all containers and images for env: " + envId);
//        } catch (Exception e) {
//            System.err.println("[InstantStack] Cleanup warning: " + e.getMessage());
//        }
//    }
//
//    public List<Environment> getAllEnvironments() { return environmentRepository.findAll(); }
//
//    @Transactional
//    public void deleteEnvironment(Long id, boolean isAutomatic) {
//        Environment env = environmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Environment not found"));
//        if (!isAutomatic) {
//            AppUser currentUser = appUserService.getCurrentUser();
//            if (currentUser.getRole() == AppUser.Role.Employee) {
//                if (!env.getWorkerId().equals(currentUser.getId())) throw new AuthException("Access Denied");
//            }
//            else if (currentUser.getRole() == AppUser.Role.Manager) {
//                if (env.getProject() != null && !env.getProject().getManagerId().equals(currentUser.getId())) throw new AuthException("Access Denied");
//            }
//        }
//        if (env.getProject() != null) {
//            env.getProject().getEnvironments().remove(env);
//            stopAndRemoveContainer(id, env.getProject().getId());
//        } else {
//            try { new ProcessBuilder("docker", "rm", "-f", "env_" + id + "_router").start(); } catch (Exception e) {}
//        }
//        environmentRepository.delete(env);
//    }
//
//    public void updateEnvironment(Long id, Environment envDetails) {
//        Environment env = environmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Environment not found"));
//        env.setStatus(envDetails.getStatus());
//        env.setPort(envDetails.getPort());
//        environmentRepository.save(env);
//    }
//
//    public Environment getEnvironmentByID(Long id) { return environmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found")); }
//
//    public int findNextAvailablePort() {
//        for (int port = MIN_PORT; port <= MAX_PORT; port++) { if (isPortAvailable(port)) return port; }
//        throw new RuntimeException("No available ports");
//    }
//
//    private boolean isPortAvailable(int port) { return !environmentRepository.existsByPort(port); }
//
//    public void updateStatus(Long id, Environment.Status newStatus) {
//        Environment env = getEnvironmentByID(id);
//        env.setStatus(newStatus);
//        environmentRepository.save(env);
//    }
//
//    public List<Environment> getEnvironmentsForWorker(Long workerId) { return environmentRepository.findByWorkerId(workerId); }
//}

////דרך של אפרת//////////
        package com.example.instantstack.service;

import com.example.instantstack.entities.AppUser;
import com.example.instantstack.entities.Environment;
import com.example.instantstack.entities.Project;
import com.example.instantstack.exception.AuthException;
import com.example.instantstack.repositories.EnvironmentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@Service
public class EnvironmentService {

    private static final int MIN_PORT = 8000;
    private static final int MAX_PORT = 9000;

    @Autowired
    private EnvironmentRepository environmentRepository;

    @Autowired
    private AppUserService appUserService;



    @PostConstruct
    public void initDockerNetwork() {
        try {
            System.out.println("[InstantStack] Checking/Creating Docker Network...");
            // פקודה שמנסה ליצור את הרשת. אם היא כבר קיימת, דוקר פשוט יחזיר שגיאה קטנה ונתעלם ממנה
            ProcessBuilder pb = new ProcessBuilder("docker", "network", "create", "instantstack-net");
            Process process = pb.start();
            process.waitFor();
            System.out.println("[InstantStack] Docker Network 'instantstack-net' is ready!");
        } catch (Exception e) {
            System.out.println("[InstantStack] Network might already exist or Docker is not running: " + e.getMessage());
        }
    }

    /**
     * 1. פונקציית יצירת הסביבה הראשית - מורידה מהגיט ומפעילה את הדוקר הדינמי
     */
    @Transactional
    public Environment createAndStartEnvironment(Project project, Long workerId) {
        AppUser currentUser = appUserService.getCurrentUser();
        if (currentUser.getRole() == AppUser.Role.Employee) {
            workerId = currentUser.getId();
        }
        Environment env = new Environment();
        env.setPort(findNextAvailablePort());
        env.setStatus(Environment.Status.STARTING);
        env.setProject(project);
        env.setWorkerId(workerId);

        // שמירה ראשונית כדי לקבל ID
        env = environmentRepository.save(env);

        try {
            String gitUrl = project.getGitUrl();
            if (gitUrl == null || gitUrl.isEmpty()) {
                throw new RuntimeException("No Git URL defined for this project.");
            }

            // נתיב תיקייה בטוח בתוך תיקיית המשתמש בווינדוס (מונע בעיות הרשאה ב-C הראשי)
            String localFolderPath = System.getProperty("user.home") + "/instantstack/projects/project_" + project.getId();

            // הורדה/עדכון של הקוד מהגיט
            cloneOrPullProjectFromGit(gitUrl, localFolderPath);

            // הפעלת דוקר באמצעות ה-Dockerfile האוטומטי
            startDockerContainer(env);

        } catch (Exception e) {
            env.setStatus(Environment.Status.ERROR);
            environmentRepository.save(env);
            throw new RuntimeException("Environment creation failed: " + e.getMessage());
        }

        return env;
    }

    /**
     * 2. פונקציית הרצת הקונטיינר - מייצרת Dockerfile, בונה Image ומפעילה אותו
     */
    public void startDockerContainer(Environment env) {
        try {
            String baseFolderPath = System.getProperty("user.home") + "/instantstack/projects/project_" + env.getProject().getId();
            File projectDir = new File(baseFolderPath);

            // 1. יצירת הקבצים המתאימים על סמך מה שיש בתיקייה
            generateAutomaticDockerfile(projectDir);

            File composeFile = new File(projectDir, "docker-compose.yml");

            // --- במידה וזה פרויקט Fullstack (יש קובץ קומפוז) ---
            if (composeFile.exists()) {
                System.out.println("[InstantStack] 🚀 Executing Docker Compose Up for Fullstack environment...");

                // פקודת הרצה של קומפוז: docker compose up -d (בונה ומריץ את שניהם ברקע)
                ProcessBuilder composePb = new ProcessBuilder("docker", "compose", "up", "-d", "--build");
                composePb.directory(projectDir);
                composePb.inheritIO(); // תראי את הלוגים של בניית שניהם ב-IntelliJ

                Process composeProcess = composePb.start();
                int exitCode = composeProcess.waitFor();

                if (exitCode != 0) {
                    throw new RuntimeException("Docker Compose failed to start the fullstack services.");
                }

                // עדכון הסטטוס ל-RUNNING (הפורטים הוגדרו קשיח בתוך הקומפוז כרגע)
                updateStatus(env.getId(), Environment.Status.RUNNING);
                System.out.println("[InstantStack] Fullstack Application is up! Server on 8080, Client on 4200.");
                return;
            }

            // --- במידה וזה פרויקט רגיל (יחיד) - הקוד המקורי והקיים שלך ---
            String containerName = "env_" + env.getId();
            String imageName = "img_project_" + env.getProject().getId();
            int expectedPort = env.getProject().getExpectedPort() != null ? env.getProject().getExpectedPort() : 80;
            String portMapping = env.getPort() + ":" + expectedPort;

            System.out.println("[InstantStack] Starting Single Docker Build for project ID: " + env.getProject().getId());

            ProcessBuilder buildPb = new ProcessBuilder("docker", "build", "-t", imageName, ".");
            buildPb.directory(projectDir);
            buildPb.inheritIO();

            Process buildProcess = buildPb.start();
            if (buildProcess.waitFor() != 0) {
                throw new RuntimeException("Docker build failed.");
            }

            ProcessBuilder runPb = new ProcessBuilder(
                    "docker", "run", "-d",
                    "--name", containerName,
                    "--network", "instantstack-net",
                    "-p", portMapping,
                    imageName
            );

            Process runProcess = runPb.start();
            runProcess.waitFor();

            updateStatus(env.getId(), Environment.Status.RUNNING);
            System.out.println("[InstantStack] Container is up on http://localhost:" + env.getPort());

        } catch (Exception e) {
            updateStatus(env.getId(), Environment.Status.ERROR);
            throw new RuntimeException("Failed to start Docker workflow: " + e.getMessage());
        }
    }

    /**
     * 3. מנגנון זיהוי חכם המייצר קובץ Dockerfile זמני בהתאם לתכולת הגיט
     */
    //----------------------------------------------------------------------------------------------------------------------
    private void generateAutomaticDockerfile(File projectDir) throws IOException {
        File dockerfile = new File(projectDir, "Dockerfile");
        File composeFile = new File(projectDir, "docker-compose.yml");

        // הגנה: אם המשתמש כבר שם קובץ קומפוז או דוקרפייל משלו, לא נדרוס לו
        if (dockerfile.exists() || composeFile.exists()) {
            System.out.println("[InstantStack] Custom Docker/Compose file detected. Skipping auto-generation.");
            return;
        }

        // 1. נבצע סריקה כדי לראות מה יש בתוך התיקייה
        File javaPackage = searchForFile(projectDir, "pom.xml");
        File nodePackage = searchForFile(projectDir, "package.json");
        File csharpPackage = searchForFile(projectDir, ".csproj");

        // --- תרחיש א': פרויקט Fullstack משולב (גם שרת Java/C# וגם קליינט Node)! ---
        if ((javaPackage != null || csharpPackage != null) && nodePackage != null) {
            System.out.println("[InstantStack] 🔥 Fullstack Project Detected! Creating Docker Compose workflow...");

            // יצירת קובץ ה-docker-compose.yml האוטומטי (מייצר את כל החבילה במקביל!)
            generateDockerComposeFile(projectDir, javaPackage, csharpPackage, nodePackage);
            return;
        }

        // --- תרחיש ב': פרויקט רגיל (רק שרת בודד או רק קליינט בודד או אתר סטטי) ---
        StringBuilder dockerContent = new StringBuilder();

        if (javaPackage != null) {
            String relativePath = getRelativePath(projectDir, javaPackage);
            dockerContent.append("FROM openjdk:17-jdk-slim\n")
                    .append("WORKDIR /app\n")
                    .append("COPY ").append(relativePath.isEmpty() ? "." : relativePath).append("/target/*.jar app.jar\n")
                    .append("ENTRYPOINT [\"java\", \"-jar\", \"/app.jar\"]\n");
            System.out.println("[InstantStack] Auto-detected: Standalone Java project.");
        }
        else if (nodePackage != null) {
            String relativePath = getRelativePath(projectDir, nodePackage);
            dockerContent.append("FROM node:20-alpine\n")
                    .append("WORKDIR /app\n")
                    .append("COPY ").append(relativePath.isEmpty() ? "." : relativePath).append("/package*.json ./\n")
                    .append("RUN npm install --legacy-peer-deps\n")
                    .append("COPY ").append(relativePath.isEmpty() ? "." : relativePath).append(" .\n")
                    .append("EXPOSE 4200\n")
                    .append("ENV CI=true\n")
                    .append("CMD [\"npm\", \"start\", \"--\", \"--host\", \"0.0.0.0\"]\n");
            System.out.println("[InstantStack] Auto-detected: Standalone Angular/React project.");
        }
        else {
            // ברירת מחדל לאתר סטטי
            File foundHtmlDir = searchForIndexHtml(projectDir);
            String relativePath = foundHtmlDir != null ? getRelativePath(projectDir, foundHtmlDir) : ".";
            if (relativePath.endsWith("/")) relativePath = relativePath.substring(0, relativePath.length() - 1);

            dockerContent.append("FROM nginx:alpine\n")
                    .append("COPY ").append(relativePath.isEmpty() || relativePath.equals(".") ? "." : "./" + relativePath).append(" /usr/share/nginx/html\n")
                    .append("EXPOSE 80\n");
            System.out.println("[InstantStack] Auto-detected: Static HTML project.");
        }

        Files.writeString(dockerfile.toPath(), dockerContent.toString());
    }    // פונקציית עזר קטנה לחשב נתיב יחסי
    private String getRelativePath(File rootDir, File targetFile) {
        File targetDir = targetFile.isDirectory() ? targetFile : targetFile.getParentFile();
        String relative = rootDir.toURI().relativize(targetDir.toURI()).getPath();
        if (relative.endsWith("/")) {
            relative = relative.substring(0, relative.length() - 1);
        }
        return relative;
    }

    private void generateDockerComposeFile(File rootDir, File javaDir, File csharpDir, File nodeDir) throws IOException {
        String clientPath = getRelativePath(rootDir, nodeDir);
        String serverPath = javaDir != null ? getRelativePath(rootDir, javaDir) : getRelativePath(rootDir, csharpDir);

        // 💥 קסם ג'אווה: מוחק באופן אקטיבי את שורת ה-WebApplication.targets שמשגעת את לינוקס!
        if (csharpDir != null && csharpDir.exists()) {
            try {
                String csprojContent = Files.readString(csharpDir.toPath());
                if (csprojContent.contains("Microsoft.WebApplication.targets")) {
                    System.out.println("[InstantStack] Cleaning Windows-specific targets from .csproj for Linux compatibility...");
                    String cleanedContent = csprojContent.replaceAll("<Import\\s+Project=\".*Microsoft\\.WebApplication\\.targets\".*/>", "");
                    Files.writeString(csharpDir.toPath(), cleanedContent);
                }
            } catch (Exception ex) {
                System.out.println("[InstantStack] Warning: Failed to auto-clean .csproj: " + ex.getMessage());
            }
        }

        // 1. יצירת Dockerfile זמני עבור הקליינט בתוך התיקייה שלו
        File clientDocker = new File(nodeDir.getParentFile(), "Dockerfile.client");
        String clientDockerContent = "FROM node:20-alpine\n" +
                "WORKDIR /app\n" +
                "COPY package*.json ./\n" +
                "RUN npm install --legacy-peer-deps\n" +
                "COPY . .\n" +
                "EXPOSE 4200\n" +
                "ENV CI=true\n" +
                "CMD [\"npm\", \"start\", \"--\", \"--host\", \"0.0.0.0\", \"--proxy-config\", \"proxy.conf.json\"]\n";
        Files.writeString(clientDocker.toPath(), clientDockerContent);

        File proxyFile = new File(nodeDir.getParentFile(), "proxy.conf.json");
        String proxyContent = "{\n" +
                "  \"/api\": {\n" +
                "    \"target\": \"http://server-app:8080\",\n" +
                "    \"secure\": false,\n" +
                "    \"changeOrigin\": true\n" +
                "  }\n" +
                "}\n";
        Files.writeString(proxyFile.toPath(), proxyContent);

        // 2. יצירת Dockerfile זמני עבור השרת בתוך התיקייה שלו
        File serverDocker = javaDir != null ? new File(javaDir.getParentFile(), "Dockerfile.server") : new File(csharpDir.getParentFile(), "Dockerfile.server");
        StringBuilder serverDockerContent = new StringBuilder();

        if (javaDir != null) {
            serverDockerContent.append("FROM openjdk:17-jdk-slim\nWORKDIR /app\nCOPY target/*.jar app.jar\nENTRYPOINT [\"java\", \"-jar\", \"/app.jar\"]\n");
        } else {
            // שימוש באימג' של Mono עבור .NET Framework - מסודר ומחרוזת תקינה!
            serverDockerContent.append("FROM mono:latest\n")
                    .append("WORKDIR /app\n")
                    .append("COPY . .\n")
                    .append("RUN nuget restore || true\n")
                    .append("RUN msbuild /p:Configuration=Release /p:SkipInvalidConfigurations=true /p:InvalidConfiguration=true || true\n")
                    .append("EXPOSE 8080\n")
                    // פקודה שמדלגת על קבצי המערכת ומפעילה את ה-API האמיתי
                    .append("ENTRYPOINT [\"sh\", \"-c\", \"mono $(find . -name '*.exe' -o -name '*.dll' ! -name 'EntityFramework*' ! -name 'Microsoft*' ! -path '*/obj/*' | head -n 1)\"]\n");
        }
        Files.writeString(serverDocker.toPath(), serverDockerContent.toString());

        // 3. שליפת הפורט הדינמי שהוגרל עבור הסביבה הנוכחית
        int dynamicPort = findNextAvailablePort();

        // 4. בניית קובץ ה-docker-compose.yml בשורש הפרויקט
        File composeFile = new File(rootDir, "docker-compose.yml");
        String composeContent = "version: '3.8'\n" +
                "services:\n" +
                "  server-app:\n" +
                "    build:\n" +
                "      context: ./" + (serverPath.isEmpty() ? "" : serverPath) + "\n" +
                "      dockerfile: Dockerfile.server\n" +
                "    networks:\n" +
                "      - instantstack-net\n\n" +
                "  client-app:\n" +
                "    build:\n" +
                "      context: ./" + (clientPath.isEmpty() ? "" : clientPath) + "\n" +
                "      dockerfile: Dockerfile.client\n" +
                "    ports:\n" +
                "      - \"" + dynamicPort + ":4200\"\n" +
                "    networks:\n" +
                "      - instantstack-net\n" +
                "    depends_on:\n" +
                "      - server-app\n\n" +
                "networks:\n" +
                "  instantstack-net:\n" +
                "    external: true\n";

        Files.writeString(composeFile.toPath(), composeContent);
        System.out.println("[InstantStack] Dynamic docker-compose.yml generated successfully on port: " + dynamicPort);
    }
    // פונקציה שמוצאת את כל קבצי ה-package.json בפרויקט
//    private void findAllNodePackages(File dir, List<File> result) {
//        if (dir == null || !dir.isDirectory()) return;
//        String name = dir.getName();
//        if (name.equals(".git") || name.equals("node_modules") || name.equals(".idea") || name.equals("target") || name.equals("bin") || name.equals("obj")) {
//            return;
//        }
//        File packageJson = new File(dir, "package.json");
//        if (packageJson.exists()) {
//            result.add(packageJson);
//        }
//        File[] files = dir.listFiles();
//        if (files != null) {
//            for (File file : files) {
//                if (file.isDirectory()) {
//                    findAllNodePackages(file, result);
//                }
//            }
//        }
//    }

    // פונקציה שמייצרת קומפוז ודוקרפיילים עבור Node Server + Node Client
//    private void generateNodeFullstackComposeFile(File rootDir, List<File> nodePackages) throws IOException {
//        // נזהה מי מהתיקיות היא השרת ומי הקליינט לפי השם, או פשוט לפי הסדר
//        File firstNode = nodePackages.get(0);
//        File secondNode = nodePackages.get(1);
//
//        File clientDir = firstNode.getParentFile().getName().toLowerCase().contains("server") ? secondNode.getParentFile() : firstNode.getParentFile();
//        File serverDir = clientDir == firstNode.getParentFile() ? secondNode.getParentFile() : firstNode.getParentFile();
//
//        String clientPath = rootDir.toURI().relativize(clientDir.toURI()).getPath();
//        String serverPath = rootDir.toURI().relativize(serverDir.toURI()).getPath();
//        if(clientPath.endsWith("/")) clientPath = clientPath.substring(0, clientPath.length()-1);
//        if(serverPath.endsWith("/")) serverPath = serverPath.substring(0, serverPath.length()-1);
//
//        // 1. Dockerfile לקליינט
//        File clientDocker = new File(clientDir, "Dockerfile.client");
//        String clientDockerContent = "FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install --legacy-peer-deps\nCOPY . .\nEXPOSE 4200\nENV CI=true\nCMD [\"npm\", \"start\", \"--\", \"--host\", \"0.0.0.0\"]\n";
//        Files.writeString(clientDocker.toPath(), clientDockerContent);
//
//        // 2. Dockerfile לשרת Node
//        File serverDocker = new File(serverDir, "Dockerfile.server");
//        String serverDockerContent = "FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 8080\nCMD [\"npm\", \"start\"]\n";
//        Files.writeString(serverDocker.toPath(), serverDockerContent);
//
//        // 3. docker-compose.yml בשורש
//        File composeFile = new File(rootDir, "docker-compose.yml");
//        String composeContent = "services:\n" +
//                "  server-app:\n" +
//                "    build:\n" +
//                "      context: ./\n" +
//                "      dockerfile: " + serverPath + "/Dockerfile.server\n" +
//                "    ports:\n" +
//                "      - \"8080:8080\"\n" +
//                "    networks:\n" +
//                "      - instantstack-net\n\n" +
//                "  client-app:\n" +
//                "    build:\n" +
//                "      context: ./\n" +
//                "      dockerfile: " + clientPath + "/Dockerfile.client\n" +
//                "    ports:\n" +
//                "      - \"4200:4200\"\n" +
//                "    networks:\n" +
//                "      - instantstack-net\n" +
//                "    depends_on:\n" +
//                "      - server-app\n\n" +
//                "networks:\n" +
//                "  instantstack-net:\n" +
//                "    external: true\n";
//
//        Files.writeString(composeFile.toPath(), composeContent);
//        System.out.println("[InstantStack] Generated Docker Compose specifically for Node-JS Fullstack bundle.");
//    }

    //----------------------------------------------------------------------------------------

    /**
     * פונקציית עזר רקורסיבית כללית לחיפוש קובץ ספציפי (כמו package.json) בתתי תיקיות
     */
    private File searchForFile(File dir, String fileName) {
        if (dir == null || !dir.isDirectory()) return null;

        String name = dir.getName();
        if (name.equals(".git") || name.equals("node_modules") || name.equals(".idea") || name.equals("target") || name.equals("bin") || name.equals("obj")) {
            return null;
        }

        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (!file.isDirectory()) {
                    // בדיקה מיוחדת עבור סי-שארפ (סיומת)
                    if (fileName.equals(".csproj") && file.getName().endsWith(".csproj")) {
                        return file;
                    }
                    // בדיקה רגילה עבור package.json ו-pom.xml (שם מדויק)
                    if (file.getName().equalsIgnoreCase(fileName)) {
                        return file;
                    }
                }
            }

            // אם לא מצאנו בתיקייה הנוכחית, נמשיך לחפש ברקורסיה בתתי-התיקיות
            for (File file : files) {
                if (file.isDirectory()) {
                    File found = searchForFile(file, fileName);
                    if (found != null) return found;
                }
            }
        }
        return null;
    }    /**
     * 4. פונקציית סריקה רקורסיבית לאיתור קובץ index.html עבור אתרים סטטיים
     */
    private File searchForIndexHtml(File dir) {
        if (dir == null || !dir.isDirectory()) return null;

        String name = dir.getName();
        if (name.equals(".git") || name.equals("node_modules") || name.equals(".idea") || name.equals("target")) {
            return null; // הגנה כדי לא לסרוק ספריות ענק
        }

        File indexFile = new File(dir, "index.html");
        if (indexFile.exists()) {
            return dir;
        }

        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    File found = searchForIndexHtml(file);
                    if (found != null) {
                        return found;
                    }
                }
            }
        }
        return null;
    }

    /**
     * 5. פונקציית הורדה ועדכון של פרויקטים מ-Git
     */
    private void cloneOrPullProjectFromGit(String gitUrl, String targetPath) throws Exception {
        File targetDir = new File(targetPath);
        File gitFolder = new File(targetDir, ".git");

        ProcessBuilder pb;

        if (targetDir.exists() && gitFolder.exists()) {
            pb = new ProcessBuilder("git", "pull");
            pb.directory(targetDir);
        } else {
            if (!targetDir.exists()) {
                targetDir.mkdirs();
            }
            pb = new ProcessBuilder("git", "clone", gitUrl, ".");
            pb.directory(targetDir);
        }

        Process process = pb.start();
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Git command failed with exit code: " + exitCode);
        }
    }

    /**
     * 6. מחיקת סביבה - עצירת קונטיינר ומחיקת ה-Image מהמחשב לפרויקט נקי
     */
    private void stopAndRemoveContainer(Long envId, Long projectId) {
        try {
            String baseFolderPath = System.getProperty("user.home") + "/instantstack/projects/project_" + projectId;
            File projectDir = new File(baseFolderPath);
            File composeFile = new File(projectDir, "docker-compose.yml");

            if (projectDir.exists() && composeFile.exists()) {
                System.out.println("[InstantStack] 🧹 Fullstack detected. Running 'docker compose down'...");
                ProcessBuilder pb = new ProcessBuilder("docker", "compose", "down", "--rmi", "all");
                pb.directory(projectDir);
                pb.start().waitFor();
                return;
            }

            // המחיקה הרגילה שלך עבור קונטיינר בודד
            String containerName = "env_" + envId;
            String imageName = "img_project_" + projectId;

            ProcessBuilder rmPb = new ProcessBuilder("docker", "rm", "-f", containerName);
            rmPb.start().waitFor();

            ProcessBuilder rmiPb = new ProcessBuilder("docker", "rmi", "-f", imageName);
            rmiPb.start();

            System.out.println("[InstantStack] Cleaned up single container and image.");
        } catch (Exception e) {
            System.err.println("[InstantStack] Cleanup warning: " + e.getMessage());
        }
    }
    // ==========================================
    //   שאר פונקציות הניהול וה-CRUD שלכן (ללא שינוי)
    // ==========================================

    public List<Environment> getAllEnvironments() {
        return environmentRepository.findAll();
    }

    public void deleteEnvironment(Long id, boolean isAutomatic) {
        // 1. שליפת הסביבה או זריקת שגיאה אם היא לא קיימת
        Environment env = environmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Environment not found with id: " + id));

        // 2. בדיקת הרשאות - מופעלת רק אם המחיקה מגיעה ממשתמש אנושי (לא מהטיימר האוטומטי)
        if (!isAutomatic) {
            AppUser currentUser = appUserService.getCurrentUser();
            if (currentUser.getRole() == AppUser.Role.Employee) {
                if (!env.getWorkerId().equals(currentUser.getId())) {
                    throw new AuthException("Access Denied: You can only delete your own environments.");
                }
            }
            else if (currentUser.getRole() == AppUser.Role.Manager) {
                if (env.getProject() != null && !env.getProject().getManagerId().equals(currentUser.getId())) {
                    throw new AuthException("Access Denied: You can only delete environments from your own projects.");
                }
            }
        } else {
            System.out.println("[InstantStack] Automatic cleanup tool is bypassing security for environment ID: " + id);
        }

        // 3. ניקוי הקשר לפרויקט ועצירת קונטיינר דוקר (הלוגיקה המקורית שלכן)
        if (env.getProject() != null) {
            env.getProject().getEnvironments().remove(env);
            // העברת ה-ID של הפרויקט לפונקציית הניקוי המשודרגת שלכן
            stopAndRemoveContainer(id, env.getProject().getId());
        } else {
            // גיבוי למקרה שאין פרויקט מקושר
            try {
                ProcessBuilder pb = new ProcessBuilder("docker", "rm", "-f", "env_" + id);
                pb.start();
            } catch (Exception e) {
                System.err.println("[InstantStack] Warning: Could not remove standalone container: " + e.getMessage());
            }
        }

        // 4. מחיקת הסביבה מהדאטה-בייס
        environmentRepository.delete(env);
        System.out.println("Environment " + id + " was successfully deleted from DB and Docker.");
    }



    public void updateEnvironment(Long id, Environment envDetails) {
        Environment env = environmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Environment not found"));

        AppUser currentUser = appUserService.getCurrentUser();

        if (currentUser.getRole() == AppUser.Role.Employee) {
            if (!env.getWorkerId().equals(currentUser.getId())) {
                throw new AuthException("Access Denied: You can only update your own environments.");
            }
        } else if (currentUser.getRole() == AppUser.Role.Manager) {
            if (env.getProject() != null && !env.getProject().getManagerId().equals(currentUser.getId())) {
                throw new AuthException("Access Denied: You can only update environments in your own projects.");
            }
        }

        env.setStatus(envDetails.getStatus());
        env.setProject(envDetails.getProject());
        env.setPort(envDetails.getPort());
        environmentRepository.save(env);
    }

    public Environment getEnvironmentByID(Long id) {
        return environmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("environment not found"));
    }

    public int findNextAvailablePort() {
        for (int port = MIN_PORT; port <= MAX_PORT; port++) {
            if (isPortAvailable(port)) {
                return port;
            }
        }
        throw new RuntimeException("No available ports in range " + MIN_PORT + "-" + MAX_PORT);
    }

    private boolean isPortAvailable(int port) {
        if (port < MIN_PORT || port > MAX_PORT) return false;
        return !environmentRepository.existsByPort(port);
    }

    public void updateStatus(Long id, Environment.Status newStatus) {
        Environment env = getEnvironmentByID(id);
        env.setStatus(newStatus);
        environmentRepository.save(env);
    }

    public List<Environment> getEnvironmentsForWorker(Long workerId) {
        return environmentRepository.findByWorkerId(workerId);
    }
}
