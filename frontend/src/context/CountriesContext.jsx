


import React, { createContext, useState, useEffect, useCallback } from 'react';
import countries from 'i18n-iso-countries';
import { buildApiUrl } from '../utils/apiConfig';

// Create and export the context to provide global state access for countries-related data
export const CountriesContext = createContext();

/**
 * CountriesProvider Component
 * This component acts as a context provider for countries-related data, including:
 * - Countries with photos (detailed with photo counts)
 * - Loading state
 * - Photo and country counts
 * - Cache management with real-time updates
 * It wraps child components and exposes the above data through the context API.
 */
export const CountriesProvider = ({ children }) => {
    // State for storing countries that have associated photos (detailed)
    const [countriesWithPhotos, setCountriesWithPhotos] = useState([]);
    // State for tracking whether data is still loading
    const [availableYears, setAvailableYears] = useState([]);
    const [loading, setLoading] = useState(true);
    // State for the total number of photos uploaded
    const [photoCount, setPhotoCount] = useState(0);
    // State for the total number of countries with photos
    const [countryCount, setCountryCount] = useState(0);

    // Cache management
    const [lastFetch, setLastFetch] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [cacheDisabled, setCacheDisabled] = useState(false);
    // State for triggering map updates
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

    /**
     * fetchCounts - Fetches the total photo count and country count from the backend API
     * This function retrieves aggregated metrics and updates the respective state variables.
     */
    const fetchCounts = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(buildApiUrl('/api/images/count'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Error fetching photo and country counts');
            }

            const data = await response.json();

            setPhotoCount(data.photoCount);
            setCountryCount(data.countryCount);
        } catch (error) {
            setPhotoCount(0);
            setCountryCount(0);
        }
    };

    /**
     * fetchCountriesWithPhotosDetailed - Fetches detailed information about countries with photos
     * This function retrieves country IDs, names, and photo counts from the new detailed endpoint.
     */
    const fetchCountriesWithPhotosDetailed = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setCountriesWithPhotos([]);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(buildApiUrl('/api/images/countries-with-photos-detailed'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                return await fetchCountriesWithPhotosOld();
            }

            const data = await response.json();
            // TEMPORARY: If data is empty, force fallback to test old endpoint
            if (!data || data.length === 0) {
                return await fetchCountriesWithPhotosOld();
            }

            // Data already comes with countryId, countryName, and photoCount
            setCountriesWithPhotos(data);

            // Force a re-render by updating the state again
            setTimeout(() => {
                setCountriesWithPhotos([...data]);
            }, 100);
        } catch (error) {
            console.error('Error fetching countries with photos detailed:', error);
            console.warn('⚠️ Falling back to old endpoint due to error');
            // Fallback to old endpoint
            return await fetchCountriesWithPhotosOld();
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fallback function using the old endpoint structure
     */
    const fetchCountriesWithPhotosOld = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setCountriesWithPhotos([]);
            return;
        }

        try {
            const response = await fetch(buildApiUrl('/api/images/countries-with-photos'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error fetching countries with photos');
            }

            const data = await response.json();
            // Convert old format to new format
            const mappedCountries = data.map((countryId) => ({
                countryId,
                countryName: getCountryName(countryId),
                photoCount: 0 // We don't have photo count in old format
            }));
            setCountriesWithPhotos(mappedCountries);
        } catch (error) {
            console.error('Error fetching countries with photos (old):', error);
            setCountriesWithPhotos([]);
        }
    };

    /**
     * Helper to get country names (same as backend)
     */
    const getCountryName = (countryId) => {
        const countryNames = {
            'us': 'United States',
            'br': 'Brazil',
            'fr': 'France',
            'de': 'Germany',
            'it': 'Italy',
            'es': 'Spain',
            'uk': 'United Kingdom',
            'ca': 'Canada',
            'au': 'Australia',
            'jp': 'Japan',
            'cn': 'China',
            'in': 'India',
            'mx': 'Mexico',
            'ar': 'Argentina',
            'cl': 'Chile',
            'pe': 'Peru',
            'co': 'Colombia',
            've': 'Venezuela',
            'ec': 'Ecuador',
            'uy': 'Uruguay',
            'py': 'Paraguay',
            'bo': 'Bolivia',
            'gy': 'Guyana',
            'sr': 'Suriname',
            'gf': 'French Guiana',
            'fk': 'Falkland Islands'
        };

        return countryNames[countryId?.toLowerCase()] || countryId?.toUpperCase() || 'Unknown';
    };

    /**
     * fetchAvailableYears - Busca os anos disponíveis no backend
     */
    const fetchAvailableYears = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAvailableYears([]);
            return;
        }

        try {
            const response = await fetch(buildApiUrl('/api/images/available-years'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar anos disponíveis');
            }

            const data = await response.json();
            setAvailableYears(data && Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao buscar anos disponíveis:', error);
            setAvailableYears([]);
        }
    };

    /**
     * refreshCountriesWithPhotos - Refreshes all data with cache validation
     * This function ensures all relevant data is fetched and updated simultaneously.
     */
    const refreshCountriesWithPhotos = useCallback(async (force = false) => {
        const now = Date.now();
        // Prevent concurrent refreshes
        if (isRefreshing) {
            return;
        }

        // Check if cache is still valid (unless forced refresh or cache disabled)
        if (!force && !cacheDisabled && (now - lastFetch) < CACHE_DURATION) {
            return;
        }

        // For forced refresh, ALWAYS bypass cache regardless of timing
        if (force) {
            // Temporarily disable cache for subsequent operations
            setCacheDisabled(true);
            setTimeout(() => {
                setCacheDisabled(false);
            }, 2000); // Disable cache for 2 seconds
        }

        setIsRefreshing(true);
        setLoading(true);

        try {
            // Always trigger immediate UI update for forced refresh
            if (force) {
                setUpdateTrigger(prev => prev + 1);
            }

            // Use Promise.allSettled for better error handling in production
            const results = await Promise.allSettled([
                fetchCounts(),
                fetchCountriesWithPhotosDetailed(),
                fetchAvailableYears()
            ]);

            setLastFetch(now);
            // Trigger another update after data is loaded
            if (force) {
                setUpdateTrigger(prev => prev + 1);
                // Add a small delay and trigger again for better production reliability
                setTimeout(() => {
                    setUpdateTrigger(prev => prev + 1);
                }, 100);
            }
        } catch (error) {
            // Even on error, trigger update to ensure UI consistency
            setUpdateTrigger(prev => prev + 1);
        } finally {
            setIsRefreshing(false);
            setLoading(false);
        }
    }, [lastFetch, isRefreshing, cacheDisabled]);

    /**
     * forceRefresh - Forces a refresh of all data (used after uploads)
     * This bypasses cache and fetches fresh data immediately.
     */
    const forceRefresh = useCallback(async () => {
        await refreshCountriesWithPhotos(true);
        // Trigger immediate map update
        setUpdateTrigger(prev => prev + 1);
    }, [refreshCountriesWithPhotos]);

    /**
     * refreshAfterUpload - Specialized refresh for post-upload scenarios
     * Completely bypasses cache and forces immediate data refresh
     */
    const refreshAfterUpload = useCallback(async () => {

        // Disable cache temporarily
        setCacheDisabled(true);

        // Reset last fetch to force refresh
        setLastFetch(0);

        // Trigger immediate UI update
        setUpdateTrigger(prev => prev + 1);

        try {
            await refreshCountriesWithPhotos(true);
        } finally {
            // Re-enable cache after a delay
            setTimeout(() => {
                setCacheDisabled(false);
            }, 3000);
        }
    }, [refreshCountriesWithPhotos]);

    /**
     * triggerMapUpdate - Triggers an immediate map update by incrementing updateTrigger
     * This function is used to notify map components that they should refresh their display
     */
    const triggerMapUpdate = useCallback(() => {
        setUpdateTrigger(prev => prev + 1);
    }, []);

    /**
     * useEffect - Effect for monitoring token changes and triggering data refresh
     * This effect listens for changes in the localStorage token (via the 'storage' event)
     * and updates the context state accordingly.
     */
    useEffect(() => {
        const updateData = () => {
            const token = localStorage.getItem('token');
            if (token) {
                refreshCountriesWithPhotos();
            } else {
                setPhotoCount(0);
                setCountryCount(0);
                setCountriesWithPhotos([]);
                setAvailableYears([]);
                setLastFetch(0);
            }
        };

        // Listen for 'storage' events to detect token changes across tabs/windows
        window.addEventListener('storage', updateData);
        updateData(); // Perform an initial data fetch on component mount

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('storage', updateData);
        };
    }, [refreshCountriesWithPhotos]);

    return (
        // Provide the context value to child components
        <CountriesContext.Provider
            value={{
                countriesWithPhotos,
                loading,
                photoCount,
                countryCount,
                availableYears,
                updateTrigger,
                refreshCountriesWithPhotos,
                forceRefresh, // New method for immediate refresh
                refreshAfterUpload, // Specialized method for post-upload refresh
                triggerMapUpdate, // New method for immediate map updates
            }}
        >
            {children}
        </CountriesContext.Provider>
    );
};

