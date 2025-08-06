'use client';

import { useEffect, useState } from 'react';

export default function PlayerList({ socket }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleLobbyUpdate = (lobby) => {
      // lobby.players is expected to be an array of player objects
      setPlayers(lobby.players || []);
    };

    socket.on('lobbyUpdate', handleLobbyUpdate);

    return () => {
      socket.off('lobbyUpdate', handleLobbyUpdate);
    };
  }, [socket]);

  return (
    <div style={styles.container}>
      <h3>Players in Lobby:</h3>
      <ul style={styles.list}>
        {players.map((player) => (
          <li key={player.id} style={styles.playerItem}>
            {player.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#131b2b',
    borderRadius: 12,
    padding: 20,
    maxWidth: 300,
    color: '#eee',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  list: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    maxHeight: 200,
    overflowY: 'auto',
  },
  playerItem: {
    padding: '8px 12px',
    borderBottom: '1px solid #21304b',
    fontSize: 16,
    fontWeight: 500,
    color: '#90caf9',
  },
};
