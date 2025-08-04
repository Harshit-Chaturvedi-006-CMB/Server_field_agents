"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import './signup.css'

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Signup successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login"); // Redirect to login page
        }, 1500);
      } else {
        setMessage(data.error || "Signup failed");
      }
    } catch (err) {
      setMessage("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSignup}>
        <h2 className="login-title">Sign Up</h2>
        <input
          type="text"
          className="login-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="login-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
        {message && <p style={{ color: "orange", marginTop: 10 }}>{message}</p>}
      </form>
    </div>
  );
}
