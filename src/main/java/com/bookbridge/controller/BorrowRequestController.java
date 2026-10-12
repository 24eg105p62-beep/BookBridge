package com.bookbridge.controller;

import com.bookbridge.dto.BorrowRequestResponse;
import com.bookbridge.service.BorrowRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;

    public BorrowRequestController(BorrowRequestService borrowRequestService) {
        this.borrowRequestService = borrowRequestService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<BorrowRequestResponse> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(borrowRequestService.getRequestById(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<BorrowRequestResponse> approveRequest(
            @PathVariable Long id,
            @RequestParam(required = false) Long ownerId) {
        return ResponseEntity.ok(borrowRequestService.approveRequest(id, ownerId));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<BorrowRequestResponse> rejectRequest(
            @PathVariable Long id,
            @RequestParam(required = false) Long ownerId) {
        return ResponseEntity.ok(borrowRequestService.rejectRequest(id, ownerId));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<BorrowRequestResponse> markReturned(
            @PathVariable Long id,
            @RequestParam(required = false) Long ownerId) {
        return ResponseEntity.ok(borrowRequestService.markReturned(id, ownerId));
    }
}
