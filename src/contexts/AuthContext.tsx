
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          const userData = await userAPI.getTeacherInfo();
          setUser({
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            middleName: userData.middleName,
            email: userData.email,
            avatar: userData.avatar,
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('accessToken');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authAPI.signIn(email, password);
      const userData = await userAPI.getTeacherInfo();
      setUser({
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        email: userData.email,
        avatar: userData.avatar,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
