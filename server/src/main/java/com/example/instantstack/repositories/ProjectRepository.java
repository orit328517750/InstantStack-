package com.example.instantstack.repositories;

import com.example.instantstack.entities.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    public boolean existsByName(String name);
    List<Project> findByManagerId(Long managerId);
    Project findByName(String name);
}
