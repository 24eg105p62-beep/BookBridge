package com.bookbridge.repository;

import com.bookbridge.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByRevieweeId(Long revieweeId);

    List<Review> findByReviewerId(Long reviewerId);

    List<Review> findByBorrowRequestId(Long borrowRequestId);

    boolean existsByBorrowRequestIdAndReviewerId(Long borrowRequestId, Long reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId")
    Optional<Double> calculateAverageRatingForUser(@Param("userId") Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId AND r.borrowRequest.book.owner.id = :userId")
    Optional<Double> calculateAverageRatingAsOwner(@Param("userId") Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId AND r.borrowRequest.requester.id = :userId")
    Optional<Double> calculateAverageRatingAsBorrower(@Param("userId") Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r")
    Optional<Double> calculateSystemAverageRating();
}
