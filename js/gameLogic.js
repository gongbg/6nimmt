const MAX_CARD_NUMBER = 104;
const DEFAULT_ROW_COUNT = 4;
const ROUND_PHASES = {
  WAITING: "waiting",
  DEALING: "dealing",
  SELECTING: "selecting",
  REVEALING: "revealing",
  RESOLVING: "resolving",
  FINISHED: "finished",
};

function cloneCard(card) {
  return {
    number: card.number,
    penalty: card.penalty,
  };
}

function cloneRow(row) {
  return {
    id: row.id,
    cards: row.cards.map(cloneCard),
  };
}

function clonePendingStep(step) {
  return {
    playerId: step.playerId,
    card: cloneCard(step.card),
    rowId: step.rowId,
    takenCards: step.takenCards.map(cloneCard),
    penaltyPointsGained: step.penaltyPointsGained,
    placement: step.placement,
  };
}

function clonePendingResolution(pendingResolution) {
  if (!pendingResolution) {
    return null;
  }

  return {
    revealedCards: pendingResolution.revealedCards.map((entry) => ({
      playerId: entry.playerId,
      card: cloneCard(entry.card),
    })),
    orderedCards: pendingResolution.orderedCards.map((entry) => ({
      playerId: entry.playerId,
      card: cloneCard(entry.card),
    })),
    steps: pendingResolution.steps.map(clonePendingStep),
    currentStepIndex: pendingResolution.currentStepIndex,
  };
}

function sumPenalty(cards) {
  return cards.reduce((total, card) => total + card.penalty, 0);
}

function getCardPenalty(number) {
  if (!Number.isInteger(number) || number < 1 || number > MAX_CARD_NUMBER) {
    throw new Error(`Card number must be an integer between 1 and ${MAX_CARD_NUMBER}.`);
  }

  if (number === 55) {
    return 7;
  }

  if (number % 11 === 0) {
    return 5;
  }

  if (number % 10 === 0) {
    return 3;
  }

  if (number % 5 === 0) {
    return 2;
  }

  return 1;
}

function createCard(number) {
  return {
    number,
    penalty: getCardPenalty(number),
  };
}

function normalizeCard(cardInput) {
  if (!cardInput || typeof cardInput !== "object") {
    throw new Error("Card data is required.");
  }

  const card = createCard(cardInput.number);

  if (cardInput.penalty !== undefined && cardInput.penalty !== card.penalty) {
    throw new Error(`Card penalty mismatch for card number "${card.number}".`);
  }

  return card;
}

function createOrderedDeck() {
  const deck = [];

  for (let number = 1; number <= MAX_CARD_NUMBER; number += 1) {
    deck.push(createCard(number));
  }

  return deck;
}

function shuffleDeck(deck, randomFn = Math.random) {
  const shuffled = deck.map(cloneCard);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomFn() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function generateAndShuffleDeck(randomFn = Math.random) {
  return shuffleDeck(createOrderedDeck(), randomFn);
}

function chooseRandomCardFromHand(hand, randomFn = Math.random) {
  if (!Array.isArray(hand) || hand.length === 0) {
    throw new Error("Cannot choose a card from an empty hand.");
  }

  const randomIndex = Math.floor(randomFn() * hand.length);
  return cloneCard(hand[randomIndex]);
}

function normalizePlayer(playerInput) {
  if (!playerInput || typeof playerInput !== "object") {
    throw new Error("Player data is required.");
  }

    const {
      id,
      nickname,
      isBot = false,
      avatar = null,
      hand = [],
      penaltyCards = playerInput.collectedPenaltyCards ?? [],
      totalPenaltyPoints = 0,
    } = playerInput;

  if (!id) {
    throw new Error("Player id is required.");
  }

  if (!nickname) {
    throw new Error("Player nickname is required.");
  }

  const normalizedPenaltyCards = penaltyCards.map(normalizeCard);
    const normalizedPlayer = {
      id,
      nickname,
      isBot: Boolean(isBot),
      avatar:
        avatar && typeof avatar === "object"
          ? {
              skinColor: avatar.skinColor ?? null,
              eyeType: avatar.eyeType ?? null,
              mouthType: avatar.mouthType ?? null,
            }
          : null,
      hand: hand.map(normalizeCard),
      penaltyCards: normalizedPenaltyCards,
      penaltyPoints: sumPenalty(normalizedPenaltyCards),
      totalPenaltyPoints,
  };

  normalizedPlayer.collectedPenaltyCards = normalizedPlayer.penaltyCards;
  return normalizedPlayer;
}

function createEmptyRow(rowIndex) {
  return {
    id: rowIndex + 1,
    cards: [],
  };
}

function normalizeRows(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return Array.from({ length: DEFAULT_ROW_COUNT }, (_, index) => createEmptyRow(index));
  }

  return rows.map((row, index) => ({
    id: row.id ?? index + 1,
    cards: Array.isArray(row.cards) ? row.cards.map(normalizeCard) : [],
  }));
}

function createPendingResolutionState(pendingResolution = {}) {
  if (!pendingResolution || !Array.isArray(pendingResolution.steps)) {
    return null;
  }

  return {
    revealedCards: Array.isArray(pendingResolution.revealedCards)
      ? pendingResolution.revealedCards.map((entry) => ({
          playerId: entry.playerId,
          card: normalizeCard(entry.card),
        }))
      : [],
    orderedCards: Array.isArray(pendingResolution.orderedCards)
      ? pendingResolution.orderedCards.map((entry) => ({
          playerId: entry.playerId,
          card: normalizeCard(entry.card),
        }))
      : [],
    steps: pendingResolution.steps.map((step) => ({
      playerId: step.playerId,
      card: normalizeCard(step.card),
      rowId: step.rowId,
      takenCards: Array.isArray(step.takenCards) ? step.takenCards.map(normalizeCard) : [],
      penaltyPointsGained: step.penaltyPointsGained ?? 0,
      placement: step.placement ?? "placed",
    })),
    currentStepIndex: pendingResolution.currentStepIndex ?? 0,
  };
}

function createRoundState(round = {}) {
  return {
    number: round.number ?? 1,
    phase: round.phase ?? ROUND_PHASES.WAITING,
    turn: round.turn ?? 0,
    activePlayerId: round.activePlayerId ?? null,
    hasScored: round.hasScored ?? false,
    selectedCardsByPlayer: Object.fromEntries(
      Object.entries(round.selectedCardsByPlayer ?? {}).map(([playerId, card]) => [
        playerId,
        normalizeCard(card),
      ])
    ),
    finalScores: Array.isArray(round.finalScores)
      ? round.finalScores.map((entry) => ({
          playerId: entry.playerId,
          roundPenaltyPoints: entry.roundPenaltyPoints ?? 0,
          totalPenaltyPoints: entry.totalPenaltyPoints ?? 0,
        }))
      : [],
    resolvedCards: Array.isArray(round.resolvedCards)
      ? round.resolvedCards.map(clonePendingStep)
      : [],
    pendingResolution: createPendingResolutionState(round.pendingResolution),
  };
}

function getRowLastCard(row) {
  return row.cards[row.cards.length - 1] ?? null;
}

function getRowPenalty(row) {
  return sumPenalty(row.cards);
}

function findPlacementRowIndex(rows, card) {
  let selectedRowIndex = -1;
  let closestDifference = Number.POSITIVE_INFINITY;

  for (let index = 0; index < rows.length; index += 1) {
    const lastCard = getRowLastCard(rows[index]);

    if (!lastCard || lastCard.number >= card.number) {
      continue;
    }

    const difference = card.number - lastCard.number;

    if (difference < closestDifference) {
      closestDifference = difference;
      selectedRowIndex = index;
    }
  }

  return selectedRowIndex;
}

function chooseLowestPenaltyRowIndex(rows) {
  let selectedRowIndex = 0;
  let minimumPenalty = Number.POSITIVE_INFINITY;

  for (let index = 0; index < rows.length; index += 1) {
    const rowPenalty = getRowPenalty(rows[index]);

    if (rowPenalty < minimumPenalty) {
      minimumPenalty = rowPenalty;
      selectedRowIndex = index;
    }
  }

  return selectedRowIndex;
}

function normalizePlayedCardEntry(entry) {
  if (!entry || typeof entry !== "object") {
    throw new Error("Each played card entry must be an object.");
  }

  if (!entry.playerId) {
    throw new Error("Each played card entry must include a playerId.");
  }

  return {
    playerId: entry.playerId,
    card: normalizeCard(entry.card),
  };
}

function normalizeCardSelection(cardSelection) {
  if (typeof cardSelection === "number") {
    return createCard(cardSelection);
  }

  return normalizeCard(cardSelection);
}

function resolvePlayedCardsAgainstRows(rows, playedCards) {
  const workingRows = rows.map(cloneRow);
  const orderedPlayedCards = playedCards
    .map(normalizePlayedCardEntry)
    .sort((left, right) => left.card.number - right.card.number);
  const resolutionLog = [];

  for (const playedEntry of orderedPlayedCards) {
    const targetRowIndex = findPlacementRowIndex(workingRows, playedEntry.card);
    const actualRowIndex =
      targetRowIndex === -1 ? chooseLowestPenaltyRowIndex(workingRows) : targetRowIndex;
    const targetRow = workingRows[actualRowIndex];
    const takenCards = [];
    let placement = "placed";

    if (targetRowIndex === -1) {
      takenCards.push(...targetRow.cards.map(cloneCard));
      targetRow.cards = [cloneCard(playedEntry.card)];
      placement = "replaced-smallest";
    } else if (targetRow.cards.length >= 5) {
      takenCards.push(...targetRow.cards.map(cloneCard));
      targetRow.cards = [cloneCard(playedEntry.card)];
      placement = "captured-full-row";
    } else {
      targetRow.cards.push(cloneCard(playedEntry.card));
    }

    resolutionLog.push({
      playerId: playedEntry.playerId,
      card: cloneCard(playedEntry.card),
      rowId: targetRow.id,
      takenCards,
      penaltyPointsGained: sumPenalty(takenCards),
      placement,
    });
  }

  return {
    rows: workingRows,
    orderedPlayedCards,
    resolutionLog,
  };
}

function createPendingResolution(rows, playedCards) {
  const normalizedPlayedCards = playedCards.map(normalizePlayedCardEntry);
  const preview = resolvePlayedCardsAgainstRows(rows, normalizedPlayedCards);

  return {
    revealedCards: normalizedPlayedCards.map((entry) => ({
      playerId: entry.playerId,
      card: cloneCard(entry.card),
    })),
    orderedCards: preview.orderedPlayedCards.map((entry) => ({
      playerId: entry.playerId,
      card: cloneCard(entry.card),
    })),
    steps: preview.resolutionLog.map(clonePendingStep),
    currentStepIndex: 0,
  };
}

class GameState {
  constructor({
    roomId = "room-1",
    players = [],
    rows = [],
    round = {},
    deck = [],
    randomFn = Math.random,
  } = {}) {
    this.roomId = roomId;
    this.players = players.map(normalizePlayer);
    this.rows = normalizeRows(rows);
    this.round = createRoundState(round);
    this.deck = deck.map(cloneCard);
    this.randomFn = randomFn;
  }

  addPlayer(playerInput) {
    const player = normalizePlayer(playerInput);

    if (this.players.some((currentPlayer) => currentPlayer.id === player.id)) {
      throw new Error(`Player with id "${player.id}" already exists.`);
    }

    this.players.push(player);
    return player;
  }

  removePlayer(playerId) {
    const playerIndex = this.players.findIndex((player) => player.id === playerId);

    if (playerIndex === -1) {
      return false;
    }

    this.players.splice(playerIndex, 1);
    delete this.round.selectedCardsByPlayer[playerId];

    if (this.round.activePlayerId === playerId) {
      this.round.activePlayerId = null;
    }

    return true;
  }

  getPlayer(playerId) {
    return this.players.find((player) => player.id === playerId) ?? null;
  }

  setDeck(deck) {
    this.deck = deck.map(cloneCard);
    return this.deck;
  }

  startRound({ roundNumber, deck } = {}) {
    this.round = createRoundState({
      number:
        roundNumber ??
        (this.round.phase === ROUND_PHASES.WAITING ? this.round.number : this.round.number + 1),
      phase: ROUND_PHASES.DEALING,
    });

    this.rows = normalizeRows();
    this.deck = Array.isArray(deck) ? deck.map(cloneCard) : generateAndShuffleDeck(this.randomFn);

    for (const player of this.players) {
      player.hand = [];
      player.penaltyCards = [];
      player.collectedPenaltyCards = player.penaltyCards;
      player.penaltyPoints = 0;
    }
  }

  drawCards(count = 1) {
    if (!Number.isInteger(count) || count < 1) {
      throw new Error("Draw count must be a positive integer.");
    }

    if (this.deck.length < count) {
      throw new Error("Not enough cards left in the deck.");
    }

    return this.deck.splice(0, count).map(cloneCard);
  }

  dealCards(cardsPerPlayer) {
    if (!Number.isInteger(cardsPerPlayer) || cardsPerPlayer < 1) {
      throw new Error("Cards per player must be a positive integer.");
    }

    for (const player of this.players) {
      player.hand = this.drawCards(cardsPerPlayer);
    }

    this.round.phase = ROUND_PHASES.SELECTING;
  }

  initializeRowsFromDeck(rowCount = DEFAULT_ROW_COUNT) {
    if (!Number.isInteger(rowCount) || rowCount < 1) {
      throw new Error("Row count must be a positive integer.");
    }

    this.rows = Array.from({ length: rowCount }, (_, index) => ({
      id: index + 1,
      cards: this.drawCards(1),
    }));

    return this.rows;
  }

  collectPenaltyCards(playerId, cards) {
    const player = this.getPlayer(playerId);

    if (!player) {
      throw new Error(`Player with id "${playerId}" was not found.`);
    }

    const normalizedCards = cards.map(cloneCard);
    player.penaltyCards.push(...normalizedCards);
    player.penaltyPoints = sumPenalty(player.penaltyCards);

    return player.penaltyPoints;
  }

  submitSelectedCard(playerId, card) {
    if (this.round.pendingResolution) {
      throw new Error("Cannot submit a new card while a turn is still resolving.");
    }

    const player = this.getPlayer(playerId);

    if (!player) {
      throw new Error(`Player with id "${playerId}" was not found.`);
    }

    if (this.round.selectedCardsByPlayer[playerId]) {
      throw new Error(`Player "${playerId}" already selected a card for this turn.`);
    }

    const normalizedCard = normalizeCardSelection(card);
    const hasCardInHand = player.hand.some((handCard) => handCard.number === normalizedCard.number);

    if (!hasCardInHand) {
      throw new Error(`Player "${playerId}" does not have card "${normalizedCard.number}" in hand.`);
    }

    this.round.selectedCardsByPlayer[playerId] = normalizedCard;
    return this.round.selectedCardsByPlayer[playerId];
  }

  getPlayersWithCardsInHand() {
    return this.players.filter((player) => player.hand.length > 0);
  }

  isTurnReadyToResolve() {
    const playersWithCards = this.getPlayersWithCardsInHand();

    return (
      playersWithCards.length > 0 &&
      playersWithCards.every((player) => this.round.selectedCardsByPlayer[player.id])
    );
  }

  chooseRandomBotCard(playerId) {
    const player = this.getPlayer(playerId);

    if (!player) {
      throw new Error(`Player with id "${playerId}" was not found.`);
    }

    if (!player.isBot) {
      throw new Error(`Player "${playerId}" is not a bot.`);
    }

    if (player.hand.length === 0) {
      throw new Error(`Bot "${playerId}" has no cards left to play.`);
    }

    if (this.round.selectedCardsByPlayer[playerId]) {
      return cloneCard(this.round.selectedCardsByPlayer[playerId]);
    }

    const selectedCard = chooseRandomCardFromHand(player.hand, this.randomFn);
    return this.submitSelectedCard(playerId, selectedCard);
  }

  removeCardFromPlayerHand(playerId, cardNumber) {
    const player = this.getPlayer(playerId);

    if (!player) {
      throw new Error(`Player with id "${playerId}" was not found.`);
    }

    const cardIndex = player.hand.findIndex((card) => card.number === cardNumber);

    if (cardIndex === -1) {
      throw new Error(`Player "${playerId}" does not have card "${cardNumber}" in hand.`);
    }

    const [removedCard] = player.hand.splice(cardIndex, 1);
    return cloneCard(removedCard);
  }

  createResolutionQueue(playedCards) {
    if (!Array.isArray(playedCards) || playedCards.length === 0) {
      throw new Error("playedCards must be a non-empty array.");
    }

    const normalizedPlayedCards = playedCards.map(normalizePlayedCardEntry);
    const playerIds = new Set();
    const cardNumbers = new Set();

    for (const playedEntry of normalizedPlayedCards) {
      if (playerIds.has(playedEntry.playerId)) {
        throw new Error(`Player "${playedEntry.playerId}" submitted more than one card.`);
      }

      if (cardNumbers.has(playedEntry.card.number)) {
        throw new Error(`Card "${playedEntry.card.number}" was submitted more than once.`);
      }

      if (!this.getPlayer(playedEntry.playerId)) {
        throw new Error(`Player with id "${playedEntry.playerId}" was not found.`);
      }

      playerIds.add(playedEntry.playerId);
      cardNumbers.add(playedEntry.card.number);
    }

    return createPendingResolution(this.rows, normalizedPlayedCards);
  }

  finalizeResolutionQueue() {
    this.round.turn += 1;
    this.round.selectedCardsByPlayer = {};
    this.round.activePlayerId = null;
    this.round.pendingResolution = null;
    this.round.phase = this.players.every((player) => player.hand.length === 0)
      ? ROUND_PHASES.FINISHED
      : ROUND_PHASES.SELECTING;

    return this.checkRoundEnd();
  }

  resolveNextPendingCard() {
    if (!this.round.pendingResolution) {
      throw new Error("There is no pending resolution queue.");
    }

    const pendingResolution = this.round.pendingResolution;
    const currentStep = pendingResolution.steps[pendingResolution.currentStepIndex];

    if (!currentStep) {
      const roundResult = this.finalizeResolutionQueue();

      return {
        appliedStep: null,
        finishedTurn: true,
        roundEnded: roundResult.ended,
        roundResult,
      };
    }

    this.round.phase = ROUND_PHASES.RESOLVING;

    const targetRow = this.rows.find((row) => row.id === currentStep.rowId);

    if (!targetRow) {
      throw new Error(`Row "${currentStep.rowId}" was not found.`);
    }

    if (currentStep.takenCards.length > 0) {
      this.collectPenaltyCards(currentStep.playerId, currentStep.takenCards);
      targetRow.cards = [cloneCard(currentStep.card)];
    } else {
      targetRow.cards.push(cloneCard(currentStep.card));
    }

    this.round.resolvedCards.push(clonePendingStep(currentStep));
    pendingResolution.currentStepIndex += 1;

    const finishedTurn = pendingResolution.currentStepIndex >= pendingResolution.steps.length;
    const roundResult = finishedTurn
      ? this.finalizeResolutionQueue()
      : { ended: false, finalScores: [] };

    return {
      appliedStep: clonePendingStep(currentStep),
      finishedTurn,
      roundEnded: roundResult.ended,
      roundResult,
    };
  }

  resolveTurn(playedCards) {
    const pendingResolution = this.createResolutionQueue(playedCards);

    for (const entry of pendingResolution.revealedCards) {
      this.removeCardFromPlayerHand(entry.playerId, entry.card.number);
    }

    this.round.pendingResolution = pendingResolution;
    this.round.phase = ROUND_PHASES.REVEALING;
    this.round.resolvedCards = [];

    const appliedSteps = [];
    let latestStepResult = {
      roundEnded: false,
      roundResult: { ended: false, finalScores: [] },
    };

    while (this.round.pendingResolution) {
      latestStepResult = this.resolveNextPendingCard();

      if (latestStepResult.appliedStep) {
        appliedSteps.push(latestStepResult.appliedStep);
      }
    }

    return {
      revealedCards: pendingResolution.revealedCards.map((entry) => ({
        playerId: entry.playerId,
        card: cloneCard(entry.card),
      })),
      orderedCards: pendingResolution.orderedCards.map((entry) => ({
        playerId: entry.playerId,
        card: cloneCard(entry.card),
      })),
      resolvedCards: appliedSteps.map(clonePendingStep),
      roundEnded: latestStepResult.roundEnded,
      roundResult: latestStepResult.roundResult,
    };
  }

  checkRoundEnd() {
    const isRoundEnded = this.players.every((player) => player.hand.length === 0);

    if (!isRoundEnded) {
      return {
        ended: false,
        finalScores: [],
      };
    }

    this.round.phase = ROUND_PHASES.FINISHED;

    if (!this.round.hasScored) {
      this.round.finalScores = this.players.map((player) => {
        const roundPenaltyPoints = sumPenalty(player.penaltyCards);
        player.penaltyPoints = roundPenaltyPoints;
        player.totalPenaltyPoints += roundPenaltyPoints;

        return {
          playerId: player.id,
          roundPenaltyPoints,
          totalPenaltyPoints: player.totalPenaltyPoints,
        };
      });

      this.round.hasScored = true;
    }

    return {
      ended: true,
      finalScores: this.round.finalScores.map((entry) => ({
        playerId: entry.playerId,
        roundPenaltyPoints: entry.roundPenaltyPoints,
        totalPenaltyPoints: entry.totalPenaltyPoints,
      })),
    };
  }

  playTurn(playerId, selectedCard) {
    if (this.round.pendingResolution) {
      throw new Error("Cannot play a new turn while the previous one is still resolving.");
    }

    const player = this.getPlayer(playerId);

    if (!player) {
      throw new Error(`Player with id "${playerId}" was not found.`);
    }

    if (player.hand.length === 0) {
      throw new Error(`Player "${playerId}" has no cards left to play.`);
    }

    this.round.activePlayerId = playerId;

    const submittedCard = this.submitSelectedCard(playerId, selectedCard);
    const botSelections = [];

    for (const botPlayer of this.players) {
      if (!botPlayer.isBot || botPlayer.id === playerId || botPlayer.hand.length === 0) {
        continue;
      }

      if (this.round.selectedCardsByPlayer[botPlayer.id]) {
        continue;
      }

      botSelections.push({
        playerId: botPlayer.id,
        card: this.chooseRandomBotCard(botPlayer.id),
      });
    }

    if (!this.isTurnReadyToResolve()) {
      return {
        submittedCard,
        botSelections,
        readyToResolve: false,
        revealedCards: [],
        orderedCards: [],
      };
    }

    const playedCards = Object.entries(this.round.selectedCardsByPlayer).map(([currentPlayerId, card]) => ({
      playerId: currentPlayerId,
      card,
    }));
    const pendingResolution = this.createResolutionQueue(playedCards);

    for (const entry of pendingResolution.revealedCards) {
      this.removeCardFromPlayerHand(entry.playerId, entry.card.number);
    }

    this.round.pendingResolution = pendingResolution;
    this.round.phase = ROUND_PHASES.REVEALING;
    this.round.resolvedCards = [];

    return {
      submittedCard,
      botSelections,
      readyToResolve: true,
      revealedCards: pendingResolution.revealedCards.map((entry) => ({
        playerId: entry.playerId,
        card: cloneCard(entry.card),
      })),
      orderedCards: pendingResolution.orderedCards.map((entry) => ({
        playerId: entry.playerId,
        card: cloneCard(entry.card),
      })),
    };
  }

  toJSON() {
    return {
      roomId: this.roomId,
        players: this.players.map((player) => ({
          id: player.id,
          nickname: player.nickname,
          isBot: player.isBot,
          avatar: player.avatar ? { ...player.avatar } : null,
          hand: player.hand.map(cloneCard),
          penaltyCards: player.penaltyCards.map(cloneCard),
          collectedPenaltyCards: player.penaltyCards.map(cloneCard),
          penaltyPoints: player.penaltyPoints,
        totalPenaltyPoints: player.totalPenaltyPoints,
      })),
      rows: this.rows.map((row) => ({
        id: row.id,
        cards: row.cards.map(cloneCard),
      })),
      round: {
        number: this.round.number,
        phase: this.round.phase,
        turn: this.round.turn,
        activePlayerId: this.round.activePlayerId,
        hasScored: this.round.hasScored,
        selectedCardsByPlayer: Object.fromEntries(
          Object.entries(this.round.selectedCardsByPlayer).map(([playerId, card]) => [
            playerId,
            cloneCard(card),
          ])
        ),
        finalScores: this.round.finalScores.map((entry) => ({
          playerId: entry.playerId,
          roundPenaltyPoints: entry.roundPenaltyPoints,
          totalPenaltyPoints: entry.totalPenaltyPoints,
        })),
        resolvedCards: this.round.resolvedCards.map(clonePendingStep),
        pendingResolution: clonePendingResolution(this.round.pendingResolution),
      },
      deck: this.deck.map(cloneCard),
    };
  }
}

function prepareRound(gameState, roundNumber) {
  gameState.startRound(roundNumber ? { roundNumber } : {});
  gameState.initializeRowsFromDeck();
  gameState.dealCards(10);
}

export {
  MAX_CARD_NUMBER,
  DEFAULT_ROW_COUNT,
  ROUND_PHASES,
  GameState,
  cloneCard,
  createCard,
  createOrderedDeck,
  shuffleDeck,
  generateAndShuffleDeck,
  chooseRandomCardFromHand,
  getCardPenalty,
  findPlacementRowIndex,
  chooseLowestPenaltyRowIndex,
  resolvePlayedCardsAgainstRows,
  prepareRound,
};
