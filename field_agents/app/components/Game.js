"use client";
import React, { useState, useEffect, useRef } from "react";
import Phaser from "phaser";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function generateLobbyCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function Game() {
  const [view, setView] = useState("selection"); // selection, create, join, playing
  const [username, setUsername] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [playerCount, setPlayerCount] = useState(1);
  const [radius, setRadius] = useState(500); // meters
  const [userLocation, setUserLocation] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [message, setMessage] = useState("");
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const gameContainerRef = useRef(null);
  const phaserGameRef = useRef(null);

  // Update userLocation on mount and watch position
  useEffect(() => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported by your browser");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setMessage("Unable to retrieve your location");
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Initialize and update Leaflet map (in create or join lobby views)
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (mapInstance.current) {
      mapInstance.current.setView([userLocation.lat, userLocation.lng], 16);
      markerInstance.current.setLatLng([userLocation.lat, userLocation.lng]);
      return;
    }

    // Initialize map
    mapInstance.current = L.map(mapRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 16,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapInstance.current);
    markerInstance.current = L.marker([userLocation.lat, userLocation.lng]).addTo(mapInstance.current);
  }, [userLocation]);

  // --- Game Scene (Phaser) ---

  useEffect(() => {
    if (view !== "playing") {
      // Destroy game if exists
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
      return;
    }

    if (phaserGameRef.current) return; // Prevent multiple instances

    class MainScene extends Phaser.Scene {
      preload() {
        this.load.image("sky", "https://labs.phaser.io/assets/skies/space3.png");
      }
      create() {
        this.add.image(400, 300, "sky");
        this.add.text(150, 280, "Game scene placeholder\nBuild your game here", {
          font: "28px Arial",
          fill: "#00bfff",
          align: "center",
        });
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameContainerRef.current,
      scene: MainScene,
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [view]);

  // --- Lobby handlers

  const handleCreateLobby = async () => {
    if (!userLocation) {
      setMessage("Waiting for location...");
      return;
    }
    const code = generateLobbyCode();
    setLobbyCode(code);
    setPlayerCount(1);
    setMessage("Creating lobby...");

    // Call backend API to create lobby
    try {
      const res = await fetch("/api/create-lobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          playerCount: 1,
          host: username || "Host",
          playgroundRadius: radius,
          centerLat: userLocation.lat,
          centerLng: userLocation.lng,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to create lobby");
      setMessage("Lobby created! Waiting for players...");
      setView("lobby");
    } catch (e) {
      setMessage("Error creating lobby: " + e.message);
    }
  };

  const handleJoinLobby = async () => {
    if (!userLocation) {
      setJoinError("Waiting for location...");
      return;
    }
    if (!joinCodeInput) {
      setJoinError("Please enter a lobby code");
      return;
    }
    setJoinError("");
    setMessage("Joining lobby...");

    try {
      const res = await fetch("/api/join-lobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: joinCodeInput.toUpperCase(),
          playerName: username || "Player",
          playerLat: userLocation.lat,
          playerLng: userLocation.lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Failed to join lobby");
        setMessage("");
      } else {
        setLobbyCode(joinCodeInput.toUpperCase());
        setPlayerCount(data.playerCount || 1);
        setMessage("Joined lobby!");
        setView("lobby");
      }
    } catch {
      setJoinError("Network error joining lobby");
      setMessage("");
    }
  };

  // --- Render ---

  if (view === "selection") {
    return (
      <div style={pageStyle}>
        <h2 style={{ marginBottom: 20, color: "#00bfff" }}>Welcome to Field Agents</h2>
        <input
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleCreateLobby} style={primaryButton}>
          Create Lobby
        </button>
        <button onClick={() => setView("join")} style={secondaryButton}>
          Join Lobby
        </button>
      </div>
    );
  }

  if (view === "join") {
    return (
      <div style={pageStyle}>
        <h2 style={{ marginBottom: 20, color: "#00bfff" }}>Join Lobby</h2>
        <input
          placeholder="Lobby Code"
          value={joinCodeInput}
          onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
          style={inputStyle}
        />
        <input
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleJoinLobby} style={primaryButton}>
          Join
        </button>
        <button onClick={() => setView("selection")} style={{...secondaryButton, marginTop: 10}}>
          Back
        </button>
        {joinError && (
          <div style={{ color: "red", marginTop: 10 }}>
            {joinError}
          </div>
        )}
      </div>
    );
  }

  if (view === "lobby") {
    return (
      <div style={{position: "relative", height: "100vh"}}>
        <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", color: "#00bfff", fontWeight: "bold", fontSize: 32, userSelect: "all" }}>
          Lobby Code: {lobbyCode}
        </div>
        <div style={{ position: "absolute", top: 16, right: 16, color: "#00bfff", fontWeight: "600", fontSize: 20 }}>
          Players: {playerCount}
        </div>
        <div ref={mapRef} style={{ height: "calc(100vh - 100px)", filter: "brightness(0.7)" }}></div>
        <button
          onClick={() => setView("playing")}
          style={{ 
            position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", 
            padding: "12px 50px", borderRadius: 25, fontWeight: "700", fontSize: 20, 
            backgroundColor: playerCount > 1 ? "#00bfff" : "#004a6d", color: "white",
            border: "none",
            cursor: playerCount > 1 ? "pointer" : "not-allowed",
          }}
          disabled={playerCount <= 1}
        >
          Start Game
        </button>
      </div>
    );
  }

  if (view === "playing") {
    return (
      <div>
        <GameSceneRenderer />
      </div>
    );
  }

  return null; // fallback
}

// Minimal inline styling helpers
const pageStyle = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#00bfff",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana",
  gap: 20,
};

const inputStyle = {
  fontSize: 20,
  padding: 12,
  borderRadius: 8,
  border: 'none',
  width: 280,
  marginBottom: 20,
};

const primaryButton = {
  backgroundColor: "#00bfff",
  border: "none",
  borderRadius: 20,
  padding: "12px 48px",
  fontWeight: "700",
  color: "white",
  fontSize: 20,
  cursor: "pointer",
  marginBottom: 10,
};

const secondaryButton = {
  backgroundColor: "#333",
  border: "none",
  borderRadius: 20,
  padding: "12px 48px",
  fontWeight: "700",
  color: "#999",
  fontSize: 20,
  cursor: "pointer",
}

// Placeholder Phaser game renderer inside React -- replace with your full Phaser code
function GameSceneRenderer() {
  const gameContainerRef = React.useRef(null);
  const phaserGameRef = React.useRef(null);

  React.useEffect(() => {
    if (phaserGameRef.current) return;

    class MainScene extends Phaser.Scene {
      preload() {}
      create() {
        this.add.text(150, 280, "Game started!", { font: "28px Arial", fill: "#00bfff" });
      }
      update() {}
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameContainerRef.current,
      scene: MainScene,
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  return <div ref={gameContainerRef} style={{ width: 800, height: 600, margin: "auto" }} />;
}
