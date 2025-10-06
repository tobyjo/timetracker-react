import React, { createContext, useContext, useState } from 'react';

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
  // For now, hardcode to user ID 1
  // Later this will be set from authentication/login
  const [currentUserId, setCurrentUserId] = useState(1);
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    userName: 'demo_user',
    fullName: 'Demo User'
  });

  // Function to update current user (for future login implementation)
  const login = (user) => {
    setCurrentUserId(user.id);
    setCurrentUser(user);
  };

  // Function to logout (for future implementation)
  const logout = () => {
    setCurrentUserId(null);
    setCurrentUser(null);
  };

  const value = {
    currentUserId,
    currentUser,
    login,
    logout,
    isLoggedIn: !!currentUserId
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;