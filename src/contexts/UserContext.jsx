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
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Update user data when Auth0 user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // Use Auth0's sub field as the unique user ID
      const userId = user.sub;
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

  const value = {
    currentUserId,
    currentUser,
    login,
    logout,
    isLoggedIn: isAuthenticated && !!currentUserId,
    isLoading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;