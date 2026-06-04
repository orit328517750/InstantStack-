package com.example.instantstack.repositories;

import com.example.instantstack.entities.Environment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EnvironmentRepository extends JpaRepository<Environment, Long> {
    boolean existsByPort(int port);
    List<Environment> findByWorkerId(Long workerId);
    List<Environment> findByCreatedAtBefore(LocalDateTime dateTime);
    @Modifying
    @Query("UPDATE Environment e SET e.status = :status WHERE e.id = :id")
    void updateStatus(@Param("id") Long id, @Param("status") Environment.Status status);
}
