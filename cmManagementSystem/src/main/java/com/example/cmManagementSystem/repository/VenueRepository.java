package com.example.cmManagementSystem.repository;

import com.example.cmManagementSystem.entity.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    
    List<Venue> findByName(String name);
    
    List<Venue> findByCity(String city);
    
    List<Venue> findByCapacityGreaterThanEqual(Integer capacity);
    
    List<Venue> findByIsUniversityVenue(Boolean isUniversityVenue);
    
    Page<Venue> findByCapacityBetween(Integer minCapacity, Integer maxCapacity, Pageable pageable);
    
    @Query("SELECT v FROM Venue v WHERE v.latitude BETWEEN ?1 AND ?2 AND v.longitude BETWEEN ?3 AND ?4")
    List<Venue> findByGeoArea(String minLat, String maxLat, String minLong, String maxLong);
} 