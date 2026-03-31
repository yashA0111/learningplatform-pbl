package com.learningplatform.engine.controller;

import com.learningplatform.engine.dto.RecommendationRequest;
import com.learningplatform.engine.model.Course;
import com.learningplatform.engine.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommend")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/{userId}")
    public List<Course> getRecommendations(@PathVariable String userId) {
        return recommendationService.recommendCourses(userId);
    }

    @PostMapping("/by-interests")
    public List<Course> getRecommendationsByInterests(@RequestBody RecommendationRequest request) {
        return recommendationService.recommendCoursesByInterests(request.getInterests(), request.getCompletedCourses());
    }

    @PostMapping("/register")
    public String registerCourse(@RequestBody Course course) {
        recommendationService.addCourse(course);
        return "Course registered successfully";
    }

    @PostMapping("/register-batch")
    public String registerCourses(@RequestBody List<Course> courses) {
        for (Course course : courses) {
            recommendationService.addCourse(course);
        }
        return "Batch registered successfully";
    }
}
