"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issues with Leaflet + Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LobbyC = () => {
  const [coords, setCoords] = useState({ lat: null, lng: null });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos =>
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () =>
          setCoords({
            lat: "Unavailable",
            lng: "Unavailable",
          })
      );
    } else {
      setCoords({ lat: "Unavailable", lng: "Unavailable" });
    }
  }, []);

  const isCoordsValid =
    coords.lat && coords.lng && coords.lat !== "Unavailable";

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
      {/* Top Centered LOBBY */}
      <div
        style={{
          position: "absolute",
          top: "2rem",
          width: "100vw",
          textAlign: "center",
          zIndex: 3,
          pointerEvents: "none", // ensure doesn't block map
          fontFamily: "'Orbitron', 'Segoe UI', Arial, sans-serif",
        }}
      >
        <span
          style={{
            fontSize: "2.7rem",
            color: "#fff",
            letterSpacing: "0.3em",
            textShadow: "0 6px 26px #000A, 0 1px 6px #0ff7, 0 0px 0px #0007",
            fontWeight: "bold",
            textTransform: "uppercase",
            background: "rgba(30,30,34,0.62)",
            padding: "0.55em 2.5em",
            borderRadius: "14px",
            border: "2px solid #00bfff",
            boxShadow: "0 4px 14px #00bfff48"
          }}
        >LOBBY</span>
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
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <Marker position={[coords.lat, coords.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
        </MapContainer>
      )}

      {/* Bottom Right Coordinates Box */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          right: "2rem",
          background: "rgba(0,0,0,0.85)",
          color: "#fff",
          padding: "1.2rem 2rem",
          borderRadius: "14px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          zIndex: 2,
          minWidth: "220px",
          fontFamily: "'Segoe UI', Arial, sans-serif",
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
