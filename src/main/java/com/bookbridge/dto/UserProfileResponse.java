package com.bookbridge.dto;

public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String location;
    private long booksListed;
    private long booksCurrentlyLentOut;
    private long booksCurrentlyBorrowed;
    private long completedExchanges;
    private Double averageRatingAsOwner;
    private Double averageRatingAsBorrower;
    private Double overallRating;

    public UserProfileResponse() {}

    public UserProfileResponse(Long id, String name, String email, String phone, String location,
                               long booksListed, long booksCurrentlyLentOut, long booksCurrentlyBorrowed,
                               long completedExchanges, Double averageRatingAsOwner,
                               Double averageRatingAsBorrower, Double overallRating) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.location = location;
        this.booksListed = booksListed;
        this.booksCurrentlyLentOut = booksCurrentlyLentOut;
        this.booksCurrentlyBorrowed = booksCurrentlyBorrowed;
        this.completedExchanges = completedExchanges;
        this.averageRatingAsOwner = averageRatingAsOwner;
        this.averageRatingAsBorrower = averageRatingAsBorrower;
        this.overallRating = overallRating;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

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

    public long getBooksCurrentlyBorrowed() {
        return booksCurrentlyBorrowed;
    }

    public void setBooksCurrentlyBorrowed(long booksCurrentlyBorrowed) {
        this.booksCurrentlyBorrowed = booksCurrentlyBorrowed;
    }

    public long getCompletedExchanges() {
        return completedExchanges;
    }

    public void setCompletedExchanges(long completedExchanges) {
        this.completedExchanges = completedExchanges;
    }

    public Double getAverageRatingAsOwner() {
        return averageRatingAsOwner;
    }

    public void setAverageRatingAsOwner(Double averageRatingAsOwner) {
        this.averageRatingAsOwner = averageRatingAsOwner;
    }

    public Double getAverageRatingAsBorrower() {
        return averageRatingAsBorrower;
    }

    public void setAverageRatingAsBorrower(Double averageRatingAsBorrower) {
        this.averageRatingAsBorrower = averageRatingAsBorrower;
    }

    public Double getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(Double overallRating) {
        this.overallRating = overallRating;
    }
}
