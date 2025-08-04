"use client";
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

// Helper: Enter fullscreen
function enterFullScreen(elem) {
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

export default function Lobby() {
  const { user } = useUser();
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    // Clean up old map instance
    mapRef.current.innerHTML = "";
    let map, marker;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map = L.map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 17,
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
          tap: false,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        marker = L.circleMarker([latitude, longitude], {
          color: "#00bfff", radius: 16, fillOpacity: 1, weight: 4
        }).addTo(map);
        setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (newPos) => {
              const { latitude: lat, longitude: lng } = newPos.coords;
              map.setView([lat, lng]);
              marker.setLatLng([lat, lng]);
            }
          );
        }, 5000);
      }
    );
    return () => { map && map.remove(); };
  }, []);

  const handleFullscreen = () => {
    enterFullScreen(document.documentElement);
  };

  const router = useRouter();

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Background Map */}
      <div
        ref={mapRef}
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          zIndex: 0, filter: "brightness(0.6) blur(2px)",
          pointerEvents: "none",
        }}
      />
      {/* Fullscreen Icon/Button */}
      <button
        onClick={handleFullscreen}
        title="Fullscreen"
        style={{
          position: "absolute", top: 24, right: 30, zIndex: 2,
          background: "rgba(34,34,34,0.8)", border: "none", borderRadius: 9,
          padding: 9, color: "#fff", cursor: "pointer", fontSize: 26,
          boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
        }}
      >
        ⛶
      </button>
      {/* Username */}
      <div
        style={{
          position: "absolute", top: 28, left: 36, zIndex: 2,
          color: "#fff", fontWeight: 700, fontSize: "1.35rem", textShadow: "0 2px 8px #111",
        }}
      >
        {user?.username || "Player"}
      </div>
      {/* Centered Lobby Buttons */}
      <div
        style={{
          position: "absolute", top: "50%", left: "50%", zIndex: 2,
          transform: "translate(-50%, -55%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5rem"
        }}
      >
        <button
          onClick={() => router.push("/create-lobby")}
          style={{
            minWidth: 240, fontSize: "1.5rem", fontWeight: 700,
            background: "#00bfff", color: "#fff", padding: "1rem 2rem",
            border: "none", borderRadius: 12, boxShadow: "0 4px 32px #00bfff33",
            cursor: "pointer", marginBottom: 0, letterSpacing: "1.5px", transition: "background 0.2s"
          }}
        >Create Lobby</button>
        <button
          onClick={() => router.push("/join-lobby")}
          style={{
            minWidth: 240, fontSize: "1.5rem", fontWeight: 700,
            background: "#fff", color: "#00bfff", border: "2px solid #00bfff", padding: "1rem 2rem",
            borderRadius: 12, boxShadow: "0 2px 24px #1515ff14",
            cursor: "pointer", letterSpacing: "1.5px", transition: "background 0.2s"
          }}
        >Join Lobby</button>
      </div>
    </div>
  );
}
