import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  phone: string;
  whatsapp: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: Omit<User, 'isLoggedIn'>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user_details');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.name && data.phone) {
        setUser({ 
          name: data.name,
          phone: data.phone,
          whatsapp: data.whatsapp || data.phone,
          isLoggedIn: true 
        });
      }
    }
  }, []);

  const login = (userData: Omit<User, 'isLoggedIn'>) => {
    const identifiedUser = { ...userData, isLoggedIn: true };
    setUser(identifiedUser);
    localStorage.setItem('user_details', JSON.stringify(identifiedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_details');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
