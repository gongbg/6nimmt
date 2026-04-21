const UI_BOT_PROFILES = [
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMS87wAY--YQmeJI0XvkGKiQC2KFHU6uTv2-L-VmuT_GEYx5buvKQpo9QZTMdDDy5TU0ZKWheM2JKpZfWic0kkknaBnjxCHBlXJ4OX-uqrJ-hDN3aa3IE8Nf9W-ccJ3V-CBa_BN0FBvWhTJeVTt4AwevbVIq2E4le2czSDAc6KRC3tTeqdgDlPyyyimyG-2O0dRhnVIgEgOJrBd2Qi9-DRfw_wqIZ9KZnop49cRaaiokQNsC2_wgIHopH7dbMYflouPzlgaVB0SBk",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBbk7hdAiASLrkJDzPPtIRTs9Ylu908_RFjDnQgaejTt_yd2fGMdaWiSJr1rL6Z2sJlCL1jbrLCy5hm0qkjf6pDscEfItelt3BWzmFvBetv-5oTIOq3oJMorBCpkD9MH89vXayVW-jtmKlazeGW-xRsGXVLwc4ryqb0c6h8ztTXBaMMGyqOoNyqnCjmgN6craEDi77CV-8KvUEX8zMviofh4IvxxX2XiCEJbks_sW95VsoAzO7v7X9u97upGHsoNvZp3yb8EDwSac4",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDwGYLKL4Fs-K1ijfJpTQQ8xu5ffgUFKrofupyKD5hYvDhiHG0G2-kqJC4PUkH1Qa6aiAkvWMo9d4dfyXv1KI9e-54V2mETSfaj7DVtIob2s3B-C03z2SY2p0a7pu3VS3cJh6dUNJy0J4D0xsWzECIfgJHUZL8-UauAEQJQuxB0tNklSlQcb8ba00f3-AionmA1R76dSNoa-nANb_4UarjHtAuigOr51bNvwfX_tMGQcAFh84KFAp10HupQKD_4qn-L-QoDjG0pSEo",
  },
];

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
const DEFAULT_AVATAR = {
  skinColor: AVATAR_SKIN_COLORS[0],
  eyeType: AVATAR_EYE_TYPES[0],
  mouthType: AVATAR_MOUTH_TYPES[0],
};

const BULL_HEAD_SVG = `
  <svg viewBox="0 0 64 64" aria-hidden="true" class="bull-icon" fill="currentColor">
    <path d="M15 12c-5 2-8 7-8 12 0 4 2 7 5 9 2-4 4-7 8-8-1-4-3-8-5-13Zm34 0c-2 5-4 9-5 13 4 1 6 4 8 8 3-2 5-5 5-9 0-5-3-10-8-12Z"></path>
    <path d="M20 28c0-8 5-15 12-15s12 7 12 15c0 4 3 7 3 12 0 8-7 14-15 14S17 48 17 40c0-5 3-8 3-12Zm8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-8 16h8l-4-6-4 6Z"></path>
  </svg>
`;

function createUiElement(tagName, className = "", textContent = "") {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}

function normalizeAvatar(avatar) {
  return {
    skinColor: AVATAR_SKIN_COLORS.includes(avatar?.skinColor)
      ? avatar.skinColor
      : DEFAULT_AVATAR.skinColor,
    eyeType: AVATAR_EYE_TYPES.includes(avatar?.eyeType)
      ? avatar.eyeType
      : DEFAULT_AVATAR.eyeType,
    mouthType: AVATAR_MOUTH_TYPES.includes(avatar?.mouthType)
      ? avatar.mouthType
      : DEFAULT_AVATAR.mouthType,
  };
}

function getAvatarMarkup(avatar) {
  const normalizedAvatar = normalizeAvatar(avatar);
  const eyeMarkupByType = {
    dot: `
      <circle cx="24" cy="28" r="2.8" fill="#17311c"></circle>
      <circle cx="40" cy="28" r="2.8" fill="#17311c"></circle>
    `,
    smile: `
      <path d="M20 29c2.5-3 5-3 8 0" stroke="#17311c" stroke-width="2.5" stroke-linecap="round" fill="none"></path>
      <path d="M36 29c2.5-3 5-3 8 0" stroke="#17311c" stroke-width="2.5" stroke-linecap="round" fill="none"></path>
    `,
    sleepy: `
      <path d="M20 28h8" stroke="#17311c" stroke-width="2.5" stroke-linecap="round"></path>
      <path d="M36 28h8" stroke="#17311c" stroke-width="2.5" stroke-linecap="round"></path>
    `,
    spark: `
      <path d="M24 24l1.2 2.6 2.8.4-2 2 0.5 2.8-2.5-1.4-2.5 1.4.5-2.8-2-2 2.8-.4L24 24Z" fill="#17311c"></path>
      <path d="M40 24l1.2 2.6 2.8.4-2 2 0.5 2.8-2.5-1.4-2.5 1.4.5-2.8-2-2 2.8-.4L40 24Z" fill="#17311c"></path>
    `,
  };
  const mouthMarkupByType = {
    smile: `<path d="M24 41c3 4 13 4 16 0" stroke="#7f260d" stroke-width="3" stroke-linecap="round" fill="none"></path>`,
    grin: `
      <rect x="23" y="38" width="18" height="7" rx="3.5" fill="#fff7f3"></rect>
      <path d="M23 41.5h18" stroke="#7f260d" stroke-width="1.6"></path>
    `,
    o: `<ellipse cx="32" cy="41" rx="4.2" ry="5.2" fill="#7f260d"></ellipse>`,
    flat: `<path d="M25 42h14" stroke="#7f260d" stroke-width="3" stroke-linecap="round"></path>`,
  };

  return `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="avatarBg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${normalizedAvatar.skinColor}"></stop>
          <stop offset="100%" stop-color="rgba(255,255,255,0.92)"></stop>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="20" fill="url(#avatarBg)"></rect>
      <circle cx="32" cy="35" r="18" fill="${normalizedAvatar.skinColor}" opacity="0.95"></circle>
      <path d="M18 23c3-8 10-13 14-13 5 0 12 5 14 13-2-2-5-3-7-3-3 0-4 1-7 1s-4-1-7-1c-2 0-5 1-7 3Z" fill="#17311c" opacity="0.85"></path>
      ${eyeMarkupByType[normalizedAvatar.eyeType]}
      ${mouthMarkupByType[normalizedAvatar.mouthType]}
    </svg>
  `;
}

function createAvatarElement(avatar, options = {}) {
  const { sizeClass = "h-10 w-10", editable = false } = options;
  const wrapper = createUiElement(
    "div",
    ["avatar-shell", sizeClass, editable ? "avatar-editable" : ""].filter(Boolean).join(" ")
  );
  wrapper.innerHTML = getAvatarMarkup(avatar);
  return wrapper;
}

function createBotAvatarElement(index, sizeClass = "h-10 w-10") {
  const wrapper = createUiElement("div", `avatar-shell ${sizeClass}`);
  const img = document.createElement("img");
  img.alt = "Bot avatar";
  img.className = "h-full w-full object-cover";
  img.src = UI_BOT_PROFILES[index % UI_BOT_PROFILES.length].avatar;
  wrapper.appendChild(img);
  return wrapper;
}

function createBullIcon(className = "") {
  const wrapper = createUiElement(
    "span",
    `inline-flex items-center justify-center ${className}`.trim()
  );
  wrapper.innerHTML = BULL_HEAD_SVG;
  return wrapper;
}

function getPenaltyColorClass(penalty) {
  if (penalty >= 5) {
    return "text-error";
  }

  if (penalty >= 3) {
    return "text-tertiary-container";
  }

  if (penalty === 2) {
    return "text-tertiary";
  }

  return "text-secondary";
}

function createBullIcons(penalty, sizeClass) {
  const wrapper = createUiElement("div", `flex gap-0.5 ${getPenaltyColorClass(penalty)}`);

  for (let count = 0; count < penalty; count += 1) {
    wrapper.appendChild(createBullIcon(sizeClass));
  }

  return wrapper;
}

function createTableCard(card, rotateClass = "") {
  const cardElement = createUiElement(
    "div",
    [
      "table-card",
      "w-11 h-14 sm:w-12 sm:h-16 lg:w-[4.5rem] lg:h-24 rounded-xl",
      "bg-gradient-to-b from-surface-bright to-surface-container-highest",
      "border border-outline-variant/15 flex flex-col justify-between items-center py-1",
      "shadow-[0_8px_32px_-4px_rgba(204,235,201,0.08)]",
      rotateClass,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const topIcons = createBullIcons(card.penalty, "text-[10px]");
  const bottomIcons = createBullIcons(card.penalty, "text-[10px]");
  bottomIcons.classList.add("rotate-180");

  cardElement.append(
    topIcons,
    createUiElement(
      "span",
      "font-headline font-bold text-lg lg:text-2xl text-on-surface",
      String(card.number)
    ),
    bottomIcons
  );

  return cardElement;
}

function createHandCard(card, options = {}) {
  const {
    selected = false,
    rotate = 0,
    offset = 0,
    overlap = 0,
    disabled = false,
    compact = false,
    highlighted = false,
    dimmed = false,
  } = options;

  const sizeClass = compact
    ? "w-11 h-14 sm:w-12 sm:h-16 rounded-xl"
    : "w-12 h-[4.5rem] sm:w-14 sm:h-20 lg:w-[4.5rem] lg:h-28 rounded-xl";
  const cardElement = createUiElement(
    "button",
    [
      compact ? "reveal-card" : "hand-card",
      sizeClass,
      "border flex flex-col justify-between items-center py-1 lg:py-2",
      compact
        ? "shadow-[0_10px_28px_-8px_rgba(0,0,0,0.45)] cursor-default relative"
        : "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] cursor-pointer relative",
      selected
        ? "bg-gradient-to-b from-primary to-primary-container border-primary-fixed-dim/30 z-20"
        : "bg-gradient-to-b from-surface-bright to-surface-container-highest border-outline-variant/15 z-10",
      highlighted ? "ring-2 ring-primary/70 scale-[1.05]" : "",
      dimmed ? "opacity-45" : "",
    ]
      .filter(Boolean)
      .join(" ")
  );

  const iconColorClass = selected ? "text-on-primary-fixed-variant" : getPenaltyColorClass(card.penalty);
  const numberColorClass = selected ? "text-on-primary-fixed-variant" : "text-on-surface";
  const iconSizeClass = compact ? "text-[9px] sm:text-[10px]" : "text-[10px] lg:text-[14px]";
  const topIcons = createBullIcons(card.penalty, iconSizeClass);
  const bottomIcons = createBullIcons(card.penalty, iconSizeClass);
  topIcons.className = `flex gap-0.5 ${iconColorClass}`;
  bottomIcons.className = `flex gap-0.5 ${iconColorClass} rotate-180`;

  cardElement.type = "button";
  cardElement.dataset.cardNumber = String(card.number);

  if (!compact) {
    cardElement.style.setProperty("--card-rotate", `${rotate}deg`);
    cardElement.style.setProperty("--card-offset", `${offset}px`);
    cardElement.style.marginLeft = `${overlap}px`;
  }

  if (selected) {
    cardElement.classList.add("active-card");
  }

  if (disabled) {
    cardElement.disabled = true;
  }

  cardElement.append(
    topIcons,
    createUiElement(
      "span",
      compact
        ? `font-headline font-bold text-base sm:text-lg ${numberColorClass}`
        : `font-headline font-bold text-xl lg:text-3xl ${numberColorClass}`,
      String(card.number)
    ),
    bottomIcons
  );

  return cardElement;
}

function createHiddenPendingCard() {
  const cardElement = createUiElement(
    "div",
    "reveal-card w-11 h-14 sm:w-12 sm:h-16 rounded-xl border border-outline-variant/20 bg-gradient-to-b from-surface-container-highest to-surface-container-lowest shadow-[0_10px_28px_-8px_rgba(0,0,0,0.45)] relative flex items-center justify-center"
  );
  cardElement.appendChild(
    createUiElement(
      "span",
      "font-headline text-xl sm:text-2xl font-black text-primary/75",
      "?"
    )
  );
  return cardElement;
}

function createEmptySlot(isNextSlot) {
  if (isNextSlot) {
    const slot = createUiElement(
      "div",
      "w-11 h-14 sm:w-12 sm:h-16 lg:w-[4.5rem] lg:h-24 rounded-xl border-2 border-primary/40 border-dashed bg-primary/10 flex items-center justify-center relative"
    );
    slot.appendChild(
      createUiElement(
        "span",
        "material-symbols-outlined text-primary/50 text-xl animate-bounce",
        "arrow_downward"
      )
    );
    return slot;
  }

  return createUiElement(
    "div",
    "w-11 h-14 sm:w-12 sm:h-16 lg:w-[4.5rem] lg:h-24 rounded-xl border-2 border-outline-variant/20 border-dashed opacity-50"
  );
}

function createDangerSlot(isActive) {
  const slot = createUiElement(
    "div",
    isActive
      ? "w-11 h-14 sm:w-12 sm:h-16 lg:w-[4.5rem] lg:h-24 rounded-xl bg-error-container/20 border-2 border-error/50 border-dashed flex items-center justify-center animate-pulse relative overflow-hidden shadow-[0_0_15px_rgba(255,180,171,0.3)]"
      : "w-11 h-14 sm:w-12 sm:h-16 lg:w-[4.5rem] lg:h-24 rounded-xl border-2 border-error-container/30 border-dashed bg-error-container/5 flex items-center justify-center relative overflow-hidden"
  );
  const stripe = createUiElement(
    "div",
    isActive
      ? "absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,180,171,0.15)_10px,rgba(255,180,171,0.15)_20px)]"
      : "absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(147,0,10,0.1)_10px,rgba(147,0,10,0.1)_20px)]"
  );
  const content = isActive
    ? createUiElement(
        "span",
        "material-symbols-outlined text-error text-2xl lg:text-3xl drop-shadow-[0_0_8px_rgba(255,180,171,0.8)] z-10",
        "warning"
      )
    : createUiElement(
        "span",
        "font-headline font-black text-error-container/30 text-2xl lg:text-3xl z-10",
        "6"
      );

  slot.append(stripe, content);
  return slot;
}

function createAppState(socket) {
  return {
    socket,
    connectionStatus: "connecting",
    playerId: null,
    room: null,
    serverState: null,
    selectedCardNumber: null,
    lobbyStatus: "서버에 연결 중입니다.",
    roomStatus: "플레이어를 기다리는 중입니다.",
    transientStatus: "",
    pendingSubmit: false,
    playLog: [],
    recentPlayedNumbers: [],
    highlightedRowIds: [],
    summaryOpen: false,
    highlightTimerId: null,
    processedLogIds: new Set(),
    avatarEditorOpen: false,
    avatarDraft: normalizeAvatar(DEFAULT_AVATAR),
    avatarSaving: false,
  };
}

function getUiElements() {
  return {
    app: document.querySelector("[data-game-app]"),
    connectionBadge: document.getElementById("connection-badge"),
    lobbyScreen: document.getElementById("lobby-screen"),
    roomScreen: document.getElementById("room-screen"),
    gameScreen: document.getElementById("game-screen"),
    nicknameInput: document.getElementById("nickname-input"),
    roomCodeInput: document.getElementById("room-code-input"),
    lobbyStatus: document.getElementById("lobby-status"),
    aiModeButton: document.getElementById("ai-mode-button"),
    createRoomButton: document.getElementById("create-room-button"),
    joinRoomButton: document.getElementById("join-room-button"),
    roomCodeDisplay: document.getElementById("room-code-display"),
    roomPlayerCount: document.getElementById("room-player-count"),
    roomPlayerList: document.getElementById("room-player-list"),
    roomStatusMessage: document.getElementById("room-status-message"),
    startGameButton: document.getElementById("start-game-button"),
    leaveRoomButton: document.getElementById("leave-room-button"),
    selfProfileButton: document.getElementById("self-profile-button"),
    selfProfileAvatar: document.getElementById("self-profile-avatar"),
    selfProfileName: document.getElementById("self-profile-name"),
    opponentSlots: Array.from(document.querySelectorAll("[data-opponent-slot]")),
    boardRows: document.getElementById("board-rows"),
    playerHand: document.getElementById("player-hand"),
    currentTurnCards: document.getElementById("current-turn-cards"),
    submitButton: document.getElementById("submit-card-button"),
    restartButton: document.getElementById("restart-round-button"),
    roundIndicator: document.getElementById("round-indicator"),
    statusMessage: document.getElementById("status-message"),
    playerPenaltyPoints: document.getElementById("player-penalty-points"),
    phaseIndicator: document.getElementById("phase-indicator"),
    deckCount: document.getElementById("deck-count"),
    selectionIndicator: document.getElementById("selection-indicator"),
    submissionStatusList: document.getElementById("submission-status-list"),
    playLog: document.getElementById("play-log"),
    modal: document.getElementById("round-summary-modal"),
    summaryScoreboard: document.getElementById("summary-scoreboard"),
    closeSummaryButton: document.getElementById("close-summary-button"),
    dismissSummaryButton: document.getElementById("dismiss-summary-button"),
    restartFromModalButton: document.getElementById("restart-from-modal-button"),
    avatarEditorModal: document.getElementById("avatar-editor-modal"),
    closeAvatarEditorButton: document.getElementById("close-avatar-editor-button"),
    cancelAvatarEditorButton: document.getElementById("cancel-avatar-editor-button"),
    saveAvatarButton: document.getElementById("save-avatar-button"),
    avatarPreview: document.getElementById("avatar-preview"),
    avatarEditorStatus: document.getElementById("avatar-editor-status"),
    avatarSkinOptions: document.getElementById("avatar-skin-options"),
    avatarEyeOptions: document.getElementById("avatar-eye-options"),
    avatarMouthOptions: document.getElementById("avatar-mouth-options"),
    staticBullIcons: Array.from(document.querySelectorAll("[data-static-bull-icon]")),
  };
}

function hydrateStaticBullIcons(elements) {
  elements.staticBullIcons.forEach((target) => {
    target.innerHTML = "";
    target.appendChild(createBullIcon("text-current"));
  });
}

function getCurrentPlayer(state, playerId) {
  return state?.players?.find((player) => player.id === playerId) ?? null;
}

function getOtherPlayers(state, playerId) {
  if (!state?.players) {
    return [];
  }

  return state.players.filter((player) => player.id !== playerId);
}

function getDisplayPenaltyPoints(player, round) {
  if (!player) {
    return 0;
  }

  return round?.hasScored ? player.totalPenaltyPoints : player.totalPenaltyPoints + player.penaltyPoints;
}

function getPlayerName(state, playerId) {
  return state?.players?.find((player) => player.id === playerId)?.nickname ?? playerId;
}

function getCurrentRoomMode(appState) {
  return appState.serverState?.mode ?? appState.room?.mode ?? "multiplayer";
}

function canEditAvatar(appState) {
  return Boolean(appState.playerId) && getCurrentRoomMode(appState) !== "ai";
}

function getEditablePlayerSource(appState) {
  return (
    appState.serverState?.players?.find((player) => player.id === appState.playerId) ??
    appState.room?.players?.find((player) => player.id === appState.playerId) ??
    null
  );
}

function withAck(socket, eventName, payload) {
  return new Promise((resolve) => {
    socket.emit(eventName, payload, (response) => {
      resolve(response ?? { ok: false, error: "No response from server." });
    });
  });
}

function renderConnectionBadge(appState, elements) {
  const badgeClassByStatus = {
    connected: "border-primary/25 bg-primary/10 text-primary",
    disconnected: "border-error-container/25 bg-error-container/10 text-error",
    connecting: "border-outline-variant/20 bg-surface-container-lowest/70 text-on-surface-variant",
  };
  const labelByStatus = {
    connected: "서버 연결됨",
    disconnected: "서버 연결 끊김",
    connecting: "서버 연결 중...",
  };

  elements.connectionBadge.className =
    "rounded-full border px-4 py-2 text-xs font-semibold " +
    (badgeClassByStatus[appState.connectionStatus] || badgeClassByStatus.connecting);
  elements.connectionBadge.textContent =
    labelByStatus[appState.connectionStatus] || labelByStatus.connecting;
}

function renderLobby(appState, elements) {
  elements.lobbyStatus.textContent = appState.lobbyStatus;
}

function createRoomPlayerBadge(player, isHost, isSelf, canEdit) {
  const card = createUiElement(
    isSelf && canEdit ? "button" : "div",
    [
      "rounded-[1.25rem] border border-outline-variant/15 bg-surface-container-lowest/70 px-4 py-4 flex items-center justify-between gap-4",
      isSelf && canEdit ? "transition-transform active:scale-[0.98]" : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
  const left = createUiElement("div", "flex items-center gap-3");
  const avatar = player.isBot
    ? createBotAvatarElement(player.nickname.length, "h-11 w-11")
    : createAvatarElement(player.avatar, {
        sizeClass: "h-11 w-11",
        editable: isSelf && canEdit,
      });
  const textWrap = createUiElement("div");
  textWrap.append(
    createUiElement(
      "p",
      "font-headline text-lg font-black text-on-surface",
      `${player.nickname}${isSelf ? " (나)" : ""}`
    ),
    createUiElement(
      "p",
      "text-sm text-on-surface-variant",
      player.isBot ? "Bot Player" : "Human Player"
    )
  );

  left.append(avatar, textWrap);
  card.appendChild(left);

  if (card.tagName === "BUTTON") {
    card.type = "button";
    card.dataset.editAvatarTrigger = "true";
  }

  if (isHost) {
    card.appendChild(
      createUiElement(
        "span",
        "rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-black text-primary",
        "HOST"
      )
    );
  }

  return card;
}

function renderRoom(appState, elements) {
  const room = appState.room;

  if (!room) {
    elements.roomCodeDisplay.textContent = "------";
    elements.roomPlayerCount.textContent = "0 / 4";
    elements.roomPlayerList.innerHTML = "";
    elements.roomStatusMessage.textContent = "플레이어를 기다리는 중입니다.";
    elements.startGameButton.disabled = true;
    return;
  }

  elements.roomCodeDisplay.textContent = room.roomCode;
  elements.roomPlayerCount.textContent = `${room.playerCount} / 4`;
  elements.roomStatusMessage.textContent = appState.roomStatus;
  elements.roomPlayerList.innerHTML = "";

  room.players.forEach((player) => {
    elements.roomPlayerList.appendChild(
      createRoomPlayerBadge(
        player,
        player.id === room.hostPlayerId,
        player.id === appState.playerId,
        canEditAvatar(appState)
      )
    );
  });

  const isHost = room.hostPlayerId === appState.playerId;
  const humanCount = room.players.filter((player) => !player.isBot).length;
  elements.startGameButton.disabled =
    !isHost || room.hasGameStarted || (room.mode !== "ai" && humanCount < 2);
}

function renderOpponentHud(state, appState, elements) {
  const opponents = getOtherPlayers(state, appState.playerId);

  elements.opponentSlots.forEach((slot, index) => {
    const player = opponents[index];
    const name = slot.querySelector("[data-opponent-name]");
    const hand = slot.querySelector("[data-opponent-hand]");
    const penalty = slot.querySelector("[data-opponent-penalty]");
    const avatarTarget = slot.querySelector("[data-opponent-avatar]");

    if (!player) {
      slot.style.display = "none";
      return;
    }

    slot.style.display = "";
    name.textContent = player.nickname;
    hand.textContent = String(player.handCount ?? player.hand?.length ?? 0);
    penalty.textContent = String(getDisplayPenaltyPoints(player, state.round));

    if (avatarTarget) {
      avatarTarget.innerHTML = "";
      avatarTarget.appendChild(
        player.isBot
          ? createBotAvatarElement(index, "h-10 w-10")
          : createAvatarElement(player.avatar, { sizeClass: "h-10 w-10" })
      );
    }
  });
}

function renderBoardRows(state, appState, elements) {
  const rotations = ["-rotate-1", "rotate-1", "rotate-2", "-rotate-2", "rotate-1"];
  const manualChoice = state.manualChoice;
  const canChooseRow = Boolean(manualChoice?.isChooser);
  const allowedRowIds = new Set(manualChoice?.allowedRowIds ?? []);

  elements.boardRows.innerHTML = "";

  state.rows.forEach((row) => {
    const rowClasses = [
      "flex items-center gap-1.5 lg:gap-3 bg-surface-container-low p-2 lg:p-3 rounded-[1.75rem] w-full relative border border-outline-variant/5 shadow-inner",
    ];

    if (appState.highlightedRowIds.includes(row.id)) {
      rowClasses.push("row-capture-flash");
    }

    if (canChooseRow && allowedRowIds.has(row.id)) {
      rowClasses.push("row-selectable");
    }

    if (manualChoice?.recommendedRowId === row.id) {
      rowClasses.push("row-guided");
    }

    const rowElement = createUiElement("div", rowClasses.join(" "));
    rowElement.dataset.rowId = String(row.id);

    row.cards.forEach((card, index) => {
      const cardElement = createTableCard(card, rotations[index % rotations.length]);

      if (appState.recentPlayedNumbers.includes(card.number)) {
        cardElement.classList.add("recent-card-enter");
      }

      rowElement.appendChild(cardElement);
    });

    for (let index = row.cards.length; index < 5; index += 1) {
      rowElement.appendChild(createEmptySlot(index === row.cards.length));
    }

    rowElement.appendChild(createDangerSlot(row.cards.length >= 5));
    elements.boardRows.appendChild(rowElement);
  });
}

function renderCurrentTurnCards(state, elements) {
  elements.currentTurnCards.innerHTML = "";
  const pendingResolution = state.round.pendingResolution;

  if (!pendingResolution?.orderedCards?.length) {
    elements.currentTurnCards.appendChild(
      createUiElement(
        "div",
        "rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/60 px-4 py-3 text-sm text-on-surface-variant",
        "이번 턴에 공개된 카드가 여기 표시됩니다."
      )
    );
    return;
  }

  const wrap = createUiElement("div", "flex flex-wrap items-end gap-3");

  pendingResolution.orderedCards.forEach((entry, index) => {
    const isResolved = index < pendingResolution.currentStepIndex;
    const isActive = index === pendingResolution.currentStepIndex;
    const item = createUiElement(
      "div",
      [
        "flex flex-col items-center gap-2 rounded-2xl border border-outline-variant/15 px-3 py-3 transition-all",
        isActive ? "bg-primary/10 shadow-[0_0_18px_rgba(255,181,159,0.18)]" : "bg-surface-container-lowest/70",
      ]
        .filter(Boolean)
        .join(" ")
    );

    const cardElement =
      entry.card?.hidden || entry.card?.number === null
        ? createHiddenPendingCard()
        : createHandCard(entry.card, {
            compact: true,
            disabled: true,
            highlighted: isActive,
            dimmed: isResolved,
          });

    if (isActive) {
      cardElement.classList.add("ring-2", "ring-primary/70");
    }

    if (isResolved) {
      cardElement.classList.add("opacity-45");
    }

    item.append(
      cardElement,
      createUiElement(
        "div",
        "text-xs font-bold tracking-wide text-on-surface-variant",
        getPlayerName(state, entry.playerId)
      )
    );
    wrap.appendChild(item);
  });

  elements.currentTurnCards.appendChild(wrap);
}

function renderPlayerHand(state, appState, elements) {
  const currentPlayer = getCurrentPlayer(state, appState.playerId);
  const hand = [...(currentPlayer?.hand ?? [])].sort((left, right) => left.number - right.number);
  const handSize = hand.length;
  const isResolving = Boolean(state.round.pendingResolution);

  elements.playerHand.innerHTML = "";

  hand.forEach((card, index) => {
    const centerIndex = (handSize - 1) / 2;
    const distanceFromCenter = index - centerIndex;

    elements.playerHand.appendChild(
      createHandCard(card, {
        selected: appState.selectedCardNumber === card.number,
        rotate: distanceFromCenter * 3,
        offset: Math.abs(distanceFromCenter) * 8,
        overlap: index === 0 ? 0 : -16,
        disabled: isResolving || state.round.phase === "finished",
      })
    );
  });
}

function renderSubmissionStatus(state, elements) {
  if (!elements.submissionStatusList) {
    return;
  }

  const statuses = state.submissionStatus ?? [];
  elements.submissionStatusList.innerHTML = "";

  if (!statuses.length) {
    elements.submissionStatusList.appendChild(
      createUiElement(
        "div",
        "rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/60 px-4 py-3 text-sm text-on-surface-variant",
        "아직 제출 정보가 없습니다."
      )
    );
    return;
  }

  statuses.forEach((entry) => {
    const badgeClass = entry.waitingForPlacement
      ? "border-primary/25 bg-primary/10 text-primary"
      : entry.submitted
        ? "border-secondary/25 bg-secondary/10 text-secondary"
        : "border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant";
    const badgeText = entry.waitingForPlacement
      ? "🐮 제출완료 🐮"
      : entry.submitted
        ? "🐮 제출완료 🐮"
        : "🐮 고민중 🐮";
    const row = createUiElement(
      "div",
      "rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/65 px-3 py-3 flex items-center justify-between gap-3"
    );
    const left = createUiElement("div", "flex items-center gap-3");
    left.append(
      createUiElement(
        "span",
        entry.isBot ? "material-symbols-outlined text-primary" : "material-symbols-outlined text-secondary",
        entry.isBot ? "smart_toy" : "person"
      ),
      createUiElement("span", "font-semibold text-on-surface", entry.nickname)
    );
    row.append(
      left,
      createUiElement(
        "span",
        `rounded-full border px-3 py-1 text-xs font-black ${badgeClass}`,
        badgeText
      )
    );
    elements.submissionStatusList.appendChild(row);
  });
}

function buildStatusMessage(state, appState) {
  if (appState.transientStatus) {
    return appState.transientStatus;
  }

  if (state.manualChoice) {
    if (state.manualChoice.isChooser) {
      return "내 턴입니다! 어디에 놓을지 선택하세요";
    }

    return `현재 ${state.manualChoice.nickname}님의 턴입니다!`;
  }

  const currentPlayer = getCurrentPlayer(state, appState.playerId);

  if (state.round.phase === "finished") {
    return "라운드가 종료되었습니다. 결과를 확인하고 다음 라운드를 시작하세요.";
  }

  if (state.round.pendingResolution) {
    const currentStep = state.round.pendingResolution.steps[state.round.pendingResolution.currentStepIndex];

    if (currentStep) {
      return `현재 ${getPlayerName(state, currentStep.playerId)}님의 턴입니다!`;
    }

    return "제출된 카드를 정리하고 있습니다.";
  }

  if (currentPlayer && state.round.selectedCardsByPlayer?.[currentPlayer.id]) {
    return "카드를 제출했습니다. 다른 플레이어를 기다리는 중입니다.";
  }

  if (appState.selectedCardNumber !== null) {
    return `${appState.selectedCardNumber}번 카드를 선택했습니다. 제출 버튼을 누르세요.`;
  }

  return "카드를 선택하고 제출하세요.";
}

function renderStatus(state, appState, elements) {
  const currentPlayer = getCurrentPlayer(state, appState.playerId);
  const displayedTurn = Math.min(state.round.turn + 1, 10);
  const submitted = Boolean(state.round.selectedCardsByPlayer?.[appState.playerId]);
  const submittedOrPending = submitted || appState.pendingSubmit;
  const isResolving = Boolean(state.round.pendingResolution);
  const isChoosingRow = Boolean(state.manualChoice?.isChooser);

  elements.roundIndicator.textContent = `Round ${state.round.number} • Turn ${displayedTurn} / 10`;
  elements.statusMessage.textContent = buildStatusMessage(state, appState);
  elements.playerPenaltyPoints.textContent = String(
    getDisplayPenaltyPoints(currentPlayer, state.round)
  );
  elements.phaseIndicator.textContent = state.round.phase;
  elements.deckCount.textContent = String(state.deck.length);
  elements.selectionIndicator.textContent = isChoosingRow
    ? "행 선택"
    : isResolving
      ? "처리 중"
      : submittedOrPending
        ? "제출 완료"
        : appState.selectedCardNumber === null
          ? "대기 중"
          : `${appState.selectedCardNumber} 선택`;

  elements.submitButton.textContent = submittedOrPending ? "제출 완료!" : "카드 제출";
  elements.submitButton.disabled =
    !currentPlayer ||
    !appState.room?.roomCode ||
    isResolving ||
    isChoosingRow ||
    state.round.phase === "finished" ||
    appState.selectedCardNumber === null ||
    submittedOrPending;
  elements.restartButton.disabled =
    !appState.room ||
    appState.room.hostPlayerId !== appState.playerId ||
    isResolving ||
    Boolean(state.manualChoice);
}

function renderSelfProfile(appState, elements) {
  if (!elements.selfProfileButton || !elements.selfProfileAvatar || !elements.selfProfileName) {
    return;
  }

  const player = getEditablePlayerSource(appState);
  elements.selfProfileAvatar.innerHTML = "";
  elements.selfProfileName.textContent = player?.nickname ?? "Player";
  elements.selfProfileButton.disabled = !player || !canEditAvatar(appState);
  elements.selfProfileButton.title = canEditAvatar(appState)
    ? "프로필을 클릭해 아바타를 편집하세요."
    : "AI 모드에서는 아바타 편집이 비활성화됩니다.";

  if (!player) {
    return;
  }

  elements.selfProfileAvatar.appendChild(
    createAvatarElement(player.avatar, {
      sizeClass: "h-11 w-11",
      editable: canEditAvatar(appState),
    })
  );
}

function createAvatarOptionButton(label, selected, datasetKey, datasetValue) {
  const button = createUiElement(
    "button",
    [
      "avatar-editor-chip rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-bold text-on-surface",
      selected ? "is-selected" : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
  button.type = "button";
  button.dataset.avatarOption = datasetKey;
  button.dataset.avatarValue = datasetValue;
  button.textContent = label;
  return button;
}

function renderAvatarEditor(appState, elements) {
  if (!elements.avatarEditorModal) {
    return;
  }

  if (appState.avatarEditorOpen) {
    elements.avatarEditorModal.classList.remove("hidden");
    elements.avatarEditorModal.classList.add("flex");
  } else {
    elements.avatarEditorModal.classList.add("hidden");
    elements.avatarEditorModal.classList.remove("flex");
  }

  if (!elements.avatarPreview) {
    return;
  }

  elements.avatarPreview.innerHTML = "";
  elements.avatarPreview.appendChild(createAvatarElement(appState.avatarDraft, { sizeClass: "h-28 w-28" }));
  elements.avatarEditorStatus.textContent = appState.avatarSaving
    ? "저장 중입니다..."
    : "수정 중에는 이 미리보기에서 바로 확인할 수 있습니다.";

  elements.avatarSkinOptions.innerHTML = "";
  AVATAR_SKIN_COLORS.forEach((color) => {
    const button = createUiElement(
      "button",
      [
        "avatar-editor-chip rounded-full border border-outline-variant/20 h-11 w-11",
        appState.avatarDraft.skinColor === color ? "is-selected" : "",
      ]
        .filter(Boolean)
        .join(" ")
    );
    button.type = "button";
    button.dataset.avatarOption = "skinColor";
    button.dataset.avatarValue = color;
    button.style.background = color;
    elements.avatarSkinOptions.appendChild(button);
  });

  const eyeLabels = {
    dot: "점눈",
    smile: "웃는 눈",
    sleepy: "졸린 눈",
    spark: "반짝 눈",
  };
  elements.avatarEyeOptions.innerHTML = "";
  AVATAR_EYE_TYPES.forEach((eyeType) => {
    elements.avatarEyeOptions.appendChild(
      createAvatarOptionButton(
        eyeLabels[eyeType],
        appState.avatarDraft.eyeType === eyeType,
        "eyeType",
        eyeType
      )
    );
  });

  const mouthLabels = {
    smile: "스마일",
    grin: "활짝",
    o: "동그라미",
    flat: "덤덤",
  };
  elements.avatarMouthOptions.innerHTML = "";
  AVATAR_MOUTH_TYPES.forEach((mouthType) => {
    elements.avatarMouthOptions.appendChild(
      createAvatarOptionButton(
        mouthLabels[mouthType],
        appState.avatarDraft.mouthType === mouthType,
        "mouthType",
        mouthType
      )
    );
  });

  elements.saveAvatarButton.disabled = appState.avatarSaving;
}

function renderPlayLog(appState, elements) {
  elements.playLog.innerHTML = "";

  if (!appState.playLog.length) {
    elements.playLog.appendChild(
      createUiElement(
        "div",
        "rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/60 px-4 py-3 text-sm text-on-surface-variant",
        "아직 처리된 카드 로그가 없습니다."
      )
    );
    return;
  }

  appState.playLog.forEach((entry, index) => {
    const card = createUiElement(
      "article",
      [
        "rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/65 px-4 py-3",
        index === 0 ? "log-entry-enter" : "",
      ]
        .filter(Boolean)
        .join(" ")
    );
    const top = createUiElement("div", "flex items-center justify-between gap-3");
    top.append(
      createUiElement(
        "div",
        "font-headline font-bold text-on-surface",
        `${entry.playerName} played ${entry.cardNumber}`
      ),
      createUiElement(
        "span",
        "rounded-full px-3 py-1 text-xs font-black border border-outline-variant/20 bg-surface-container-high text-primary",
        `Row ${entry.rowId}`
      )
    );
    card.append(top, createUiElement("p", "mt-2 text-sm text-on-surface-variant", entry.message));
    elements.playLog.appendChild(card);
  });
}

function renderRoundSummary(state, appState, elements) {
  elements.summaryScoreboard.innerHTML = "";
  const scores = [...(state.round.finalScores ?? [])].sort(
    (left, right) => left.totalPenaltyPoints - right.totalPenaltyPoints
  );

  scores.forEach((entry, index) => {
    const player = state.players.find((currentPlayer) => currentPlayer.id === entry.playerId);
    const row = createUiElement(
      "div",
      "flex items-center justify-between gap-4 rounded-[1.5rem] border border-outline-variant/15 bg-surface-container-low/80 px-4 py-4"
    );
    const left = createUiElement("div", "flex items-center gap-4");
    left.append(
      createUiElement(
        "div",
        "flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest text-primary font-black",
        String(index + 1)
      ),
      (() => {
        const textWrap = createUiElement("div");
        textWrap.append(
          createUiElement(
            "p",
            "font-headline text-lg font-black text-on-surface",
            player?.nickname ?? entry.playerId
          ),
          createUiElement(
            "p",
            "text-sm text-on-surface-variant",
            `이번 라운드 +${entry.roundPenaltyPoints} • 누적 ${entry.totalPenaltyPoints}`
          )
        );
        return textWrap;
      })()
    );

    const right = createUiElement(
      "div",
      "rounded-full border border-outline-variant/20 bg-surface-container-lowest px-4 py-2 text-sm font-black text-primary flex items-center gap-2"
    );
    right.append(createBullIcon("text-current"), document.createTextNode(String(entry.totalPenaltyPoints)));

    row.append(left, right);
    elements.summaryScoreboard.appendChild(row);
  });

  if (appState.summaryOpen && state.round.phase === "finished") {
    elements.modal.classList.remove("hidden");
    elements.modal.classList.add("flex");
  } else {
    elements.modal.classList.add("hidden");
    elements.modal.classList.remove("flex");
  }
}

function renderGame(state, appState, elements) {
  renderOpponentHud(state, appState, elements);
  renderBoardRows(state, appState, elements);
  renderCurrentTurnCards(state, elements);
  renderPlayerHand(state, appState, elements);
  renderStatus(state, appState, elements);
  renderSelfProfile(appState, elements);
  renderSubmissionStatus(state, elements);
  renderPlayLog(appState, elements);
  renderRoundSummary(state, appState, elements);
}

function renderApp(appState, elements) {
  renderConnectionBadge(appState, elements);

  const showGame = Boolean(appState.serverState);
  const showRoom = !showGame && Boolean(appState.room);
  const showLobby = !showGame && !showRoom;

  elements.lobbyScreen.classList.toggle("hidden", !showLobby);
  elements.roomScreen.classList.toggle("hidden", !showRoom);
  elements.gameScreen.classList.toggle("hidden", !showGame);

  renderLobby(appState, elements);
  renderRoom(appState, elements);
  renderAvatarEditor(appState, elements);

  if (showGame && appState.serverState) {
    renderGame(appState.serverState, appState, elements);
  } else {
    elements.modal.classList.add("hidden");
    elements.modal.classList.remove("flex");
  }
}

function resetHighlightState(appState) {
  appState.recentPlayedNumbers = [];
  appState.highlightedRowIds = [];

  if (appState.highlightTimerId) {
    window.clearTimeout(appState.highlightTimerId);
    appState.highlightTimerId = null;
  }
}

function resetGameUiState(appState) {
  appState.selectedCardNumber = null;
  appState.pendingSubmit = false;
  appState.playLog = [];
  appState.processedLogIds = new Set();
  appState.summaryOpen = false;
  appState.transientStatus = "";
  resetHighlightState(appState);
}

function buildLogEntry(state, step) {
  const playerName = getPlayerName(state, step.playerId);
  const message =
    step.placement === "captured-full-row"
      ? `${playerName}이(가) 6번째 칸을 채워 벌점 ${step.penaltyPointsGained}점을 가져갔습니다.`
      : step.placement === "replaced-smallest"
        ? `${playerName}이(가) 직접 고른 줄을 가져가고 새 카드로 교체했습니다.`
        : `${playerName}이(가) ${step.rowId}번 줄에 카드를 배치했습니다.`;

  return {
    id: `${state.round.number}-${state.round.turn}-${step.playerId}-${step.card.number}`,
    playerName,
    cardNumber: step.card.number,
    rowId: step.rowId,
    message,
  };
}

function applyStateDiff(appState, nextState) {
  const previousState = appState.serverState;
  const previousResolvedCount = previousState?.round?.resolvedCards?.length ?? 0;
  const nextResolvedCards = nextState.round?.resolvedCards ?? [];
  const nextResolvedCount = nextResolvedCards.length;
  const roundRestarted =
    !previousState ||
    previousState.round.number !== nextState.round.number ||
    (previousState.round.phase === "finished" && nextState.round.phase !== "finished");

  if (roundRestarted) {
    resetGameUiState(appState);
  }

  if (nextResolvedCount > previousResolvedCount) {
    const newSteps = nextResolvedCards.slice(previousResolvedCount);
    const freshSteps = [];

    newSteps.forEach((step) => {
      const entry = buildLogEntry(nextState, step);

      if (appState.processedLogIds.has(entry.id)) {
        return;
      }

      appState.processedLogIds.add(entry.id);
      appState.playLog = [entry, ...appState.playLog].slice(0, 16);
      freshSteps.push(step);
    });

    if (freshSteps.length) {
      const latestStep = freshSteps[freshSteps.length - 1];

      appState.recentPlayedNumbers = [latestStep.card.number];
      appState.highlightedRowIds = latestStep.penaltyPointsGained > 0 ? [latestStep.rowId] : [];

      if (appState.highlightTimerId) {
        window.clearTimeout(appState.highlightTimerId);
      }

      appState.highlightTimerId = window.setTimeout(() => {
        appState.recentPlayedNumbers = [];
        appState.highlightedRowIds = [];
        appState.highlightTimerId = null;
        renderApp(appState, getUiElements());
      }, 850);
    }
  }

  if (!nextState.round.pendingResolution && !nextState.manualChoice && nextState.round.phase !== "finished") {
    appState.selectedCardNumber = null;
  }

  if (nextState.round.phase === "finished") {
    appState.summaryOpen = true;
  }
}

async function handleCreateRoom(appState, elements, mode) {
  const nickname = elements.nicknameInput.value.trim();

  if (!nickname) {
    appState.lobbyStatus = "닉네임을 먼저 입력하세요.";
    renderApp(appState, elements);
    return;
  }

  appState.lobbyStatus =
    mode === "ai" ? "AI 방을 생성 중입니다..." : "멀티플레이 방을 생성 중입니다...";
  renderApp(appState, elements);

  const response = await withAck(appState.socket, "createRoom", { nickname, mode });

  if (!response.ok) {
    appState.lobbyStatus = response.error || "방 생성에 실패했습니다.";
    renderApp(appState, elements);
    return;
  }

  appState.playerId = response.playerId;
  appState.room = response.room;
  appState.roomStatus =
    mode === "ai"
      ? "AI 게임을 시작하는 중입니다."
      : "방이 생성되었습니다. 친구에게 방 코드를 공유하세요.";
  appState.lobbyStatus = `방 ${response.roomCode} 생성 완료`;
  renderApp(appState, elements);
}

async function handleJoinRoom(appState, elements) {
  const nickname = elements.nicknameInput.value.trim();
  const roomCode = elements.roomCodeInput.value.trim().toUpperCase();

  if (!nickname) {
    appState.lobbyStatus = "닉네임을 먼저 입력하세요.";
    renderApp(appState, elements);
    return;
  }

  if (!roomCode) {
    appState.lobbyStatus = "참여할 방 코드를 입력하세요.";
    renderApp(appState, elements);
    return;
  }

  appState.lobbyStatus = `${roomCode} 방에 참여 중입니다...`;
  renderApp(appState, elements);

  const response = await withAck(appState.socket, "joinRoom", { nickname, roomCode });

  if (!response.ok) {
    appState.lobbyStatus = response.error || "방 참여에 실패했습니다.";
    renderApp(appState, elements);
    return;
  }

  appState.playerId = response.playerId;
  appState.room = response.room;
  appState.roomStatus = "방에 참여했습니다. 호스트가 게임을 시작할 때까지 기다리세요.";
  appState.lobbyStatus = `${response.roomCode} 방에 참여했습니다.`;
  renderApp(appState, elements);
}

async function handleStartGame(appState, elements) {
  if (!appState.room?.roomCode) {
    return;
  }

  appState.roomStatus = "서버에 게임 시작을 요청하는 중입니다.";
  renderApp(appState, elements);

  const response = await withAck(appState.socket, "startGame", {
    roomCode: appState.room.roomCode,
  });

  if (!response.ok) {
    appState.roomStatus = response.error || "게임 시작에 실패했습니다.";
    renderApp(appState, elements);
  }
}

async function handleSubmitCard(appState, elements) {
  if (!appState.room?.roomCode || appState.selectedCardNumber === null) {
    return;
  }

  appState.transientStatus = `${appState.selectedCardNumber}번 카드를 서버로 전송하는 중입니다.`;
  appState.pendingSubmit = true;
  renderApp(appState, elements);

  const response = await withAck(appState.socket, "submitCard", {
    roomCode: appState.room.roomCode,
    cardNumber: appState.selectedCardNumber,
  });

  if (!response.ok) {
    appState.pendingSubmit = false;
    appState.transientStatus = response.error || "카드 제출에 실패했습니다.";
    renderApp(appState, elements);
    return;
  }

  appState.pendingSubmit = false;
  appState.transientStatus = "";
  renderApp(appState, elements);
}

async function handleChooseRow(appState, elements, rowId) {
  if (!appState.room?.roomCode || !appState.serverState?.manualChoice?.isChooser) {
    return;
  }

  appState.transientStatus = `${rowId}번 줄을 선택하는 중입니다.`;
  renderApp(appState, elements);

  const response = await withAck(appState.socket, "chooseRow", {
    roomCode: appState.room.roomCode,
    rowId,
  });

  if (!response.ok) {
    appState.transientStatus = response.error || "행 선택에 실패했습니다.";
    renderApp(appState, elements);
    return;
  }

  appState.transientStatus = "";
  renderApp(appState, elements);
}

async function handleRestartRound(appState, elements) {
  if (!appState.room?.roomCode) {
    return;
  }

  const response = await withAck(appState.socket, "restartRound", {
    roomCode: appState.room.roomCode,
  });

  if (!response.ok) {
    appState.transientStatus = response.error || "라운드 재시작에 실패했습니다.";
    renderApp(appState, elements);
    return;
  }

  appState.summaryOpen = false;
  appState.transientStatus = "";
  renderApp(appState, elements);
}

function openAvatarEditor(appState, elements) {
  if (!canEditAvatar(appState)) {
    return;
  }

  const player = getEditablePlayerSource(appState);

  if (!player) {
    return;
  }

  appState.avatarDraft = normalizeAvatar(player.avatar);
  appState.avatarEditorOpen = true;
  renderApp(appState, elements);
}

function closeAvatarEditor(appState, elements) {
  appState.avatarEditorOpen = false;
  appState.avatarSaving = false;
  renderApp(appState, elements);
}

async function handleSaveAvatar(appState, elements) {
  if (!appState.room?.roomCode || !canEditAvatar(appState)) {
    return;
  }

  appState.avatarSaving = true;
  renderApp(appState, elements);

  const response = await withAck(appState.socket, "updateAvatar", {
    roomCode: appState.room.roomCode,
    avatar: appState.avatarDraft,
  });

  if (!response.ok) {
    appState.avatarSaving = false;
    appState.transientStatus = response.error || "아바타 저장에 실패했습니다.";
    renderApp(appState, elements);
    return;
  }

  appState.avatarSaving = false;
  appState.avatarEditorOpen = false;
  appState.transientStatus = "";
  renderApp(appState, elements);
}

function initializeApp(socket) {
  if (typeof document === "undefined") {
    return;
  }

  const elements = getUiElements();

  if (!elements.app) {
    return;
  }

  const appState = createAppState(socket);
  hydrateStaticBullIcons(elements);

  const rerender = () => {
    renderApp(appState, elements);
  };

  socket.on("connect", () => {
    appState.connectionStatus = "connected";
    appState.lobbyStatus = "서버에 연결되었습니다. 닉네임을 입력하고 시작하세요.";
    rerender();
  });

  socket.on("disconnect", () => {
    appState.connectionStatus = "disconnected";
    appState.lobbyStatus = "서버 연결이 끊어졌습니다. 서버를 확인하세요.";
    rerender();
  });

  socket.on("roomUpdated", (room) => {
    appState.room = room;

    if (room.hasGameStarted) {
      appState.roomStatus = "게임이 시작되었습니다.";
    } else {
      const isHost = room.hostPlayerId === appState.playerId;
      const humanCount = room.players.filter((player) => !player.isBot).length;
      appState.roomStatus = isHost
        ? humanCount >= 2 || room.mode === "ai"
          ? "준비가 되면 게임 시작 버튼을 누르세요."
          : "최소 2명의 인간 플레이어가 필요합니다."
        : "호스트가 게임을 시작할 때까지 기다리세요.";
    }

    rerender();
  });

  socket.on("updateState", ({ roomCode, state }) => {
    if (roomCode && appState.room?.roomCode !== roomCode) {
      appState.room = {
        ...(appState.room ?? {}),
        roomCode,
      };
    }

    applyStateDiff(appState, state);
    appState.serverState = state;
    appState.transientStatus = "";
    appState.pendingSubmit = false;
    rerender();
  });

  socket.on("submissionStatusUpdated", ({ roomCode, statuses }) => {
    if (!appState.serverState) {
      return;
    }

    if (roomCode && appState.room?.roomCode !== roomCode) {
      return;
    }

    appState.serverState = {
      ...appState.serverState,
      submissionStatus: Array.isArray(statuses) ? statuses : [],
    };
    rerender();
  });

  socket.on("placementWarning", ({ roomCode, message }) => {
    if (roomCode && appState.room?.roomCode !== roomCode) {
      return;
    }

    appState.transientStatus = message || "그곳에는 놓을 수 없습니다!";
    rerender();
  });

  elements.aiModeButton.addEventListener("click", () => {
    handleCreateRoom(appState, elements, "ai");
  });

  elements.createRoomButton.addEventListener("click", () => {
    handleCreateRoom(appState, elements, "multiplayer");
  });

  elements.joinRoomButton.addEventListener("click", () => {
    handleJoinRoom(appState, elements);
  });

  elements.startGameButton.addEventListener("click", () => {
    handleStartGame(appState, elements);
  });

  elements.leaveRoomButton.addEventListener("click", () => {
    window.location.reload();
  });

  elements.roomPlayerList.addEventListener("click", (event) => {
    if (!event.target.closest("[data-edit-avatar-trigger='true']")) {
      return;
    }

    openAvatarEditor(appState, elements);
  });

  elements.selfProfileButton?.addEventListener("click", () => {
    openAvatarEditor(appState, elements);
  });

  [elements.avatarSkinOptions, elements.avatarEyeOptions, elements.avatarMouthOptions].forEach(
    (target) => {
      target?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-avatar-option]");

        if (!button) {
          return;
        }

        appState.avatarDraft = normalizeAvatar({
          ...appState.avatarDraft,
          [button.dataset.avatarOption]: button.dataset.avatarValue,
        });
        renderApp(appState, elements);
      });
    }
  );

  elements.saveAvatarButton?.addEventListener("click", () => {
    handleSaveAvatar(appState, elements);
  });

  elements.closeAvatarEditorButton?.addEventListener("click", () => {
    closeAvatarEditor(appState, elements);
  });

  elements.cancelAvatarEditorButton?.addEventListener("click", () => {
    closeAvatarEditor(appState, elements);
  });

  elements.avatarEditorModal?.addEventListener("click", (event) => {
    if (event.target === elements.avatarEditorModal) {
      closeAvatarEditor(appState, elements);
    }
  });

  elements.playerHand.addEventListener("click", (event) => {
    if (!appState.serverState || appState.serverState.round.pendingResolution) {
      return;
    }

    const cardButton = event.target.closest("[data-card-number]");

    if (!cardButton) {
      return;
    }

    const cardNumber = Number(cardButton.dataset.cardNumber);
    appState.selectedCardNumber = appState.selectedCardNumber === cardNumber ? null : cardNumber;
    appState.transientStatus = "";
    rerender();
  });

  elements.boardRows.addEventListener("click", (event) => {
    const rowElement = event.target.closest("[data-row-id]");

    if (!rowElement || !appState.serverState?.manualChoice?.isChooser) {
      return;
    }

    const rowId = Number(rowElement.dataset.rowId);
    const allowed = appState.serverState.manualChoice.allowedRowIds ?? [];

    if (!allowed.includes(rowId)) {
      return;
    }

    handleChooseRow(appState, elements, rowId);
  });

  elements.submitButton.addEventListener("click", () => {
    handleSubmitCard(appState, elements);
  });

  elements.restartButton.addEventListener("click", () => {
    handleRestartRound(appState, elements);
  });

  elements.restartFromModalButton.addEventListener("click", () => {
    handleRestartRound(appState, elements);
  });

  elements.closeSummaryButton.addEventListener("click", () => {
    appState.summaryOpen = false;
    rerender();
  });

  elements.dismissSummaryButton.addEventListener("click", () => {
    appState.summaryOpen = false;
    rerender();
  });

  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      appState.summaryOpen = false;
      rerender();
    }
  });

  window.renderGame = (state) => {
    appState.serverState = state;
    rerender();
  };

  rerender();
}

export { initializeApp, renderGame };
