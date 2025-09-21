import React, { createContext, useState, useEffect, useCallback } from 'react';

/**
 * AuthContext
 * This context is used to manage and provide authentication information throughout the application.
 * Exporting it allows any consumer to use AuthContext in other components.
 */
export const AuthContext = createContext();

/**
 * AuthProvider Component
 * This component acts as a wrapper that holds authentication-related state and methods.
 * It provides the following:
 *  - Authentication status (isLoggedIn)
 *  - User's full name (fullname)
 *  - User's email (email)
 *  - Premium status (isPremium)
 *  - Methods to log in, log out, and update the premium status
 * 
 * The context's state is kept in sync with localStorage to persist data across browser sessions.
 * 
 * @param {object} props - The properties for this component.
 * @param {JSX.Element} props.children - The child components that will consume the authentication data.
 * @returns {JSX.Element} A context provider that supplies authentication state and methods.
 */
export const AuthProvider = ({ children }) => {
  /**
   * Determines if a user is logged in by checking the presence of a "token" in localStorage.
   * This ensures that if a token exists, the state initializes as logged in.
   */
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  /**
   * Stores the user's full name from localStorage, or defaults to an empty string if not found.
   */
  const [fullname, setFullname] = useState(localStorage.getItem('fullname') || '');

  /**
   * Stores the user's email address from localStorage, or defaults to an empty string if not found.
   */
  const [email, setEmail] = useState(localStorage.getItem('email') || '');

  /**
   * Determines if a user is a premium user by checking the "premium" value in localStorage.
   * The initial state is converted to a boolean, avoiding issues on the first render.
   */
  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem('premium') === 'true';
  });

  /**
   * Validates the stored token by making a test API call
   * @returns {Promise<boolean>} true if token is valid, false otherwise
   */
  const validateToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const url = import.meta.env.VITE_BACKEND_URL 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/auth/validate`
        : '/api/auth/validate';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return true;
      } else if (response.status === 401) {
        // Token is invalid, logout user
        logout();
        return false;
      }
      return false;
    } catch (error) {
      console.error('Token validation error:', error);
      // On network error, assume token is invalid and logout
      logout();
      return false;
    }
  };

  /**
   * logout
   * Handles the logout process by removing user-related data from localStorage,
   * resetting the relevant states, and dispatching a 'storage' event to inform
   * other parts of the application of the change.
   */
  const logout = useCallback(() => {
    // Remove user credentials from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('fullname');
    localStorage.removeItem('email');
    // localStorage.setItem('premium', "false"); // Uncomment if needed

    // Reset the local state to reflect that the user is no longer logged in
    setIsLoggedIn(false);
    setFullname('');
    setEmail('');
    // setIsPremium(false); // Uncomment if you want to reset premium status on logout

    // Dispatch a storage event to notify other components or tabs
    window.dispatchEvent(new Event('storage'));
  }, []);

  /**
   * Checks token validity on component mount and sets up periodic validation
   */
  useEffect(() => {
    if (isLoggedIn) {
      // Validate token immediately
      validateToken();
      
      // Set up periodic validation every 5 minutes
      const interval = setInterval(validateToken, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  /**
   * Sets up a global fetch interceptor to handle authentication failures
   */
  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override fetch to intercept responses
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Check for authentication failures
      if (response.status === 401 && isLoggedIn) {
        console.warn('🔐 Global fetch interceptor: Authentication failed');
        
        // Clear invalid token
        logout();
        
        // Show notification if possible
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast({
            title: "Session Expired",
            description: "Your login session has expired. Please log in again.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      }
      
      return response;
    };
    
    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [isLoggedIn, logout]);

  /**
   * login
   * Handles the process of storing new authentication data (token, fullname, email, premium) both
   * in localStorage and in the component state. It also triggers a 'storage' event to notify
   * any other listeners (e.g., other browser tabs) of changes in localStorage.
   *
   * @param {object} data - An object containing user information.
   * @param {string} data.token - The authentication token for the user.
   * @param {string} data.fullname - The user's full name.
   * @param {string} data.email - The user's email address.
   * @param {boolean|string} data.premium - Indicates whether the user is a premium member.
   */
  const login = useCallback((data) => {
    if (typeof data !== "object") {
      console.error("Error: login data is not a valid object!", data);
      return;
    }

    const { token, fullname, email, premium } = data;

    // Convert 'premium' to a boolean if it is a string, otherwise check its boolean value
    const isPremiumUser = premium === true || premium === "true";

    // Store user data in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('fullname', fullname);
    localStorage.setItem('email', email);
    localStorage.setItem('premium', isPremiumUser ? "true" : "false");

    // Update state to reflect authenticated status
    setIsLoggedIn(true);
    setFullname(fullname);
    setEmail(email);
    setIsPremium(isPremiumUser);

    // Dispatch a storage event to notify other browser tabs or components
    window.dispatchEvent(new Event('storage'));
  }, []);



  /**
   * register
   * Handles user registration by making an API call to the backend.
   * If successful, automatically logs the user in.
   *
   * @param {object} userData - Registration data (fullname, email, password)
   * @returns {Promise} - Promise that resolves with the response or rejects with an error
   */
  const register = useCallback(async (userData) => {
    
    try {
      // Use o proxy do Vite quando VITE_BACKEND_URL não estiver definido
      const url = import.meta.env.VITE_BACKEND_URL 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`
        : '/api/auth/register';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        let errorText = await response.text();
        console.error('❌ Register error response:', errorText);
        
        // Handle specific HTTP status codes
        if (response.status === 409) {
          // 409 Conflict means the email is already in use
          errorText = 'An account with this email already exists. Please use a different email or try logging in.';
        } else if (response.status === 400) {
          errorText = 'Invalid registration data. Please check your information and try again.';
        } else if (response.status >= 500) {
          errorText = 'Server error. Please try again later.';
        }
        
        throw new Error(errorText || 'Registration failed');
      }

      // Handle the response - it might be JSON or plain text
      let data;
      try {
        const responseText = await response.text();
        
        // Try to parse as JSON first
        try {
          data = JSON.parse(responseText);
        } catch {
          // If not JSON, treat as plain text success message
          data = { message: responseText };
        }
      } catch (readError) {
        console.error('❌ Error reading success response:', readError);
        data = { message: 'Registration successful' };
      }
      
      // Auto-login after successful registration
      if (data.token) {
        login(data);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }, [login]);

  /**
   * updatePremiumStatus
   * Updates the premium status in both localStorage and the component state.
   *
   * @param {boolean|string} status - The new premium status to be set. Can be a boolean or a string.
   */
  const updatePremiumStatus = useCallback((status) => {
    const statusStr = String(status);
    localStorage.setItem('premium', statusStr);
    setIsPremium(statusStr === 'true');
  }, []);

  /**
   * upgradeToPremium
   * Upgrades the current user to premium status by calling the backend API.
   *
   * @returns {Promise<Object>} - Promise that resolves with the upgrade response
   */
  const upgradeToPremium = useCallback(async () => {
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }


      // Validate token first
      try {
        const validateUrl = import.meta.env.VITE_BACKEND_URL 
          ? `${import.meta.env.VITE_BACKEND_URL}/api/auth/validate`
          : '/api/auth/validate';

        const validateResponse = await fetch(validateUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!validateResponse.ok) {
          throw new Error('Your session has expired. Please log in again.');
        }

      } catch (validationError) {
        console.error('❌ Token validation error:', validationError);
        throw new Error('Authentication failed. Please log in again.');
      }

      const url = import.meta.env.VITE_BACKEND_URL 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/auth/users/make-premium`
        : '/api/users/make-premium';


      // Use only PUT method as defined in the backend controller
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.error('❌ Upgrade error response text:', errorText);
        } catch (readError) {
          console.error('❌ Could not read error response:', readError);
        }

        // Handle specific HTTP status codes
        if (response.status === 403) {
          throw new Error('Access denied. Premium upgrade is currently restricted. This feature may require admin approval or may not be available for self-service. Please contact support for assistance.');
        } else if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('Premium upgrade endpoint not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(errorText || `Upgrade failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Update premium status in state and localStorage
      if (data.premium === true) {
        updatePremiumStatus(true);
      }
      
      return data;
    } catch (error) {
      console.error('💥 Upgrade function error:', error);
      throw error;
    }
  }, [updatePremiumStatus]);

  /**
   * Render a Provider that makes all state variables and functions
   * available to any child components through the AuthContext.
   */
  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        isPremium, 
        fullname, 
        email, 
        login, 
        logout, 
        updatePremiumStatus,
        upgradeToPremium
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
