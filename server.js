import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { GameState, prepareRound, cloneCard } from "./js/gameLogic.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = Number(process.env.PORT) || 3000;
const MAX_PLAYERS_PER_ROOM = 4;
const TURN_STEP_DELAY_MS = 900;
const rooms = {};
let nextPlayerId = 1;

app.use(cors());
app.use(express.json());
app.use(express.static(process.cwd()));

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    roomCount: Object.keys(rooms).length,
  });
});

function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  do {
    code = "";

    for (let index = 0; index < 6; index += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  } while (rooms[code]);

  return code;
}

function createPlayer({ socketId = null, nickname, isBot = false }) {
  const id = isBot ? `bot-${nextPlayerId}` : `player-${nextPlayerId}`;
  nextPlayerId += 1;

  return {
    id,
    socketId,
    nickname,
    isBot,
  };
}

function createRoom({ ownerPlayer, mode }) {
  const code = createRoomCode();
  const room = {
    code,
    mode,
    hostPlayerId: ownerPlayer.id,
    players: [ownerPlayer],
    gameState: null,
    resolutionTimerId: null,
  };

  rooms[code] = room;
  return room;
}

function getRoomPlayersForState(room) {
  return room.players.map((player) => ({
    id: player.id,
    nickname: player.nickname,
    isBot: player.isBot,
  }));
}

function buildRoomSummary(room) {
  return {
    roomCode: room.code,
    mode: room.mode,
    hostPlayerId: room.hostPlayerId,
    playerCount: room.players.length,
    players: getRoomPlayersForState(room),
    hasGameStarted: Boolean(room.gameState),
  };
}

function sanitizeGameStateForPlayer(room, viewerPlayerId) {
  if (!room.gameState) {
    return null;
  }

  const state = room.gameState.toJSON();

  state.players = state.players.map((player) => ({
    ...player,
    hand: player.id === viewerPlayerId ? player.hand.map(cloneCard) : [],
    handCount: room.gameState.getPlayer(player.id)?.hand.length ?? player.hand.length,
  }));

  return state;
}

function emitRoomSummary(room) {
  io.to(room.code).emit("roomUpdated", buildRoomSummary(room));
}

function emitStateToRoom(room) {
  for (const player of room.players) {
    if (!player.socketId) {
      continue;
    }

    io.to(player.socketId).emit("updateState", {
      roomCode: room.code,
      state: sanitizeGameStateForPlayer(room, player.id),
    });
  }
}

function getHumanPlayers(room) {
  return room.players.filter((player) => !player.isBot);
}

function createGameForRoom(room) {
  room.gameState = new GameState({
    roomId: room.code,
    players: room.players.map((player) => ({
      id: player.id,
      nickname: player.nickname,
      isBot: player.isBot,
    })),
  });
  prepareRound(room.gameState, 1);
}

function maybeDeleteRoom(roomCode) {
  const room = rooms[roomCode];

  if (!room) {
    return;
  }

  if (room.players.length === 0) {
    if (room.resolutionTimerId) {
      clearTimeout(room.resolutionTimerId);
    }

    delete rooms[roomCode];
  }
}

function removePlayerFromRoom(room, socketId) {
  const playerIndex = room.players.findIndex((player) => player.socketId === socketId);

  if (playerIndex === -1) {
    return null;
  }

  const [removedPlayer] = room.players.splice(playerIndex, 1);

  if (room.gameState) {
    room.gameState.removePlayer(removedPlayer.id);
  }

  if (room.hostPlayerId === removedPlayer.id && room.players.length > 0) {
    room.hostPlayerId = room.players[0].id;
  }

  return removedPlayer;
}

function queueNextResolutionStep(room) {
  if (!room.gameState || !room.gameState.round.pendingResolution) {
    room.resolutionTimerId = null;
    emitStateToRoom(room);
    return;
  }

  room.resolutionTimerId = setTimeout(() => {
    room.gameState.resolveNextPendingCard();
    emitStateToRoom(room);
    queueNextResolutionStep(room);
  }, TURN_STEP_DELAY_MS);
}

function startResolutionIfReady(room) {
  if (!room.gameState || !room.gameState.round.pendingResolution) {
    return;
  }

  if (room.resolutionTimerId) {
    return;
  }

  emitStateToRoom(room);
  queueNextResolutionStep(room);
}

function findRoomBySocketId(socketId) {
  return Object.values(rooms).find((room) =>
    room.players.some((player) => player.socketId === socketId)
  );
}

io.on("connection", (socket) => {
  socket.on("createRoom", ({ nickname, mode = "multiplayer" } = {}, callback = () => {}) => {
    try {
      if (!nickname || typeof nickname !== "string") {
        throw new Error("nickname is required.");
      }

      const humanPlayer = createPlayer({
        socketId: socket.id,
        nickname: nickname.trim(),
        isBot: false,
      });
      const room = createRoom({
        ownerPlayer: humanPlayer,
        mode,
      });

      socket.join(room.code);

      if (mode === "ai") {
        while (room.players.length < MAX_PLAYERS_PER_ROOM) {
          room.players.push(
            createPlayer({
              nickname: `Bot_${room.players.length}`,
              isBot: true,
            })
          );
        }

        createGameForRoom(room);
      }

      emitRoomSummary(room);
      emitStateToRoom(room);
      callback({
        ok: true,
        roomCode: room.code,
        playerId: humanPlayer.id,
        room: buildRoomSummary(room),
      });
    } catch (error) {
      callback({
        ok: false,
        error: error.message,
      });
    }
  });

  socket.on("joinRoom", ({ roomCode, nickname } = {}, callback = () => {}) => {
    try {
      const normalizedRoomCode = String(roomCode || "").trim().toUpperCase();
      const room = rooms[normalizedRoomCode];

      if (!room) {
        throw new Error("Room not found.");
      }

      if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
        throw new Error("Room is full.");
      }

      if (!nickname || typeof nickname !== "string") {
        throw new Error("nickname is required.");
      }

      const player = createPlayer({
        socketId: socket.id,
        nickname: nickname.trim(),
        isBot: false,
      });

      room.players.push(player);
      socket.join(room.code);

      emitRoomSummary(room);
      emitStateToRoom(room);
      callback({
        ok: true,
        roomCode: room.code,
        playerId: player.id,
        room: buildRoomSummary(room),
      });
    } catch (error) {
      callback({
        ok: false,
        error: error.message,
      });
    }
  });

  socket.on("startGame", ({ roomCode } = {}, callback = () => {}) => {
    try {
      const normalizedRoomCode = String(roomCode || "").trim().toUpperCase();
      const room = rooms[normalizedRoomCode];

      if (!room) {
        throw new Error("Room not found.");
      }

      const player = room.players.find((currentPlayer) => currentPlayer.socketId === socket.id);

      if (!player) {
        throw new Error("You are not a member of this room.");
      }

      if (room.hostPlayerId !== player.id) {
        throw new Error("Only the room host can start the game.");
      }

      if (getHumanPlayers(room).length < 2 && room.mode !== "ai") {
        throw new Error("At least 2 human players are required.");
      }

      if (!room.gameState) {
        createGameForRoom(room);
      }

      emitRoomSummary(room);
      emitStateToRoom(room);
      callback({
        ok: true,
        roomCode: room.code,
      });
    } catch (error) {
      callback({
        ok: false,
        error: error.message,
      });
    }
  });

  socket.on("submitCard", ({ roomCode, cardNumber } = {}, callback = () => {}) => {
    try {
      const normalizedRoomCode = String(roomCode || "").trim().toUpperCase();
      const room = rooms[normalizedRoomCode];

      if (!room || !room.gameState) {
        throw new Error("Active game room not found.");
      }

      const player = room.players.find((currentPlayer) => currentPlayer.socketId === socket.id);

      if (!player) {
        throw new Error("You are not a member of this room.");
      }

      if (player.isBot) {
        throw new Error("Bots cannot submit cards through the client.");
      }

      if (room.resolutionTimerId || room.gameState.round.pendingResolution) {
        throw new Error("Turn resolution is already in progress.");
      }

      const turnResult = room.gameState.playTurn(player.id, Number(cardNumber));

      emitStateToRoom(room);

      if (turnResult.readyToResolve) {
        startResolutionIfReady(room);
      }

      callback({
        ok: true,
        readyToResolve: turnResult.readyToResolve,
      });
    } catch (error) {
      callback({
        ok: false,
        error: error.message,
      });
    }
  });

  socket.on("restartRound", ({ roomCode } = {}, callback = () => {}) => {
    try {
      const normalizedRoomCode = String(roomCode || "").trim().toUpperCase();
      const room = rooms[normalizedRoomCode];

      if (!room || !room.gameState) {
        throw new Error("Active game room not found.");
      }

      const player = room.players.find((currentPlayer) => currentPlayer.socketId === socket.id);

      if (!player) {
        throw new Error("You are not a member of this room.");
      }

      if (room.hostPlayerId !== player.id) {
        throw new Error("Only the room host can restart the round.");
      }

      if (room.resolutionTimerId) {
        clearTimeout(room.resolutionTimerId);
        room.resolutionTimerId = null;
      }

      prepareRound(room.gameState);
      emitStateToRoom(room);
      callback({ ok: true });
    } catch (error) {
      callback({
        ok: false,
        error: error.message,
      });
    }
  });

  socket.on("disconnect", () => {
    const room = findRoomBySocketId(socket.id);

    if (!room) {
      return;
    }

    removePlayerFromRoom(room, socket.id);
    emitRoomSummary(room);
    emitStateToRoom(room);
    maybeDeleteRoom(room.code);
  });
});

httpServer.listen(PORT, () => {
  console.log(`6 Nimmt server listening on http://localhost:${PORT}`);
});
