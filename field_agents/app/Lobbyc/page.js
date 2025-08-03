"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fixing default marker icon issues with Leaflet + Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const lobbyC = () => {
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
      {isCoordsValid && (
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={30} // ~50m scale
          scrollWheelZoom={true}
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
            // Dark cyberpunk style tile layer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CartoDB</a> contributors'
          />
          <Marker position={[coords.lat, coords.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
        </MapContainer>
      )}

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

export default lobbyC;
