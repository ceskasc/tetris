const STORAGE_KEY = "lunara-pages-save";
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const VISIBLE_QUEUE = 5;

const PIECES = {
  I: [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[1, 0], [1, 1], [1, 2], [1, 3]],
  ],
  O: [[[1, 0], [2, 0], [1, 1], [2, 1]]],
  T: [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]],
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[1, 1], [2, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[2, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 0], [0, 1], [1, 1], [0, 2]],
  ],
  J: [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [0, 2], [1, 2]],
  ],
  L: [
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
  ],
};

const COLORS = {
  I: "#8cdcff",
  O: "#ffe78a",
  T: "#d6a4ff",
  S: "#9af3c4",
  Z: "#ff9fba",
  J: "#8fb2ff",
  L: "#ffc489",
};

const MODES = {
  klasik: {
    ad: "Klasik",
    aciklama: "Giderek hızlanan geleneksel yüksek skor akışı.",
    etiketler: ["Uzun seans", "Yüksek skor", "Seviye ritmi"],
    gravity(level) {
      return Math.max(90, 820 - (level - 1) * 46);
    },
    sprintTarget: null,
  },
  zen: {
    ad: "Zen",
    aciklama: "Daha sakin, daha yumuşak ve baskısı düşük tempo.",
    etiketler: ["Sakin tempo", "Rahat akış", "Nazik hız eğrisi"],
    gravity(level) {
      return Math.max(190, 1080 - (level - 1) * 28);
    },
    sprintTarget: null,
  },
  ritim: {
    ad: "Ritim",
    aciklama: "Başlangıçtan itibaren daha canlı, daha enerjik ve akıcı seans.",
    etiketler: ["Canlı başlangıç", "Hızlı karar", "Akıcı combo hissi"],
    gravity(level) {
      return Math.max(72, 650 - (level - 1) * 52);
    },
    sprintTarget: null,
  },
  sprint: {
    ad: "Sprint 40",
    aciklama: "40 satırı en hızlı biçimde temizle ve kişisel rekorunu kır.",
    etiketler: ["40 satır", "Süre odaklı", "Temiz verimlilik"],
    gravity(level) {
      return Math.max(60, 550 - (level - 1) * 38);
    },
    sprintTarget: 40,
  },
};

const dom = {
  board: document.getElementById("board"),
  holdGrid: document.getElementById("hold-grid"),
  holdCopy: document.getElementById("hold-copy"),
  nextList: document.getElementById("next-list"),
  modeList: document.getElementById("mode-list"),
  modeTitle: document.getElementById("mode-title"),
  modeDescription: document.getElementById("mode-description"),
  modeTags: document.getElementById("mode-tags"),
  score: document.getElementById("score-value"),
  lines: document.getElementById("lines-value"),
  level: document.getElementById("level-value"),
  time: document.getElementById("time-value"),
  combo: document.getElementById("combo-value"),
  b2b: document.getElementById("b2b-value"),
  progressFill: document.getElementById("progress-fill"),
  progressCopy: document.getElementById("progress-copy"),
  sessionBanner: document.getElementById("session-banner"),
  bestClassic: document.getElementById("best-classic"),
  bestZen: document.getElementById("best-zen"),
  bestRitim: document.getElementById("best-ritim"),
  bestSprint: document.getElementById("best-sprint"),
  profilePlays: document.getElementById("profile-plays"),
  profileLines: document.getElementById("profile-lines"),
  profileCombo: document.getElementById("profile-combo"),
  profileMode: document.getElementById("profile-mode"),
  startButton: document.getElementById("start-button"),
  pauseButton: document.getElementById("pause-button"),
  overlay: document.getElementById("result-overlay"),
  resultTitle: document.getElementById("result-title"),
  resultCopy: document.getElementById("result-copy"),
  resultScore: document.getElementById("result-score"),
  resultLines: document.getElementById("result-lines"),
  resultLevel: document.getElementById("result-level"),
  resultTime: document.getElementById("result-time"),
  playAgainButton: document.getElementById("play-again-button"),
  closeOverlayButton: document.getElementById("close-overlay-button"),
};

const boardCells = [];
const miniCellCache = new WeakMap();

let save = loadSave();
let activeMode = "klasik";
let state = null;
let rafId = 0;
let lastFrame = 0;

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("bos");
    const parsed = JSON.parse(raw);
    return {
      bestScores: parsed.bestScores ?? { klasik: 0, zen: 0, ritim: 0 },
      bestSprintMs: parsed.bestSprintMs ?? null,
      totalLines: parsed.totalLines ?? 0,
      totalPlays: parsed.totalPlays ?? 0,
      longestCombo: parsed.longestCombo ?? 0,
      lastMode: parsed.lastMode ?? "Klasik",
    };
  } catch {
    return {
      bestScores: { klasik: 0, zen: 0, ritim: 0 },
      bestSprintMs: null,
      totalLines: 0,
      totalPlays: 0,
      longestCombo: 0,
      lastMode: "Klasik",
    };
  }
}

function persistSave() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

function emptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

function shuffleBag() {
  const bag = Object.keys(PIECES);
  for (let index = bag.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [bag[index], bag[swap]] = [bag[swap], bag[index]];
  }
  return bag;
}

function fillQueue(queue) {
  const next = [...queue];
  while (next.length < 7) next.push(...shuffleBag());
  return next;
}

function createPiece(type) {
  return { type, rotation: 0, x: 3, y: type === "I" ? -1 : 0 };
}

function getCells(piece) {
  const rotations = PIECES[piece.type];
  return rotations[piece.rotation % rotations.length].map(([x, y]) => ({
    x: piece.x + x,
    y: piece.y + y,
  }));
}

function canPlace(board, piece) {
  return getCells(piece).every((cell) => {
    if (cell.x < 0 || cell.x >= BOARD_WIDTH || cell.y >= BOARD_HEIGHT) return false;
    if (cell.y < 0) return true;
    return board[cell.y][cell.x] === null;
  });
}

function createState(modeKey) {
  const queue = fillQueue([]);
  const current = {
    modeKey,
    board: emptyBoard(),
    queue,
    hold: null,
    canHold: true,
    active: null,
    score: 0,
    lines: 0,
    level: modeKey === "ritim" ? 2 : 1,
    combo: -1,
    maxCombo: 0,
    b2b: 0,
    timeMs: 0,
    status: "hazir",
    dropBuffer: 0,
    lastBanner: "Hazır olduğunda başlat.",
    completedSprint: false,
  };
  spawnNext(current);
  return current;
}

function spawnNext(targetState) {
  targetState.queue = fillQueue(targetState.queue);
  const type = targetState.queue.shift();
  targetState.active = createPiece(type);
  targetState.canHold = true;
  if (!canPlace(targetState.board, targetState.active)) {
    finishRun("Tahta doldu, ama ritim tekrar kurulabilir.");
  }
}

function mergePiece(targetState) {
  getCells(targetState.active).forEach((cell) => {
    if (cell.y >= 0) targetState.board[cell.y][cell.x] = targetState.active.type;
  });
}

function clearLines(targetState) {
  const kept = targetState.board.filter((row) => row.some((cell) => cell === null));
  const cleared = BOARD_HEIGHT - kept.length;
  if (!cleared) {
    targetState.combo = -1;
    targetState.b2b = 0;
    return;
  }
  targetState.board = [
    ...Array.from({ length: cleared }, () => Array(BOARD_WIDTH).fill(null)),
    ...kept,
  ];
  targetState.lines += cleared;
  targetState.combo += 1;
  targetState.maxCombo = Math.max(targetState.maxCombo, targetState.combo);
  const lineScores = [0, 100, 300, 500, 800];
  let scoreGain = lineScores[Math.min(cleared, 4)] * targetState.level;
  if (cleared >= 4) {
    targetState.b2b += 1;
    if (targetState.b2b > 1) scoreGain = Math.round(scoreGain * 1.3);
  } else {
    targetState.b2b = 0;
  }
  if (targetState.combo > 0) scoreGain += targetState.combo * 50;
  targetState.score += scoreGain;
  targetState.level = Math.max(targetState.level, Math.floor(targetState.lines / 10) + 1);
  if (MODES[targetState.modeKey].sprintTarget && targetState.lines >= MODES[targetState.modeKey].sprintTarget) {
    targetState.completedSprint = true;
    finishRun("Sprint hedefi tamamlandı. Bu ritim artık rekor vitrininde.");
    return;
  }
  targetState.lastBanner =
    cleared >= 4 ? "Tetris! Tahta güçlü biçimde açıldı." : `${cleared} satır temizlendi.`;
}

function lockPiece() {
  if (!state?.active || state.status !== "oynaniyor") return;
  mergePiece(state);
  clearLines(state);
  if (state.status === "bitti") return;
  spawnNext(state);
  render();
}

function move(dx, dy) {
  if (!state?.active || state.status !== "oynaniyor") return false;
  const next = { ...state.active, x: state.active.x + dx, y: state.active.y + dy };
  if (!canPlace(state.board, next)) return false;
  state.active = next;
  if (dy > 0) state.score += 1;
  render();
  return true;
}

function rotate(direction) {
  if (!state?.active || state.status !== "oynaniyor") return;
  const rotations = PIECES[state.active.type].length;
  const nextRotation = (state.active.rotation + direction + rotations) % rotations;
  for (const offset of [0, -1, 1, -2, 2]) {
    const next = { ...state.active, rotation: nextRotation, x: state.active.x + offset };
    if (canPlace(state.board, next)) {
      state.active = next;
      render();
      return;
    }
  }
}

function hardDrop() {
  if (!state?.active || state.status !== "oynaniyor") return;
  let distance = 0;
  while (move(0, 1)) distance += 1;
  state.score += distance * 2;
  lockPiece();
}

function holdPiece() {
  if (!state?.active || !state.canHold || state.status !== "oynaniyor") return;
  const current = state.active.type;
  if (!state.hold) {
    state.hold = current;
    spawnNext(state);
  } else {
    const swapped = state.hold;
    state.hold = current;
    state.active = createPiece(swapped);
    if (!canPlace(state.board, state.active)) {
      finishRun("Hold değişimi sonrası tahta kapanışa gitti.");
      return;
    }
  }
  state.canHold = false;
  render();
}

function getGhostPiece() {
  if (!state?.active) return null;
  const ghost = { ...state.active };
  while (canPlace(state.board, { ...ghost, y: ghost.y + 1 })) ghost.y += 1;
  return ghost;
}

function finishRun(copy) {
  if (!state) return;
  state.status = "bitti";
  state.lastBanner = copy;
  save.totalPlays += 1;
  save.totalLines += state.lines;
  save.longestCombo = Math.max(save.longestCombo, state.maxCombo);
  save.lastMode = MODES[state.modeKey].ad;
  if (state.modeKey === "sprint" && state.completedSprint) {
    if (save.bestSprintMs === null || state.timeMs < save.bestSprintMs) save.bestSprintMs = state.timeMs;
  } else if (state.modeKey !== "sprint") {
    save.bestScores[state.modeKey] = Math.max(save.bestScores[state.modeKey], state.score);
  }
  persistSave();
  syncProfile();
  showResult();
  render();
}

function startRun() {
  state = createState(activeMode);
  state.status = "oynaniyor";
  state.lastBanner =
    activeMode === "sprint"
      ? "40 satırı temizle ve süreyi olabildiğince aşağı çek."
      : "Parçalar akıyor. Kontrol sende.";
  dom.overlay.classList.add("hidden");
  dom.overlay.setAttribute("aria-hidden", "true");
  lastFrame = performance.now();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
  render();
}

function togglePause() {
  if (!state || state.status === "bitti") {
    startRun();
    return;
  }
  state.status = state.status === "duraklatildi" ? "oynaniyor" : "duraklatildi";
  state.lastBanner =
    state.status === "duraklatildi"
      ? "Seans duraklatıldı. Hazır olduğunda ritme geri dön."
      : "Akış yeniden açıldı.";
  if (state.status === "oynaniyor") {
    lastFrame = performance.now();
    rafId = requestAnimationFrame(loop);
  }
  render();
}

function loop(now) {
  if (!state || state.status !== "oynaniyor") return;
  const delta = now - lastFrame;
  lastFrame = now;
  state.timeMs += delta;
  state.dropBuffer += delta;
  if (state.dropBuffer >= MODES[state.modeKey].gravity(state.level)) {
    state.dropBuffer = 0;
    if (!move(0, 1)) lockPiece();
  }
  renderStatsOnly();
  rafId = requestAnimationFrame(loop);
}

function buildBoard() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < BOARD_WIDTH * BOARD_HEIGHT; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    boardCells.push(cell);
    fragment.appendChild(cell);
  }
  dom.board.appendChild(fragment);
}

function createMiniGrid(container) {
  container.innerHTML = "";
  const cells = [];
  for (let index = 0; index < 16; index += 1) {
    const cell = document.createElement("div");
    cell.className = "mini-cell";
    container.appendChild(cell);
    cells.push(cell);
  }
  miniCellCache.set(container, cells);
}

function renderMini(container, type) {
  const cells = miniCellCache.get(container);
  if (!cells) return;
  cells.forEach((cell) => {
    cell.style.background = "rgba(255,255,255,0.04)";
    cell.style.boxShadow = "none";
  });
  if (!type) return;
  PIECES[type][0].forEach(([x, y]) => {
    const cell = cells[y * 4 + x];
    if (!cell) return;
    cell.style.background = COLORS[type];
    cell.style.boxShadow = `0 0 14px ${COLORS[type]}`;
  });
}

function renderQueue() {
  dom.nextList.innerHTML = "";
  state.queue.slice(0, VISIBLE_QUEUE).forEach((type) => {
    const wrapper = document.createElement("div");
    wrapper.className = "queue-card";
    const grid = document.createElement("div");
    grid.className = "mini-grid";
    wrapper.appendChild(grid);
    dom.nextList.appendChild(wrapper);
    createMiniGrid(grid);
    renderMini(grid, type);
  });
}

function renderModeCards() {
  dom.modeList.innerHTML = "";
  Object.entries(MODES).forEach(([key, mode]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mode-card${key === activeMode ? " active" : ""}`;
    button.innerHTML = `<h3>${mode.ad}</h3><p>${mode.aciklama}</p>`;
    button.addEventListener("click", () => {
      activeMode = key;
      renderModeCards();
      renderModeMeta();
    });
    dom.modeList.appendChild(button);
  });
}

function renderModeMeta() {
  const mode = MODES[activeMode];
  dom.modeTitle.textContent = mode.ad;
  dom.modeDescription.textContent = mode.aciklama;
  dom.modeTags.innerHTML = "";
  mode.etiketler.forEach((tag) => {
    const span = document.createElement("span");
    span.textContent = tag;
    dom.modeTags.appendChild(span);
  });
}

function renderStatsOnly() {
  if (!state) return;
  dom.score.textContent = formatNumber(state.score);
  dom.lines.textContent = String(state.lines);
  dom.level.textContent = String(state.level);
  dom.time.textContent = formatTime(state.timeMs);
  dom.combo.textContent = String(Math.max(0, state.combo));
  dom.b2b.textContent = String(state.b2b);
  dom.sessionBanner.textContent = state.lastBanner;
  if (activeMode === "sprint") {
    const remaining = Math.max(0, MODES.sprint.sprintTarget - state.lines);
    const progress = Math.min(100, (state.lines / MODES.sprint.sprintTarget) * 100);
    dom.progressFill.style.width = `${progress}%`;
    dom.progressCopy.textContent = `${remaining} satır kaldı`;
  } else {
    const progress = ((state.lines % 10) / 10) * 100;
    dom.progressFill.style.width = `${progress}%`;
    dom.progressCopy.textContent = `%${Math.round(progress)}`;
  }
}

function renderBoard() {
  const board = state ? state.board.map((row) => [...row]) : emptyBoard();
  const ghost = state?.active ? getGhostPiece() : null;
  if (ghost) {
    getCells(ghost).forEach((cell) => {
      if (cell.y >= 0 && board[cell.y][cell.x] === null) board[cell.y][cell.x] = `${ghost.type}-ghost`;
    });
  }
  if (state?.active) {
    getCells(state.active).forEach((cell) => {
      if (cell.y >= 0) board[cell.y][cell.x] = state.active.type;
    });
  }
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const value = board[y][x];
      const cell = boardCells[y * BOARD_WIDTH + x];
      cell.className = "cell";
      cell.style.background = "rgba(255,255,255,0.03)";
      cell.style.boxShadow = "none";
      if (!value) continue;
      const ghostCell = String(value).endsWith("-ghost");
      const type = ghostCell ? String(value).replace("-ghost", "") : value;
      cell.classList.add("filled");
      if (ghostCell) cell.classList.add("ghost");
      cell.style.background = COLORS[type];
      cell.style.boxShadow = ghostCell ? "none" : `0 0 18px ${COLORS[type]}`;
    }
  }
}

function render() {
  renderModeMeta();
  renderBoard();
  renderStatsOnly();
  if (!state) {
    renderMini(dom.holdGrid, null);
    dom.holdCopy.textContent = "Henüz boş";
    dom.nextList.innerHTML = "";
    return;
  }
  renderMini(dom.holdGrid, state.hold);
  dom.holdCopy.textContent = state.hold ? `${state.hold} parçası beklemede` : "Henüz boş";
  renderQueue();
}

function syncProfile() {
  dom.bestClassic.textContent = formatNumber(save.bestScores.klasik);
  dom.bestZen.textContent = formatNumber(save.bestScores.zen);
  dom.bestRitim.textContent = formatNumber(save.bestScores.ritim);
  dom.bestSprint.textContent = save.bestSprintMs ? formatTime(save.bestSprintMs) : "--:--";
  dom.profilePlays.textContent = String(save.totalPlays);
  dom.profileLines.textContent = String(save.totalLines);
  dom.profileCombo.textContent = String(save.longestCombo);
  dom.profileMode.textContent = save.lastMode;
}

function showResult() {
  dom.resultTitle.textContent =
    activeMode === "sprint" && state.completedSprint ? "Sprint tamamlandı" : "Seans tamamlandı";
  dom.resultCopy.textContent = state.lastBanner;
  dom.resultScore.textContent = formatNumber(state.score);
  dom.resultLines.textContent = String(state.lines);
  dom.resultLevel.textContent = String(state.level);
  dom.resultTime.textContent = formatTime(state.timeMs);
  dom.overlay.classList.remove("hidden");
  dom.overlay.setAttribute("aria-hidden", "false");
}

function formatNumber(value) {
  return new Intl.NumberFormat("tr-TR").format(value);
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function bindEvents() {
  window.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    switch (event.code) {
      case "ArrowLeft":
        event.preventDefault();
        move(-1, 0);
        break;
      case "ArrowRight":
        event.preventDefault();
        move(1, 0);
        break;
      case "ArrowDown":
        event.preventDefault();
        move(0, 1);
        break;
      case "ArrowUp":
      case "KeyX":
        event.preventDefault();
        rotate(1);
        break;
      case "KeyZ":
        event.preventDefault();
        rotate(-1);
        break;
      case "Space":
        event.preventDefault();
        hardDrop();
        break;
      case "ShiftLeft":
      case "ShiftRight":
        event.preventDefault();
        holdPiece();
        break;
      case "Escape":
      case "KeyP":
        event.preventDefault();
        togglePause();
        break;
    }
  });
  dom.startButton.addEventListener("click", startRun);
  dom.pauseButton.addEventListener("click", togglePause);
  dom.playAgainButton.addEventListener("click", startRun);
  dom.closeOverlayButton.addEventListener("click", () => {
    dom.overlay.classList.add("hidden");
    dom.overlay.setAttribute("aria-hidden", "true");
  });
  document.querySelectorAll("[data-touch]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-touch");
      if (action === "left") move(-1, 0);
      if (action === "right") move(1, 0);
      if (action === "down") move(0, 1);
      if (action === "rotate") rotate(1);
      if (action === "hold") holdPiece();
      if (action === "drop") hardDrop();
    });
  });
}

function init() {
  buildBoard();
  createMiniGrid(dom.holdGrid);
  renderModeCards();
  renderModeMeta();
  syncProfile();
  bindEvents();
  render();
}

init();
