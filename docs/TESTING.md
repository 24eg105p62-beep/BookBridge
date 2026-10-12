# BookBridge — Testing Guide

## 1. Automated Backend Test Suite

The backend contains automated JUnit 5 and Spring Boot integration tests verifying all 7 core business rules defined in the project specification:

```powershell
mvn test
```

### Covered Test Cases
1. `testRegistrationRejectsDuplicateEmail`: Verifies that registering an account with an existing email throws `BadRequestException`.
2. `testSelfRequestRejected`: Verifies that an owner attempting to request their own book throws `BadRequestException`.
3. `testBorrowLifecycleAndReviewRules`: Tests the complete end-to-end lifecycle:
   - Book creation with `AVAILABLE` status.
   - Borrow request submission transitioning book to `REQUESTED`.
   - Rejection of competing active requests on the same book.
   - Owner approval transitioning book to `BORROWED`.
   - Prevention of premature reviews before return confirmation.
   - Owner return confirmation setting loan to `RETURNED` and freeing book to `AVAILABLE`.
   - Post-loan review unlock and submission.
   - Prevention of duplicate reviews in the same direction.
   - Mutual two-way reviews (`borrower -> owner` and `owner -> borrower`).

---

## 2. Frontend Build Verification

To verify that all React components, styles, and dependencies bundle without error:

```powershell
cd frontend
npm run build
```

Expected output:
```
✓ built in ~2.5s (0 errors)
```

---

## 3. End-to-End API Smoke Testing

With the backend running on `http://localhost:8080`:

### Check Snapshot:
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/users/snapshot" -Method Get
```

### Fetch Books Catalog:
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/books" -Method Get
```

### Fetch Member Statistics:
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/users/1/statistics" -Method Get
```
