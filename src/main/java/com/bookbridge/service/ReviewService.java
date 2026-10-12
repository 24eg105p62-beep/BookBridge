package com.bookbridge.service;

import com.bookbridge.dto.ReviewCreateDto;
import com.bookbridge.dto.ReviewResponse;
import com.bookbridge.entity.BorrowRequest;
import com.bookbridge.entity.RequestStatus;
import com.bookbridge.entity.Review;
import com.bookbridge.entity.User;
import com.bookbridge.exception.BadRequestException;
import com.bookbridge.exception.ResourceNotFoundException;
import com.bookbridge.exception.UnauthorizedException;
import com.bookbridge.repository.BorrowRequestRepository;
import com.bookbridge.repository.ReviewRepository;
import com.bookbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         BorrowRequestRepository borrowRequestRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse submitReview(Long requestId, ReviewCreateDto dto) {
        BorrowRequest borrowRequest = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found with id: " + requestId));

        // Rule 1: Only RETURNED loans are eligible for rating
        if (borrowRequest.getStatus() != RequestStatus.RETURNED) {
            throw new BadRequestException("Reviews are only allowed after a loan is completed and marked RETURNED");
        }

        User reviewer = userRepository.findById(dto.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getReviewerId()));

        User bookOwner = borrowRequest.getBook().getOwner();
        User borrower = borrowRequest.getRequester();

        // Rule 2: Reviewer must be either the borrower or the book owner
        User reviewee;
        if (reviewer.getId().equals(borrower.getId())) {
            // Borrower is reviewing the owner
            reviewee = bookOwner;
        } else if (reviewer.getId().equals(bookOwner.getId())) {
            // Owner is reviewing the borrower
            reviewee = borrower;
        } else {
            throw new UnauthorizedException("Only the borrower or the book owner involved in this exchange can leave a review");
        }

        // Rule 3: Single review per direction (unique borrow_request_id + reviewer_id)
        if (reviewRepository.existsByBorrowRequestIdAndReviewerId(requestId, reviewer.getId())) {
            throw new BadRequestException("You have already submitted a review for this loan exchange");
        }

        // Rule 4: Rating range check (1 to 5)
        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars");
        }

        Review review = new Review();
        review.setBorrowRequest(borrowRequest);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment() != null ? dto.getComment().trim() : null);
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    public List<ReviewResponse> getReviewsForUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return reviewRepository.findByRevieweeId(userId).stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsForRequest(Long requestId) {
        borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found with id: " + requestId));

        return reviewRepository.findByBorrowRequestId(requestId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse mapToResponse(Review review) {
        ReviewResponse res = new ReviewResponse();
        res.setId(review.getId());
        res.setBorrowRequestId(review.getBorrowRequest().getId());
        if (review.getBorrowRequest().getBook() != null) {
            res.setBookTitle(review.getBorrowRequest().getBook().getTitle());
        }
        res.setReviewerId(review.getReviewer().getId());
        res.setReviewerName(review.getReviewer().getName());
        res.setRevieweeId(review.getReviewee().getId());
        res.setRevieweeName(review.getReviewee().getName());
        res.setRating(review.getRating());
        res.setComment(review.getComment());
        res.setCreatedAt(review.getCreatedAt());
        return res;
    }
}
