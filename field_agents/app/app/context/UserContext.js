"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Only runs on client
    const stored = window.localStorage.getItem("fieldAgentsUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    // When user changes, update localStorage
    if (user) {
      window.localStorage.setItem("fieldAgentsUser", JSON.stringify(user));
    } else {
      window.localStorage.removeItem("fieldAgentsUser");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
