package com.bookbridge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class BorrowRequestCreateDto {

    @NotNull(message = "Requester ID is required")
    private Long requesterId;

    @NotNull(message = "Due date is required")
    @Future(message = "Due date must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    public BorrowRequestCreateDto() {}

    public BorrowRequestCreateDto(Long requesterId, LocalDate dueDate) {
        this.requesterId = requesterId;
        this.dueDate = dueDate;
    }

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}
