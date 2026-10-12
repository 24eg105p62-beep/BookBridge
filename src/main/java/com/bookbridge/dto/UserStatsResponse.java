package com.bookbridge.dto;

public class UserStatsResponse {

    // Owner view
    private long booksListed;
    private long booksCurrentlyLentOut;
    private long pendingIncomingRequests;
    private Double averageRatingAsOwner;

    // Borrower view
    private long booksCurrentlyBorrowed;
    private long borrowingHistory;
    private long pendingSentRequests;
    private Double averageRatingAsBorrower;

    // Overall
    private long completedExchanges;
    private Double overallAverageRating;

    public UserStatsResponse() {}

    public long getBooksListed() {
        return booksListed;
    }

    public void setBooksListed(long booksListed) {
        this.booksListed = booksListed;
    }

    public long getBooksCurrentlyLentOut() {
        return booksCurrentlyLentOut;
    }

    public void setBooksCurrentlyLentOut(long booksCurrentlyLentOut) {
        this.booksCurrentlyLentOut = booksCurrentlyLentOut;
    }

    public long getPendingIncomingRequests() {
        return pendingIncomingRequests;
    }

    public void setPendingIncomingRequests(long pendingIncomingRequests) {
        this.pendingIncomingRequests = pendingIncomingRequests;
    }

    public Double getAverageRatingAsOwner() {
        return averageRatingAsOwner;
    }

    public void setAverageRatingAsOwner(Double averageRatingAsOwner) {
        this.averageRatingAsOwner = averageRatingAsOwner;
    }

    public long getBooksCurrentlyBorrowed() {
        return booksCurrentlyBorrowed;
    }

    public void setBooksCurrentlyBorrowed(long booksCurrentlyBorrowed) {
        this.booksCurrentlyBorrowed = booksCurrentlyBorrowed;
    }

    public long getBorrowingHistory() {
        return borrowingHistory;
    }

    public void setBorrowingHistory(long borrowingHistory) {
        this.borrowingHistory = borrowingHistory;
    }

    public long getPendingSentRequests() {
        return pendingSentRequests;
    }

    public void setPendingSentRequests(long pendingSentRequests) {
        this.pendingSentRequests = pendingSentRequests;
    }

    public Double getAverageRatingAsBorrower() {
        return averageRatingAsBorrower;
    }

    public void setAverageRatingAsBorrower(Double averageRatingAsBorrower) {
        this.averageRatingAsBorrower = averageRatingAsBorrower;
    }

    public long getCompletedExchanges() {
        return completedExchanges;
    }

    public void setCompletedExchanges(long completedExchanges) {
        this.completedExchanges = completedExchanges;
    }

    public Double getOverallAverageRating() {
        return overallAverageRating;
    }

    public void setOverallAverageRating(Double overallAverageRating) {
        this.overallAverageRating = overallAverageRating;
    }
}
