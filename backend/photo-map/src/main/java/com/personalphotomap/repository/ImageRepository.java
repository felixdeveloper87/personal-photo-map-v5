package com.personalphotomap.repository;

import com.personalphotomap.model.AppUser;
import com.personalphotomap.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository interface for accessing Image entities in the database.
 * Includes both standard and custom queries for user-specific filtering.
 */
@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    /**
     * Finds all images from a given country, regardless of user.
     */
    List<Image> findByCountryId(String countryId);

    /**
     * Counts the total number of images uploaded by a specific user.
     */
    @Query("SELECT COUNT(i) FROM Image i WHERE i.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * Finds all images for a specific country and year (regardless of user).
     */
    List<Image> findByCountryIdAndYear(String countryId, int year);

    /**
     * Finds all images uploaded by a specific user.
     */
    List<Image> findByUserId(Long userId);

    /**
     * Finds all images uploaded by a user in a specific country and year.
     */
    List<Image> findByUserAndCountryIdAndYear(AppUser user, String countryId, int year);

    /**
     * Finds all images uploaded by a user, sorted by upload date (most recent first).
     */
    List<Image> findByUserIdOrderByUploadDateDesc(Long userId);

    /**
     * Finds all images uploaded by a user for a specific country.
     */
    List<Image> findByCountryIdAndUserId(String countryId, Long userId);

    /**
     * Finds all images uploaded by a user for a specific country and year.
     */
    List<Image> findByCountryIdAndYearAndUserId(String countryId, int year, Long userId);

    /**
     * Returns a list of unique country IDs where a user has uploaded images.
     */
    @Query("SELECT DISTINCT i.countryId FROM Image i WHERE i.user.id = :userId")
    List<String> findDistinctCountryIdsByUserId(@Param("userId") Long userId);

    /**
     * Returns all images ordered by upload date (most recent first).
     */
    @Query("SELECT i FROM Image i ORDER BY i.uploadDate DESC")
    List<Image> findAllOrderedByUploadDateDesc();

    /**
     * Returns a list of distinct years in which a user has uploaded images.
     */
    @Query("SELECT DISTINCT i.year FROM Image i WHERE i.user.id = :userId ORDER BY i.year DESC")
    List<Integer> findDistinctYearsByUserId(@Param("userId") Long userId);

    /**
     * Finds all images uploaded by a user in a specific year, ordered by upload date descending.
     */
    @Query("SELECT i FROM Image i WHERE i.user.id = :userId AND i.year = :year ORDER BY i.uploadDate DESC")
    List<Image> findByUserIdAndYear(@Param("userId") Long userId, @Param("year") Integer year);

    /**
     * Returns a list of distinct years a user has uploaded images for a specific country.
     */
    @Query("SELECT DISTINCT i.year FROM Image i WHERE i.countryId = :countryId AND i.user.id = :userId ORDER BY i.year")
    List<Integer> findDistinctYearsByCountryIdAndUserId(@Param("countryId") String countryId,
                                                        @Param("userId") Long userId);

    /**
     * Counts the number of unique countries where the user has uploaded images.
     */
    @Query("SELECT COUNT(DISTINCT i.countryId) FROM Image i WHERE i.user.id = :userId")
    long countDistinctCountryByUserId(@Param("userId") Long userId);

    /**
     * Returns detailed information about countries where a user has photos.
     * Includes country ID, country name, and photo count.
     */
    @Query("SELECT i.countryId, COUNT(i) as photoCount FROM Image i WHERE i.user.id = :userId GROUP BY i.countryId ORDER BY photoCount DESC")
    List<Object[]> findCountriesWithPhotoCountsByUserId(@Param("userId") Long userId);

    /**
     * Checks if an image with the given filename belongs to the specified user.
     */
    boolean existsByFileNameAndUserId(String fileName, Long userId);
}
