# BOOKBRIDGE — Community Book Exchange & Lending Platform
**B.Tech CSE Full-Stack Capstone Project**  
*Read More. Own Less. Share Books.*

- **Student Name:** Yeldhandi Chandu  
- **Roll Number:** 24EG105P62  
- **Branch & Section:** CSE-P  
- **Architecture:** `React.js` ➔ `Spring Boot REST API` ➔ `Java Service Layer` ➔ `Spring Data JPA / Hibernate` ➔ `MySQL Database`

---

## 1. Project Overview

**BookBridge** is a full-stack community book exchange and peer-to-peer lending web platform. It addresses the fragmentation of informal book sharing (typically lost in WhatsApp groups, notice boards, or idle bookshelves) by providing:
- **Centralized Book Discovery:** Search and filter books by title, author, genre, condition, and location.
- **Single Source of Truth:** Live status tracking (`AVAILABLE`, `REQUESTED`, `BORROWED`, `UNAVAILABLE`).
- **Accountability & Trust:** Reputation scoring (1–5 star reviews) with derived owner and borrower statistics calculated directly from the database.
- **Strict Business Validation:** Preventing duplicate active requests, self-borrowing, unauthorized status mutations, and premature reviews.

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React.js / JavaScript / CSS3 | 18.x | Responsive SPA, interactive forms, real-time dashboards |
| **Backend API** | Java & Spring Boot | 3.2.x (Java 17+) | Layered RESTful web services, dependency injection |
| **Build Tool** | Apache Maven | 3.9.x | Dependency management, build automation, testing |
| **ORM / Persistence** | Spring Data JPA & Hibernate | 3.2.x | Entity-relational mapping, custom JPQL queries |
| **Database** | MySQL (with H2 dev profile) | 8.0+ | Normalized relational storage, foreign key constraints |
| **Security** | Spring Security & BCrypt | 6.x | Password hashing and cross-origin resource sharing (CORS) |

---

## 3. Project Directory Structure

```
proj anti/
├── pom.xml                                   # Root Maven Configuration
├── build.bat                                 # One-click Windows build script
├── run.bat                                   # One-click launch script (MySQL or H2)
├── README.md                                 # Complete documentation & guide
├── BookBridge_Project_Document.pdf           # Original specification document
├── src/
│   ├── main/
│   │   ├── java/com/bookbridge/
│   │   │   ├── BookBridgeApplication.java    # Spring Boot Main Class + Seed Data
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java       # BCrypt & CORS Configuration
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java       # Registration & Login endpoints
│   │   │   │   ├── UserController.java       # Profiles & Dashboard stats
│   │   │   │   ├── BookController.java       # Books CRUD & Discovery
│   │   │   │   ├── BorrowRequestController.java # Request, Approve, Return flow
│   │   │   │   └── ReviewController.java     # Exchange ratings & reviews
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java          # Authentication business logic
│   │   │   │   ├── UserService.java          # User metrics & statistics
│   │   │   │   ├── BookService.java          # Book listing & ownership rules
│   │   │   │   ├── BorrowRequestService.java # Loan lifecycle & availability rules
│   │   │   │   └── ReviewService.java        # Rating validation & review logic
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java       # User JPA data access
│   │   │   │   ├── BookRepository.java       # Filter & search JPA queries
│   │   │   │   ├── BorrowRequestRepository.java # Loan records JPA queries
│   │   │   │   └── ReviewRepository.java     # Rating aggregates JPA queries
│   │   │   ├── entity/
│   │   │   │   ├── User.java                 # Community member entity
│   │   │   │   ├── Book.java                 # Book catalog entity
│   │   │   │   ├── BorrowRequest.java        # Loan request entity
│   │   │   │   ├── Review.java               # Two-way exchange review entity
│   │   │   │   ├── Genre.java                # Genre enumeration
│   │   │   │   ├── BookCondition.java        # Condition enumeration
│   │   │   │   ├── BookStatus.java           # Status enumeration
│   │   │   │   └── RequestStatus.java        # Request lifecycle enumeration
│   │   │   ├── dto/                          # Clean request & response schemas
│   │   │   └── exception/                    # Global exception handling (400, 404, 403)
│   │   └── resources/
│   │       ├── application.properties        # MySQL connection configuration
│   │       ├── application-h2.properties     # Fallback instant zero-setup H2 config
│   │       ├── schema.sql                    # MySQL DDL table creation script
│   │       └── data.sql                      # Seed data script
│   └── test/
│       └── java/com/bookbridge/
│           └── BookBridgeApplicationTests.java # Business rule unit & slice tests
└── frontend/                                 # React.js Frontend
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js                            # Complete Single Page UI
        ├── App.css                           # Modern responsive styling
        ├── index.js
        └── services/api.js                   # REST API integration client
```

---

## 4. Step-by-Step Setup Guide

### Step 1: Install Prerequisites
1. **Java Development Kit (JDK 17 or higher):**
   - Download from: [Adoptium Eclipse Temurin 17](https://adoptium.net/) or [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/).
   - Add Java to your system `PATH` and verify:
     ```powershell
     java -version
     ```
2. **Apache Maven (3.8+):**
   - Download from: [Maven Official](https://maven.apache.org/download.cgi).
   - Extract to `C:\Program Files\apache-maven` and add the `bin` directory to your `PATH`.
   - Verify:
     ```powershell
     mvn -version
     ```
3. **MySQL Server (Optional for Production):**
   - Download MySQL Community Server or use XAMPP / WampServer.
   - Start MySQL on port `3306`.
4. **Node.js (for React frontend):**
   - Download LTS from: [Node.js Official](https://nodejs.org/).
   - Verify:
     ```powershell
     node -v
     npm -v
     ```

---

### Step 2: Database Configuration

#### Option A: Using MySQL (Default)
1. Open MySQL Workbench or MySQL Command Line:
   ```sql
   CREATE DATABASE bookbridge_db;
   ```
2. Check `src/main/resources/application.properties` to ensure your MySQL username and password match:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/bookbridge_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=root
   ```
3. Spring Data JPA with `hibernate.ddl-auto=update` will automatically create the tables on startup. The built-in `DataInitializer` will also insert initial sample users, books, loans, and reviews!

#### Option B: Instant In-Memory H2 (No MySQL Needed!)
If you haven't installed MySQL yet, you can run the project immediately with zero configuration using the H2 profile:
```powershell
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
Or simply double-click `run.bat` and select Option **[2]**!

---

### Step 3: Run the Spring Boot Backend

From the project root directory (`c:\Users\DELL\OneDrive\Documents\proj anti`):

1. **Build and Test:**
   ```powershell
   mvn clean test
   ```
2. **Run the Application:**
   ```powershell
   mvn spring-boot:run
   ```
   *Or double click:* `run.bat`

The backend starts at `http://localhost:8080`.

---

### Step 4: Run the React.js Frontend

In a separate terminal window:
```powershell
cd frontend
npm install
npm start
```
The React frontend opens in your browser at `http://localhost:3000`.

---

## 5. Pre-seeded Test Accounts

All accounts use the default password: `password123`

| Member Name | Email | Role in Seed Data |
| :--- | :--- | :--- |
| **Yeldhandi Chandu** | `chandu@bookbridge.com` | Owner of "Clean Code", completed rated loan with Priya |
| **Priya Sharma** | `priya@bookbridge.com` | Borrower of "Clean Code", Owner of "Atomic Habits" |
| **Rahul Verma** | `rahul@bookbridge.com` | Active borrower of "Atomic Habits", Owner of "To Kill a Mockingbird" |
| **Ananya Patel** | `ananya@bookbridge.com` | Pending requester for "The Pragmatic Programmer" |

*(You can easily switch between any of these users using the "Active Member" dropdown in the top-right of the React navbar to test both Owner and Borrower workflows without logging out!)*

---

## 6. Core REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new member account with BCrypt password hashing.
- `POST /api/auth/login` — Authenticate member credentials.

### Book Management & Discovery
- `GET /api/books` — Discover books (supports `?search=...`, `?genre=...`, `?location=...`, `?status=...`).
- `GET /api/books/featured` — Get recently listed available books for homepage.
- `GET /api/books/{id}` — Get single book details and owner profile summary.
- `POST /api/books` — List a new personal book (`ownerId` required).
- `PUT /api/books/{id}` — Update book listing (owner only).
- `DELETE /api/books/{id}?ownerId={id}` — Remove book listing (only if no active request exists).

### Borrow Lifecycle
- `POST /api/books/{bookId}/request` — Submit borrow request with proposed due date (`requesterId`, `dueDate`).
- `PUT /api/requests/{id}/approve?ownerId={id}` — Owner approves request (auto-rejects other pending requests for book, marks book `BORROWED`).
- `PUT /api/requests/{id}/reject?ownerId={id}` — Owner rejects request (restores book to `AVAILABLE`).
- `PUT /api/requests/{id}/return?ownerId={id}` — Owner confirms physical return (marks request `RETURNED`, frees book to `AVAILABLE`, unlocks rating).
- `GET /api/users/{id}/requests?type=incoming|outgoing` — Retrieve incoming or outgoing requests.

### Reviews & Ratings
- `POST /api/requests/{id}/review` — Submit 1-5 star review and comment for a completed loan (enforces max 1 review per direction).
- `GET /api/users/{id}/reviews` — Retrieve reviews received by member.
- `GET /api/users/{id}/statistics` — Retrieve live derived owner & borrower statistics.
- `GET /api/users/snapshot` — Community totals: total books listed, active members, books exchanged, average rating.

---

## 7. Business Rules Enforced in Java Service Layer

1. **Duplicate Account Prevention:** Email must be unique. Passwords are never stored in plaintext (BCrypt hashed).
2. **Ownership Authorization:** Only the book's owner can modify/delete the book, approve/reject borrow requests, or confirm return.
3. **No Self-Borrowing:** An owner cannot submit a borrow request for their own book.
4. **Single Active Request Rule:** A book cannot receive a new borrow request if it already has a `PENDING` or `APPROVED` request.
5. **Auto-Rejection on Approval:** When an owner approves a borrow request, all other pending requests for that book are automatically updated to `REJECTED`.
6. **Return Unlocks Rating:** Only loans marked `RETURNED` are eligible for reviews.
7. **Two-Way Rating Limitation:** Each completed exchange allows at most one review per direction (`borrower -> owner` and `owner -> borrower`).
8. **Real-Time Derived Statistics:** No dashboard metric or rating is hardcoded; all values are computed via JPA aggregation queries over the database.
