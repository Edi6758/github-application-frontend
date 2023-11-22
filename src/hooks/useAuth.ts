import { useState, useEffect } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    // Retrieve token from localStorage on initial load
    return localStorage.getItem("accessToken");
  });

  const [user, setUser] = useState<string | null>(() => {
    // Retrieve username from localStorage on initial load
    return localStorage.getItem("user");
  });

  const login = (accessToken: string, user: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", user);
    setToken(accessToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // Check if token exists in localStorage on initial load and when it changes
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (storedToken !== token) {
      setToken(storedToken);
    }
    if (storedUser !== user) {
      setUser(storedUser);
    }
  }, [token, user]);

  const isLogged = !!token; // Check if token exists

  return { isLogged, token, user, login, logout };
}
