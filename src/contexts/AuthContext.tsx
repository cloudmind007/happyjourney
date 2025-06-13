import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  accessToken: string | null;
  role: string | null;
  login: (accessToken: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));

  const login = (newAccessToken: string, newRole: string) => {
    setAccessToken(newAccessToken);
    setRole(newRole);
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("role", newRole);
  };

  const logout = () => {
    setAccessToken(null);
    setRole(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ accessToken, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};