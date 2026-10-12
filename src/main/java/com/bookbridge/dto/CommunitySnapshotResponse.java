package com.bookbridge.dto;

public class CommunitySnapshotResponse {

    private long totalBooksListed;
    private long activeMembers;
    private long booksExchanged;
    private Double averageRating;

    public CommunitySnapshotResponse() {}

    public CommunitySnapshotResponse(long totalBooksListed, long activeMembers, long booksExchanged, Double averageRating) {
        this.totalBooksListed = totalBooksListed;
        this.activeMembers = activeMembers;
        this.booksExchanged = booksExchanged;
        this.averageRating = averageRating;
    }

    public long getTotalBooksListed() {
        return totalBooksListed;
    }

    public void setTotalBooksListed(long totalBooksListed) {
        this.totalBooksListed = totalBooksListed;
    }

    public long getActiveMembers() {
        return activeMembers;
    }

    public void setActiveMembers(long activeMembers) {
        this.activeMembers = activeMembers;
    }

    public long getBooksExchanged() {
        return booksExchanged;
    }

    public void setBooksExchanged(long booksExchanged) {
        this.booksExchanged = booksExchanged;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }
}
