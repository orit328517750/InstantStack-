package com.example.instantstack.repositories;

import com.example.instantstack.entities.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    public boolean existsByName(String name);

    Project findByName(String name);
}
