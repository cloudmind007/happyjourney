import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  accessToken: string | null;
  role: string | null;
  username: string | null;
  userId: number | null;
  login: (data: { accessToken: string; role: string; username?: string; userId?: number }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));
  const [userId, setUserId] = useState<number | null>(
    localStorage.getItem("userId") ? Number(localStorage.getItem("userId")) : null
  );

  const login = ({ accessToken, role, username, userId }: AuthContextType["login"]["arguments"]) => {
    const normalizedRole = role.toLowerCase();
    console.log("Login role:", { raw: role, normalized: normalizedRole, userId, username });
    setAccessToken(accessToken);
    setRole(normalizedRole);
    setUsername(username || null);
    setUserId(userId || null);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("role", normalizedRole);
    if (username) localStorage.setItem("username", username);
    if (userId) localStorage.setItem("userId", userId.toString());
  };

  const logout = () => {
    setAccessToken(null);
    setRole(null);
    setUsername(null);
    setUserId(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ accessToken, role, username, userId, login, logout }}>
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