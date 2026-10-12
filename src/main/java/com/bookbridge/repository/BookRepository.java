package com.bookbridge.repository;

import com.bookbridge.entity.Book;
import com.bookbridge.entity.BookStatus;
import com.bookbridge.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findByOwnerId(Long ownerId);

    long countByOwnerId(Long ownerId);

    long countByOwnerIdAndStatus(Long ownerId, BookStatus status);

    @Query("SELECT b FROM Book b WHERE " +
           "(:search IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:genre IS NULL OR b.genre = :genre) AND " +
           "(:location IS NULL OR LOWER(b.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:status IS NULL OR b.status = :status) " +
           "ORDER BY b.createdAt DESC")
    List<Book> findWithFilters(@Param("search") String search,
                               @Param("genre") Genre genre,
                               @Param("location") String location,
                               @Param("status") BookStatus status);

    List<Book> findTop6ByStatusOrderByCreatedAtDesc(BookStatus status);
}
