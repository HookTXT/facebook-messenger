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

  // Initialize Facebook SDK
  useEffect(() => {
    const initFacebookSDK = () => {
      if (window.FB) return;

      window.fbAsyncInit = () => {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0' // Use the latest version
        });

        checkLoginStatus();
      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    initFacebookSDK();
  }, []);

  // Check if user is already logged in
  const checkLoginStatus = useCallback(() => {
    if (!window.FB) return;

    setIsLoading(true);
    
    window.FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
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
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    });
  }, []);

  // Fetch user information
  const fetchUserInfo = async (token: string) => {
    return new Promise<void>((resolve, reject) => {
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
      console.warn('Facebook SDK not initialized yet, retrying...');
      setTimeout(login, 500); // Retry after 500ms
      return;
    }

    setIsLoading(true);
    setError(null);

    window.FB.login((response) => {
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
  }, []);

  // Handle logout
  const logout = useCallback(() => {
    if (!window.FB) return;

    window.FB.logout(() => {
      setIsLoggedIn(false);
      setUserInfo(null);
      setPages([]);
    });
  }, []);

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
    error
  };
};