const STORAGE_KEY = "movequest-app-demo-v2";

const defaultState = {
  onboarded: false,
  goal: "stress",
  energy: 72,
  level: 8,
  xp: 1180,
  coins: 460,
  streak: 6,
  rankGap: 84,
  completedTasks: ["stretch"],
  nudged: [],
  joinedLeagues: ["dorm"],
  purchased: [],
  run: {
    active: false,
    progress: 0,
    seconds: 0,
    distance: 0,
    reward: 0
  }
};

const tasks = [
  {
    id: "stretch",
    icon: "醒",
    title: "课间 8 分钟唤醒",
    meta: "低门槛启动",
    text: "久坐后做肩颈、髋部和踝关节活动。",
    reward: { xp: 40, coins: 12, energy: 8 }
  },
  {
    id: "run2k",
    icon: "跑",
    title: "操场跑图 2km",
    meta: "GPS 任务",
    text: "边跑边拾取虚拟补给点，完成后计入战队。",
    reward: { xp: 120, coins: 36, energy: 16 }
  },
  {
    id: "squad",
    icon: "队",
    title: "给 1 位队友助攻",
    meta: "社交牵引",
    text: "轻提醒比硬催促更适合宿舍熟人关系。",
    reward: { xp: 60, coins: 18, energy: 10 }
  }
];

const teammates = [
  { id: "wen", avatar: "雯", name: "沛雯", text: "刚完成 1.8km，等你补最后一棒", status: "在线" },
  { id: "hao", avatar: "豪", name: "子豪", text: "今天还没动，适合发一个轻提醒", status: "未打卡" },
  { id: "yi", avatar: "仪", name: "嘉仪", text: "报名了晨跑局，缺一个同伴", status: "组队中" }
];

const leagues = [
  { id: "dorm", title: "宿舍杯 7 日连击", text: "4 人组队，按完成次数排名。", tag: "已加入" },
  { id: "night", title: "夜跑补给赛", text: "经过校园虚拟点位收集金币。", tag: "可加入" },
  { id: "club", title: "社团燃脂 PK", text: "按社团累计运动分钟数结算。", tag: "可加入" }
];

const badges = [
  {
    id: "starter",
    icon: "启",
    title: "运动开机",
    text: "完成第一个低门槛任务。",
    unlocked: (state) => state.completedTasks.length >= 1
  },
  {
    id: "streak",
    icon: "连",
    title: "六天不断签",
    text: "连续运动 6 天。",
    unlocked: (state) => state.streak >= 6
  },
  {
    id: "map",
    icon: "图",
    title: "校园跑图者",
    text: "完成一次 GPS 跑图。",
    unlocked: (state) => state.completedTasks.includes("run2k")
  },
  {
    id: "captain",
    icon: "队",
    title: "宿舍气氛官",
    text: "给队友发送助攻提醒。",
    unlocked: (state) => state.nudged.length > 0
  }
];

const routePoints = [
  { left: 66, top: 88 },
  { left: 164, top: 54 },
  { left: 260, top: 86 },
  { left: 292, top: 172 },
  { left: 214, top: 250 },
  { left: 112, top: 220 },
  { left: 66, top: 88 }
];

const els = {
  startApp: document.getElementById("start-app"),
  screens: [...document.querySelectorAll(".screen")],
  tabs: [...document.querySelectorAll(".tab")],
  taskStack: document.getElementById("task-stack"),
  taskProgress: document.getElementById("task-progress"),
  energyScore: document.getElementById("energy-score"),
  levelLabel: document.getElementById("level-label"),
  streakLabel: document.getElementById("streak-label"),
  coinsLabel: document.getElementById("coins-label"),
  rankLabel: document.getElementById("rank-label"),
  onlineLabel: document.getElementById("online-label"),
  runToggle: document.getElementById("run-toggle"),
  runState: document.getElementById("run-state"),
  distanceLabel: document.getElementById("distance-label"),
  timeLabel: document.getElementById("time-label"),
  runReward: document.getElementById("run-reward"),
  playerDot: document.getElementById("player-dot"),
  teammateList: document.getElementById("teammate-list"),
  leagueList: document.getElementById("league-list"),
  rankGap: document.getElementById("rank-gap"),
  squadProgress: document.getElementById("squad-progress"),
  nudgeAll: document.getElementById("nudge-all"),
  passLevel: document.getElementById("pass-level"),
  passProgress: document.getElementById("pass-progress"),
  badgeGrid: document.getElementById("badge-grid"),
  toastRegion: document.getElementById("toast-region"),
  choiceCards: [...document.querySelectorAll(".choice-card")]
};

let state = loadState();
let runTimer = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...structuredClone(defaultState), ...JSON.parse(raw) } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showToast(title, text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
  els.toastRegion.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}

function switchScreen(name) {
  els.screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });

  document.querySelector(".phone-safe-area").classList.toggle("app-ready", name !== "onboarding");

  els.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tabTarget === name);
  });
}

function completeTask(taskId) {
  if (state.completedTasks.includes(taskId)) {
    return;
  }

  const task = tasks.find((item) => item.id === taskId);
  state.completedTasks.push(taskId);
  state.xp += task.reward.xp;
  state.coins += task.reward.coins;
  state.energy = Math.min(100, state.energy + task.reward.energy);
  state.rankGap = Math.max(0, state.rankGap - 24);

  if (state.completedTasks.length === tasks.length) {
    state.streak += 1;
    showToast("今日全清", "宿舍战队获得双倍积分，连续天数 +1。");
  } else {
    showToast("任务完成", `获得 ${task.reward.xp} XP 和 ${task.reward.coins} 金币。`);
  }

  saveState();
  render();
}

function renderTasks() {
  els.taskProgress.textContent = `${state.completedTasks.length}/${tasks.length}`;
  els.taskStack.innerHTML = tasks.map((task) => {
    const done = state.completedTasks.includes(task.id);
    return `
      <article class="task-card ${done ? "completed" : ""}">
        <span class="task-icon">${task.icon}</span>
        <div>
          <span class="task-meta">${task.meta}</span>
          <h4>${task.title}</h4>
          <p>${task.text}</p>
        </div>
        <button class="task-button" type="button" data-task="${task.id}" ${done ? "disabled" : ""}>
          ${done ? "已完成" : "完成"}
        </button>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-task]").forEach((button) => {
    button.addEventListener("click", () => completeTask(button.dataset.task));
  });
}

function renderStats() {
  const passPercent = Math.min(100, Math.round((state.xp % 240) / 240 * 100) + 28);
  els.energyScore.textContent = state.energy;
  els.levelLabel.textContent = `Lv.${state.level}`;
  els.streakLabel.textContent = `连续 ${state.streak} 天`;
  els.coinsLabel.textContent = state.coins;
  els.rankLabel.textContent = state.rankGap <= 0 ? "#1" : "#2";
  els.onlineLabel.textContent = teammates.filter((item) => item.status !== "未打卡").length;
  els.rankGap.textContent = state.rankGap;
  els.squadProgress.style.width = `${Math.min(100, 88 - state.rankGap / 3)}%`;
  els.passLevel.textContent = `等级 ${state.level}`;
  els.passProgress.style.width = `${passPercent}%`;
}

function renderRun() {
  els.runState.textContent = state.run.active ? "记录中" : "未开始";
  els.runToggle.textContent = state.run.active ? "暂停" : "开始";
  els.distanceLabel.textContent = `${state.run.distance.toFixed(2)} km`;
  els.timeLabel.textContent = formatTime(state.run.seconds);
  els.runReward.textContent = `${state.run.reward} XP`;

  const pointIndex = Math.min(routePoints.length - 1, Math.floor(state.run.progress * (routePoints.length - 1)));
  const point = routePoints[pointIndex];
  els.playerDot.style.left = `${point.left}px`;
  els.playerDot.style.top = `${point.top}px`;
}

function tickRun() {
  state.run.seconds += 4;
  state.run.progress = Math.min(1, state.run.progress + 0.08);
  state.run.distance = Math.min(2, state.run.progress * 2);
  state.run.reward = Math.round(state.run.progress * 120);

  if (state.run.progress >= 1) {
    stopRun();
    if (!state.completedTasks.includes("run2k")) {
      completeTask("run2k");
    }
    showToast("跑图完成", "模拟 GPS 轨迹已结算，虚拟补给点奖励已进入账户。");
  }

  saveState();
  render();
}

function startRun() {
  state.run.active = true;
  runTimer = setInterval(tickRun, 700);
  saveState();
  renderRun();
}

function stopRun() {
  state.run.active = false;
  if (runTimer) {
    clearInterval(runTimer);
    runTimer = null;
  }
  saveState();
  renderRun();
}

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${secs}`;
}

function renderSquad() {
  els.teammateList.innerHTML = teammates.map((mate) => {
    const nudged = state.nudged.includes(mate.id);
    return `
      <article class="teammate-card">
        <span class="avatar">${mate.avatar}</span>
        <div>
          <h4>${mate.name} · ${mate.status}</h4>
          <p>${mate.text}</p>
        </div>
        <button class="mini-button" type="button" data-nudge="${mate.id}" ${nudged ? "disabled" : ""}>
          ${nudged ? "已助攻" : "助攻"}
        </button>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-nudge]").forEach((button) => {
    button.addEventListener("click", () => nudgeTeammate(button.dataset.nudge));
  });

  els.leagueList.innerHTML = leagues.map((league) => {
    const joined = state.joinedLeagues.includes(league.id);
    return `
      <article class="league-card">
        <div class="league-card-top">
          <div>
            <h4>${league.title}</h4>
            <p>${league.text}</p>
          </div>
          <span class="league-tag">${joined ? "已加入" : league.tag}</span>
        </div>
        <button class="mini-button" type="button" data-league="${league.id}" ${joined ? "disabled" : ""}>
          ${joined ? "进行中" : "加入"}
        </button>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-league]").forEach((button) => {
    button.addEventListener("click", () => joinLeague(button.dataset.league));
  });
}

function nudgeTeammate(id) {
  if (state.nudged.includes(id)) {
    return;
  }
  state.nudged.push(id);
  state.coins += 10;
  state.xp += 30;
  if (!state.completedTasks.includes("squad")) {
    completeTask("squad");
  } else {
    saveState();
    render();
  }
  showToast("助攻已发送", "对方收到轻提醒，你获得社交协作奖励。");
}

function joinLeague(id) {
  if (state.joinedLeagues.includes(id)) {
    return;
  }
  state.joinedLeagues.push(id);
  state.rankGap = Math.max(0, state.rankGap - 12);
  saveState();
  render();
  showToast("挑战已加入", "新的战队任务会出现在今日任务流中。");
}

function renderBadges() {
  els.badgeGrid.innerHTML = badges.map((badge) => {
    const unlocked = badge.unlocked(state);
    return `
      <article class="badge-card ${unlocked ? "unlocked" : "locked"}">
        <span class="badge-icon">${badge.icon}</span>
        <div class="badge-card-top">
          <h4>${badge.title}</h4>
          <span class="badge-state">${unlocked ? "已解锁" : "未解锁"}</span>
        </div>
        <p>${badge.text}</p>
      </article>
    `;
  }).join("");
}

function buyItem(type) {
  const price = type === "meal" ? 180 : 260;
  if (state.purchased.includes(type)) {
    showToast("已兑换", "这个奖励已经在你的背包里。");
    return;
  }
  if (state.coins < price) {
    showToast("金币不足", "完成今日任务或跑图可以继续获得金币。");
    return;
  }
  state.coins -= price;
  state.purchased.push(type);
  saveState();
  render();
  showToast("兑换成功", type === "meal" ? "健康餐券已加入账户。" : "队伍跑道皮肤已解锁。");
}

function render() {
  renderStats();
  renderTasks();
  renderRun();
  renderSquad();
  renderBadges();
}

els.choiceCards.forEach((button) => {
  button.addEventListener("click", () => {
    els.choiceCards.forEach((card) => card.classList.remove("selected"));
    button.classList.add("selected");
    state.goal = button.dataset.goal;
    saveState();
  });
});

els.startApp.addEventListener("click", () => {
  state.onboarded = true;
  saveState();
  switchScreen("home");
});

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    switchScreen(tab.dataset.tabTarget);
  });
});

document.querySelectorAll("[data-tab-target]").forEach((button) => {
  if (button.classList.contains("tab")) {
    return;
  }
  button.addEventListener("click", () => switchScreen(button.dataset.tabTarget));
});

document.querySelector("[data-action='reset']").addEventListener("click", () => {
  stopRun();
  state = structuredClone(defaultState);
  saveState();
  render();
  switchScreen("onboarding");
  showToast("演示已重置", "新手引导、任务和奖励回到初始状态。");
});

els.runToggle.addEventListener("click", () => {
  if (state.run.progress >= 1) {
    state.run = structuredClone(defaultState.run);
  }
  state.run.active ? stopRun() : startRun();
});

els.nudgeAll.addEventListener("click", () => {
  teammates.forEach((mate) => {
    if (!state.nudged.includes(mate.id)) {
      state.nudged.push(mate.id);
    }
  });
  state.coins += 24;
  state.xp += 60;
  if (!state.completedTasks.includes("squad")) {
    state.completedTasks.push("squad");
  }
  saveState();
  render();
  showToast("已催练全队", "用轻提醒推动熟人圈一起完成今天的运动。");
});

document.querySelectorAll("[data-shop]").forEach((button) => {
  button.addEventListener("click", () => buyItem(button.dataset.shop));
});

if (state.run.active) {
  startRun();
}

render();
switchScreen(state.onboarded ? "home" : "onboarding");
