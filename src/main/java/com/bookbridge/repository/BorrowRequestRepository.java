package com.bookbridge.repository;

import com.bookbridge.entity.BorrowRequest;
import com.bookbridge.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    List<BorrowRequest> findByBookId(Long bookId);

    List<BorrowRequest> findByRequesterId(Long requesterId);

    List<BorrowRequest> findByBookOwnerId(Long ownerId);

    List<BorrowRequest> findByBookIdAndStatus(Long bookId, RequestStatus status);

    List<BorrowRequest> findByBookIdAndStatusIn(Long bookId, Collection<RequestStatus> statuses);

    long countByRequesterIdAndStatus(Long requesterId, RequestStatus status);

    long countByBookOwnerIdAndStatus(Long ownerId, RequestStatus status);

    long countByStatus(RequestStatus status);

    @Query("SELECT COUNT(br) FROM BorrowRequest br WHERE (br.requester.id = :userId OR br.book.owner.id = :userId) AND br.status = :status")
    long countExchangesForUserAndStatus(@Param("userId") Long userId, @Param("status") RequestStatus status);
}
