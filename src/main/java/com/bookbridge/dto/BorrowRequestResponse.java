package com.bookbridge.dto;

import com.bookbridge.entity.BookCondition;
import com.bookbridge.entity.RequestStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BorrowRequestResponse {

    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private BookCondition bookCondition;
    private Long requesterId;
    private String requesterName;
    private String requesterLocation;
    private Double requesterRating;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime requestDate;
    private LocalDate dueDate;
    private LocalDateTime returnDate;
    private RequestStatus status;
    private boolean reviewedByRequester;
    private boolean reviewedByOwner;

    public BorrowRequestResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getBookAuthor() {
        return bookAuthor;
    }

    public void setBookAuthor(String bookAuthor) {
        this.bookAuthor = bookAuthor;
    }

    public BookCondition getBookCondition() {
        return bookCondition;
    }

    public void setBookCondition(BookCondition bookCondition) {
        this.bookCondition = bookCondition;
    }

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getRequesterLocation() {
        return requesterLocation;
    }

    public void setRequesterLocation(String requesterLocation) {
        this.requesterLocation = requesterLocation;
    }

    public Double getRequesterRating() {
        return requesterRating;
    }

    public void setRequesterRating(Double requesterRating) {
        this.requesterRating = requesterRating;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDateTime returnDate) {
        this.returnDate = returnDate;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public boolean isReviewedByRequester() {
        return reviewedByRequester;
    }

    public void setReviewedByRequester(boolean reviewedByRequester) {
        this.reviewedByRequester = reviewedByRequester;
    }

    public boolean isReviewedByOwner() {
        return reviewedByOwner;
    }

    public void setReviewedByOwner(boolean reviewedByOwner) {
        this.reviewedByOwner = reviewedByOwner;
    }
}
