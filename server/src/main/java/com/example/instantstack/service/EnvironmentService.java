//package com.example.instantstack.service;
//
//import com.example.instantstack.entities.AppUser;
//import com.example.instantstack.entities.Environment;
//import com.example.instantstack.entities.Project;
//import com.example.instantstack.exception.AuthException;
//import com.example.instantstack.repositories.EnvironmentRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
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
////    // פונקציה ליצירת סביבה מאפס - מרכזת את כל השלבים
////    @Transactional
////    public Environment createAndStartEnvironment(Project project,Long workerId) {
////        AppUser currentUser = appUserService.getCurrentUser();
////        if(currentUser.getRole() == AppUser.Role.Employee){
////            workerId = currentUser.getId();
////        }
////        Environment env = new Environment();
////        env.setPort(findNextAvailablePort());
////        env.setStatus(Environment.Status.STARTING);
////        env.setProject(project);
////        env.setWorkerId(workerId);
////
////        // שמירה ראשונית כדי לקבל ID
////        env = environmentRepository.save(env);
////
////        try {
////            startDockerContainer(env);
////        } catch (Exception e) {
////            env.setStatus(Environment.Status.ERROR);
////            environmentRepository.save(env);
////            throw new RuntimeException("Docker failed: " + e.getMessage());
////        }
////        return env;
////    }
//@Transactional
//public Environment createAndStartEnvironment(Project project, Long workerId) {
//    AppUser currentUser = appUserService.getCurrentUser();
//    if (currentUser.getRole() == AppUser.Role.Employee) {
//        workerId = currentUser.getId();
//    }
//    Environment env = new Environment();
//    env.setPort(findNextAvailablePort());
//    env.setStatus(Environment.Status.STARTING);
//    env.setProject(project);
//    env.setWorkerId(workerId);
//
//    // שמירה ראשונית כדי לקבל ID (הלוגיקה המקורית שלך נשמרת במלואה)
//    env = environmentRepository.save(env);
//
//    try {
//        // 1. שליפת כתובת ה-Git מתוך ישות הפרויקט שהתקבלה
//        String gitUrl = project.getGitUrl();
//
//        // הגנה: אם אין כתובת גיט לפרויקט, נעצור כאן בצורה מסודרת
//        if (gitUrl == null || gitUrl.isEmpty()) {
//            throw new RuntimeException("No Git URL defined for this project.");
//        }
//
//        // 2. יצירת נתיב תיקייה ייחודי במחשב לפי מזהה הפרויקט
//        // הנתיב החדש ישמור את זה בתיקיית המשתמש הרגילה שלך בווינדוס
//        String localFolderPath = System.getProperty("user.home") + "/instantstack/projects/project_" + project.getId();
//        // 3. קריאה לפונקציה החדשה שמורידה או מעדכנת את הקוד מהגיט
//        cloneOrPullProjectFromGit(gitUrl, localFolderPath);
//
//        // 4. הפעלת הקונטיינר בדוקר (הפונקציה המשודרגת שמשתמשת ב-Volume)
//        startDockerContainer(env);
//
//    } catch (Exception e) {
//        // הגנה מקורית שלך: כל תקלה בגיט או בדוקר תשנה סטטוס ל-ERROR
//        env.setStatus(Environment.Status.ERROR);
//        environmentRepository.save(env);
//        throw new RuntimeException("Environment creation failed: " + e.getMessage());
//    }
//
//    return env;
//}
//
//    public List<Environment> getAllEnvironments() {
//         return  environmentRepository.findAll();
//    }
//
//    @Transactional // הקריטי ביותר! דואג שהקשר לפרויקט יהיה פתוח בזמן המחיקה
//    public void deleteEnvironment(Long id) {
//        Environment env = environmentRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Environment not found with id: " + id));
//
//        AppUser currentUser = appUserService.getCurrentUser();
//        if(currentUser.getRole() == AppUser.Role.Employee) {
//            if (!env.getWorkerId().equals(currentUser.getId())) {
//                throw new AuthException("Access Denied: You can only delete your own environments.");
//            }
//        }
//        else if(currentUser.getRole() == AppUser.Role.Manager){
//            if (env.getProject() != null &&
//                    !env.getProject().getManagerId().equals(currentUser.getId())) {
//                throw new AuthException("Access Denied: You can only delete environments from your own projects.");
//            }
//        }
//
//        // ניתוק הקשר מהפרויקט
//        if (env.getProject() != null) {
//            env.getProject().getEnvironments().remove(env);
//        }
//        // עצירה והסרה של הקונטיינר מהדוקר
//        stopAndRemoveContainer(id);
//        // מחיקה מה-DB
//        environmentRepository.delete(env);
//        System.out.println("Environment " + id + " was successfully deleted from DB and Docker.");
//    }
//    public void updateEnvironment(Long id,Environment envDetails) {
//        Environment env = environmentRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Environment not found"));
//
//        AppUser currentUser = appUserService.getCurrentUser();
//
//        if (currentUser.getRole() == AppUser.Role.Employee) {
//            // עובד יכול לעדכן רק סביבה של עצמו
//            if (!env.getWorkerId().equals(currentUser.getId())) {
//                throw new AuthException("Access Denied: You can only update your own environments.");
//            }
//        } else if (currentUser.getRole() == AppUser.Role.Manager) {
//            // מנהל יכול לעדכן רק סביבה ששייכת לפרויקט שלו
//            if (env.getProject() != null && !env.getProject().getManagerId().equals(currentUser.getId())) {
//                throw new AuthException("Access Denied: You can only update environments in your own projects.");
//            }
//        }
//
//        env.setStatus(envDetails.getStatus());
//        env.setProject(envDetails.getProject());
//        env.setPort(envDetails.getPort());
//        environmentRepository.save(env);
//    }
//
//    public Environment getEnvironmentByID(Long id) {
//        return environmentRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("environment not found"));
//    }
//
//    public int findNextAvailablePort() {
//        for (int port = MIN_PORT; port <= MAX_PORT; port++) {
//            if (isPortAvailable(port)) {
//                return port;
//            }
//        }
//        throw new RuntimeException("No available ports in range " + MIN_PORT + "-" + MAX_PORT);
//    }
//
//    private boolean isPortAvailable(int port) {
//        if (port < MIN_PORT || port > MAX_PORT) return false;
//        return !environmentRepository.existsByPort(port);
//    }
//
//    public void startDockerContainer(Environment env) {
//        try {
//            String containerName = "env_" + env.getId();
//            String portMapping = env.getPort() + ":80";
//
//            // 1. הגדרת נתיב מקומי במחשב שבו נשמור את הקוד של הפרויקט
//            String localFolderPath = "C:/instantstack/projects/project_" + env.getProject().getId();
//
//            // 2. משיכת הכתובת הדינמית מהשדה החדש שהוספתן בפרויקט!
//            String gitUrl = env.getProject().getGitUrl();
//
//            // 3. קריאה לפונקציית הגיט (החכמה שכתבנו קודם) שמורידה/מעדכנת את הקוד
//            cloneOrPullProjectFromGit(gitUrl, localFolderPath);
//
//            // 4. שינוי פקודת הדוקר: הוספת ה-Volume (-v)
//            // מחברים את התיקייה במחשב שלך (localFolderPath) ישירות לתיקיית האתר של דוקר
//            ProcessBuilder pb = new ProcessBuilder(
//                    "docker", "run", "-d",
//                    "--name", containerName,
//                    "-p", portMapping,
//                    "-v", localFolderPath + ":/usr/share/nginx/html", // המפתח לקישור האוטומטי!
//                    "nginx"
//            );
//
//            Process process = pb.start();
//            process.waitFor(); // מחכים שדוקר יסיים לעלות בצורה יציבה
//
//            updateStatus(env.getId(), Environment.Status.RUNNING);
//        } catch (Exception e) {
//            updateStatus(env.getId(), Environment.Status.ERROR);
//            throw new RuntimeException("Failed to start Docker container: " + e.getMessage());
//        }
//    }
//    private void cloneOrPullProjectFromGit(String gitUrl, String targetPath) throws Exception {
//        java.io.File targetDir = new java.io.File(targetPath);
//        java.io.File gitFolder = new java.io.File(targetDir, ".git");
//
//        ProcessBuilder pb;
//
//        if (targetDir.exists() && gitFolder.exists()) {
//            // אם הפרויקט כבר הורד בעבר, רק נמשוך שינויים חדשים מה-gitUrl
//            pb = new ProcessBuilder("git", "pull");
//            pb.directory(targetDir);
//        } else {
//            // פעם ראשונה? ניצור תיקייה ונעשה Clone נקי
//            if (!targetDir.exists()) {
//                targetDir.mkdirs();
//            }
//            pb = new ProcessBuilder("git", "clone", gitUrl, ".");
//            pb.directory(targetDir);
//        }
//
//        Process process = pb.start();
//        int exitCode = process.waitFor();
//        if (exitCode != 0) {
//            throw new RuntimeException("Git command failed with exit code: " + exitCode);
//        }
//    }
//
//    private void stopAndRemoveContainer(Long envId) {
//        try {
//            String containerName = "env_" + envId;
//            ProcessBuilder pb = new ProcessBuilder("docker", "rm", "-f", containerName);
//            pb.start();
//        } catch (Exception e) {
//            System.err.println("Note: Docker container for env_" + envId + " could not be deleted.");
//        }
//    }
//
//    public void updateStatus(Long id, Environment.Status newStatus) {
//        Environment env = getEnvironmentByID(id);
//        env.setStatus(newStatus);
//        environmentRepository.save(env);
//    }
//    public List<Environment> getEnvironmentsForWorker(Long workerId) {
//        return environmentRepository.findByWorkerId(workerId);
//    }
//
//}


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
            String containerName = "env_" + env.getId();
            String imageName = "img_project_" + env.getProject().getId();

            String baseFolderPath = System.getProperty("user.home") + "/instantstack/projects/project_" + env.getProject().getId();
            File projectDir = new File(baseFolderPath);

            // מייצרים אוטומטית את קובץ ה-Dockerfile בתיקיית הפרויקט בהתאם לשפה שלו
            generateAutomaticDockerfile(projectDir);

            // שליפת הפורט הצפוי מהדאטה-בייס (ברירת מחדל לפרונטנד היא 80)
            int expectedPort = env.getProject().getExpectedPort() != null ? env.getProject().getExpectedPort() : 80;
            String portMapping = env.getPort() + ":" + expectedPort;

            System.out.println("[InstantStack] Starting Docker Build for project ID: " + env.getProject().getId());

            // שלב א': Docker Build - בניית ה-Image מה-Dockerfile
            ProcessBuilder buildPb = new ProcessBuilder("docker", "build", "-t", imageName, ".");
            buildPb.directory(projectDir);

            // שולח את הפלט של דוקר ישירות ל-Console של IntelliJ שתראי מה קורה בזמן אמת!
            buildPb.inheritIO();

            Process buildProcess = buildPb.start();

            // נותנים לזה עד 5 דקות לסיים לבנות (מתאים לאנגולר/ריאקט כבדים)
            int buildExitCode = buildProcess.waitFor();
            if (buildExitCode != 0) {
                throw new RuntimeException("Docker build failed. Check your project structure.");
            }

            System.out.println("[InstantStack] Docker Build successful. Launching container: " + containerName);
            // שלב ב': Docker Run - הפעלת הקונטיינר המותאם אישית
            ProcessBuilder runPb = new ProcessBuilder(
                    "docker", "run", "-d",
                    "--name", containerName,
                    "--network", "instantstack-net", // 🔥 הנה השינוי היחיד!
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
    private void generateAutomaticDockerfile(File projectDir) throws IOException {
        File dockerfile = new File(projectDir, "Dockerfile");

        if (dockerfile.exists()) {
            System.out.println("[InstantStack] Custom Dockerfile detected. Skipping auto-generation.");
            return;
        }

        StringBuilder dockerContent = new StringBuilder();

        // 1. זיהוי פרויקט Java (Maven)
        if (new File(projectDir, "pom.xml").exists()) {
            dockerContent.append("FROM openjdk:17-jdk-slim\n")
                    .append("COPY target/*.jar app.jar\n")
                    .append("ENTRYPOINT [\"java\", \"-jar\", \"/app.jar\"]\n");
            System.out.println("[InstantStack] Auto-detected: Java (Maven) project.");
        }
        // 2. 🔥 שדרוג: זיהוי חכם של Node.js / React / Angular (גם אם הם מתחבאים בתת-תיקייה!)
        // 2. שדרוג: זיהוי חכם של Node.js / React / Angular
        else if (searchForFile(projectDir, "package.json") != null) {
            File packageJsonDir = searchForFile(projectDir, "package.json");
            String relativePath = projectDir.toURI().relativize(packageJsonDir.toURI()).getPath();
            if (relativePath.endsWith("/")) {
                relativePath = relativePath.substring(0, relativePath.length() - 1);
            }

            dockerContent.append("FROM node:20-alpine\n") // 🔥 כאן שינינו מ-18 ל-20!
                    .append("WORKDIR /app\n")
                    .append("COPY ").append(relativePath.isEmpty() ? "." : relativePath).append("/package*.json ./\n")
                    .append("RUN npm install --legacy-peer-deps\n")
                    .append("COPY ").append(relativePath.isEmpty() ? "." : relativePath).append(" .\n")
                    .append("EXPOSE 4200\n")
                    .append("ENV CI=true\n")
                    .append("CMD [\"npm\", \"start\", \"--\", \"--host\", \"0.0.0.0\"]\n");

            System.out.println("[InstantStack] Auto-detected Angular/Node in subfolder: " + relativePath);
        }
        // 3. ברירת מחדל: אתר סטטי
        else {
            File foundHtmlDir = searchForIndexHtml(projectDir);
            String relativePath = ".";
            if (foundHtmlDir != null) {
                relativePath = projectDir.toURI().relativize(foundHtmlDir.toURI()).getPath();
            }

            dockerContent.append("FROM nginx:alpine\n")
                    .append("COPY ./").append(relativePath).append(" /usr/share/nginx/html\n")
                    .append("EXPOSE 80\n");
            System.out.println("[InstantStack] Auto-detected: Static HTML project.");
        }

        Files.writeString(dockerfile.toPath(), dockerContent.toString());
    }

    /**
     * פונקציית עזר רקורסיבית כללית לחיפוש קובץ ספציפי (כמו package.json) בתתי תיקיות
     */
    private File searchForFile(File dir, String fileName) {
        if (dir == null || !dir.isDirectory()) return null;
        String name = dir.getName();
        if (name.equals(".git") || name.equals("node_modules") || name.equals(".idea") || name.equals("target") || name.equals("bin") || name.equals("obj")) {
            return null;
        }
        File targetFile = new File(dir, fileName);
        if (targetFile.exists()) {
            return dir;
        }
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    File found = searchForFile(file, fileName);
                    if (found != null) return found;
                }
            }
        }
        return null;
    }
    /**
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
            String containerName = "env_" + envId;
            String imageName = "img_project_" + projectId;

            // הסרת הקונטיינר בכוח
            ProcessBuilder rmPb = new ProcessBuilder("docker", "rm", "-f", containerName);
            rmPb.start().waitFor();

            // הסרת ה-Image מהדיסק
            ProcessBuilder rmiPb = new ProcessBuilder("docker", "rmi", "-f", imageName);
            rmiPb.start();

            System.out.println("[InstantStack] Cleaned up container " + containerName + " and image " + imageName);
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

    @Transactional
    public void deleteEnvironment(Long id) {
        Environment env = environmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Environment not found with id: " + id));

        AppUser currentUser = appUserService.getCurrentUser();
        if(currentUser.getRole() == AppUser.Role.Employee) {
            if (!env.getWorkerId().equals(currentUser.getId())) {
                throw new AuthException("Access Denied: You can only delete your own environments.");
            }
        }
        else if(currentUser.getRole() == AppUser.Role.Manager){
            if (env.getProject() != null && !env.getProject().getManagerId().equals(currentUser.getId())) {
                throw new AuthException("Access Denied: You can only delete environments from your own projects.");
            }
        }

        if (env.getProject() != null) {
            env.getProject().getEnvironments().remove(env);
            // העברת ה-ID של הפרויקט לפונקציית הניקוי המשודרגת
            stopAndRemoveContainer(id, env.getProject().getId());
        } else {
            // גיבוי למקרה שאין פרויקט מקושר
            try { ProcessBuilder pb = new ProcessBuilder("docker", "rm", "-f", "env_" + id); pb.start(); } catch(Exception e){}
        }

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