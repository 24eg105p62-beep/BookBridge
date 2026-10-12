package com.bookbridge;

import com.bookbridge.dto.*;
import com.bookbridge.entity.*;
import com.bookbridge.exception.BadRequestException;
import com.bookbridge.repository.UserRepository;
import com.bookbridge.service.AuthService;
import com.bookbridge.service.BookService;
import com.bookbridge.service.BorrowRequestService;
import com.bookbridge.service.ReviewService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
class BookBridgeApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private BookService bookService;

    @Autowired
    private BorrowRequestService borrowRequestService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testRegistrationRejectsDuplicateEmail() {
        RegisterRequest req1 = new RegisterRequest("Test User", "testdup@test.com", "pass1234", "123456", "Hyderabad");
        authService.register(req1);

        RegisterRequest req2 = new RegisterRequest("Test User 2", "testdup@test.com", "pass5678", "654321", "Hyderabad");
        assertThrows(BadRequestException.class, () -> authService.register(req2));
    }

    @Test
    void testSingleUserActiveLoginEnforced() {
        // Ensure clean state
        authService.logout(null);

        // 1. User 1 logs in
        LoginRequest login1 = new LoginRequest("chandu@bookbridge.com", "password123");
        AuthResponse res1 = authService.login(login1);
        assertNotNull(res1.getToken());

        // 2. User 2 attempts to log in while User 1 is active -> must be rejected
        LoginRequest login2 = new LoginRequest("priya@bookbridge.com", "password123");
        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.login(login2));
        assertTrue(ex.getMessage().contains("Only one user can be logged in at a time"));

        // 3. User 1 logs out
        authService.logout(res1.getId());

        // 4. User 2 can now successfully log in
        AuthResponse res2 = authService.login(login2);
        assertNotNull(res2.getToken());
        assertEquals("Priya Sharma", res2.getName());

        // Cleanup
        authService.logout(res2.getId());
    }

    @Test
    void testSelfRequestRejected() {
        User user = userRepository.findAll().get(0);
        BookCreateRequest createBook = new BookCreateRequest(
                "Test Self Request Book", "Author A", Genre.FICTION, BookCondition.NEW,
                "Description", "Hyderabad", user.getId()
        );
        BookResponse book = bookService.createBook(createBook);

        // Attempt to request own book
        BorrowRequestCreateDto reqDto = new BorrowRequestCreateDto(user.getId(), LocalDate.now().plusDays(7));
        assertThrows(BadRequestException.class, () -> borrowRequestService.createRequest(book.getId(), reqDto));
    }

    @Test
    void testBorrowLifecycleAndReviewRules() {
        User owner = userRepository.findAll().get(0);
        User borrower = userRepository.findAll().get(1);

        // 1. Owner lists a book
        BookCreateRequest createBook = new BookCreateRequest(
                "Lifecycle Test Book", "Author B", Genre.ACADEMIC, BookCondition.GOOD,
                "Description", "Hyderabad", owner.getId()
        );
        BookResponse book = bookService.createBook(createBook);
        assertEquals(BookStatus.AVAILABLE, book.getStatus());

        // 2. Borrower requests book
        BorrowRequestCreateDto reqDto = new BorrowRequestCreateDto(borrower.getId(), LocalDate.now().plusDays(10));
        BorrowRequestResponse request = borrowRequestService.createRequest(book.getId(), reqDto);
        assertEquals(RequestStatus.PENDING, request.getStatus());

        // Book status should now be REQUESTED
        BookResponse requestedBook = bookService.getBookById(book.getId());
        assertEquals(BookStatus.REQUESTED, requestedBook.getStatus());

        // 3. Second request on same book must fail
        User thirdUser = userRepository.findAll().get(2);
        BorrowRequestCreateDto reqDto2 = new BorrowRequestCreateDto(thirdUser.getId(), LocalDate.now().plusDays(5));
        assertThrows(BadRequestException.class, () -> borrowRequestService.createRequest(book.getId(), reqDto2));

        // 4. Owner approves request
        BorrowRequestResponse approvedRequest = borrowRequestService.approveRequest(request.getId(), owner.getId());
        assertEquals(RequestStatus.APPROVED, approvedRequest.getStatus());

        // Book status should now be BORROWED
        BookResponse borrowedBook = bookService.getBookById(book.getId());
        assertEquals(BookStatus.BORROWED, borrowedBook.getStatus());

        // 5. Review before return should be rejected
        ReviewCreateDto prematureReview = new ReviewCreateDto(borrower.getId(), 5, "Too early");
        assertThrows(BadRequestException.class, () -> reviewService.submitReview(approvedRequest.getId(), prematureReview));

        // 6. Owner marks loan as RETURNED
        BorrowRequestResponse returnedRequest = borrowRequestService.markReturned(approvedRequest.getId(), owner.getId());
        assertEquals(RequestStatus.RETURNED, returnedRequest.getStatus());

        // Book status should be freed back to AVAILABLE
        BookResponse returnedBook = bookService.getBookById(book.getId());
        assertEquals(BookStatus.AVAILABLE, returnedBook.getStatus());

        // 7. Reviews unlocked! Borrower reviews Owner
        ReviewCreateDto borrowerReview = new ReviewCreateDto(borrower.getId(), 5, "Excellent owner");
        assertNotNull(reviewService.submitReview(returnedRequest.getId(), borrowerReview));

        // Duplicate review by borrower must fail
        assertThrows(BadRequestException.class, () -> reviewService.submitReview(returnedRequest.getId(), borrowerReview));

        // Owner reviews Borrower
        ReviewCreateDto ownerReview = new ReviewCreateDto(owner.getId(), 5, "Responsible borrower");
        assertNotNull(reviewService.submitReview(returnedRequest.getId(), ownerReview));
    }
}
