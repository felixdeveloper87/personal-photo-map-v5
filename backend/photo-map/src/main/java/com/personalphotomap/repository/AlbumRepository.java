package com.personalphotomap.repository;

import com.personalphotomap.model.Album;
import com.personalphotomap.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the Album entity.
 * Provides standard CRUD operations and custom queries
 * to retrieve albums based on user and country criteria.
 */
@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {

    /**
     * Retrieves all albums associated with a specific country.
     *
     * @param countryId The identifier of the country
     * @return List of albums for the given country
     */
    List<Album> findByCountryId(String countryId);

    /**
     * Retrieves all albums for a given user in a specific country.
     *
     * @param countryId The identifier of the country
     * @param user The owner of the albums
     * @return List of user-specific albums for the specified country
     */
    List<Album> findByCountryIdAndUser(String countryId, AppUser user);

    /**
     * Retrieves all albums belonging to a specific user.
     *
     * @param user The album owner
     * @return List of albums created by the user
     */
    List<Album> findByUser(AppUser user);

    /**
     * Retrieves all albums that contain a specific image.
     *
     * @param imageId The unique ID of the image
     * @return List of albums containing the specified image
     */
    @Query("SELECT a FROM Album a JOIN a.images i WHERE i.id = :imageId")
    List<Album> findByImageId(@Param("imageId") Long imageId);
}
