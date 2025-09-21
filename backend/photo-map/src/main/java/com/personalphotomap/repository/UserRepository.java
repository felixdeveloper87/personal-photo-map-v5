package com.personalphotomap.repository;

import com.personalphotomap.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for accessing AppUser entities in the database.
 * Inherits standard JPA repository methods for CRUD operations.
 */
@Repository
public interface UserRepository extends JpaRepository<AppUser, Long> {

    /**
     * Finds a user by their email address.
     * 
     * @param email The email address of the user to search for.
     * @return The user object if found, otherwise null.
     */
    AppUser findByEmail(String email);

}
