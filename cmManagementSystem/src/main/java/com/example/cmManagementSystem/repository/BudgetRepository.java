package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    
    List<Budget> findByClubId(Long clubId);
    
    List<Budget> findByClubIdAndStatus(Long clubId, Budget.BudgetStatus status);
    
    List<Budget> findByAcademicYear(String academicYear);
} 