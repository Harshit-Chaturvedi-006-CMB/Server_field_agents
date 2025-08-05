'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000'; // use your server URL in production

export default function Joinlobby() {
  const [inputLobbyCode, setInputLobbyCode] = useState('');
  const [joinedLobbyCode, setJoinedLobbyCode] = useState('');
  const [players, setPlayers] = useState([]);

  const username = typeof window !== 'undefined'
    ? (localStorage.getItem('fieldAgentsUser') || 'Agent')
    : 'Agent';

  useEffect(() => {
    let socket;
    if (joinedLobbyCode) {
      socket = io(SOCKET_URL, { transports: ['websocket'] });
      socket.on('connect', () => {
        socket.emit('joinLobby', {
          lobbyCode: joinedLobbyCode,
          player: { name: username },
        });
      });

      socket.on('lobbyUpdate', (lobby) => {
        setPlayers(lobby.players || []);
      });

      // Clean up on unmount
      return () => {
        socket.emit('leaveLobby', { lobbyCode: joinedLobbyCode, playerId: username });
        socket.disconnect();
      };
    }
  }, [joinedLobbyCode, username]);

  const handleJoin = () => {
    if (!/^[A-Z0-9]{6}$/.test(inputLobbyCode)) {
      alert('Please enter a valid 6-character lobby code.');
      return;
    }
    setJoinedLobbyCode(inputLobbyCode.toUpperCase());
  };

  if (joinedLobbyCode) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1>Lobby</h1>
          <div style={styles.playerCount}>{players.length} / 10</div>
        </header>
        <div style={styles.lobbyCodeContainer}>
          <span style={styles.lobbyCodeLabel}>Lobby Code:</span>
          <span style={styles.lobbyCode}>{joinedLobbyCode}</span>
        </div>
        <div style={styles.infoBox}>
          <div style={{ marginBottom: 20 }}>Players in Lobby:</div>
          <ul style={styles.playerList}>
            {players.map((p, i) => (
              <li key={i} style={styles.playerItem}>{(JSON.parse(p.name).username)}</li>
            ))}
          </ul>
        </div>
        <button
          style={styles.leaveButton}
          onClick={() => {
            setJoinedLobbyCode('');
            setPlayers([]);
          }}
        >
          Leave Lobby
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Join a Lobby</h1>
      <input
        type="text"
        value={inputLobbyCode}
        onChange={e => setInputLobbyCode(e.target.value.toUpperCase())}
        placeholder="Enter Lobby Code"
        maxLength={6}
        style={styles.input}
      />
      <button onClick={handleJoin} style={styles.joinButton}>
        Join Lobby
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '30px 20px',
    backgroundColor: '#10151a',
    color: '#eee',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  lobbyCode: {
    fontWeight: 'bold',
    fontSize: 26,
    letterSpacing: 6,
    backgroundColor: '#2a3042',
    padding: '12px 24px',
    borderRadius: 10,
    userSelect: 'all',
    fontFamily: "'Courier New', Courier, monospace",
  },
  input: {
    fontSize: 24,
    padding: '10px 18px',
    marginTop: 24,
    marginBottom: 16,
    width: 260,
    borderRadius: 8,
    border: '1px solid #556677',
    backgroundColor: '#1a202c',
    color: '#eee',
    textTransform: 'uppercase',
    letterSpacing: 5,
    outline: 'none',
  },
  joinButton: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: '12px 48px',
    borderRadius: 28,
    backgroundColor: '#56CCF2',
    color: '#10151a',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  leaveButton: {
    fontSize: 18,
    padding: '10px 36px',
    borderRadius: 28,
    backgroundColor: '#e05f5f',
    border: 'none',
    cursor: 'pointer',
    marginTop: 24,
    color: 'white',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 12,
    fontWeight: '600',
  },
};
