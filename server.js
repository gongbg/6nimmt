import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  GameState,
  prepareRound,
  cloneCard,
  findPlacementRowIndex,
} from "./js/gameLogic.js";

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
const MAX_CHAT_MESSAGES = 30;
const TURN_STEP_DELAY_MS = 900;
const AI_PLACEMENT_DELAY_MS = 1500;
const RECONNECT_GRACE_MS = 5 * 60 * 1000;
const AVATAR_SKIN_COLORS = [
  "#ffb59f",
  "#f4c27b",
  "#8fd3ff",
  "#b8f18a",
  "#ffd166",
  "#f6a6ff",
];
const AVATAR_EYE_TYPES = ["dot", "smile", "sleepy", "spark"];
const AVATAR_MOUTH_TYPES = ["smile", "grin", "o", "flat"];
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

function createDefaultAvatar(seedValue) {
  const seed = Math.abs(Number(seedValue) || 0);

  return {
    skinColor: AVATAR_SKIN_COLORS[seed % AVATAR_SKIN_COLORS.length],
    eyeType: AVATAR_EYE_TYPES[seed % AVATAR_EYE_TYPES.length],
    mouthType: AVATAR_MOUTH_TYPES[seed % AVATAR_MOUTH_TYPES.length],
  };
}

function normalizeAvatarInput(avatar, fallbackSeed) {
  const fallbackAvatar = createDefaultAvatar(fallbackSeed);

  if (!avatar || typeof avatar !== "object") {
    return fallbackAvatar;
  }

  const skinColor = AVATAR_SKIN_COLORS.includes(avatar.skinColor)
    ? avatar.skinColor
    : fallbackAvatar.skinColor;
  const eyeType = AVATAR_EYE_TYPES.includes(avatar.eyeType)
    ? avatar.eyeType
    : fallbackAvatar.eyeType;
  const mouthType = AVATAR_MOUTH_TYPES.includes(avatar.mouthType)
    ? avatar.mouthType
    : fallbackAvatar.mouthType;

  return {
    skinColor,
    eyeType,
    mouthType,
  };
}

function createPlayer({ socketId = null, nickname, isBot = false }) {
  const id = isBot ? `bot-${nextPlayerId}` : `player-${nextPlayerId}`;
  const avatarSeed = nextPlayerId;
  nextPlayerId += 1;

  return {
    id,
    socketId,
    nickname,
    isBot,
    avatar: isBot ? null : normalizeAvatarInput(null, avatarSeed),
    disconnectTimerId: null,
  };
}

function createRoom({ ownerPlayer, mode }) {
  const code = createRoomCode();
  const room = {
    code,
    mode,
    hostPlayerId: ownerPlayer.id,
    players: [ownerPlayer],
    chatMessages: [],
    gameState: null,
    resolutionTimerId: null,
    manualChoice: null,
  };

  rooms[code] = room;
  return room;
}

function getRoomPlayersForState(room) {
  return room.players.map((player) => ({
    id: player.id,
    nickname: player.nickname,
    isBot: player.isBot,
    avatar: player.avatar ? { ...player.avatar } : null,
    connected: Boolean(player.isBot || player.socketId),
  }));
}

function buildRoomSummary(room) {
  const chatMessages = Array.isArray(room.chatMessages) ? room.chatMessages : [];

  return {
    roomCode: room.code,
    mode: room.mode,
    hostPlayerId: room.hostPlayerId,
    playerCount: room.players.length,
    players: getRoomPlayersForState(room),
    chatMessages: chatMessages.map((message) => ({ ...message })),
    hasGameStarted: Boolean(room.gameState),
  };
}

function appendChatMessage(room, { playerId, nickname, message, isSystem = false }) {
  const normalizedMessage = String(message || "").trim();

  if (!normalizedMessage) {
    return null;
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    playerId: playerId ?? "system",
    nickname: nickname ?? "System",
    message: normalizedMessage.slice(0, 160),
    isSystem,
    createdAt: Date.now(),
  };

  const currentMessages = Array.isArray(room.chatMessages) ? room.chatMessages : [];
  room.chatMessages = [...currentMessages, entry].slice(-MAX_CHAT_MESSAGES);
  return entry;
}

function sumPenalty(cards) {
  return cards.reduce((total, card) => total + card.penalty, 0);
}

function createHiddenCard() {
  return {
    number: null,
    penalty: null,
    hidden: true,
  };
}

function chooseLowestPenaltyRowId(rows) {
  let selectedRowId = rows[0]?.id ?? null;
  let minimumPenalty = Number.POSITIVE_INFINITY;

  for (const row of rows) {
    const rowPenalty = sumPenalty(row.cards);

    if (rowPenalty < minimumPenalty) {
      minimumPenalty = rowPenalty;
      selectedRowId = row.id;
    }
  }

  return selectedRowId;
}

function isAiMode(room) {
  return ["ai", "bot", "singleplayer"].includes(String(room.mode || "").toLowerCase());
}

function getCurrentPendingStep(room) {
  const pendingResolution = room.gameState?.round?.pendingResolution;

  if (!pendingResolution) {
    return null;
  }

  return pendingResolution.steps[pendingResolution.currentStepIndex] ?? null;
}

function stepRequiresManualChoice(step) {
  return Boolean(step);
}

function buildSubmissionStatus(room) {
  if (!room.gameState) {
    return room.players.map((player) => ({
      playerId: player.id,
      nickname: player.nickname,
      isBot: player.isBot,
      submitted: false,
      waitingForPlacement: false,
    }));
  }

  return room.players.map((player) => ({
    playerId: player.id,
    nickname: player.nickname,
    isBot: player.isBot,
    submitted: Boolean(room.gameState.round.selectedCardsByPlayer[player.id]),
    waitingForPlacement: room.manualChoice?.playerId === player.id,
  }));
}

function buildManualChoiceState(room, viewerPlayerId) {
  if (!room.manualChoice) {
    return null;
  }

  const isChooser = room.manualChoice.playerId === viewerPlayerId;

  return {
    playerId: room.manualChoice.playerId,
    nickname: room.manualChoice.nickname,
    card: isChooser ? cloneCard(room.manualChoice.card) : createHiddenCard(),
    allowedRowIds: isChooser ? [...room.manualChoice.allowedRowIds] : [],
    recommendedRowId: isChooser ? room.manualChoice.recommendedRowId : null,
    reason: room.manualChoice.reason,
    prompt: room.manualChoice.prompt,
    isChooser,
  };
}

function createManualChoice(room, step) {
  const player = room.gameState.getPlayer(step.playerId);
  const recommendedRowIndex = findPlacementRowIndex(room.gameState.rows, step.card);

  return {
    playerId: step.playerId,
    nickname: player?.nickname ?? step.playerId,
    card: cloneCard(step.card),
    allowedRowIds:
      recommendedRowIndex === -1
        ? room.gameState.rows.map((row) => row.id)
        : [room.gameState.rows[recommendedRowIndex].id],
    recommendedRowId:
      recommendedRowIndex >= 0 ? room.gameState.rows[recommendedRowIndex].id : null,
    reason: recommendedRowIndex >= 0 ? "manual-placement" : "small-card-choice",
    prompt: "카드를 배치할 행을 선택하세요.",
  };
}

function chooseAiRowId(room, step) {
  const recommendedRowIndex = findPlacementRowIndex(room.gameState.rows, step.card);

  if (recommendedRowIndex >= 0) {
    return room.gameState.rows[recommendedRowIndex].id;
  }

  return chooseLowestPenaltyRowId(room.gameState.rows);
}

function applyRowChoice(room, step, targetRowId) {
  const targetRow = room.gameState.rows.find((row) => row.id === Number(targetRowId));

  if (!targetRow) {
    throw new Error("Selected row was not found.");
  }

  step.rowId = targetRow.id;

  const hasNoNaturalPlacement =
    findPlacementRowIndex(room.gameState.rows, step.card) === -1;
  const targetRowIsFull = targetRow.cards.length >= 5;

  if (hasNoNaturalPlacement) {
    step.takenCards = targetRow.cards.map(cloneCard);
    step.penaltyPointsGained = sumPenalty(step.takenCards);
    step.placement = "replaced-smallest";
    return;
  }

  if (targetRowIsFull) {
    step.takenCards = targetRow.cards.map(cloneCard);
    step.penaltyPointsGained = sumPenalty(step.takenCards);
    step.placement = "captured-full-row";
    return;
  }

  step.takenCards = [];
  step.penaltyPointsGained = 0;
  step.placement = "placed";
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
  state.round.selectedCardsByPlayer = Object.fromEntries(
    Object.entries(state.round.selectedCardsByPlayer).map(([playerId, card]) => [
      playerId,
      cloneCard(card),
    ])
  );

  if (state.round.pendingResolution) {
    const { currentStepIndex } = state.round.pendingResolution;

    state.round.pendingResolution.revealedCards = state.round.pendingResolution.revealedCards.map(
      (entry, index) => ({
        playerId: entry.playerId,
        card:
          entry.playerId === viewerPlayerId || index < currentStepIndex
            ? cloneCard(entry.card)
            : createHiddenCard(),
      })
    );
    state.round.pendingResolution.orderedCards = state.round.pendingResolution.orderedCards.map(
      (entry, index) => ({
        playerId: entry.playerId,
        card:
          entry.playerId === viewerPlayerId || index < currentStepIndex
            ? cloneCard(entry.card)
            : createHiddenCard(),
      })
    );
    state.round.pendingResolution.steps = state.round.pendingResolution.steps.map((step, index) => ({
      ...step,
      card:
        step.playerId === viewerPlayerId || index < currentStepIndex
          ? cloneCard(step.card)
          : createHiddenCard(),
      rowId: index < currentStepIndex ? step.rowId : null,
      takenCards: index < currentStepIndex ? step.takenCards : [],
      penaltyPointsGained: index < currentStepIndex ? step.penaltyPointsGained : 0,
      placement: index < currentStepIndex ? step.placement : "pending",
    }));
  }

  state.submissionStatus = buildSubmissionStatus(room);
  state.manualChoice = buildManualChoiceState(room, viewerPlayerId);

  return state;
}

function emitRoomSummary(room) {
  io.to(room.code).emit("roomUpdated", buildRoomSummary(room));
}

function emitSubmissionStatus(room) {
  io.to(room.code).emit("submissionStatusUpdated", {
    roomCode: room.code,
    statuses: buildSubmissionStatus(room),
  });
}

function emitChatMessages(room) {
  io.to(room.code).emit("chatUpdated", {
    roomCode: room.code,
    messages: (Array.isArray(room.chatMessages) ? room.chatMessages : []).map((message) => ({
      ...message,
    })),
  });
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

  emitSubmissionStatus(room);
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
      avatar: player.avatar ? { ...player.avatar } : null,
    })),
  });
  prepareRound(room.gameState, 1);
  room.manualChoice = null;
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

  if (room.manualChoice?.playerId === removedPlayer.id) {
    room.manualChoice = null;
  }

  return removedPlayer;
}

function removePlayerById(room, playerId) {
  const playerIndex = room.players.findIndex((player) => player.id === playerId);

  if (playerIndex === -1) {
    return null;
  }

  const [removedPlayer] = room.players.splice(playerIndex, 1);

  if (removedPlayer.disconnectTimerId) {
    clearTimeout(removedPlayer.disconnectTimerId);
    removedPlayer.disconnectTimerId = null;
  }

  if (room.gameState) {
    room.gameState.removePlayer(removedPlayer.id);
  }

  if (room.hostPlayerId === removedPlayer.id && room.players.length > 0) {
    room.hostPlayerId = room.players[0].id;
  }

  if (room.manualChoice?.playerId === removedPlayer.id) {
    room.manualChoice = null;
  }

  return removedPlayer;
}

function scheduleDisconnectedPlayerRemoval(room, playerId) {
  const player = room.players.find((currentPlayer) => currentPlayer.id === playerId);

  if (!player || player.isBot) {
    return;
  }

  if (player.disconnectTimerId) {
    clearTimeout(player.disconnectTimerId);
  }

  player.disconnectTimerId = setTimeout(() => {
    player.disconnectTimerId = null;
    removePlayerById(room, playerId);
    emitRoomSummary(room);
    emitStateToRoom(room);
    maybeDeleteRoom(room.code);
  }, RECONNECT_GRACE_MS);
}

function syncPlayerAvatar(room, playerId, avatar) {
  const roomPlayer = room.players.find((player) => player.id === playerId);

  if (roomPlayer) {
    roomPlayer.avatar = { ...avatar };
  }

  const statePlayer = room.gameState?.getPlayer(playerId);

  if (statePlayer) {
    statePlayer.avatar = { ...avatar };
  }
}

function queueNextResolutionStep(room) {
  if (!room.gameState || !room.gameState.round.pendingResolution) {
    room.resolutionTimerId = null;
    room.manualChoice = null;
    emitStateToRoom(room);
    return;
  }

  const currentStep = getCurrentPendingStep(room);
  room.resolutionTimerId = null;

  if (!stepRequiresManualChoice(currentStep)) {
    room.manualChoice = null;
    emitStateToRoom(room);
    return;
  }

  const currentPlayer = room.gameState.getPlayer(currentStep.playerId);

  if (isAiMode(room) && currentPlayer?.isBot) {
    room.manualChoice = null;
    emitStateToRoom(room);
    room.resolutionTimerId = setTimeout(() => {
      try {
        const botStep = getCurrentPendingStep(room);

        if (!botStep) {
          room.resolutionTimerId = null;
          emitStateToRoom(room);
          return;
        }

        applyRowChoice(room, botStep, chooseAiRowId(room, botStep));
        room.gameState.resolveNextPendingCard();
        room.resolutionTimerId = null;
        emitStateToRoom(room);
        queueNextResolutionStep(room);
      } catch (error) {
        room.resolutionTimerId = null;
        console.error("AI placement failed:", error);
        emitStateToRoom(room);
      }
    }, AI_PLACEMENT_DELAY_MS);
    return;
  }

  room.manualChoice = createManualChoice(room, currentStep);
  emitStateToRoom(room);
}

function startResolutionIfReady(room) {
  if (!room.gameState || !room.gameState.round.pendingResolution) {
    return;
  }

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

  socket.on("resumeSession", ({ roomCode, playerId } = {}, callback = () => {}) => {
    try {
      const normalizedRoomCode = String(roomCode || "").trim().toUpperCase();
      const normalizedPlayerId = String(playerId || "").trim();
      const room = rooms[normalizedRoomCode];

      if (!room) {
        throw new Error("Room not found.");
      }

      const player = room.players.find((currentPlayer) => currentPlayer.id === normalizedPlayerId);

      if (!player) {
        throw new Error("Player session not found.");
      }

      if (player.disconnectTimerId) {
        clearTimeout(player.disconnectTimerId);
        player.disconnectTimerId = null;
      }

      player.socketId = socket.id;
      socket.join(room.code);

      emitRoomSummary(room);
      emitStateToRoom(room);
      callback({
        ok: true,
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

  socket.on("updateAvatar", ({ roomCode, avatar } = {}, callback = () => {}) => {
    try {
      const normalizedRoomCode = String(roomCode || "").trim().toUpperCase();
      const room = rooms[normalizedRoomCode];

      if (!room) {
        throw new Error("Room not found.");
      }

      if (isAiMode(room)) {
        throw new Error("Avatar editing is only available in multiplayer mode.");
      }

      const player = room.players.find((currentPlayer) => currentPlayer.socketId === socket.id);

      if (!player) {
        throw new Error("You are not a member of this room.");
      }

      if (player.isBot) {
        throw new Error("Bots cannot edit avatars.");
      }

      const normalizedAvatar = normalizeAvatarInput(avatar, player.id.length);
      syncPlayerAvatar(room, player.id, normalizedAvatar);

      emitRoomSummary(room);
      emitStateToRoom(room);
      callback({
        ok: true,
        avatar: normalizedAvatar,
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

      if (turnResult.readyToResolve) {
        startResolutionIfReady(room);
      } else {
        emitStateToRoom(room);
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

  socket.on("sendChatMessage", ({ roomCode, message } = {}, callback = () => {}) => {
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

      const appendedMessage = appendChatMessage(room, {
        playerId: player.id,
        nickname: player.nickname,
        message,
        isSystem: false,
      });

      if (!appendedMessage) {
        throw new Error("Message is empty.");
      }

      emitRoomSummary(room);
      emitChatMessages(room);
      callback({ ok: true, message: appendedMessage });
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

      room.manualChoice = null;
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

  socket.on("leaveRoom", ({ roomCode } = {}, callback = () => {}) => {
    try {
      const normalizedRoomCode = String(roomCode || "").trim().toUpperCase();
      const room = rooms[normalizedRoomCode];

      if (!room) {
        callback({ ok: true });
        return;
      }

      const player = room.players.find((currentPlayer) => currentPlayer.socketId === socket.id);

      if (!player) {
        callback({ ok: true });
        return;
      }

      removePlayerById(room, player.id);
      socket.leave(room.code);
      emitRoomSummary(room);
      emitStateToRoom(room);
      maybeDeleteRoom(room.code);
      callback({ ok: true });
    } catch (error) {
      callback({
        ok: false,
        error: error.message,
      });
    }
  });

  socket.on("chooseRow", ({ roomCode, rowId } = {}, callback = () => {}) => {
    try {
      const normalizedRoomCode = String(roomCode || "").trim().toUpperCase();
      const room = rooms[normalizedRoomCode];

      if (!room || !room.gameState) {
        throw new Error("Active game room not found.");
      }

      if (!room.manualChoice) {
        throw new Error("There is no row choice pending.");
      }

      const player = room.players.find((currentPlayer) => currentPlayer.socketId === socket.id);

      if (!player) {
        throw new Error("You are not a member of this room.");
      }

      if (player.id !== room.manualChoice.playerId) {
        throw new Error("It is not your turn to choose a row.");
      }

      const currentStep = getCurrentPendingStep(room);

      if (!stepRequiresManualChoice(currentStep)) {
        throw new Error("The current card does not require a manual row choice.");
      }

      const selectedRowId = Number(rowId);
      const allowedRowIds = room.manualChoice.allowedRowIds ?? [];

      if (!allowedRowIds.includes(selectedRowId)) {
        socket.emit("placementWarning", {
          message: "그곳에는 놓을 수 없습니다!",
          roomCode: room.code,
        });
        callback({
          ok: false,
          error: "That row is not valid for this card.",
        });
        return;
      }

      applyRowChoice(room, currentStep, selectedRowId);
      room.manualChoice = null;

      const stepResult = room.gameState.resolveNextPendingCard();
      emitStateToRoom(room);
      queueNextResolutionStep(room);

      callback({
        ok: true,
        finishedTurn: stepResult.finishedTurn,
        roundEnded: stepResult.roundEnded,
      });
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

    const disconnectedPlayer = room.players.find((player) => player.socketId === socket.id);

    if (!disconnectedPlayer) {
      return;
    }

    disconnectedPlayer.socketId = null;
    scheduleDisconnectedPlayerRemoval(room, disconnectedPlayer.id);
    emitRoomSummary(room);
    emitStateToRoom(room);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Six Bugs server listening on http://localhost:${PORT}`);
});
