package com.personalphotomap.repository;

import com.personalphotomap.model.CountryInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for accessing CountryInfo entities in the database.
 * Provides methods for retrieving cached country information and managing cache expiration.
 */
@Repository
public interface CountryInfoRepository extends JpaRepository<CountryInfo, String> {

    /**
     * Finds country information by country ID (ISO2 code).
     * 
     * @param countryId The ISO2 country code (e.g., "US", "BR")
     * @return Optional containing the country info if found
     */
    Optional<CountryInfo> findByCountryId(String countryId);

    /**
     * Deletes all expired cache entries.
     * Entries are considered expired if their expiresAt timestamp is before the given time.
     * 
     * @param now The current timestamp to compare against
     */
    @Modifying
    @Query("DELETE FROM CountryInfo c WHERE c.expiresAt < :now")
    void deleteExpired(@Param("now") LocalDateTime now);

    /**
     * Finds all country info entries that have expired basic information.
     * Basic info includes capital, language, coordinates, etc.
     * 
     * @param now The current timestamp to compare against
     * @return List of country info entries with expired basic information
     */
    @Query("SELECT c FROM CountryInfo c WHERE c.basicInfoExpiresAt < :now")
    List<CountryInfo> findExpiredBasicInfo(@Param("now") LocalDateTime now);

    /**
     * Finds all country info entries that have expired economic data.
     * 
     * @param now The current timestamp to compare against
     * @return List of country info entries with expired economic data
     */
    @Query("SELECT c FROM CountryInfo c WHERE c.economicDataExpiresAt < :now")
    List<CountryInfo> findExpiredEconomicData(@Param("now") LocalDateTime now);

    /**
     * Finds all country info entries that have expired social data.
     * 
     * @param now The current timestamp to compare against
     * @return List of country info entries with expired social data
     */
    @Query("SELECT c FROM CountryInfo c WHERE c.socialDataExpiresAt < :now")
    List<CountryInfo> findExpiredSocialData(@Param("now") LocalDateTime now);

    /**
     * Checks if country information exists for a given country ID.
     * 
     * @param countryId The ISO2 country code
     * @return true if country info exists, false otherwise
     */
    boolean existsByCountryId(String countryId);

    /**
     * Finds all country info entries that need to be refreshed soon.
     * Returns entries that will expire within the next 24 hours.
     * 
     * @param now The current timestamp
     * @param tomorrow Timestamp 24 hours from now
     * @return List of country info entries expiring soon
     */
    @Query("SELECT c FROM CountryInfo c WHERE c.expiresAt BETWEEN :now AND :tomorrow")
    List<CountryInfo> findExpiringSoon(@Param("now") LocalDateTime now, 
                                       @Param("tomorrow") LocalDateTime tomorrow);
}