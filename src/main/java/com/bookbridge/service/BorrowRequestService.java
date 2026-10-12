package com.bookbridge.service;

import com.bookbridge.dto.BorrowRequestCreateDto;
import com.bookbridge.dto.BorrowRequestResponse;
import com.bookbridge.entity.*;
import com.bookbridge.exception.BadRequestException;
import com.bookbridge.exception.ResourceNotFoundException;
import com.bookbridge.exception.UnauthorizedException;
import com.bookbridge.repository.BookRepository;
import com.bookbridge.repository.BorrowRequestRepository;
import com.bookbridge.repository.ReviewRepository;
import com.bookbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public BorrowRequestService(BorrowRequestRepository borrowRequestRepository,
                                BookRepository bookRepository,
                                UserRepository userRepository,
                                ReviewRepository reviewRepository) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional
    public BorrowRequestResponse createRequest(Long bookId, BorrowRequestCreateDto dto) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        User requester = userRepository.findById(dto.getRequesterId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getRequesterId()));

        // Business Rule 1: Reject self-request
        if (book.getOwner().getId().equals(requester.getId())) {
            throw new BadRequestException("You cannot request to borrow your own book");
        }

        // Business Rule 2: Book must be AVAILABLE
        if (book.getStatus() != BookStatus.AVAILABLE) {
            throw new BadRequestException("Book is currently " + book.getStatus() + " and cannot be requested");
        }

        // Business Rule 3: Single active request rule - check for existing PENDING or APPROVED requests
        List<BorrowRequest> activeRequests = borrowRequestRepository.findByBookIdAndStatusIn(
                bookId, Arrays.asList(RequestStatus.PENDING, RequestStatus.APPROVED)
        );
        if (!activeRequests.isEmpty()) {
            throw new BadRequestException("This book already has an active borrow request");
        }

        BorrowRequest request = new BorrowRequest();
        request.setBook(book);
        request.setRequester(requester);
        request.setDueDate(dto.getDueDate());
        request.setRequestDate(LocalDateTime.now());
        request.setStatus(RequestStatus.PENDING);

        // Update book status to REQUESTED
        book.setStatus(BookStatus.REQUESTED);
        bookRepository.save(book);

        BorrowRequest savedRequest = borrowRequestRepository.save(request);
        return mapToResponse(savedRequest);
    }

    @Transactional
    public BorrowRequestResponse approveRequest(Long requestId, Long ownerId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found with id: " + requestId));

        Book book = request.getBook();

        // Business Rule: Ownership authorization check
        if (ownerId != null && !book.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("Only the book's owner can approve this request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be approved. Current status: " + request.getStatus());
        }

        // Approve this request
        request.setStatus(RequestStatus.APPROVED);
        book.setStatus(BookStatus.BORROWED);
        bookRepository.save(book);
        borrowRequestRepository.save(request);

        // Business Rule: Auto-reject any other pending request for this book
        List<BorrowRequest> otherPendingRequests = borrowRequestRepository.findByBookIdAndStatus(book.getId(), RequestStatus.PENDING);
        for (BorrowRequest other : otherPendingRequests) {
            if (!other.getId().equals(request.getId())) {
                other.setStatus(RequestStatus.REJECTED);
                borrowRequestRepository.save(other);
            }
        }

        return mapToResponse(request);
    }

    @Transactional
    public BorrowRequestResponse rejectRequest(Long requestId, Long ownerId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found with id: " + requestId));

        Book book = request.getBook();

        // Ownership authorization check
        if (ownerId != null && !book.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("Only the book's owner can reject this request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be rejected. Current status: " + request.getStatus());
        }

        request.setStatus(RequestStatus.REJECTED);
        borrowRequestRepository.save(request);

        // If no more active requests exist, return book to AVAILABLE
        List<BorrowRequest> active = borrowRequestRepository.findByBookIdAndStatusIn(
                book.getId(), Arrays.asList(RequestStatus.PENDING, RequestStatus.APPROVED)
        );
        if (active.isEmpty()) {
            book.setStatus(BookStatus.AVAILABLE);
            bookRepository.save(book);
        }

        return mapToResponse(request);
    }

    @Transactional
    public BorrowRequestResponse markReturned(Long requestId, Long ownerId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found with id: " + requestId));

        Book book = request.getBook();

        // Ownership authorization check: only owner confirms return
        if (ownerId != null && !book.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("Only the book's owner can mark a book as returned");
        }

        // Business Rule: Only an APPROVED request can be marked RETURNED
        if (request.getStatus() != RequestStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED (currently borrowed) loans can be marked RETURNED");
        }

        request.setStatus(RequestStatus.RETURNED);
        request.setReturnDate(LocalDateTime.now());
        borrowRequestRepository.save(request);

        // Returning frees book to AVAILABLE
        book.setStatus(BookStatus.AVAILABLE);
        bookRepository.save(book);

        return mapToResponse(request);
    }

    public List<BorrowRequestResponse> getUserRequests(Long userId, String type) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<BorrowRequest> list;
        if ("incoming".equalsIgnoreCase(type)) {
            list = borrowRequestRepository.findByBookOwnerId(userId);
        } else if ("outgoing".equalsIgnoreCase(type)) {
            list = borrowRequestRepository.findByRequesterId(userId);
        } else {
            // Both incoming and outgoing combined
            list = borrowRequestRepository.findByRequesterId(userId);
            List<BorrowRequest> incoming = borrowRequestRepository.findByBookOwnerId(userId);
            for (BorrowRequest r : incoming) {
                if (!list.contains(r)) {
                    list.add(r);
                }
            }
        }

        return list.stream()
                .sorted((a, b) -> b.getRequestDate().compareTo(a.getRequestDate()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BorrowRequestResponse getRequestById(Long id) {
        BorrowRequest request = borrowRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found with id: " + id));
        return mapToResponse(request);
    }

    public BorrowRequestResponse mapToResponse(BorrowRequest request) {
        BorrowRequestResponse dto = new BorrowRequestResponse();
        dto.setId(request.getId());
        dto.setRequestDate(request.getRequestDate());
        dto.setDueDate(request.getDueDate());
        dto.setReturnDate(request.getReturnDate());
        dto.setStatus(request.getStatus());

        if (request.getBook() != null) {
            Book b = request.getBook();
            dto.setBookId(b.getId());
            dto.setBookTitle(b.getTitle());
            dto.setBookAuthor(b.getAuthor());
            dto.setBookCondition(b.getCondition());

            if (b.getOwner() != null) {
                dto.setOwnerId(b.getOwner().getId());
                dto.setOwnerName(b.getOwner().getName());
            }
        }

        if (request.getRequester() != null) {
            User r = request.getRequester();
            dto.setRequesterId(r.getId());
            dto.setRequesterName(r.getName());
            dto.setRequesterLocation(r.getLocation());

            Double reqRating = reviewRepository.calculateAverageRatingAsBorrower(r.getId()).orElse(null);
            if (reqRating != null) {
                dto.setRequesterRating(Math.round(reqRating * 10.0) / 10.0);
            }
        }

        // Check review completion status
        if (request.getStatus() == RequestStatus.RETURNED) {
            boolean reqRev = reviewRepository.existsByBorrowRequestIdAndReviewerId(request.getId(), request.getRequester().getId());
            boolean ownRev = reviewRepository.existsByBorrowRequestIdAndReviewerId(request.getId(), request.getBook().getOwner().getId());
            dto.setReviewedByRequester(reqRev);
            dto.setReviewedByOwner(ownRev);
        }

        return dto;
    }
}
