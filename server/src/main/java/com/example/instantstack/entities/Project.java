package com.example.instantstack.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Entity
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Environment> environments = new ArrayList<>();
    private Long managerId;
    private String gitUrl;
    private Integer expectedPort; // הפורט הפנימי שהאפליקציה בתוך הדוקר מקשיבה לו (למשל 8080 או 3000)

}
