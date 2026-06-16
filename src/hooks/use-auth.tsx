import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useGetMe, User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User, isPasswordExpired?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("stemmatters_token"));
  
  // Set the getter for api-client-react
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("stemmatters_token"));
  }, []);

  const { data: user, isLoading: isUserLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("stemmatters_token");
      setToken(null);
    }
  }, [isError]);

  const login = (newToken: string, newUser: User, isPasswordExpired = false) => {
    localStorage.setItem("stemmatters_token", newToken);
    setToken(newToken);
    if (isPasswordExpired) {
      setLocation("/change-password");
    } else {
      setLocation("/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("stemmatters_token");
    setToken(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading: isUserLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
