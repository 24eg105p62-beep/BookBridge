package com.bookbridge.controller;

import com.bookbridge.dto.ReviewCreateDto;
import com.bookbridge.dto.ReviewResponse;
import com.bookbridge.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ReviewResponse> submitReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewCreateDto dto) {
        ReviewResponse response = reviewService.submitReview(id, dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getRequestReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewsForRequest(id));
    }
}
