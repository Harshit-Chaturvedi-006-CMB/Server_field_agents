// socket-server.js
const { Server } = require('socket.io');
const io = new Server(4000, { cors: { origin: "*" } }); // Adjust origin for production

const lobbies = {}; // lobbyCode -> { players: [...] }
const lobbyMessages = {}; // lobbyCode -> [messages]
let revealCount = {}; // lobbyCode -> number of reveals done

io.on('connection', (socket) => {
  // Create Lobby
  socket.on('createLobby', ({ lobbyCode, player }) => {
    if (!lobbies[lobbyCode]) {
      lobbies[lobbyCode] = { players: [] };
    }
    if (!lobbies[lobbyCode].players.some(p => p.id === player.id)) {
      // Assign default role if missing
      if (!player.role) player.role = 'Agent';
      lobbies[lobbyCode].players.push(player);
    }
    socket.join(lobbyCode);
    io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
  });

  // Join Lobby
  socket.on('joinLobby', ({ lobbyCode, player }) => {
    if (!lobbies[lobbyCode]) {
      lobbies[lobbyCode] = { players: [] };
    }
    if (!lobbies[lobbyCode].players.some(p => p.id === player.id)) {
      if (!player.role) player.role = 'Agent';
      lobbies[lobbyCode].players.push(player);
    }
    socket.join(lobbyCode);
    io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
  });

  // Leave Lobby
  socket.on('leaveLobby', ({ lobbyCode, playerId }) => {
    if (lobbies[lobbyCode]) {
      lobbies[lobbyCode].players = lobbies[lobbyCode].players.filter(p => p.id !== playerId);
      io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
    }
    socket.leave(lobbyCode);
  });

  // Player Movement
  socket.on('playerMove', ({ lobbyCode, player, coordinates }) => {
    const lobby = lobbies[lobbyCode];
    if (lobby) {
      const idx = lobby.players.findIndex(p => p.id === player.id);
      if (idx !== -1) {
        lobby.players[idx].coordinates = coordinates;

        io.to(lobbyCode).emit('playerMoved', {
          player: lobby.players[idx],
          coordinates
        });

        io.to(lobbyCode).emit('lobbyUpdate', lobby);

        console.log(
          lobby.players.map(p => ({
            id: p.id,
            name: p.name,
            coordinates: p.coordinates
          }))
        );
      }
    }
  });

 socket.on('startGame', ({ lobbyCode }) => {
  const lobby = lobbies[lobbyCode];
  if (lobby) {
    // --- Assign roles and tasks (can be random or by logic) ---
    const roles = ['Leader', 'Agent', 'Spy', 'Medic']; // Example roles
    const tasks = ['Find the code', 'Secure the vault', 'Intercept the spy', 'Heal a teammate'];
    assignRolesAndTasks(lobbyCode);

    // Shuffle roles/tasks or assign however you want
    lobby.players.forEach((p, i) => {
      p.role = roles[i % roles.length];
      p.task = tasks[i % tasks.length];
    });

    // --- Emit roles and tasks to all in the lobby ---
    io.to(lobbyCode).emit('revealRoles', {
      roles: lobby.players.map(p => ({
        id: p.id,
        role: p.role,
        task: p.task
      })),
    });

    // Proceed as before to go to game after reveal
    setTimeout(() => {
      io.to(lobbyCode).emit('goToGame');
    }, 3000);
  }
});

  // Reveal Done: Track reveal progress & notify when all done
  socket.on('revealDone', ({ lobbyCode }) => {
    revealCount[lobbyCode] = (revealCount[lobbyCode] || 0) + 1;
    const lobby = lobbies[lobbyCode];
    if (lobby && revealCount[lobbyCode] === lobby.players.length) {
      io.to(lobbyCode).emit('goToGame');
      revealCount[lobbyCode] = 0; // reset count
    }
  });

  // Example: assign roles and tasks to all players
function assignRolesAndTasks(lobbyCode) {
  // 1. Make sure lobby exists:
  const lobby = lobbies[lobbyCode];
  if (!lobby) return;
  
  // 2. Do the assignment (this is a basic mock, replace with your logic):
  const roles = lobby.players.map((player, idx) => ({
    id: player.id,
    name: player.name,
    role: idx === 0 ? "Spy" : "Agent",
    task: idx === 0 ? "Steal files" : "Protect the room"
  }));

  // 3. Send 'revealRoles' event to all in the room:
  io.to(lobbyCode).emit('revealRoles', { roles });
}


  // Chat: Receive and broadcast messages, save per lobby
  socket.on('chatMessage', (msg) => {
    if (!msg.lobbyCode) return;
    lobbyMessages[msg.lobbyCode] = (lobbyMessages[msg.lobbyCode] || []).concat([{
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp || Date.now(),
    }]);
    io.to(msg.lobbyCode).emit('chatMessage', msg);
  });

  // Serve Previous Messages on Request
  socket.on('getPreviousMessages', ({ lobbyCode }) => {
    socket.emit('previousMessages', lobbyMessages[lobbyCode] || []);
  });
});
