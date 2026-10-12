# BookBridge — REST API Specification

Base URL: `http://localhost:8080/api`

---

## 1. Authentication Endpoints

### Register Member
- **POST** `/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Yeldhandi Chandu",
    "email": "chandu@bookbridge.com",
    "password": "password123",
    "phone": "9876543210",
    "location": "Hyderabad, Tech Hub"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "token": "bb-token-1-1728701000",
    "id": 1,
    "name": "Yeldhandi Chandu",
    "email": "chandu@bookbridge.com",
    "phone": "9876543210",
    "location": "Hyderabad, Tech Hub",
    "message": "Account created successfully"
  }
  ```

### Login Member
- **POST** `/auth/login`
- **Request Body:**
  ```json
  {
    "email": "chandu@bookbridge.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "bb-token-1-1728701000",
    "id": 1,
    "name": "Yeldhandi Chandu",
    "email": "chandu@bookbridge.com",
    "message": "Login successful"
  }
  ```

---

## 2. Community & User Statistics

### Community Snapshot
- **GET** `/users/snapshot`
- **Response (200 OK):**
  ```json
  {
    "totalBooksListed": 6,
    "activeMembers": 4,
    "booksExchanged": 1,
    "averageRating": 5.0
  }
  ```

### User Profile
- **GET** `/users/{id}`
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "Yeldhandi Chandu",
    "email": "chandu@bookbridge.com",
    "phone": "9876543210",
    "location": "Hyderabad, Tech Hub",
    "booksListed": 2,
    "booksCurrentlyLentOut": 0,
    "booksCurrentlyBorrowed": 0,
    "completedExchanges": 1,
    "averageRatingAsOwner": 5.0,
    "averageRatingAsBorrower": null,
    "overallRating": 5.0
  }
  ```

### User Statistics (Owner vs Borrower View)
- **GET** `/users/{id}/statistics`
- **Response (200 OK):**
  ```json
  {
    "booksListed": 2,
    "booksCurrentlyLentOut": 0,
    "pendingIncomingRequests": 1,
    "averageRatingAsOwner": 5.0,
    "booksCurrentlyBorrowed": 0,
    "borrowingHistory": 0,
    "pendingSentRequests": 0,
    "averageRatingAsBorrower": null,
    "completedExchanges": 1,
    "overallAverageRating": 5.0
  }
  ```

---

## 3. Book Catalog & Discovery

### Search & Filter Books
- **GET** `/books?search=Clean&genre=ACADEMIC&location=Hyderabad&status=AVAILABLE`
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "author": "Robert C. Martin",
      "genre": "ACADEMIC",
      "condition": "GOOD",
      "description": "Essential read for every software developer.",
      "location": "Hyderabad, Tech Hub",
      "status": "AVAILABLE",
      "ownerId": 1,
      "ownerName": "Yeldhandi Chandu",
      "ownerRating": 5.0,
      "createdAt": "2026-10-12T04:30:00"
    }
  ]
  ```

### Featured Books
- **GET** `/books/featured`

### Get Book Details
- **GET** `/books/{id}`

### List Personal Book
- **POST** `/books`
- **Request Body:**
  ```json
  {
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen",
    "genre": "ACADEMIC",
    "condition": "NEW",
    "description": "Comprehensive reference textbook on algorithms.",
    "location": "Hyderabad",
    "ownerId": 1
  }
  ```

### Edit Book Listing
- **PUT** `/books/{id}` (Owner only)

### Delete Book Listing
- **DELETE** `/books/{id}?ownerId=1` (Blocked if active loan or request exists)

---

## 4. Borrowing Lifecycle Endpoints

### Submit Borrow Request
- **POST** `/books/{bookId}/request`
- **Request Body:**
  ```json
  {
    "requesterId": 2,
    "dueDate": "2026-10-25"
  }
  ```
- **Rules Enforced:**
  - Requester cannot be the book's owner.
  - Book must be `AVAILABLE`.
  - Rejects duplicate active request.
  - Book status transitions to `REQUESTED`.

### Approve Request
- **PUT** `/requests/{id}/approve?ownerId=1`
- **Rules Enforced:**
  - Owner authorization verified.
  - Automatically rejects other competing pending requests for the same book.
  - Book status transitions to `BORROWED`.

### Reject Request
- **PUT** `/requests/{id}/reject?ownerId=1`
- **Rules Enforced:**
  - Book status resets to `AVAILABLE` if no active request remains.

### Confirm Return
- **PUT** `/requests/{id}/return?ownerId=1`
- **Rules Enforced:**
  - Only `APPROVED` loans can be marked `RETURNED`.
  - Sets `returnDate`.
  - Frees book status back to `AVAILABLE`.
  - Unlocks post-exchange review flow.

---

## 5. Reviews & Ratings

### Submit Exchange Review
- **POST** `/requests/{requestId}/review`
- **Request Body:**
  ```json
  {
    "reviewerId": 2,
    "rating": 5,
    "comment": "Book was in great condition and returned on time!"
  }
  ```
- **Rules Enforced:**
  - Loan must be `RETURNED`.
  - Reviewer must be borrower or owner.
  - At most 1 review per direction (`borrower -> owner`, `owner -> borrower`).
  - Average ratings recalculated immediately.
