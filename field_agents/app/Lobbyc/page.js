"use client";
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper: Direction Arrow Icon as a Leaflet DivIcon
function ArrowIcon({ heading = 0 }) {
  return L.divIcon({
    className: "",
    iconAnchor: [16, 32],
    iconSize: [32, 32],
    html: `
      <svg width="32" height="32" style="transform: rotate(${heading}deg)">
        <polygon points="16,2 30,30 16,24 2,30" fill="#00bfff" stroke="#001a22" stroke-width="2"/>
      </svg>
    `,
  });
}

const DirectionArrowMarker = ({ position, heading }) => {
  // Only render if Heading and Position valid
  if (!position || heading === null) return null;
  return (
    <Marker
      position={position}
      icon={ArrowIcon({ heading })}
      interactive={false}
      zIndexOffset={1000}
    />
  );
};

const LobbyC = () => {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [lobbyName, setLobbyName] = useState("");
  const [playRadius, setPlayRadius] = useState("");
  const [heading, setHeading] = useState(null);

  // Get device geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setCoords({
          lat: pos.coords.latitude, lng: pos.coords.longitude,
        }),
        () => setCoords({ lat: "Unavailable", lng: "Unavailable" })
      );
    } else {
      setCoords({ lat: "Unavailable", lng: "Unavailable" });
    }
  }, []);

  // Listen for device orientation
  useEffect(() => {
    function handleOrientation(event) {
      // Some browsers use 'webkitCompassHeading', some use 'alpha'
      let dir = event.webkitCompassHeading ?? (360 - event.alpha);
      // Normalize heading
      if (isFinite(dir)) setHeading(dir);
    }
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
      window.addEventListener("deviceorientation", handleOrientation, true);
      return () => {
        window.removeEventListener("deviceorientationabsolute", handleOrientation);
        window.removeEventListener("deviceorientation", handleOrientation);
      };
    }
  }, []);

  const isCoordsValid = coords.lat && coords.lng && coords.lat !== "Unavailable";

  function onStart(e) {
    e.preventDefault();
    alert(
      `Lobby: ${lobbyName}\nPlay Radius: ${playRadius}m\nLatitude: ${coords.lat}\nLongitude: ${coords.lng}`
    );
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#232526",
      }}
    >
      {/* Centered LOBBY Section with inputs and code */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "20%",
          transform: "translate(-50%, -50%)",
          zIndex: 3,
          pointerEvents: "none",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          padding: "0 1rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.82)",
            borderRadius: 14,
            border: "1.5px solid #00bfff",
            padding: "1.5rem 2.5rem",
            minWidth: 320,
            maxWidth: "98vw",
            boxShadow: "0 4px 26px #000a",
            textAlign: "center",
            pointerEvents: "auto",
            color: "#fff",
            fontFamily: "'Segoe UI', Arial, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: "1.7rem",
              fontWeight: 700,
              letterSpacing: "0.19em",
              textTransform: "uppercase",
              textShadow: "0 3px 13px #000C",
              marginBottom: "0.75rem",
            }}
          >
            LOBBY
          </div>

          <form
            onSubmit={onStart}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <input
              type="text"
              required
              placeholder="Lobby Name"
              value={lobbyName}
              onChange={(e) => setLobbyName(e.target.value)}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: 8,
                border: "1px solid #444",
                background: "#202226",
                color: "#fff",
                fontSize: "1rem",
                outline: "none",
              }}
            />
            <input
              type="number"
              required
              min={1}
              placeholder="Play Radius (meters)"
              value={playRadius}
              onChange={(e) => setPlayRadius(e.target.value)}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: 8,
                border: "1px solid #444",
                background: "#202226",
                color: "#fff",
                fontSize: "1rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                marginTop: "0.5rem",
                border: "none",
                borderRadius: 8,
                padding: "0.6rem",
                fontWeight: 700,
                background: "#00bfff",
                color: "#222",
                fontSize: "1.03rem",
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "background .16s",
              }}
            >
              Start
            </button>
          </form>
          <div
            style={{
              marginTop: "1.3rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              letterSpacing: "0.05em",
              color: "#00bfff",
              userSelect: "all",
            }}
          >
            Code : b3hd3
          </div>
        </div>
      </div>
      {/* Map */}
      {isCoordsValid && (
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={18}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          doubleClickZoom={false}
          attributionControl={false}
          keyboard={false}
          touchZoom={false}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 1,
          }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {/* User marker */}
          <Marker position={[coords.lat, coords.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
          {/* Arrow marker */}
          <DirectionArrowMarker
            position={[coords.lat, coords.lng]}
            heading={heading}
          />
        </MapContainer>
      )}
      {/* Bottom Centered Coordinates Box, moved upward */}
      <div
        style={{
          position: "absolute",
          bottom: "6rem", // moved upward from the bottom edge
          right: "-8%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.85)",
          color: "#fff",
          padding: "1.2rem 2rem",
          borderRadius: "14px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          zIndex: 2,
          minWidth: "220px",
          fontFamily: "'Segoe UI', Arial, sans-serif",
          textAlign: "center",
          userSelect: "text",
        }}
      >
        <h3
          style={{
            margin: 0,
            marginBottom: "0.7rem",
            fontSize: "1.2rem",
            letterSpacing: "1px",
            color: "#00bfff",
          }}
        >
          Coordinates
        </h3>
        <div>
          <strong>Latitude:</strong> {coords.lat ?? "Loading..."}
        </div>
        <div>
          <strong>Longitude:</strong> {coords.lng ?? "Loading..."}
        </div>
      </div>
    </div>
  );
};

export default LobbyC;
