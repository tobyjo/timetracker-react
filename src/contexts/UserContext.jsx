import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// Create the User Context
const UserContext = createContext();

// Custom hook to use the User Context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// User Provider component
export const UserProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Update user data when Auth0 user changes
  useEffect(() => {
    console.log('🔄 Auth state changed:', {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userSub: user?.sub
    });

    if (isAuthenticated && user) {
      // Use Auth0's sub field as the unique user ID
      const userId = user.sub;
      console.log('👤 Setting up user:', {
        userId,
        email: user.email,
        name: user.name
      });
      
      setCurrentUserId(userId);
      setCurrentUser({
        id: userId,
        userName: user.email || user.name || 'Unknown User',
        fullName: user.name || user.email || 'Unknown User',
        email: user.email,
        picture: user.picture,
        auth0User: user
      });
    } else {
      console.log('🚫 Clearing user state');
      setCurrentUserId(null);
      setCurrentUser(null);
    }
  }, [user, isAuthenticated]);

  // Function to update current user (for future use if needed)
  const login = (userData) => {
    setCurrentUserId(userData.id);
    setCurrentUser(userData);
  };

  // Function to logout (clears local state)
  const logout = () => {
    setCurrentUserId(null);
    setCurrentUser(null);
  };

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      console.log('🔐 Making authenticated request to:', url);
      
      // Get the access token from Auth0 with explicit audience
      const token = await getAccessTokenSilently({
        audience: "timetracker",
        scope: "openid profile email read:timeentries write:timeentries read:projects write:projects read:segments write:segments"
      });
      
      // Debug: Log token info (first/last 10 chars for security)
      if (token) {
        console.log('✅ Token retrieved successfully');
        console.log('🔍 Token preview:', `${token.substring(0, 10)}...${token.substring(token.length - 10)}`);
        console.log('📏 Token length:', token.length);
        
        // Decode JWT payload for debugging (without verification)
        try {
          const tokenParts = token.split('.');
          console.log('🧩 Token structure:', {
            totalParts: tokenParts.length,
            headerLength: tokenParts[0]?.length || 0,
            payloadLength: tokenParts[1]?.length || 0,
            signatureLength: tokenParts[2]?.length || 0,
            // fullToken: token // Removed for security
          });
          
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('🎫 Token payload:', {
              sub: payload.sub,
              aud: payload.aud,
              iss: payload.iss,
              exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiration',
              iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'No issued at',
              scope: payload.scope,
              allClaims: payload
            });
          } else {
            console.error('❌ Invalid JWT format - should have 3 parts separated by dots');
          }
        } catch (decodeError) {
          console.warn('⚠️ Could not decode token payload:', decodeError);
          console.log('🔍 Raw token parts for inspection:', token.split('.'));
        }
      } else {
        console.error('❌ No token retrieved');
      }
      
      // Add the Authorization header with the Bearer token
      const authenticatedOptions = {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('📤 Request headers:', authenticatedOptions.headers);
      console.log('🌐 Request options:', { 
        method: authenticatedOptions.method || 'GET',
        url,
        hasBody: !!authenticatedOptions.body 
      });

      const response = await fetch(url, authenticatedOptions);
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
      }

      return response;
    } catch (error) {
      console.error('💥 Error making authenticated request:', error);
      
      // Log additional Auth0 error details
      if (error.error) {
        console.error('🔐 Auth0 Error Details:', {
          error: error.error,
          error_description: error.error_description,
          message: error.message
        });
      }
      
      throw error;
    }
  };

  const value = {
    currentUserId,
    currentUser,
    login,
    logout,
    isLoggedIn: isAuthenticated && !!currentUserId,
    isLoading,
    makeAuthenticatedRequest
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;