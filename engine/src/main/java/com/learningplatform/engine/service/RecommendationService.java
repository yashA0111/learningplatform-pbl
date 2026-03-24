package com.learningplatform.engine.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningplatform.engine.model.Course;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private List<Course> courses = new ArrayList<>();
    
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
                courses = mapper.readValue(is, new TypeReference<List<Course>>(){});
            }
        } catch (Exception e) {
            e.printStackTrace();
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

    public List<Course> recommendCoursesByInterests(List<String> interests) {
        if (interests == null || interests.isEmpty()) {
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

    private double calculateJaccardSimilarity(Set<String> s1, Set<String> s2) {
        if (s1.isEmpty() && s2.isEmpty()) return 0.0;
        
        Set<String> intersection = new HashSet<>(s1);
        intersection.retainAll(s2);
        
        Set<String> union = new HashSet<>(s1);
        union.addAll(s2);
        
        return (double) intersection.size() / union.size();
    }
}
