package com.bookbridge.controller;

import com.bookbridge.dto.ApiResponse;
import com.bookbridge.dto.BookCreateRequest;
import com.bookbridge.dto.BookResponse;
import com.bookbridge.dto.BookUpdateRequest;
import com.bookbridge.dto.BorrowRequestCreateDto;
import com.bookbridge.dto.BorrowRequestResponse;
import com.bookbridge.entity.BookStatus;
import com.bookbridge.entity.Genre;
import com.bookbridge.service.BookService;
import com.bookbridge.service.BorrowRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;
    private final BorrowRequestService borrowRequestService;

    public BookController(BookService bookService, BorrowRequestService borrowRequestService) {
        this.bookService = bookService;
        this.borrowRequestService = borrowRequestService;
    }

    @GetMapping
    public ResponseEntity<List<BookResponse>> getAllBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Genre genre,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BookStatus status) {
        return ResponseEntity.ok(bookService.getAllBooks(search, genre, location, status));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<BookResponse>> getFeaturedBooks() {
        return ResponseEntity.ok(bookService.getFeaturedBooks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @PostMapping
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookCreateRequest request) {
        BookResponse response = bookService.createBook(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookUpdateRequest request) {
        return ResponseEntity.ok(bookService.updateBook(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteBook(
            @PathVariable Long id,
            @RequestParam(required = false) Long ownerId) {
        bookService.deleteBook(id, ownerId);
        return ResponseEntity.ok(new ApiResponse(true, "Book listing deleted successfully"));
    }

    @PostMapping("/{bookId}/request")
    public ResponseEntity<BorrowRequestResponse> requestBook(
            @PathVariable Long bookId,
            @Valid @RequestBody BorrowRequestCreateDto dto) {
        BorrowRequestResponse response = borrowRequestService.createRequest(bookId, dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
