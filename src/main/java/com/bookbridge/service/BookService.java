package com.bookbridge.service;

import com.bookbridge.dto.BookCreateRequest;
import com.bookbridge.dto.BookResponse;
import com.bookbridge.dto.BookUpdateRequest;
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

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final ReviewRepository reviewRepository;

    public BookService(BookRepository bookRepository,
                       UserRepository userRepository,
                       BorrowRequestRepository borrowRequestRepository,
                       ReviewRepository reviewRepository) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<BookResponse> getAllBooks(String search, Genre genre, String location, BookStatus status) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanLocation = (location != null && !location.trim().isEmpty()) ? location.trim() : null;

        List<Book> books = bookRepository.findWithFilters(cleanSearch, genre, cleanLocation, status);
        return books.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BookResponse> getFeaturedBooks() {
        return bookRepository.findTop6ByStatusOrderByCreatedAtDesc(BookStatus.AVAILABLE)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return mapToResponse(book);
    }

    @Transactional
    public BookResponse createBook(BookCreateRequest request) {
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with id: " + request.getOwnerId()));

        Book book = new Book();
        book.setTitle(request.getTitle().trim());
        book.setAuthor(request.getAuthor().trim());
        book.setGenre(request.getGenre());
        book.setCondition(request.getCondition());
        book.setDescription(request.getDescription());
        book.setLocation(request.getLocation() != null ? request.getLocation().trim() : owner.getLocation());
        book.setOwner(owner);
        book.setStatus(BookStatus.AVAILABLE);

        Book savedBook = bookRepository.save(book);
        return mapToResponse(savedBook);
    }

    @Transactional
    public BookResponse updateBook(Long id, BookUpdateRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        // Ownership authorization check
        if (!book.getOwner().getId().equals(request.getOwnerId())) {
            throw new UnauthorizedException("Only the book's owner can modify this book listing");
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            book.setTitle(request.getTitle().trim());
        }
        if (request.getAuthor() != null && !request.getAuthor().trim().isEmpty()) {
            book.setAuthor(request.getAuthor().trim());
        }
        if (request.getGenre() != null) {
            book.setGenre(request.getGenre());
        }
        if (request.getCondition() != null) {
            book.setCondition(request.getCondition());
        }
        if (request.getDescription() != null) {
            book.setDescription(request.getDescription());
        }
        if (request.getLocation() != null) {
            book.setLocation(request.getLocation().trim());
        }
        if (request.getStatus() != null) {
            book.setStatus(request.getStatus());
        }

        Book updatedBook = bookRepository.save(book);
        return mapToResponse(updatedBook);
    }

    @Transactional
    public void deleteBook(Long id, Long ownerId) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        // Ownership authorization check
        if (ownerId != null && !book.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedException("Only the book's owner can delete this book listing");
        }

        // Active request check: cannot delete if active (PENDING or APPROVED) requests exist
        List<BorrowRequest> activeRequests = borrowRequestRepository.findByBookIdAndStatusIn(
                id, Arrays.asList(RequestStatus.PENDING, RequestStatus.APPROVED)
        );

        if (!activeRequests.isEmpty()) {
            throw new BadRequestException("Cannot delete book listing while it has active borrow requests");
        }

        bookRepository.delete(book);
    }

    public List<BookResponse> getBooksByOwner(Long ownerId) {
        userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

        return bookRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookResponse mapToResponse(Book book) {
        BookResponse response = new BookResponse();
        response.setId(book.getId());
        response.setTitle(book.getTitle());
        response.setAuthor(book.getAuthor());
        response.setGenre(book.getGenre());
        response.setCondition(book.getCondition());
        response.setDescription(book.getDescription());
        response.setLocation(book.getLocation());
        response.setStatus(book.getStatus());
        response.setCreatedAt(book.getCreatedAt());

        if (book.getOwner() != null) {
            User owner = book.getOwner();
            response.setOwnerId(owner.getId());
            response.setOwnerName(owner.getName());
            response.setOwnerEmail(owner.getEmail());
            response.setOwnerPhone(owner.getPhone());
            response.setOwnerLocation(owner.getLocation());

            Double ownerRating = reviewRepository.calculateAverageRatingAsOwner(owner.getId()).orElse(null);
            if (ownerRating != null) {
                response.setOwnerRating(Math.round(ownerRating * 10.0) / 10.0);
            }
        }

        return response;
    }
}
