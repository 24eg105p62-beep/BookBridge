package com.bookbridge.controller;

import com.bookbridge.dto.*;
import com.bookbridge.service.BookService;
import com.bookbridge.service.BorrowRequestService;
import com.bookbridge.service.ReviewService;
import com.bookbridge.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final BorrowRequestService borrowRequestService;
    private final ReviewService reviewService;
    private final BookService bookService;

    public UserController(UserService userService,
                          BorrowRequestService borrowRequestService,
                          ReviewService reviewService,
                          BookService bookService) {
        this.userService = userService;
        this.borrowRequestService = borrowRequestService;
        this.reviewService = reviewService;
        this.bookService = bookService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResponse> updateUserProfile(@PathVariable Long id,
                                                                 @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateUserProfile(id, request));
    }

    @GetMapping("/{id}/statistics")
    public ResponseEntity<UserStatsResponse> getUserStatistics(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserStatistics(id));
    }

    @GetMapping("/{id}/requests")
    public ResponseEntity<List<BorrowRequestResponse>> getUserRequests(
            @PathVariable Long id,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(borrowRequestService.getUserRequests(id, type));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getUserReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewsForUser(id));
    }

    @GetMapping("/{id}/books")
    public ResponseEntity<List<BookResponse>> getUserBooks(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBooksByOwner(id));
    }

    @GetMapping("/snapshot")
    public ResponseEntity<CommunitySnapshotResponse> getCommunitySnapshot() {
        return ResponseEntity.ok(userService.getCommunitySnapshot());
    }
}
