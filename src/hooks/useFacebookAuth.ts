import { useState, useEffect, useCallback } from 'react';
import { FacebookUserInfo, FacebookPage } from '../types/facebook';
import { saveFacebookToken, getFacebookToken } from '../services/supabaseService';

/**
 * Custom hook for handling Facebook authentication
 */
export const useFacebookAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<FacebookUserInfo | null>(null);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFBInitialized, setIsFBInitialized] = useState(false);

  // Initialize Facebook SDK
  useEffect(() => {
    const initFacebookSDK = () => {
      // Define async init function that will run when SDK is loaded
      window.fbAsyncInit = function() {
        try {
          window.FB.init({
            appId: import.meta.env.VITE_FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v19.0' // Updated to a current stable version
          });
          
          console.log("Facebook SDK initialized successfully");
          setIsFBInitialized(true);
          checkLoginStatus();
        } catch (error) {
          console.error("Error initializing Facebook SDK:", error);
          handleError(error);
        }
      };

      // If FB is already loaded and initialized, trigger the init manually
      if (window.FB) {
        window.fbAsyncInit();
      }
    };

    // Wait for DOM to be fully loaded
    if (document.readyState === 'complete') {
      initFacebookSDK();
    } else {
      window.addEventListener('load', initFacebookSDK);
      return () => window.removeEventListener('load', initFacebookSDK);
    }
  }, []);

  // Check if user is already logged in
  const checkLoginStatus = useCallback(() => {
    if (!window.FB || !isFBInitialized) {
      console.log("FB not available for login status check");
      return;
    }

    console.log("Checking login status");
    setIsLoading(true);
    
    window.FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        console.log("User already connected:", response);
        const token = response.authResponse.accessToken;
        const userId = response.authResponse.userID;
        
        // Store the token securely
        saveFacebookToken(userId, token, 'short_lived')
          .then(() => fetchUserInfo(token))
          .then(() => fetchPages(token))
          .then(() => {
            setIsLoggedIn(true);
            setIsLoading(false);
          })
          .catch(handleError);
      } else {
        console.log("User not connected:", response.status);
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    });
  }, [isFBInitialized]);

  // Fetch user information
  const fetchUserInfo = async (token: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!window.FB || !isFBInitialized) {
        reject(new Error("Facebook SDK not initialized"));
        return;
      }

      window.FB.api(
        '/me',
        { fields: 'id,name,email,picture.type(large)' },
        (response: FacebookUserInfo) => {
          if (!response || response.error) {
            reject(response?.error?.message || 'Failed to fetch user info');
            return;
          }
          
          setUserInfo(response);
          resolve();
        }
      );
    });
  };

  // Fetch user's Facebook pages
  const fetchPages = async (token: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!window.FB || !isFBInitialized) {
        reject(new Error("Facebook SDK not initialized"));
        return;
      }

      window.FB.api(
        '/me/accounts',
        { 
          fields: 'id,name,category,picture.type(large),access_token,tasks',
          access_token: token
        },
        async (response: { data: FacebookPage[] }) => {
          if (!response || response.error) {
            reject(response?.error?.message || 'Failed to fetch pages');
            return;
          }
          
          // Store page access tokens
          if (response.data && response.data.length > 0) {
            for (const page of response.data) {
              if (page.access_token) {
                await saveFacebookToken(page.id, page.access_token, 'page');
              }
            }
          }
          
          setPages(response.data || []);
          resolve();
        }
      );
    });
  };

  // Handle login with Facebook
  const login = useCallback(() => {
    if (!window.FB) {
      setError('Facebook SDK not loaded. Please refresh the page.');
      return;
    }

    if (!isFBInitialized) {
      setError('Facebook SDK is initializing. Please try again in a moment.');
      return;
    }

    try {
      console.log("Attempting to log in with Facebook");
      setIsLoading(true);
      setError(null);

      window.FB.login((response) => {
        console.log("Login response:", response);
        if (response.authResponse) {
          const token = response.authResponse.accessToken;
          const userId = response.authResponse.userID;
          
          // Store the token securely
          saveFacebookToken(userId, token, 'short_lived')
            .then(() => fetchUserInfo(token))
            .then(() => fetchPages(token))
            .then(() => {
              setIsLoggedIn(true);
              setIsLoading(false);
            })
            .catch(handleError);
        } else {
          setError('Facebook login was cancelled or failed');
          setIsLoading(false);
        }
      }, { 
        scope: 'email,pages_show_list,pages_messaging,pages_manage_metadata'
      });
    } catch (error) {
      console.error("Error during login:", error);
      handleError(error);
    }
  }, [isFBInitialized]);

  // Handle logout
  const logout = useCallback(() => {
    if (!window.FB || !isFBInitialized) return;

    window.FB.logout(() => {
      setIsLoggedIn(false);
      setUserInfo(null);
      setPages([]);
    });
  }, [isFBInitialized]);

  // Handle errors
  const handleError = (error: any) => {
    console.error('Facebook auth error:', error);
    setError(typeof error === 'string' ? error : error.message || 'An unknown error occurred');
    setIsLoading(false);
  };

  return {
    isLoggedIn,
    userInfo,
    pages,
    login,
    logout,
    isLoading,
    error,
    isFBInitialized
  };
};