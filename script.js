const state = {
  mode: "focus",
  isRunning: false,
  focusMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  longInterval: 4,
  cycle: 1,
  remainingSeconds: 25 * 60,
  timerId: null,
};

const elements = {
  timeDisplay: document.getElementById("timeDisplay"),
  modeLabel: document.getElementById("modeLabel"),
  cycleDisplay: document.getElementById("cycleDisplay"),
  toggleBtn: document.getElementById("toggleBtn"),
  resetBtn: document.getElementById("resetBtn"),
  statusLabel: document.getElementById("statusLabel"),
  focusValue: document.getElementById("focusValue"),
  shortValue: document.getElementById("shortValue"),
  longValue: document.getElementById("longValue"),
  intervalValue: document.getElementById("intervalValue"),
  progressRing: document.querySelector(".ring__progress"),
  modeTabs: document.querySelectorAll(".tab"),
};

const totalRingLength = 2 * Math.PI * 96;

const modeLabels = {
  focus: "专注",
  short: "短休息",
  long: "长休息",
};

const statusText = {
  focus: "保持专注，完成这一轮。",
  short: "站起来活动一下。",
  long: "长休息时间，补充能量。",
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateDisplay() {
  elements.timeDisplay.textContent = formatTime(state.remainingSeconds);
  elements.modeLabel.textContent = modeLabels[state.mode];
  elements.cycleDisplay.textContent = `第 ${state.cycle} 轮 · 目标 ${state.longInterval} 轮`;
  elements.statusLabel.textContent = statusText[state.mode];
  elements.focusValue.textContent = state.focusMinutes;
  elements.shortValue.textContent = state.shortMinutes;
  elements.longValue.textContent = state.longMinutes;
  elements.intervalValue.textContent = state.longInterval;

  elements.modeTabs.forEach((tab) => {
    tab.classList.toggle("tab--active", tab.dataset.mode === state.mode);
  });

  const duration = getCurrentDuration();
  const progress = duration === 0 ? 0 : state.remainingSeconds / duration;
  elements.progressRing.style.strokeDasharray = totalRingLength;
  elements.progressRing.style.strokeDashoffset = `${totalRingLength * (1 - progress)}`;
}

function getCurrentDuration() {
  if (state.mode === "focus") return state.focusMinutes * 60;
  if (state.mode === "short") return state.shortMinutes * 60;
  return state.longMinutes * 60;
}

function setMode(nextMode) {
  state.mode = nextMode;
  state.remainingSeconds = getCurrentDuration();
  if (!state.isRunning) {
    elements.toggleBtn.textContent = "开始";
  }
  updateDisplay();
}

function nextPhase() {
  if (state.mode === "focus") {
    const isLong = state.cycle % state.longInterval === 0;
    setMode(isLong ? "long" : "short");
  } else {
    if (state.mode === "long") {
      state.cycle = 1;
    } else {
      state.cycle += 1;
    }
    setMode("focus");
  }
}

function tick() {
  if (state.remainingSeconds > 0) {
    state.remainingSeconds -= 1;
    updateDisplay();
    return;
  }
  pauseTimer();
  nextPhase();
  elements.toggleBtn.textContent = "开始";
  elements.statusLabel.textContent = "阶段结束，准备进入下一段。";
}

function startTimer() {
  if (state.timerId) return;
  state.timerId = window.setInterval(tick, 1000);
  state.isRunning = true;
  elements.toggleBtn.textContent = "暂停";
}

function pauseTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  state.isRunning = false;
  elements.toggleBtn.textContent = "继续";
}

function resetTimer() {
  pauseTimer();
  state.mode = "focus";
  state.cycle = 1;
  state.remainingSeconds = state.focusMinutes * 60;
  elements.toggleBtn.textContent = "开始";
  elements.statusLabel.textContent = "准备开始你的专注时间。";
  updateDisplay();
}

function toggleTimer() {
  if (state.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function updateSetting(type, step) {
  const ranges = {
    focus: [15, 60],
    short: [3, 15],
    long: [10, 30],
    interval: [2, 6],
  };

  const [min, max] = ranges[type];
  const keyMap = {
    focus: "focusMinutes",
    short: "shortMinutes",
    long: "longMinutes",
    interval: "longInterval",
  };

  const key = keyMap[type];
  const nextValue = Math.min(max, Math.max(min, state[key] + step));
  state[key] = nextValue;

  if (!state.isRunning && state.mode === "focus" && type === "focus") {
    state.remainingSeconds = state.focusMinutes * 60;
  }

  if (!state.isRunning && state.mode === "short" && type === "short") {
    state.remainingSeconds = state.shortMinutes * 60;
  }

  if (!state.isRunning && state.mode === "long" && type === "long") {
    state.remainingSeconds = state.longMinutes * 60;
  }

  updateDisplay();
}

function bindEvents() {
  elements.toggleBtn.addEventListener("click", toggleTimer);
  elements.resetBtn.addEventListener("click", resetTimer);

  elements.modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (state.isRunning) return;
      setMode(tab.dataset.mode);
    });
  });

  document.querySelectorAll(".step").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.action;
      const step = Number(btn.dataset.step);
      updateSetting(type, step);
    });
  });
}

updateDisplay();
bindEvents();
