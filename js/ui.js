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
const ACTIVE_SESSION_STORAGE_KEY = "sixnimmt.activeSession";
const CHAT_BUBBLE_TTL_MS = 3000;
const CHAT_PANEL_VISIBLE_MESSAGES = 3;
const CLEANUP_ANNOUNCEMENT_BUILDERS = [
  (name) => `청소부 ${name}`,
  (name) => `바닥쓸기장인 ${name}`,
  (name) => `인간청소기 ${name}`,
  (name) => `다 ${name} 거야!!!!`,
  (name) => `인간 다이슨 ${name}`,
  (name) => `환경미화원 ${name}`,
  (name) => `배고픈 ${name}`,
];

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

function getSessionStorages() {
  if (typeof window === "undefined") {
    return [];
  }

  const storages = [];

  try {
    if (window.sessionStorage) {
      storages.push(window.sessionStorage);
    }
  } catch (_error) {
    // Ignore storage access failures and fall back to any available storage.
  }

  try {
    if (window.localStorage && !storages.includes(window.localStorage)) {
      storages.push(window.localStorage);
    }
  } catch (_error) {
    // Ignore storage access failures and fall back to any available storage.
  }

  return storages;
}

function saveActiveSession(appState) {
  const storages = getSessionStorages();

  if (storages.length === 0) {
    return;
  }

  if (!appState.playerId || !appState.room?.roomCode) {
    storages.forEach((storage) => storage.removeItem(ACTIVE_SESSION_STORAGE_KEY));
    return;
  }

  const payload = {
    playerId: appState.playerId,
    roomCode: appState.room.roomCode,
    room: appState.room,
    serverState: appState.serverState,
    playLog: appState.playLog,
    selectedCardNumber: appState.selectedCardNumber,
    processedLogIds: Array.from(appState.processedLogIds ?? []),
    savedAt: Date.now(),
  };

  const serializedPayload = JSON.stringify(payload);
  storages.forEach((storage) => storage.setItem(ACTIVE_SESSION_STORAGE_KEY, serializedPayload));
}

function loadActiveSession() {
  const storages = getSessionStorages();

  for (const storage of storages) {
    const rawValue = storage.getItem(ACTIVE_SESSION_STORAGE_KEY);

    if (!rawValue) {
      continue;
    }

    try {
      return JSON.parse(rawValue);
    } catch (_error) {
      storage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    }
  }

  return null;
}

function clearActiveSession() {
  getSessionStorages().forEach((storage) => storage.removeItem(ACTIVE_SESSION_STORAGE_KEY));
}

function resetAppToLobby(appState) {
  if (typeof window !== "undefined" && appState.chatBubbleTimerId) {
    window.clearTimeout(appState.chatBubbleTimerId);
    appState.chatBubbleTimerId = null;
  }

  appState.playerId = null;
  appState.room = null;
  appState.serverState = null;
  appState.selectedCardNumber = null;
  appState.pendingSubmit = false;
  appState.transientStatus = "";
  appState.roomStatus = "?뚮젅?댁뼱瑜?湲곕떎由щ뒗 以묒엯?덈떎.";
  appState.leaveGameModalOpen = false;
  appState.avatarEditorOpen = false;
  appState.avatarSaving = false;
  appState.leavingGame = false;
  appState.isRestoringSession = false;
  appState.resumeInFlight = false;
  appState.summaryOpen = false;
  appState.playLog = [];
  appState.processedLogIds = new Set();
  appState.enteringLogIds = new Set();
  appState.guidedPulseVariant = "a";
  resetHighlightState(appState);
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

function getPenaltyTier(penalty) {
  if (penalty >= 7) {
    return "disaster";
  }

  if (penalty >= 5) {
    return "danger";
  }

  if (penalty >= 3) {
    return "warning";
  }

  if (penalty >= 2) {
    return "caution";
  }

  return "safe";
}

function buildCleanupAnnouncement(step, cleanerName, roundNumber, turnNumber) {
  const seed = `${roundNumber}-${turnNumber}-${step?.playerId ?? ""}-${step?.card?.number ?? ""}-${step?.rowId ?? ""}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  const formatter =
    CLEANUP_ANNOUNCEMENT_BUILDERS[
      hash % CLEANUP_ANNOUNCEMENT_BUILDERS.length
    ] ?? CLEANUP_ANNOUNCEMENT_BUILDERS[0];
  return formatter(cleanerName);
}

function getPenaltyForCardNumber(number) {
  const normalizedNumber = Number(number);

  if (!Number.isInteger(normalizedNumber) || normalizedNumber < 1 || normalizedNumber > 104) {
    throw new Error(`Card number must be an integer between 1 and 104. Received: ${number}`);
  }

  if (normalizedNumber === 55) {
    return 7;
  }

  if (normalizedNumber % 11 === 0) {
    return 5;
  }

  if (normalizedNumber % 10 === 0) {
    return 3;
  }

  if (normalizedNumber % 5 === 0) {
    return 2;
  }

  return 1;
}

function normalizeCardVisualInput(cardOrNumber) {
  if (typeof cardOrNumber === "number" || typeof cardOrNumber === "string") {
    const number = Number(cardOrNumber);

    return {
      number,
      penalty: getPenaltyForCardNumber(number),
    };
  }

  const number = Number(cardOrNumber?.number);

  return {
    ...cardOrNumber,
    number,
    penalty: getPenaltyForCardNumber(number),
  };
}

function createBullIcon(tierOrClassName = "", className = "") {
  const resolvedClassName = className || tierOrClassName;
  const icon = createUiElement(
    "span",
    `material-symbols-outlined inline-flex items-center justify-center ${resolvedClassName}`.trim(),
    "pest_control"
  );
  icon.style.fontVariationSettings = "'FILL' 1";
  return icon;
}

function createPenaltyIconRow(penalty, isActive, isBottom = false) {
  const tier = getPenaltyTier(penalty);
  const iconSizeClass =
    penalty >= 7
      ? isActive
        ? "text-[10px] lg:text-[13px]"
        : "text-[10px] lg:text-[12px]"
      : penalty >= 5
        ? isActive
          ? "text-[11px] lg:text-[14px]"
          : "text-[10px] lg:text-[13px]"
        : isActive
          ? "text-[11px] lg:text-[15px]"
          : "text-[11px] lg:text-[14px]";
  const iconToneClassByTier = isActive
    ? {
        safe: "text-secondary-fixed",
        caution: "text-[#6e5a00]",
        warning: "text-[#8a3b00]",
        danger: "text-[#8b1e1e]",
        disaster: "text-[#160607]",
      }
      : {
          safe: "text-secondary",
          caution: "text-lime-300",
          warning: "text-orange-300",
          danger: "text-red-400",
          disaster: "text-[#160607]",
        };
  const createIcon = () => {
    const icon = createUiElement(
      "span",
      ["material-symbols-outlined", iconSizeClass].join(" "),
      "pest_control"
    );
    icon.style.fontVariationSettings = "'FILL' 1";
    return icon;
  };

  if (penalty === 7) {
    const wrapper = createUiElement(
      "div",
      [
        "flex flex-col items-center gap-[1px] leading-none",
        iconToneClassByTier[tier],
        isBottom ? "rotate-180" : "",
      ]
        .filter(Boolean)
        .join(" ")
    );
    const firstRow = createUiElement("div", "flex items-center justify-center gap-0.5");
    const secondRow = createUiElement("div", "flex items-center justify-center gap-0.5");

    for (let count = 0; count < 4; count += 1) {
      firstRow.appendChild(createIcon());
    }

    for (let count = 0; count < 3; count += 1) {
      secondRow.appendChild(createIcon());
    }

    wrapper.append(firstRow, secondRow);
    return wrapper;
  }

  const row = createUiElement(
    "div",
    [
      "flex gap-0.5",
      iconToneClassByTier[tier],
      isBottom ? "rotate-180" : "",
    ]
      .filter(Boolean)
      .join(" ")
  );

  for (let count = 0; count < penalty; count += 1) {
    row.appendChild(createIcon());
  }

  return row;
}

function createTableCard(card, rotateClass = "") {
  const normalizedCard = normalizeCardVisualInput(card);
  const tier = getPenaltyTier(normalizedCard.penalty);
  const glowClass =
    tier === "danger" ? "card-glow-danger" : tier === "disaster" ? "card-glow-disaster" : "";
  const tableCardPaletteByTier = {
    safe: {
      container:
        "bg-gradient-to-b from-surface-bright to-surface-container-highest border-outline-variant/15 shadow-[0_8px_32px_-4px_rgba(204,235,201,0.08)]",
      number: "text-on-surface",
    },
    caution: {
      container:
        "bg-gradient-to-b from-surface-bright to-surface-container-highest border-lime-300/55 shadow-[0_10px_34px_-8px_rgba(163,230,53,0.18)]",
      number: "text-lime-200",
    },
    warning: {
      container:
        "bg-gradient-to-b from-surface-bright to-surface-container-highest border-orange-400/60 shadow-[0_10px_34px_-8px_rgba(251,146,60,0.2)]",
      number: "text-orange-200",
    },
    danger: {
      container:
        "bg-gradient-to-b from-surface-bright to-surface-container-highest border-red-400/65 shadow-[0_12px_36px_-10px_rgba(248,113,113,0.24)]",
      number: "text-red-200",
    },
    disaster: {
      container:
        "bg-gradient-to-b from-[#7f1d1d] via-[#991b1b] to-[#450a0a] border-red-300/65 shadow-[0_14px_40px_-10px_rgba(239,68,68,0.38)]",
      number: "text-red-50",
    },
  };
  const palette = tableCardPaletteByTier[tier];
  const cardElement = createUiElement(
    "div",
    [
      "table-card",
      "w-12 h-16 lg:w-[4.5rem] lg:h-[6.35rem] rounded-xl border flex flex-col justify-between items-center py-1 lg:py-1.5",
      palette.container,
      glowClass,
      rotateClass,
    ]
      .filter(Boolean)
      .join(" ")
  );

  cardElement.dataset.penaltyTier = tier;
  cardElement.dataset.penalty = String(normalizedCard.penalty);
  cardElement.append(
    createPenaltyIconRow(normalizedCard.penalty, false, false),
    createUiElement(
      "span",
      `mt-auto mb-[0.16rem] lg:mb-[0.26rem] translate-y-[0.06rem] lg:translate-y-[0.1rem] font-headline font-bold text-lg lg:text-[1.55rem] ${palette.number}`,
      String(normalizedCard.number)
    )
  );
  return cardElement;
}

function createHandCard(card, options = {}) {
  const normalizedCard = normalizeCardVisualInput(card);
  const tier = getPenaltyTier(normalizedCard.penalty);
  const glowClass =
    tier === "danger" ? "card-glow-danger" : tier === "disaster" ? "card-glow-disaster" : "";
  const handCardPaletteByTier = {
    safe: {
      idle:
        "bg-gradient-to-b from-surface-bright to-surface-container-highest border-outline-variant/15 shadow-[0_8px_32px_-4px_rgba(204,235,201,0.08)]",
      idleNumber: "text-on-surface",
      active:
        "bg-gradient-to-b from-[#5a66d6] via-[#4553c2] to-[#333a8f] border-secondary-fixed/65 shadow-[0_0_18px_rgba(99,102,241,0.42),0_0_34px_rgba(168,85,247,0.26)]",
      activeNumber: "text-secondary-fixed",
    },
    caution: {
      idle:
        "bg-gradient-to-b from-surface-bright to-surface-container-highest border-lime-300/55 shadow-[0_10px_34px_-8px_rgba(163,230,53,0.18)]",
      idleNumber: "text-lime-200",
      active:
        "bg-gradient-to-b from-[#f8f29b] to-[#b5d748] border-lime-100/60 shadow-[0_16px_40px_-8px_rgba(163,230,53,0.35)]",
      activeNumber: "text-[#495400]",
    },
    warning: {
      idle:
        "bg-gradient-to-b from-surface-bright to-surface-container-highest border-orange-400/60 shadow-[0_10px_34px_-8px_rgba(251,146,60,0.2)]",
      idleNumber: "text-orange-200",
      active:
        "bg-gradient-to-b from-[#ffd089] to-[#ff8a3d] border-orange-100/65 shadow-[0_16px_40px_-8px_rgba(251,146,60,0.38)]",
      activeNumber: "text-[#6f2c00]",
    },
    danger: {
      idle:
        "bg-gradient-to-b from-surface-bright to-surface-container-highest border-red-400/65 shadow-[0_12px_36px_-10px_rgba(248,113,113,0.24)]",
      idleNumber: "text-red-200",
      active:
        "bg-gradient-to-b from-[#ff9a9a] to-[#d93636] border-red-100/70 shadow-[0_18px_44px_-8px_rgba(239,68,68,0.42)]",
      activeNumber: "text-[#5a0606]",
    },
    disaster: {
      idle:
        "bg-gradient-to-b from-[#7f1d1d] via-[#991b1b] to-[#450a0a] border-red-300/65 shadow-[0_14px_40px_-10px_rgba(239,68,68,0.38)]",
      idleNumber: "text-red-50",
      active:
        "bg-gradient-to-b from-[#ef4444] via-[#dc2626] to-[#7f1d1d] border-red-100/75 shadow-[0_20px_48px_-8px_rgba(220,38,38,0.5)]",
      activeNumber: "text-red-50",
    },
  };
  const palette = handCardPaletteByTier[tier];
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
    ? selected
      ? "w-[2.9rem] h-[4.25rem] lg:w-[3.9rem] lg:h-[5.8rem]"
      : "w-10 h-14 lg:w-[3.5rem] lg:h-[5rem]"
    : selected
      ? "w-[3.25rem] h-[4.85rem] lg:w-[5.15rem] lg:h-[7.7rem]"
      : "w-12 h-16 lg:w-[4.5rem] lg:h-[6.35rem]";
  const cardElement = createUiElement(
    "button",
    [
      compact ? "reveal-card" : "hand-card",
      sizeClass,
      "rounded-xl flex flex-col justify-between items-center border relative overflow-hidden",
      glowClass,
      selected
        ? `${palette.active} py-1 lg:py-1.5 z-20 cursor-pointer`
        : `${palette.idle} py-1 lg:py-1.5 z-10 cursor-pointer`,
      highlighted && !selected ? "ring-2 ring-primary/70" : "",
      dimmed ? "opacity-45" : "",
    ]
      .filter(Boolean)
      .join(" ")
  );

  cardElement.type = "button";
  cardElement.dataset.cardNumber = String(normalizedCard.number);
  cardElement.dataset.penaltyTier = tier;
  cardElement.dataset.penalty = String(normalizedCard.penalty);

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
    createPenaltyIconRow(normalizedCard.penalty, selected, false),
    createUiElement(
      "span",
      selected
        ? `mt-auto mb-[0.18rem] lg:mb-[0.28rem] translate-y-[0.06rem] lg:translate-y-[0.1rem] font-headline font-bold text-lg lg:text-[1.65rem] ${palette.activeNumber}`
        : `mt-auto mb-[0.16rem] lg:mb-[0.24rem] translate-y-[0.06rem] lg:translate-y-[0.1rem] font-headline font-bold text-base lg:text-[1.45rem] ${palette.idleNumber}`,
      String(normalizedCard.number)
    )
  );

  return cardElement;
}

function createHiddenPendingCard() {
  const cardElement = createUiElement(
    "div",
    "reveal-card w-10 h-14 lg:w-[3.5rem] lg:h-[5rem] rounded-xl border border-outline-variant/20 bg-gradient-to-b from-surface-container-highest to-surface-container-lowest shadow-[0_10px_28px_-8px_rgba(0,0,0,0.45)] relative flex items-center justify-center"
  );
  cardElement.appendChild(
    createUiElement(
      "span",
      "font-headline text-lg lg:text-xl font-black text-primary/75",
      "?"
    )
  );
  return cardElement;
}

function createEmptySlot(isNextSlot) {
  if (isNextSlot) {
    const slot = createUiElement(
      "div",
      "w-11 h-14 sm:w-12 sm:h-16 lg:w-[4rem] lg:h-[5.6rem] rounded-xl border-2 border-primary/40 border-dashed bg-primary/10 flex items-center justify-center relative"
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
    "w-11 h-14 sm:w-12 sm:h-16 lg:w-[4rem] lg:h-[5.6rem] rounded-xl border-2 border-outline-variant/20 border-dashed opacity-50"
  );
}

function createDangerSlot(isActive) {
  const slot = createUiElement(
    "div",
    isActive
      ? "w-11 h-14 sm:w-12 sm:h-16 lg:w-[4rem] lg:h-[5.6rem] rounded-xl bg-error-container/20 border-2 border-error/50 border-dashed flex items-center justify-center animate-pulse relative overflow-hidden shadow-[0_0_15px_rgba(255,180,171,0.3)]"
      : "w-11 h-14 sm:w-12 sm:h-16 lg:w-[4rem] lg:h-[5.6rem] rounded-xl border-2 border-error-container/30 border-dashed bg-error-container/5 flex items-center justify-center relative overflow-hidden"
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

function createCleanupActor(label) {
  const actor = createUiElement("div", "cleanup-actor");
  actor.dataset.cleanerLabel = label;
  return actor;
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
    playedCardLabelsByNumber: new Map(),
    playedCardLabelTurn: null,
    highlightedRowIds: [],
    cleanedRowIds: [],
    cleanupAnnouncement: "",
    summaryOpen: false,
    highlightTimerId: null,
    processedLogIds: new Set(),
    enteringLogIds: new Set(),
    guidedPulseVariant: "a",
    chatBubbleTimerId: null,
    avatarEditorOpen: false,
    avatarDraft: normalizeAvatar(DEFAULT_AVATAR),
    avatarSaving: false,
    leavingGame: false,
    isRestoringSession: false,
    resumeInFlight: false,
    leaveGameModalOpen: false,
  };
}

function getUiElements() {
  return {
    app: document.querySelector("[data-game-app]"),
    mainContent: document.getElementById("main-content"),
    gameLogSidebar: document.getElementById("game-log-sidebar"),
    gameSidebar: document.getElementById("game-sidebar"),
    brandRefreshButton: document.getElementById("brand-refresh-button"),
    connectionBadge: document.getElementById("connection-badge"),
    leaveGameButton: document.getElementById("leave-game-button"),
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
    cleanupAnnouncement: document.getElementById("cleanup-announcement"),
    handPanel:
      document.getElementById("hand-panel") ??
      document.getElementById("player-hand")?.closest("section") ??
      null,
    playerHand: document.getElementById("player-hand"),
    currentTurnCards: document.getElementById("current-turn-cards"),
    submitButton: document.getElementById("submit-card-button"),
    restartButton: document.getElementById("restart-round-button"),
    roundIndicator: document.getElementById("round-indicator"),
    turnNotice: document.getElementById("turn-notice"),
    statusMessage: document.getElementById("status-message"),
    playerPenaltyPoints: document.getElementById("player-penalty-points"),
    phaseIndicator: document.getElementById("phase-indicator"),
    deckCount: document.getElementById("deck-count"),
    selectionIndicator: document.getElementById("selection-indicator"),
    submissionStatusList: document.getElementById("submission-status-list"),
    chatMessages: document.getElementById("chat-messages"),
    chatInput: document.getElementById("chat-input"),
    chatSendButton: document.getElementById("chat-send-button"),
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
    leaveGameModal: document.getElementById("leave-game-modal"),
    closeLeaveGameModalButton: document.getElementById("close-leave-game-modal-button"),
    cancelLeaveGameButton: document.getElementById("cancel-leave-game-button"),
    confirmLeaveGameButton: document.getElementById("confirm-leave-game-button"),
    staticBullIcons: Array.from(document.querySelectorAll("[data-static-bull-icon]")),
  };
}

function hydrateStaticBullIcons(elements) {
  elements.staticBullIcons.forEach((target) => {
    target.innerHTML = "";
    target.appendChild(createBullIcon("text-current"));
  });
}

function syncSectionLabels(elements) {
  const revealSection = elements.currentTurnCards?.parentElement;
  const revealHeading = revealSection?.querySelector("h3");
  const revealCaption = revealSection?.querySelector("span.text-xs");
  if (revealHeading) {
    revealHeading.textContent = "카드공개";
  }
  if (revealCaption) {
    revealCaption.textContent = "이번 턴에 공개된 카드만 표시됩니다.";
  }

  const logSection = elements.playLog?.parentElement;
  const logHeading = logSection?.querySelector("h3");
  const logCaption = logSection?.querySelector("span.text-xs");
  if (logHeading) {
    logHeading.textContent = "카드 로그";
  }
  if (logCaption) {
    logCaption.textContent = "최근 카드 로그는 최대 4개까지만 표시됩니다.";
  }
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

function getChatCreatedAt(entry) {
  const createdAt = Number(entry?.createdAt);
  return Number.isFinite(createdAt) ? createdAt : 0;
}

function getLatestChatByPlayer(appState, now = Date.now()) {
  const latestChatByPlayer = new Map();
  const chatMessages = Array.isArray(appState.room?.chatMessages) ? appState.room.chatMessages : [];

  for (const entry of chatMessages) {
    if (!entry?.playerId || entry.isSystem || !entry.message) {
      continue;
    }

    const age = now - getChatCreatedAt(entry);
    if (age < 0 || age >= CHAT_BUBBLE_TTL_MS) {
      continue;
    }

    latestChatByPlayer.set(entry.playerId, entry);
  }

  return latestChatByPlayer;
}

function scheduleChatBubbleExpiry(appState, rerender) {
  if (typeof window === "undefined") {
    return;
  }

  if (appState.chatBubbleTimerId) {
    window.clearTimeout(appState.chatBubbleTimerId);
    appState.chatBubbleTimerId = null;
  }

  const now = Date.now();
  const chatMessages = Array.isArray(appState.room?.chatMessages) ? appState.room.chatMessages : [];
  let nextDelay = Number.POSITIVE_INFINITY;

  for (const entry of chatMessages) {
    if (!entry?.playerId || entry.isSystem || !entry.message) {
      continue;
    }

    const age = now - getChatCreatedAt(entry);
    if (age >= 0 && age < CHAT_BUBBLE_TTL_MS) {
      nextDelay = Math.min(nextDelay, CHAT_BUBBLE_TTL_MS - age + 30);
    }
  }

  if (Number.isFinite(nextDelay)) {
    appState.chatBubbleTimerId = window.setTimeout(() => {
      appState.chatBubbleTimerId = null;
      rerender();
    }, nextDelay);
  }
}

function createProfileChatBubble(chatEntry, isSelf) {
  const bubble = createUiElement(
    "div",
    [
      "profile-chat-bubble",
      isSelf ? "profile-chat-bubble-self" : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
  bubble.textContent = chatEntry.message;
  bubble.title = chatEntry.message;
  return bubble;
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

function hydrateFromStoredSession(appState, storedSession) {
  if (!storedSession?.playerId || !storedSession?.roomCode) {
    return;
  }

  appState.playerId = storedSession.playerId;
  appState.room = storedSession.room ?? {
    roomCode: storedSession.roomCode,
  };
  appState.serverState = storedSession.serverState ?? null;
  appState.playLog = (Array.isArray(storedSession.playLog) ? storedSession.playLog : []).slice(0, 4);
  appState.selectedCardNumber =
    typeof storedSession.selectedCardNumber === "number"
      ? storedSession.selectedCardNumber
      : null;
  appState.processedLogIds = new Set(
    Array.isArray(storedSession.processedLogIds)
      ? storedSession.processedLogIds
      : appState.playLog.map((entry) => entry?.id).filter(Boolean)
  );
  appState.isRestoringSession = true;
  appState.lobbyStatus = "진행 중인 게임 세션을 복구 중입니다.";
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

  if (elements.leaveGameButton) {
    const canLeave = Boolean(appState.room || appState.serverState);
    elements.leaveGameButton.classList.toggle("hidden", !canLeave);
  }
}

function renderLobby(appState, elements) {
  elements.lobbyStatus.textContent = appState.lobbyStatus;
}

function createRoomPlayerBadge(player, isHost, isSelf, canEdit) {
  const isReconnecting = Boolean(!player.isBot && player.connected === false);
  const card = createUiElement(
    isSelf && canEdit ? "button" : "div",
    [
      "rounded-[1.25rem] border border-outline-variant/15 bg-surface-container-lowest/70 px-4 py-4 flex items-center justify-between gap-4",
      isSelf && canEdit ? "transition-transform active:scale-[0.98]" : "",
      isReconnecting ? "opacity-70" : "",
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
      player.isBot ? "Bot Player" : isReconnecting ? "재접속 대기 중" : "Human Player"
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
    name.textContent = player.connected === false ? `${player.nickname} (재접속 대기)` : player.nickname;
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
  const canChooseRow = Boolean(manualChoice?.isChooser && !state.reconnectPause?.paused);
  const allowedRowIds = new Set(manualChoice?.allowedRowIds ?? []);
  const guidedPulseClass = `guided-pulse-${appState.guidedPulseVariant ?? "a"}`;

  elements.boardRows.innerHTML = "";

  state.rows.forEach((row) => {
    const rowPenaltyTotal = row.cards.reduce((total, card) => total + (card.penalty ?? 0), 0);
    const isCleanupRow = appState.cleanedRowIds.includes(row.id);
    const rowClasses = [
      "flex items-center gap-1.5 lg:gap-3 bg-surface-container-low p-2 lg:p-3 rounded-[1.75rem] w-full relative border border-outline-variant/5 shadow-inner",
    ];

    if (appState.highlightedRowIds.includes(row.id)) {
      rowClasses.push("row-capture-flash");
    }

    if (isCleanupRow) {
      rowClasses.push("row-cleanup-sweep");
    }

    if (canChooseRow && allowedRowIds.has(row.id)) {
      rowClasses.push("row-selectable");
    }

    const shouldGuideRow =
      manualChoice?.recommendedRowId === row.id ||
      (canChooseRow && manualChoice?.reason === "small-card-choice" && allowedRowIds.has(row.id));

    if (shouldGuideRow) {
      rowClasses.push("row-guided", guidedPulseClass);
    }

    const rowElement = createUiElement("div", rowClasses.join(" "));
    rowElement.dataset.rowId = String(row.id);
    rowElement.dataset.cleanerLabel = appState.cleanedRowIds.includes(row.id)
      ? appState.cleanupAnnouncement
      : "";

    const rowPenaltyBadge = createUiElement(
      "div",
      "absolute right-3 top-2 z-10 rounded-full border border-outline-variant/20 bg-surface-container-highest/95 px-3.5 py-2 text-[15px] lg:text-[17px] font-black text-primary flex items-center gap-2 shadow-[0_12px_28px_-14px_rgba(0,0,0,0.65)]"
    );
    rowPenaltyBadge.append(
      createBullIcon("text-current text-[17px] lg:text-[19px]"),
      document.createTextNode(String(rowPenaltyTotal))
    );
    rowElement.appendChild(rowPenaltyBadge);

    row.cards.forEach((card, index) => {
      const cardElement = createTableCard(card, rotations[index % rotations.length]);
      const playerName = appState.playedCardLabelsByNumber.get(card.number);

      if (playerName) {
        const label = createUiElement("span", "played-card-label", playerName);
        label.title = playerName;
        cardElement.appendChild(label);
      }

      if (appState.recentPlayedNumbers.includes(card.number)) {
        cardElement.classList.add("recent-card-enter");

        if (card.penalty <= 3) {
          cardElement.classList.add("card-light-enter");
        }

        if (card.penalty >= 7) {
          cardElement.classList.add("card-slam-enter-disaster");
        } else if (card.penalty >= 5) {
          cardElement.classList.add("card-slam-enter");
        }
      }

      rowElement.appendChild(cardElement);
    });

    if (isCleanupRow && appState.cleanupAnnouncement) {
      rowElement.appendChild(createCleanupActor(appState.cleanupAnnouncement));
    }

    for (let index = row.cards.length; index < 5; index += 1) {
      rowElement.appendChild(createEmptySlot(index === row.cards.length));
    }

    rowElement.appendChild(createDangerSlot(row.cards.length >= 5));
    elements.boardRows.appendChild(rowElement);
  });
}

function renderCleanupAnnouncement(appState, elements) {
  if (!elements.cleanupAnnouncement) {
    return;
  }

  elements.cleanupAnnouncement.textContent = "";
  elements.cleanupAnnouncement.classList.add("hidden");
  elements.cleanupAnnouncement.classList.remove("cleanup-announcement-enter");
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

  const wrap = createUiElement("div", "flex flex-wrap items-end gap-2 lg:gap-2.5");

  pendingResolution.orderedCards.forEach((entry, index) => {
    const isResolved = index < pendingResolution.currentStepIndex;
    const isActive = index === pendingResolution.currentStepIndex;
    const item = createUiElement(
      "div",
      [
        "flex flex-col items-center gap-1.5 rounded-2xl border border-outline-variant/15 px-2.5 py-2 transition-all",
        isActive ? "bg-primary/10 shadow-[0_0_16px_rgba(255,181,159,0.18)]" : "bg-surface-container-lowest/70",
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
        "text-[11px] font-bold tracking-wide text-on-surface-variant",
        getPlayerName(state, entry.playerId)
      )
    );
    wrap.appendChild(item);
  });

  elements.currentTurnCards.appendChild(wrap);
}

function renderPlayerHand(state, appState, elements) {
  const currentPlayer = getCurrentPlayer(state, appState.playerId);
  const submittedCardNumber = state.round.selectedCardsByPlayer?.[appState.playerId]?.number ?? null;
  const hiddenSubmittedCardNumber = appState.pendingSubmit
    ? appState.selectedCardNumber
    : submittedCardNumber;
  const hand = [...(currentPlayer?.hand ?? [])]
    .filter((card) => card.number !== hiddenSubmittedCardNumber)
    .sort((left, right) => left.number - right.number);
  const isResolving = Boolean(state.round.pendingResolution);
  const isChoosingRow = Boolean(state.manualChoice);
  const isReconnectPaused = Boolean(state.reconnectPause?.paused);
  const submittedOrPending =
    Boolean(state.round.selectedCardsByPlayer?.[appState.playerId]) || appState.pendingSubmit;

  elements.playerHand.innerHTML = "";

  hand.forEach((card) => {
    elements.playerHand.appendChild(
      createHandCard(card, {
        selected: appState.selectedCardNumber === card.number,
        rotate: 0,
        offset: 0,
        overlap: 0,
        disabled:
          isReconnectPaused ||
          isResolving ||
          isChoosingRow ||
          submittedOrPending ||
          state.round.phase === "finished",
      })
    );
  });
}

function renderPlayerStatePanel(state, appState, elements) {
  if (!elements.submissionStatusList) {
    return;
  }

  const statuses = state.submissionStatus ?? [];
  elements.submissionStatusList.innerHTML = "";

  if (!statuses.length || !Array.isArray(state.players)) {
    elements.submissionStatusList.appendChild(
      createUiElement(
        "div",
        "rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/60 px-4 py-3 text-sm text-on-surface-variant",
        "?꾩쭅 ?쒖텧 ?뺣낫媛 ?놁뒿?덈떎."
      )
    );
    return;
  }

  const statusByPlayerId = new Map(statuses.map((entry) => [entry.playerId, entry]));
  const orderedPlayers = [
    ...state.players.filter((player) => player.id === appState.playerId),
    ...state.players.filter((player) => player.id !== appState.playerId),
  ];
  const latestChatByPlayer = getLatestChatByPlayer(appState);

  orderedPlayers.forEach((player, index) => {
    const entry = statusByPlayerId.get(player.id) ?? {
      playerId: player.id,
      nickname: player.nickname,
      isBot: player.isBot,
      submitted: false,
      waitingForPlacement: false,
      connected: player.connected !== false,
      reconnecting: Boolean(player.reconnecting || player.connected === false),
    };
    const isSelf = player.id === appState.playerId;
    const latestChat = latestChatByPlayer.get(player.id);
    const penaltyPoints = getDisplayPenaltyPoints(player, state.round);
    const submitted = isSelf ? entry.submitted || appState.pendingSubmit : entry.submitted;
    const reconnecting = Boolean(entry.reconnecting || player.reconnecting || player.connected === false);
    const badgeClass = reconnecting
      ? "border-error-container/25 bg-error-container/10 text-error"
      : entry.waitingForPlacement
      ? "border-primary/25 bg-primary/10 text-primary"
      : submitted
        ? "border-secondary/25 bg-secondary/10 text-secondary"
        : "border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant";
    const badgeText = reconnecting
      ? "재접속 대기"
      : entry.waitingForPlacement
      ? "행 선택 중"
      : submitted
        ? "제출 완료"
        : "고민 중";

    const row = createUiElement(
      "div",
      [
        "rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/65 px-3 py-3",
        "flex items-start justify-between gap-3",
        isSelf ? "ring-1 ring-primary/25" : "",
      ]
        .filter(Boolean)
        .join(" ")
    );

    const left = createUiElement("div", "min-w-0 flex flex-1 items-start gap-3");
    const avatarWrap = createUiElement("div", "h-10 w-10 shrink-0");
    avatarWrap.appendChild(
      player.isBot
        ? createBotAvatarElement(index, "h-10 w-10")
        : createAvatarElement(player.avatar, { sizeClass: "h-10 w-10" })
    );

    const textWrap = createUiElement("div", "min-w-0 flex-1");
    const titleRow = createUiElement("div", "flex items-center gap-2");
    titleRow.appendChild(
      createUiElement(
        "span",
        "truncate font-headline text-sm font-black text-on-surface",
        player.nickname
      )
    );

    if (isSelf) {
      titleRow.appendChild(
        createUiElement(
          "span",
          "rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-primary",
          "YOU"
        )
      );
    }

    const meta = createUiElement("div", "mt-1");
    const penaltyMeta = createUiElement(
      "span",
      "inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-black text-primary shadow-[0_8px_18px_-14px_rgba(255,112,67,0.5)]"
    );
    penaltyMeta.append(
      createBullIcon("text-primary text-[16px]"),
      createUiElement("span", "text-[15px] leading-none", String(penaltyPoints))
    );
    textWrap.append(titleRow, meta);
    meta.append(penaltyMeta);
    if (latestChat) {
      textWrap.appendChild(createProfileChatBubble(latestChat, isSelf));
    }
    left.append(avatarWrap, textWrap);

    const right = createUiElement("div", "shrink-0 flex flex-col items-end gap-2");
    right.appendChild(
      createUiElement(
        "span",
        `inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] leading-none font-black ${badgeClass}`,
        badgeText
      )
    );

    row.append(left, right);
    elements.submissionStatusList.appendChild(row);
  });
}

function renderChatPanel(appState, elements) {
  if (!elements.chatMessages || !elements.chatInput || !elements.chatSendButton) {
    return;
  }

  const chatMessages = Array.isArray(appState.room?.chatMessages) ? appState.room.chatMessages : [];
  const visibleChatMessages = chatMessages.slice(-CHAT_PANEL_VISIBLE_MESSAGES);
  elements.chatMessages.innerHTML = "";

  if (!visibleChatMessages.length) {
    elements.chatMessages.appendChild(
      createUiElement(
        "div",
        "rounded-2xl border border-outline-variant/15 bg-surface-container-high/40 px-3 py-3 text-sm text-on-surface-variant",
        "아직 채팅이 없습니다."
      )
    );
  } else {
    visibleChatMessages.forEach((entry) => {
      const item = createUiElement(
        "div",
        "rounded-2xl border border-outline-variant/10 bg-surface-container-high/35 px-3 py-2.5 mb-2 last:mb-0"
      );
      const authorRow = createUiElement("div", "flex items-center justify-between gap-2");
      const name = createUiElement(
        "span",
        entry.playerId === appState.playerId
          ? "text-xs font-black text-primary"
          : "text-xs font-black text-on-surface",
        entry.nickname || "Player"
      );
      const time = createUiElement(
        "span",
        "text-[11px] text-on-surface-variant/70",
        entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""
      );
      const message = createUiElement("p", "mt-1 text-sm leading-5 text-on-surface break-words", entry.message || "");
      authorRow.append(name, time);
      item.append(authorRow, message);
      elements.chatMessages.appendChild(item);
    });
  }

  elements.chatSendButton.disabled = !appState.room?.roomCode;
  elements.chatInput.disabled = !appState.room?.roomCode;
}

function buildStatusMessage(state, appState) {
  if (appState.transientStatus) {
    return appState.transientStatus;
  }

  if (state.reconnectPause?.paused) {
    return state.reconnectPause.message || "플레이어의 연결이 끊겼습니다. 재접속을 기다립니다.";
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

  return "제출할 카드를 한 번 클릭하세요.";
}

function renderStatus(state, appState, elements) {
  const currentPlayer = getCurrentPlayer(state, appState.playerId);
  const displayedTurn = Math.min(state.round.turn + 1, 10);
  const submitted = Boolean(state.round.selectedCardsByPlayer?.[appState.playerId]);
  const submittedOrPending = submitted || appState.pendingSubmit;
  const isResolving = Boolean(state.round.pendingResolution);
  const isChoosingRow = Boolean(state.manualChoice?.isChooser);
  const isReconnectPaused = Boolean(state.reconnectPause?.paused);
  const isMyTurnActionable =
    Boolean(currentPlayer) &&
    state.round.phase !== "finished" &&
    isChoosingRow &&
    !isReconnectPaused;
  const shouldShowTurnNotice = isChoosingRow && !isReconnectPaused;

  elements.roundIndicator.textContent = `Round ${state.round.number} • Turn ${displayedTurn} / 10`;
  elements.statusMessage.textContent = buildStatusMessage(state, appState);
  elements.playerPenaltyPoints.textContent = String(
    getDisplayPenaltyPoints(currentPlayer, state.round)
  );
  elements.phaseIndicator.textContent = state.round.phase;
  elements.deckCount.textContent = String(state.deck.length);
  elements.selectionIndicator.textContent = isReconnectPaused
    ? "재접속 대기"
    : isChoosingRow
      ? "행 선택"
    : isResolving
      ? "처리 중"
      : submittedOrPending
        ? "제출 완료"
        : "카드 클릭";

  elements.submitButton.hidden = true;
  elements.submitButton.disabled = true;
  elements.restartButton.disabled =
    !appState.room ||
    appState.room.hostPlayerId !== appState.playerId ||
    isReconnectPaused ||
    isResolving ||
    Boolean(state.manualChoice);

  if (elements.turnNotice) {
    elements.turnNotice.textContent = "당신 차례입니다";
    elements.turnNotice.classList.toggle("hidden", !shouldShowTurnNotice);
  }

  if (elements.handPanel) {
    elements.handPanel.classList.remove("hand-deck-guided", "guided-pulse-a", "guided-pulse-b");

    if (isMyTurnActionable) {
      elements.handPanel.classList.add(
        "hand-deck-guided",
        `guided-pulse-${appState.guidedPulseVariant ?? "a"}`
      );
    }
  }
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

function renderLeaveGameModal(appState, elements) {
  if (!elements.leaveGameModal) {
    return;
  }

  if (appState.leaveGameModalOpen) {
    elements.leaveGameModal.classList.remove("hidden");
    elements.leaveGameModal.classList.add("flex");
  } else {
    elements.leaveGameModal.classList.add("hidden");
    elements.leaveGameModal.classList.remove("flex");
  }

  if (elements.confirmLeaveGameButton) {
    elements.confirmLeaveGameButton.disabled = Boolean(appState.leavingGame);
  }

  if (elements.cancelLeaveGameButton) {
    elements.cancelLeaveGameButton.disabled = Boolean(appState.leavingGame);
  }

  if (elements.closeLeaveGameModalButton) {
    elements.closeLeaveGameModalButton.disabled = Boolean(appState.leavingGame);
  }
}

function renderPlayLog(appState, elements) {
  elements.playLog.innerHTML = "";
  const enteringLogIds = appState.enteringLogIds ?? new Set();

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
    const accentClass =
      entry.placement === "captured-full-row" || entry.placement === "replaced-smallest"
        ? "border-primary/30 bg-primary/10 text-primary"
        : "border-outline-variant/20 bg-surface-container-high text-on-surface-variant";
    const accentText =
      entry.placement === "captured-full-row"
        ? "줄 획득"
        : entry.placement === "replaced-smallest"
          ? "강제 선택"
          : "배치 완료";
    const card = createUiElement(
      "article",
      [
        "rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/65 px-4 py-3 shadow-[0_10px_26px_-18px_rgba(0,0,0,0.55)]",
        enteringLogIds.has(entry.id) ? "log-entry-enter" : "",
      ]
        .filter(Boolean)
        .join(" ")
    );
    const top = createUiElement("div", "flex items-start justify-between gap-3");
    const left = createUiElement("div", "min-w-0");
    left.append(
      createUiElement("div", "text-[11px] font-black uppercase tracking-[0.22em] text-primary/70", entry.playerName),
      createUiElement("div", "mt-1 flex items-center gap-2 flex-wrap", "")
    );
    const meta = left.lastChild;
    meta.append(
      createUiElement(
        "span",
        "rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-headline font-black text-primary",
        `#${entry.cardNumber}`
      ),
      createUiElement(
        "span",
        "rounded-full border border-outline-variant/20 bg-surface-container-high px-3 py-1 text-xs font-black text-on-surface",
        `${entry.rowId}번 줄`
      ),
      createUiElement(
        "span",
        `rounded-full border px-3 py-1 text-xs font-black ${accentClass}`,
        accentText
      )
    );

    const right = createUiElement("div", "shrink-0 rounded-full bg-surface-container-highest px-2.5 py-1 text-[11px] font-bold text-on-surface-variant");
    right.textContent = `${index + 1}`;

    const message = createUiElement("p", "mt-2 text-sm leading-6 text-on-surface-variant", entry.message);
    if (entry.penaltyPointsGained > 0) {
      message.appendChild(
        createUiElement(
          "span",
          "ml-2 inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-black text-primary",
          `+${entry.penaltyPointsGained}`
        )
      );
    }
    top.append(left, right);
    card.append(top, message);
    elements.playLog.appendChild(card);
  });

  enteringLogIds.clear();
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
  const shouldGuideHandDeck = Boolean(state.manualChoice?.isChooser && !state.reconnectPause?.paused);

  if (shouldGuideHandDeck) {
    appState.guidedPulseVariant = appState.guidedPulseVariant === "a" ? "b" : "a";
  } else {
    appState.guidedPulseVariant = "a";
  }

  renderOpponentHud(state, appState, elements);
  renderBoardRows(state, appState, elements);
  renderCleanupAnnouncement(appState, elements);
  renderCurrentTurnCards(state, elements);
  renderPlayerHand(state, appState, elements);
  renderStatus(state, appState, elements);
  renderSelfProfile(appState, elements);
  renderPlayerStatePanel(state, appState, elements);
  renderChatPanel(appState, elements);
  renderPlayLog(appState, elements);
  renderRoundSummary(state, appState, elements);
}

function renderApp(appState, elements) {
  syncSectionLabels(elements);
  renderConnectionBadge(appState, elements);

  const showGame = Boolean(appState.serverState);
  const showRoom = !showGame && Boolean(appState.room);
  const showLobby = !showGame && !showRoom;

  elements.lobbyScreen.classList.toggle("hidden", !showLobby);
  elements.roomScreen.classList.toggle("hidden", !showRoom);
  elements.gameScreen.classList.toggle("hidden", !showGame);
  elements.gameLogSidebar?.classList.toggle("lg:block", showGame);
  elements.gameSidebar?.classList.toggle("lg:block", showGame);

  renderLobby(appState, elements);
  renderRoom(appState, elements);
  renderAvatarEditor(appState, elements);
  renderLeaveGameModal(appState, elements);

  if (showGame && appState.serverState) {
    renderGame(appState.serverState, appState, elements);
  } else {
    elements.modal.classList.add("hidden");
    elements.modal.classList.remove("flex");
  }
}

function resetHighlightState(appState) {
  appState.recentPlayedNumbers = [];
  appState.playedCardLabelsByNumber = new Map();
  appState.playedCardLabelTurn = null;
  appState.highlightedRowIds = [];
  appState.cleanedRowIds = [];
  appState.cleanupAnnouncement = "";

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
  appState.enteringLogIds = new Set();
  appState.guidedPulseVariant = "a";
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
    placement: step.placement,
    penaltyPointsGained: step.penaltyPointsGained ?? 0,
  };
}

function shouldTriggerCleanupMotion(step) {
  return step?.placement === "captured-full-row" || step?.placement === "replaced-smallest";
}

function applyStateDiff(appState, nextState) {
  if (!nextState?.round || !Array.isArray(nextState.players) || !Array.isArray(nextState.rows)) {
    return;
  }

  const previousState = appState.serverState;
  const previousResolvedCount = previousState?.round?.resolvedCards?.length ?? 0;
  const nextResolvedCards = nextState.round?.resolvedCards ?? [];
  const nextResolvedCount = nextResolvedCards.length;
  const turnChanged = Boolean(previousState) && previousState.round?.turn !== nextState.round.turn;
  const previousHadPendingResolution = Boolean(previousState?.round?.pendingResolution);
  const nextHasPendingResolution = Boolean(nextState.round.pendingResolution);
  const resolutionStarted = Boolean(previousState) && !previousHadPendingResolution && nextHasPendingResolution;
  const roundRestarted =
    !previousState ||
    previousState.round.number !== nextState.round.number ||
    (previousState.round.phase === "finished" && nextState.round.phase !== "finished");

  if (roundRestarted) {
    resetGameUiState(appState);
  } else if (resolutionStarted) {
    appState.playedCardLabelsByNumber = new Map();
    appState.playedCardLabelTurn = nextState.round.turn;
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
      appState.enteringLogIds.add(entry.id);
      appState.playLog = [entry, ...appState.playLog].slice(0, 4);
      appState.playedCardLabelsByNumber = new Map();
      appState.playedCardLabelTurn = turnChanged ? previousState.round.turn : nextState.round.turn;
      appState.playedCardLabelsByNumber.set(step.card.number, entry.playerName);
      freshSteps.push(step);
    });

    if (freshSteps.length) {
      const latestStep = freshSteps[freshSteps.length - 1];
      const cleanupTriggered = shouldTriggerCleanupMotion(latestStep);
      const cleanerName = getPlayerName(nextState, latestStep.playerId);

      appState.recentPlayedNumbers = [latestStep.card.number];
      appState.highlightedRowIds = latestStep.penaltyPointsGained > 0 ? [latestStep.rowId] : [];
      appState.cleanedRowIds = cleanupTriggered ? [latestStep.rowId] : [];
      appState.cleanupAnnouncement = cleanupTriggered
        ? buildCleanupAnnouncement(
            latestStep,
            cleanerName,
            nextState.round.number,
            nextState.round.turn
          )
        : "";

      if (appState.highlightTimerId) {
        window.clearTimeout(appState.highlightTimerId);
      }

      appState.highlightTimerId = window.setTimeout(() => {
        appState.recentPlayedNumbers = [];
        appState.highlightedRowIds = [];
        appState.cleanedRowIds = [];
        appState.cleanupAnnouncement = "";
        appState.highlightTimerId = null;
        renderApp(appState, getUiElements());
      }, cleanupTriggered ? 3200 : 850);
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

async function handleSubmitCard(appState, elements, cardNumber = appState.selectedCardNumber) {
  const normalizedCardNumber = Number(cardNumber);
  const state = appState.serverState;
  const alreadySubmitted = Boolean(state?.round?.selectedCardsByPlayer?.[appState.playerId]);

  if (
    !appState.room?.roomCode ||
    !state ||
    appState.pendingSubmit ||
    alreadySubmitted ||
    !Number.isInteger(normalizedCardNumber) ||
    normalizedCardNumber < 1 ||
    normalizedCardNumber > 104 ||
    Boolean(state.reconnectPause?.paused) ||
    Boolean(state.manualChoice) ||
    Boolean(state.round.pendingResolution) ||
    state.round.phase === "finished"
  ) {
    return;
  }

  appState.selectedCardNumber = normalizedCardNumber;
  appState.transientStatus = `${normalizedCardNumber}번 카드를 서버로 전송하는 중입니다.`;
  appState.pendingSubmit = true;
  renderApp(appState, elements);

  const response = await withAck(appState.socket, "submitCard", {
    roomCode: appState.room.roomCode,
    cardNumber: normalizedCardNumber,
  });

  if (!response.ok) {
    appState.pendingSubmit = false;
    appState.selectedCardNumber = null;
    appState.transientStatus = response.error || "카드 제출에 실패했습니다.";
    renderApp(appState, elements);
    return;
  }

  appState.pendingSubmit = false;
  appState.selectedCardNumber = null;
  appState.transientStatus = "";
  renderApp(appState, elements);
}

async function handleChooseRow(appState, elements, rowId) {
  if (
    !appState.room?.roomCode ||
    appState.serverState?.reconnectPause?.paused ||
    !appState.serverState?.manualChoice?.isChooser
  ) {
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

async function handleSendChat(appState, elements) {
  const message = elements.chatInput?.value?.trim();

  if (!appState.room?.roomCode || !message) {
    return;
  }

  if (!appState.socket?.connected) {
    appState.transientStatus = "채팅 서버 연결이 끊어져 있습니다.";
    renderApp(appState, elements);
    return;
  }

  const response = await withAck(appState.socket, "sendChatMessage", {
    roomCode: appState.room.roomCode,
    message,
  });

  if (!response.ok) {
    appState.transientStatus = response.error || "채팅 전송에 실패했습니다.";
    renderApp(appState, elements);
    return;
  }

  appState.transientStatus = "";
  elements.chatInput.value = "";
  renderApp(appState, elements);
}

async function handleResumeSession(appState, elements) {
  if (!appState.playerId || !appState.room?.roomCode || appState.resumeInFlight) {
    return;
  }

  appState.resumeInFlight = true;

  const response = await withAck(appState.socket, "resumeSession", {
    roomCode: appState.room.roomCode,
    playerId: appState.playerId,
  });

  if (!response.ok) {
    appState.resumeInFlight = false;
    clearActiveSession();
    appState.playerId = null;
    appState.room = null;
    appState.serverState = null;
    appState.isRestoringSession = false;
    appState.lobbyStatus = "저장된 세션을 복구하지 못했습니다. 다시 입장해 주세요.";
    renderApp(appState, elements);
    return;
  }

  appState.playerId = response.playerId;
  appState.room = response.room;
  appState.resumeInFlight = false;

  if (!response.room?.hasGameStarted) {
    appState.serverState = null;
    appState.isRestoringSession = false;
  }
  appState.lobbyStatus = "진행 중인 게임으로 다시 연결되었습니다.";
  renderApp(appState, elements);
}

function openLeaveGameModal(appState, elements) {
  appState.leavingGame = false;
  appState.leaveGameModalOpen = true;
  renderApp(appState, elements);
}

function closeLeaveGameModal(appState, elements) {
  appState.leavingGame = false;
  appState.leaveGameModalOpen = false;
  renderApp(appState, elements);
}

async function handleLeaveGame(appState, elements) {
  if (appState.leavingGame) {
    return;
  }

  appState.leavingGame = true;
  renderApp(appState, elements);

  const roomCode = appState.room?.roomCode;

  if (roomCode && appState.socket) {
    appState.socket.emit("leaveRoom", { roomCode }, () => {});
  }

  clearActiveSession();
  resetAppToLobby(appState);
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
  syncSectionLabels(elements);

  const appState = createAppState(socket);
  const storedSession = loadActiveSession();

  if (storedSession) {
    hydrateFromStoredSession(appState, storedSession);
  }

  hydrateStaticBullIcons(elements);

  const rerender = () => {
    renderApp(appState, elements);
    saveActiveSession(appState);
    scheduleChatBubbleExpiry(appState, rerender);
  };
  const persistSession = () => {
    saveActiveSession(appState);
  };

  window.addEventListener("pagehide", persistSession);
  window.addEventListener("beforeunload", persistSession);

  elements.brandRefreshButton?.addEventListener("click", () => {
    saveActiveSession(appState);
    window.location.reload();
  });

  socket.on("connect", () => {
    appState.connectionStatus = "connected";
    if (appState.playerId && appState.room?.roomCode) {
      // Socket.IO may reconnect with a new socket.id; re-bind it to the saved player id.
      appState.isRestoringSession = true;
      rerender();
      handleResumeSession(appState, elements);
      return;
    }

    appState.lobbyStatus = "서버에 연결되었습니다. 닉네임을 입력하고 시작하세요.";
    rerender();
  });

  socket.on("disconnect", () => {
    appState.connectionStatus = "disconnected";
    appState.lobbyStatus = "서버 연결이 끊어졌습니다. 서버를 확인하세요.";
    rerender();
  });

  if (appState.playerId && appState.room?.roomCode && socket.connected) {
    handleResumeSession(appState, elements);
  }

  socket.on("roomUpdated", (room) => {
    appState.room = room;
    const keepHydratedGameState =
      appState.isRestoringSession &&
      Boolean(appState.serverState?.round) &&
      room.hasGameStarted;

    if (room.reconnectPause?.paused) {
      appState.roomStatus =
        room.reconnectPause.message || "플레이어의 연결이 끊겼습니다. 재접속을 기다립니다.";
    } else if (room.hasGameStarted) {
      appState.roomStatus = "게임이 시작되었습니다.";
    } else if (!keepHydratedGameState) {
      appState.serverState = null;
      appState.isRestoringSession = false;
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

    if (!state || !state.round || !Array.isArray(state.players) || !Array.isArray(state.rows)) {
      if (appState.isRestoringSession && appState.serverState?.round) {
        rerender();
        return;
      }

      appState.serverState = null;
      appState.isRestoringSession = false;
      appState.transientStatus = "";
      appState.pendingSubmit = false;
      rerender();
      return;
    }

    applyStateDiff(appState, state);
    appState.serverState = state;
    appState.isRestoringSession = false;
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

  socket.on("chatUpdated", ({ roomCode, messages }) => {
    if (roomCode && appState.room?.roomCode !== roomCode) {
      return;
    }

    appState.room = {
      ...(appState.room ?? {}),
      ...(roomCode ? { roomCode } : {}),
      chatMessages: Array.isArray(messages) ? messages : [],
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

  elements.chatSendButton?.addEventListener("click", () => {
    handleSendChat(appState, elements);
  });

  elements.chatInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) {
      return;
    }

    event.preventDefault();
    handleSendChat(appState, elements);
  });

  elements.startGameButton.addEventListener("click", () => {
    handleStartGame(appState, elements);
  });

  elements.leaveRoomButton.addEventListener("click", () => {
    openLeaveGameModal(appState, elements);
  });

  elements.leaveGameButton?.addEventListener("click", () => {
    openLeaveGameModal(appState, elements);
  });

  elements.closeLeaveGameModalButton?.addEventListener("click", () => {
    closeLeaveGameModal(appState, elements);
  });

  elements.cancelLeaveGameButton?.addEventListener("click", () => {
    closeLeaveGameModal(appState, elements);
  });

  elements.confirmLeaveGameButton?.addEventListener("click", () => {
    handleLeaveGame(appState, elements);
  });

  elements.leaveGameModal?.addEventListener("click", (event) => {
    if (event.target === elements.leaveGameModal) {
      closeLeaveGameModal(appState, elements);
    }
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
    if (!appState.serverState || appState.pendingSubmit) {
      return;
    }

    const cardButton = event.target.closest("[data-card-number]");

    if (!cardButton || cardButton.disabled) {
      return;
    }

    const cardNumber = Number(cardButton.dataset.cardNumber);
    appState.transientStatus = "";
    handleSubmitCard(appState, elements, cardNumber);
  });

  elements.boardRows.addEventListener("click", (event) => {
    const rowElement = event.target.closest("[data-row-id]");

    if (!rowElement) {
      return;
    }

    if (appState.serverState?.reconnectPause?.paused) {
      appState.transientStatus =
        appState.serverState.reconnectPause.message || "플레이어의 재접속을 기다리는 중입니다.";
      rerender();
      return;
    }

    if (!appState.serverState?.manualChoice?.isChooser) {
      return;
    }

    const rowId = Number(rowElement.dataset.rowId);
    const allowed = appState.serverState.manualChoice.allowedRowIds ?? [];

    if (!allowed.includes(rowId)) {
      return;
    }

    handleChooseRow(appState, elements, rowId);
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

export { initializeApp, renderGame, getPenaltyForCardNumber };
