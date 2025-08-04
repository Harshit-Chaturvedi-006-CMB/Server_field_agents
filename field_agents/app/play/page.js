"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
// import Game from "@/components/Game"; // Uncomment when ready
import "./PlayPage.css"; // We'll define simple CSS in this file for animations

export default function PlayPage() {
  const { user } = useUser();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      // Show welcome screen for 3 seconds before hiding and showing game
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!user) return null; // Wait for redirect

  return (
    <main className="play-container">
      {showWelcome ? (
        <div className="welcome-wrapper">
          <h1 className="welcome-text animate-fade-in">
            Welcome to the Arena, <span className="player-name">{user.username}</span>!
          </h1>
          <div className="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      ) : (
        // Render your game component here
        // <Game />
        <div style={{ color: "#00bfff", fontSize: "1.5rem", textAlign: "center", marginTop: "2rem" }}>
          Game would render here…
        </div>
      )}
    </main>
  );
}
