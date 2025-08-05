'use client';

import { useState, useEffect } from 'react';
import PhaserGame from '@/components/PhaserGame'; // Adjust path if needed

export default function Play() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #203055 0%, #06080d 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        color: '#fff'
      }}
    >
      {/* Animated spinner global styles */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Top welcome */}
      <h1 style={{ marginTop: 64, fontSize: 36, letterSpacing: 2 }}>
        Welcome, Agent!
      </h1>
      {loading ? (
        <div
          style={{
            marginTop: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              border: '8px solid #4fa1f2',
              borderTop: '8px solid #293e6a',
              borderRadius: '50%',
              animation: 'spin 1.1s linear infinite'
            }}
          />
          <div style={{ marginTop: 30, fontSize: 20, letterSpacing: 2 }}>
            Initializing mission system...
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 40, width: '100%' }}>
          <PhaserGame  />
        </div>
      )}
    </div>
  );
}
