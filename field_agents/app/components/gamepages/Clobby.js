"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

function generateLobbyCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function Clobby() {
  const { user, mounted } = useUser();
  const router = useRouter();

  const [lobbyCode, setLobbyCode] = useState("");
  const [playerCount, setPlayerCount] = useState(1);
  const [message, setMessage] = useState("");
  const [isStartEnabled, setStartEnabled] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !user) {
      router.replace("/login");
    }
  }, [user, mounted, router]);

  // Generate code and create lobby on mount
  useEffect(() => {
    if (!user || !mounted) return;

    const code = generateLobbyCode();
    setLobbyCode(code);

    // Create lobby in backend
    async function createLobby() {
      try {
        const res = await fetch("/api/create-lobby", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            playerCount: 1,
            host: user.username,
          }),
        });
        if (!res.ok) throw new Error("Failed to create lobby");
        setMessage("Lobby created! Waiting for players...");
      } catch {
        setMessage("Error creating lobby.");
      }
    }

    createLobby();
  }, [user, mounted]);

  // Mock player count increase every 5s for demo (replace with real-time updates)
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setPlayerCount((c) => {
        const next = Math.min(c + 1, 10);
        setStartEnabled(next > 1);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [mounted]);

  const startGame = () => {
    if (!isStartEnabled) return;
    setMessage("Game starting...");
    // TODO: Notify backend or navigate to game scene
  };

  if (!mounted || !user) return null; // Wait for mounted and user check       

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#121212",
        color: "#00bfff",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Player count top right */}
      <div
        style={{
          alignSelf: "flex-end",
          fontWeight: "600",
          fontSize: "1.3rem",
          backgroundColor: "#222",
          padding: "0.5rem 1rem",
          borderRadius: 12,
          marginBottom: "1rem",
          userSelect: "none",
        }}
      >
        Players: {playerCount}
      </div>

      {/* Lobby code center */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "4rem",
          fontWeight: "900",
          letterSpacing: "0.3rem",
          userSelect: "all",
        }}
      >
        {lobbyCode}
      </div>

      {/* Start button */}
      <button
        disabled={!isStartEnabled}
        onClick={startGame}
        style={{
          width: "40%",
          alignSelf: "center",
          marginBottom: "2rem",
          padding: "1rem",
          fontSize: "1.5rem",
          fontWeight: "700",
          borderRadius: 12,
          backgroundColor: isStartEnabled ? "#00bfff" : "#004a6d",
          border: "none",
          color: isStartEnabled ? "#fff" : "#aaa",
          cursor: isStartEnabled ? "pointer" : "not-allowed",
          transition: "background-color 0.3s ease",
          userSelect: "none",
        }}
      >
        Start
      </button>

      {/* Status message */}
      {message && (
        <div
          style={{
            textAlign: "center",
            color: "#00bfff",
            fontWeight: "600",
            fontSize: "1.2rem",
            userSelect: "none",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
