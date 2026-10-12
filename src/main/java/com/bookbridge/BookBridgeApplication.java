package com.bookbridge;

import com.bookbridge.entity.*;
import com.bookbridge.repository.BookRepository;
import com.bookbridge.repository.BorrowRequestRepository;
import com.bookbridge.repository.ReviewRepository;
import com.bookbridge.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication
public class BookBridgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookBridgeApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                     BookRepository bookRepository,
                                     BorrowRequestRepository borrowRequestRepository,
                                     ReviewRepository reviewRepository,
                                     PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed sample data only if database is empty
            if (userRepository.count() > 0) {
                return;
            }

            // 1. Create Initial Members (Passwords hashed with BCrypt)
            User chandu = new User(null, "Yeldhandi Chandu", "chandu@bookbridge.com",
                    passwordEncoder.encode("password123"), "9876543210", "Hyderabad, Tech Hub");
            chandu = userRepository.save(chandu);

            User priya = new User(null, "Priya Sharma", "priya@bookbridge.com",
                    passwordEncoder.encode("password123"), "9123456789", "Madhapur, Hyderabad");
            priya = userRepository.save(priya);

            User rahul = new User(null, "Rahul Verma", "rahul@bookbridge.com",
                    passwordEncoder.encode("password123"), "9988776655", "Kondapur, Hyderabad");
            rahul = userRepository.save(rahul);

            User ananya = new User(null, "Ananya Patel", "ananya@bookbridge.com",
                    passwordEncoder.encode("password123"), "9871234560", "Gachibowli, Hyderabad");
            ananya = userRepository.save(ananya);

            // 2. Create Books
            Book b1 = new Book(null, "Clean Code: A Handbook of Agile Software Craftsmanship",
                    "Robert C. Martin", Genre.ACADEMIC, BookCondition.GOOD,
                    "Essential read for every software developer. Clean code principles and best practices.",
                    "Hyderabad, Tech Hub", chandu);
            b1 = bookRepository.save(b1);

            Book b2 = new Book(null, "Atomic Habits",
                    "James Clear", Genre.SELF_HELP, BookCondition.NEW,
                    "An easy and proven way to build good habits and break bad ones.",
                    "Madhapur, Hyderabad", priya);
            b2 = bookRepository.save(b2);

            Book b3 = new Book(null, "The Pragmatic Programmer",
                    "David Thomas & Andrew Hunt", Genre.ACADEMIC, BookCondition.GOOD,
                    "Your journey to mastery in software craft and system design.",
                    "Hyderabad, Tech Hub", chandu);
            b3 = bookRepository.save(b3);

            Book b4 = new Book(null, "To Kill a Mockingbird",
                    "Harper Lee", Genre.FICTION, BookCondition.FAIR,
                    "A classic novel of warmth and humor despite dealing with serious issues.",
                    "Kondapur, Hyderabad", rahul);
            b4 = bookRepository.save(b4);

            Book b5 = new Book(null, "Steve Jobs: The Exclusive Biography",
                    "Walter Isaacson", Genre.BIOGRAPHY, BookCondition.GOOD,
                    "The story of the roller-coaster life and searingly intense personality of Steve Jobs.",
                    "Gachibowli, Hyderabad", ananya);
            b5 = bookRepository.save(b5);

            Book b6 = new Book(null, "Designing Data-Intensive Applications",
                    "Martin Kleppmann", Genre.ACADEMIC, BookCondition.NEW,
                    "The big ideas behind reliable, scalable, and maintainable systems.",
                    "Madhapur, Hyderabad", priya);
            b6 = bookRepository.save(b6);

            // 3. Create a Completed Loan (RETURNED) for Clean Code (Priya borrowed from Chandu)
            BorrowRequest reqCompleted = new BorrowRequest();
            reqCompleted.setBook(b1);
            reqCompleted.setRequester(priya);
            reqCompleted.setRequestDate(LocalDateTime.now().minusDays(20));
            reqCompleted.setDueDate(LocalDate.now().minusDays(5));
            reqCompleted.setReturnDate(LocalDateTime.now().minusDays(6));
            reqCompleted.setStatus(RequestStatus.RETURNED);
            reqCompleted = borrowRequestRepository.save(reqCompleted);

            // 4. Add Reviews for the Completed Loan (Both Directions)
            // Direction 1: Borrower (Priya) rates Owner (Chandu)
            Review rev1 = new Review(null, reqCompleted, priya, chandu, 5,
                    "Chandu is a fantastic book owner! The book was in excellent condition and handed over promptly.");
            reviewRepository.save(rev1);

            // Direction 2: Owner (Chandu) rates Borrower (Priya)
            Review rev2 = new Review(null, reqCompleted, chandu, priya, 5,
                    "Priya took great care of the book and returned it even before the due date. Highly recommended!");
            reviewRepository.save(rev2);

            // 5. Create an Active Loan (BORROWED) for Atomic Habits (Rahul borrowing from Priya)
            b2.setStatus(BookStatus.BORROWED);
            bookRepository.save(b2);

            BorrowRequest reqActive = new BorrowRequest();
            reqActive.setBook(b2);
            reqActive.setRequester(rahul);
            reqActive.setRequestDate(LocalDateTime.now().minusDays(5));
            reqActive.setDueDate(LocalDate.now().plusDays(9));
            reqActive.setStatus(RequestStatus.APPROVED);
            borrowRequestRepository.save(reqActive);

            // 6. Create a Pending Request for The Pragmatic Programmer (Ananya requesting from Chandu)
            b3.setStatus(BookStatus.REQUESTED);
            bookRepository.save(b3);

            BorrowRequest reqPending = new BorrowRequest();
            reqPending.setBook(b3);
            reqPending.setRequester(ananya);
            reqPending.setRequestDate(LocalDateTime.now().minusDays(1));
            reqPending.setDueDate(LocalDate.now().plusDays(14));
            reqPending.setStatus(RequestStatus.PENDING);
            borrowRequestRepository.save(reqPending);
        };
    }
}
