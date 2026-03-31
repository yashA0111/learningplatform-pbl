package com.learningplatform.engine.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningplatform.engine.model.Course;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class RecommendationService {

    private List<Course> courses = new CopyOnWriteArrayList<>();
    
    // Mock user database with predefined interests
    private final Map<String, List<String>> userInterests = Map.of(
            "user1", List.of("Java", "Spring Boot", "Backend"),
            "user2", List.of("Python", "AI", "Data Science"),
            "user3", List.of("JavaScript", "React", "Frontend")
    );

    @PostConstruct
    public void init() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = getClass().getResourceAsStream("/courses.json");
            if (is != null) {
                List<Course> initialCourses = mapper.readValue(is, new TypeReference<List<Course>>(){});
                courses.addAll(initialCourses);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void addCourse(Course course) {
        if (course != null) {
            // Check if course already exists (by ID) to avoid duplicates
            boolean exists = courses.stream().anyMatch(c -> c.getId() != null && c.getId().equals(course.getId()));
            if (!exists) {
                courses.add(course);
            }
        }
    }

    public List<Course> recommendCourses(String userId) {
        List<String> interests = userInterests.getOrDefault(userId, Collections.emptyList());
        if (interests.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> userInterestsSet = new HashSet<>(interests);

        return courses.stream()
                .sorted((c1, c2) -> Double.compare(
                        calculateJaccardSimilarity(new HashSet<>(c2.getTags()), userInterestsSet),
                        calculateJaccardSimilarity(new HashSet<>(c1.getTags()), userInterestsSet)
                ))
                .limit(5)
                .collect(Collectors.toList());
    }

    public List<Course> recommendCoursesByInterests(List<String> interests, List<String> completedCourses) {
        if (interests == null || interests.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> userInterestsSet = new HashSet<>(interests);
        Set<String> completedCoursesSet = completedCourses != null ? 
                completedCourses.stream().map(String::toLowerCase).collect(Collectors.toSet()) : 
                Collections.emptySet();

        return courses.stream()
                .filter(course -> {
                    // Filter out courses the user HAS completed
                    String titleLower = course.getTitle().toLowerCase();
                    String idLower = course.getId().toLowerCase();
                    return !completedCoursesSet.contains(titleLower) && !completedCoursesSet.contains(idLower);
                })
                .sorted((c1, c2) -> Double.compare(
                        calculateJaccardSimilarity(new HashSet<>(c2.getTags()), userInterestsSet),
                        calculateJaccardSimilarity(new HashSet<>(c1.getTags()), userInterestsSet)
                ))
                .limit(5)
                .collect(Collectors.toList());
    }

    private double calculateJaccardSimilarity(Set<String> s1, Set<String> s2) {
        if (s1.isEmpty() && s2.isEmpty()) return 0.0;
        
        Set<String> intersection = new HashSet<>(s1);
        intersection.retainAll(s2);
        
        Set<String> union = new HashSet<>(s1);
        union.addAll(s2);
        
        return (double) intersection.size() / union.size();
    }
}
