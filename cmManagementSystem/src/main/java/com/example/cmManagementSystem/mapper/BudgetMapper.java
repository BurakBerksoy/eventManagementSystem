package com.example.cmManagementSystem.mapper;

import com.example.cmManagementSystem.dto.BudgetDto;
import com.example.cmManagementSystem.entity.Budget;
import org.springframework.stereotype.Component;

@Component
public class BudgetMapper {

    /**
     * Budget entity'sini BudgetDto'ya dönüştürür
     *
     * @param budget Budget entity
     * @return BudgetDto
     */
    public BudgetDto toDto(Budget budget) {
        if (budget == null) {
            return null;
        }
        
        BudgetDto dto = new BudgetDto();
        dto.setId(budget.getId());
        
        if (budget.getClub() != null) {
            dto.setClubId(budget.getClub().getId());
            dto.setClubName(budget.getClub().getName());
        }
        
        dto.setTotalAmount(budget.getTotalAmount());
        dto.setAvailableAmount(budget.getAvailableAmount());
        dto.setAllocatedAmount(budget.getAllocatedAmount());
        dto.setAcademicYear(budget.getAcademicYear());
        dto.setStartDate(budget.getStartDate());
        dto.setEndDate(budget.getEndDate());
        dto.setDescription(budget.getDescription());
        dto.setStatus(budget.getStatus());
        
        if (budget.getCreatedBy() != null) {
            dto.setCreatedById(budget.getCreatedBy().getId());
            dto.setCreatedByName(budget.getCreatedBy().getName());
        }
        
        dto.setCreatedAt(budget.getCreatedAt());
        dto.setUpdatedAt(budget.getUpdatedAt());
        
        return dto;
    }
    
    /**
     * BudgetDto'yu Budget entity'ye dönüştürür (yeni entity oluşturur)
     *
     * @param budgetDto BudgetDto
     * @return Budget entity
     */
    public Budget toEntity(BudgetDto budgetDto) {
        if (budgetDto == null) {
            return null;
        }
        
        Budget budget = new Budget();
        updateEntityFromDto(budgetDto, budget);
        return budget;
    }
    
    /**
     * BudgetDto değerlerini mevcut Budget entity'sine kopyalar (update)
     *
     * @param budgetDto Kaynak BudgetDto
     * @param budget Hedef Budget entity
     */
    public void updateEntityFromDto(BudgetDto budgetDto, Budget budget) {
        if (budgetDto == null || budget == null) {
            return;
        }
        
        budget.setTotalAmount(budgetDto.getTotalAmount());
        budget.setAvailableAmount(budgetDto.getAvailableAmount());
        budget.setAllocatedAmount(budgetDto.getAllocatedAmount());
        budget.setAcademicYear(budgetDto.getAcademicYear());
        budget.setStartDate(budgetDto.getStartDate());
        budget.setEndDate(budgetDto.getEndDate());
        budget.setDescription(budgetDto.getDescription());
        budget.setStatus(budgetDto.getStatus());
    }
} 