'use client';

import { useEffect, useState, useRef } from 'react';

const roleTasksMap = {
  scientist: ['Analyze samples', 'Run experiments', 'Collect data'],
  explorer: ['Scout area', 'Map location', 'Survey surroundings'],
  deviation: ['Hacking systems', 'Bypass security', 'Data extraction'],
  engineer: ['Repair equipment', 'Maintain systems', 'Build infrastructure'],
  Kira: ['Lead mission', 'Coordinate team', 'Strategize plan'],
};

const roles = ['scientist', 'explorer', 'deviation', 'engineer'];

function getRandomTasks(role) {
  const tasks = roleTasksMap[role] || [];
  // For example assign 2 random tasks from role tasks
  const shuffled = tasks.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
}

function generatePlayerData(playerNames) {
  // Assign one Kira among all players, rest random roles
  const kiraIndex = Math.floor(Math.random() * playerNames.length);

  return playerNames.map((name, i) => {
    const role = i === kiraIndex ? 'Kira' : roles[Math.floor(Math.random() * roles.length)];
    return {
      playerName: name,
      role,
      tasks: getRandomTasks(role),
      coordinates: { lat: 0, long: 0 }, // initial dummy coords, replace/live-update as needed
    };
  });
}

export default function Lobby() {
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState(null);

  // Simulate some player names for demo 
  const players = useRef([
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Eve',
  ]);

  useEffect(() => {
    // Simulate backend data creation delay
    const timer = setTimeout(() => {
      const playerData = generatePlayerData(players.current);
      const newGameData = {
        timestamp: new Date().toISOString(),
        playerCount: playerData.length,
        playerData,
      };
      setGameData(newGameData);
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading || !gameData) {
    return (
      <div style={styles.loadingContainer}>
        <h2 style={{ fontSize: 28, marginBottom: 10 }}>Sit Tight</h2>
        <p style={{ fontSize: 20, color: '#aaa' }}>The Lobby Is Under Creation</p>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={styles.lobbyContainer}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>Lobby</h1>
      <p style={{ marginBottom: 8 }}>
        <strong>Player Count:</strong> {gameData.playerCount}
      </p>

      <table style={styles.playerTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Tasks</th>
            <th>Coordinates</th>
          </tr>
        </thead>
        <tbody>
          {gameData.playerData.map(({ playerName, role, tasks, coordinates }, i) => (
            <tr key={i}>
              <td>{playerName}</td>
              <td>{role}</td>
              <td>{tasks.join(', ')}</td>
              <td>{`${coordinates.lat}, ${coordinates.long}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <>
      <div
        style={{
          width: 56,
          height: 56,
          border: '6px solid #4fa1f2',
          borderTop: '6px solid #293e6a',
          borderRadius: '50%',
          animation: 'spin 1.1s linear infinite',
          marginTop: 25,
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    background: '#10151a',
    color: '#eee',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lobbyContainer: {
    minHeight: '100vh',
    background: '#10151a',
    color: '#eee',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    padding: 24,
  },
  playerTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 18,
  },
  playerTableThTd: {
    borderBottom: '1px solid #444',
    padding: '12px 8px',
  },
};
