'use client';

import { useEffect, useState } from 'react';

export default function TaskTab({ socket, playerId }) {
  const [role, setRole] = useState(null);
  const [task, setTask] = useState(null);
  const [activeTab, setActiveTab] = useState('role'); // 'role' | 'task'

  useEffect(() => {
    if (!socket) return;

    const handleRevealRoles = ({ roles }) => {
      // roles is assumed to be an array of player role/task objects
      const me = roles.find(r => r.id === playerId);
      if (me) {
        setRole(me.role || 'Agent'); // fallback to 'Agent' if no role
        setTask(me.task || 'No task assigned');
      }
    };

    socket.on('revealRoles', handleRevealRoles);

    // Cleanup listener on unmount
    return () => {
      socket.off('revealRoles', handleRevealRoles);
    };
  }, [socket, playerId]);

  if (!role && !task) {
    // Show a waiting message until data received
    return (
      <div style={styles.loading}>
        Waiting for role and task assignment...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tabHeader}>
        <button
          style={activeTab === 'role' ? styles.activeTabButton : styles.tabButton}
          onClick={() => setActiveTab('role')}
        >
          Role
        </button>
        <button
          style={activeTab === 'task' ? styles.activeTabButton : styles.tabButton}
          onClick={() => setActiveTab('task')}
        >
          Task
        </button>
      </div>

      <div style={styles.tabContent}>
        {activeTab === 'role' && <div style={styles.text}>{role}</div>}
        {activeTab === 'task' && <div style={styles.text}>{task}</div>}
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    backgroundColor: '#1a2330',
    borderRadius: 12,
    padding: '16px 24px',
    width: 320,
    userSelect: 'none',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#eee',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  },
  tabHeader: {
    display: 'flex',
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#23293a',
    border: 'none',
    borderRadius: 8,
    padding: '10px 0',
    color: '#7ecfff',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  activeTabButton: {
    flex: 1,
    backgroundColor: '#56ccf2',
    border: 'none',
    borderRadius: 8,
    padding: '10px 0',
    color: '#10151a',
    fontWeight: '700',
    cursor: 'default',
  },
  tabContent: {
    minHeight: 60,
  },
  text: {
    fontSize: 18,
    lineHeight: 1.4,
  },
  loading: {
    color: '#7a8bb1',
    fontStyle: 'italic',
    padding: '12px',
    textAlign: 'center',
  },
};
