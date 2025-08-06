const { Server } = require('socket.io');
const io = new Server(4000, { cors: { origin: "*" } }); // This binds to 0.0.0.0 by default


const lobbies = {}; // Map lobbyCode → { players: [...] }
const lobbyMessages = {}; // { lobbyCode: [messages] }


io.on('connection', (socket) => {
  socket.on('createLobby', ({ lobbyCode, player }) => {
    // Initialize lobby if doesn't exist
    if (!lobbies[lobbyCode]) { 
      lobbies[lobbyCode] = { players: [] };
    }
    // Add host player if not already in list
    if (!lobbies[lobbyCode].players.some(p => p.name === player.name)) {
      lobbies[lobbyCode].players.push(player);
    }
    
    socket.join(lobbyCode);
    io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
  });


 socket.on('playerMove', ({ lobbyCode, player, coordinates }) => {
  const lobby = lobbies[lobbyCode];
  if (lobby) {
    const idx = lobby.players.findIndex(p => p.id === player.id);
    if (idx !== -1) {
      lobby.players[idx].coordinates = coordinates;

      // Emit only the moved player's data, if you want per-player logs
      io.to(lobbyCode).emit('playerMoved', {
        player: lobby.players[idx],
        coordinates
      });

      // Optional: or broadcast the whole updated list
      io.to(lobbyCode).emit('lobbyUpdate', lobby);

      // For server debug, log all player coordinates
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
    // Emit roles to reveal
    io.to(lobbyCode).emit('revealRoles', {
      roles: lobby.players.map(p => ({ id: p.id, role: p.role })),
    });

    // After 3 seconds, emit goToGame
    setTimeout(() => {
      io.to(lobbyCode).emit('goToGame');
    }, 3000);
  }
});


// When reveal animation is over on each client, they notify server, server tracks and syncs transition to game
let revealCount = {}; // { lobbyCode: number }
io.on('connection', (socket) => {
  socket.on('revealDone', ({ lobbyCode }) => {
    revealCount[lobbyCode] = (revealCount[lobbyCode] || 0) + 1;
    if (revealCount[lobbyCode] === lobbies[lobbyCode].players.length) {
      // All players finished reveal; let everyone proceed
      io.to(lobbyCode).emit('goToGame');
      revealCount[lobbyCode] = 0; // Reset for next game
    }
  });
});


 socket.on("chatMessage", (msg) => {
    if (!msg.lobbyCode) return;
    // Save to messages array (optional: limit message array length per lobby)
    lobbyMessages[msg.lobbyCode] = (lobbyMessages[msg.lobbyCode] || []).concat([
      {
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp || Date.now()
      }
    ]);
    // Broadcast new message
    io.to(msg.lobbyCode).emit("chatMessage", msg);
  });

  // Serve previous messages on join
  socket.on("getPreviousMessages", ({ lobbyCode }) => {
    socket.emit("previousMessages", lobbyMessages[lobbyCode] || []);
  });


  socket.on('joinLobby', ({ lobbyCode, player }) => {
    if (!lobbies[lobbyCode]) lobbies[lobbyCode] = { players: [] };

    if (!lobbies[lobbyCode].players.some(p => p.name === player.name)) {
      lobbies[lobbyCode].players.push(player);
    }
    
    socket.join(lobbyCode);
    io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
  });

  socket.on('leaveLobby', ({ lobbyCode, playerId }) => {
  if (lobbies[lobbyCode]) {
    lobbies[lobbyCode].players = lobbies[lobbyCode].players.filter(
      p => p.name !== playerId
    );
    io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
  }
  socket.leave(lobbyCode);
});

});
