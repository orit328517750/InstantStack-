package com.example.instantstack.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Environment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int port;

    @Enumerated(EnumType.STRING) // שומר את הטקסט של ה-Enum ב-DB
    private Status status;

    @ManyToOne
    @JoinColumn(name = "project_id") // הגדרה מפורשת של עמודת הקשר
    private Project project;


    public enum Status {
        PENDING,   // בהמתנה/יצירה
        STARTING,  // בתהליך עלייה בדוקר
        RUNNING,   // עובד ותקין
        STOPPED,   // כבוי
        ERROR     // תקלה בהפעלה
    }
}