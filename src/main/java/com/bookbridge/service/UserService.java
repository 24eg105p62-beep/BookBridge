package com.bookbridge.service;

import com.bookbridge.dto.CommunitySnapshotResponse;
import com.bookbridge.dto.UpdateProfileRequest;
import com.bookbridge.dto.UserProfileResponse;
import com.bookbridge.dto.UserStatsResponse;
import com.bookbridge.entity.BookStatus;
import com.bookbridge.entity.RequestStatus;
import com.bookbridge.entity.User;
import com.bookbridge.exception.ResourceNotFoundException;
import com.bookbridge.repository.BookRepository;
import com.bookbridge.repository.BorrowRequestRepository;
import com.bookbridge.repository.ReviewRepository;
import com.bookbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final ReviewRepository reviewRepository;

    public UserService(UserRepository userRepository,
                       BookRepository bookRepository,
                       BorrowRequestRepository borrowRequestRepository,
                       ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.reviewRepository = reviewRepository;
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserProfileResponse getUserProfile(Long id) {
        User user = findById(id);

        long booksListed = bookRepository.countByOwnerId(id);
        long booksCurrentlyLentOut = bookRepository.countByOwnerIdAndStatus(id, BookStatus.BORROWED);
        long booksCurrentlyBorrowed = borrowRequestRepository.countByRequesterIdAndStatus(id, RequestStatus.APPROVED);
        long completedExchanges = borrowRequestRepository.countExchangesForUserAndStatus(id, RequestStatus.RETURNED);

        Double avgOwner = roundToSingleDecimal(reviewRepository.calculateAverageRatingAsOwner(id).orElse(null));
        Double avgBorrower = roundToSingleDecimal(reviewRepository.calculateAverageRatingAsBorrower(id).orElse(null));
        Double overallAvg = roundToSingleDecimal(reviewRepository.calculateAverageRatingForUser(id).orElse(null));

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getLocation(),
                booksListed,
                booksCurrentlyLentOut,
                booksCurrentlyBorrowed,
                completedExchanges,
                avgOwner,
                avgBorrower,
                overallAvg
        );
    }

    @Transactional
    public UserProfileResponse updateUserProfile(Long id, UpdateProfileRequest request) {
        User user = findById(id);

        user.setName(request.getName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation().trim());
        }

        userRepository.save(user);
        return getUserProfile(id);
    }

    public UserStatsResponse getUserStatistics(Long id) {
        findById(id); // verify existence

        UserStatsResponse stats = new UserStatsResponse();

        // Owner metrics
        stats.setBooksListed(bookRepository.countByOwnerId(id));
        stats.setBooksCurrentlyLentOut(bookRepository.countByOwnerIdAndStatus(id, BookStatus.BORROWED));
        stats.setPendingIncomingRequests(borrowRequestRepository.countByBookOwnerIdAndStatus(id, RequestStatus.PENDING));
        stats.setAverageRatingAsOwner(roundToSingleDecimal(reviewRepository.calculateAverageRatingAsOwner(id).orElse(null)));

        // Borrower metrics
        stats.setBooksCurrentlyBorrowed(borrowRequestRepository.countByRequesterIdAndStatus(id, RequestStatus.APPROVED));
        stats.setBorrowingHistory(borrowRequestRepository.countByRequesterIdAndStatus(id, RequestStatus.RETURNED));
        stats.setPendingSentRequests(borrowRequestRepository.countByRequesterIdAndStatus(id, RequestStatus.PENDING));
        stats.setAverageRatingAsBorrower(roundToSingleDecimal(reviewRepository.calculateAverageRatingAsBorrower(id).orElse(null)));

        // Overall metrics
        stats.setCompletedExchanges(borrowRequestRepository.countExchangesForUserAndStatus(id, RequestStatus.RETURNED));
        stats.setOverallAverageRating(roundToSingleDecimal(reviewRepository.calculateAverageRatingForUser(id).orElse(null)));

        return stats;
    }

    public CommunitySnapshotResponse getCommunitySnapshot() {
        long totalBooks = bookRepository.count();
        long activeMembers = userRepository.count();
        long booksExchanged = borrowRequestRepository.countByStatus(RequestStatus.RETURNED);
        Double avgRating = roundToSingleDecimal(reviewRepository.calculateSystemAverageRating().orElse(null));

        return new CommunitySnapshotResponse(totalBooks, activeMembers, booksExchanged, avgRating);
    }

    private Double roundToSingleDecimal(Double val) {
        if (val == null) return null;
        return Math.round(val * 10.0) / 10.0;
    }
}
