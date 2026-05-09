const STORAGE_KEY = "movequest-demo-state";

const quests = [
  {
    id: "stretch",
    title: "课间 8 分钟唤醒拉伸",
    tagline: "适合上课前或图书馆久坐后完成，先用低门槛动作启动身体。",
    xp: 80,
    coins: 15,
    social: "宿舍队 +1 连击"
  },
  {
    id: "run",
    title: "操场快走 / 慢跑 2 公里",
    tagline: "用最容易坚持的有氧任务覆盖晚饭后时间，适合新手长期复用。",
    xp: 140,
    coins: 28,
    social: "联赛贡献 +12"
  },
  {
    id: "strength",
    title: "寝室 15 分钟核心训练",
    tagline: "无器械完成，支持和室友一起打卡，降低运动组织成本。",
    xp: 120,
    coins: 24,
    social: "解锁双倍奖励"
  }
];

const challenges = [
  {
    id: "dorm-battle",
    title: "宿舍杯 7 日连击赛",
    description: "4 人组队，累计打卡次数越多，宿舍排名越靠前。",
    slots: "3 / 4 人就位",
    reward: "胜出队伍获限定头像框 + 食堂健康餐券",
    progress: 76
  },
  {
    id: "sunrise-run",
    title: "晨跑唤醒局",
    description: "连续 5 天早于 8:00 完成运动，适合想建立晨练节律的人。",
    slots: "18 人参与",
    reward: "晨练徽章 + 赛季声望",
    progress: 44
  },
  {
    id: "society-burn",
    title: "社团燃脂 PK",
    description: "按社团统计总运动时长，适合社团拉新和集体展示。",
    slots: "舞蹈社领先 12 分",
    reward: "社团主页置顶 + 荣誉海报",
    progress: 88
  }
];

const feedItems = [
  {
    id: "wen",
    name: "沛雯",
    title: "刚完成夜跑 3km",
    note: "她说：和舍友一起下楼后，开始这件事就没那么难了。",
    time: "2 分钟前",
    avatar: "沛"
  },
  {
    id: "hao",
    name: "子豪",
    title: "完成 20 分钟核心训练",
    note: "已经连续打卡 6 天，正在冲击“寝室带练官”徽章。",
    time: "11 分钟前",
    avatar: "豪"
  },
  {
    id: "yi",
    name: "嘉仪",
    title: "发起了今晚操场组队局",
    note: "还差 1 人就能成团，加入后双方都能拿到协作奖励。",
    time: "18 分钟前",
    avatar: "仪"
  }
];

const badges = [
  {
    id: "rookie",
    title: "运动开机者",
    description: "完成 1 次今日任务后解锁，强化“先开始”心智。",
    check: (state) => state.completedQuests.length >= 1
  },
  {
    id: "streak7",
    title: "连续 7 天在线",
    description: "适合建立初步运动惯性。",
    check: (state) => state.streak >= 7
  },
  {
    id: "social3",
    title: "气氛组队友",
    description: "累计鼓励 3 位好友后解锁，把围观变成参与。",
    check: (state) => state.cheeredIds.length >= 3
  },
  {
    id: "squad",
    title: "战队发起人",
    description: "加入任意联赛后解锁，强化群体归属感。",
    check: (state) => Boolean(state.joinedChallenge)
  }
];

const defaultHeatmap = [1, 2, 0, 3, 1, 2, 0, 1, 0, 2, 3, 1, 2, 1];

const defaultState = {
  xp: 780,
  streak: 12,
  weeklyActivity: 86,
  contribution: 320,
  supportCount: 23,
  completedQuests: ["stretch"],
  cheeredIds: [],
  joinedChallenge: "dorm-battle",
  heatmap: defaultHeatmap,
  plan: null
};

const els = {
  heroStreak: document.getElementById("hero-streak"),
  heroActivity: document.getElementById("hero-activity"),
  heroContribution: document.getElementById("hero-contribution"),
  levelValue: document.getElementById("level-value"),
  xpValue: document.getElementById("xp-value"),
  dailyScore: document.getElementById("daily-score"),
  socialPulse: document.getElementById("social-pulse"),
  questList: document.getElementById("quest-list"),
  questProgressText: document.getElementById("quest-progress-text"),
  questProgressBar: document.getElementById("quest-progress-bar"),
  planForm: document.getElementById("plan-form"),
  planOutput: document.getElementById("plan-output"),
  challengeList: document.getElementById("challenge-list"),
  feedList: document.getElementById("feed-list"),
  calendarGrid: document.getElementById("calendar-grid"),
  seasonTrackFill: document.getElementById("season-track-fill"),
  badgeList: document.getElementById("badge-list"),
  supportCount: document.getElementById("support-count"),
  supportBar: document.getElementById("support-bar"),
  toastRegion: document.getElementById("toast-region"),
  resetButton: document.getElementById("reset-demo"),
  questsPanel: document.getElementById("quests-panel"),
  planPanel: document.getElementById("plan-panel"),
  socialSection: document.getElementById("social")
};

let state = loadState();

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(defaultState);
    }
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed
    };
  } catch (error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getLevel() {
  return Math.max(1, Math.floor(state.xp / 120));
}

function getDailyScore() {
  const base = state.completedQuests.length * 22 + (state.joinedChallenge ? 10 : 0) + state.cheeredIds.length * 4;
  return Math.min(100, base + 24);
}

function showToast(title, message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
  els.toastRegion.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 2400);
}

function renderHeaderStats() {
  els.heroStreak.textContent = `${state.streak} 天`;
  els.heroActivity.textContent = `${state.weeklyActivity}%`;
  els.heroContribution.textContent = `+${state.contribution}`;
  els.levelValue.textContent = `Lv.${getLevel()}`;
  els.xpValue.textContent = `${state.xp} XP`;
  els.dailyScore.textContent = `${getDailyScore()} / 100`;
  els.socialPulse.textContent = `${14 + state.cheeredIds.length} 位好友本周已打卡`;
  els.supportCount.textContent = `${state.supportCount} 次`;
  els.supportBar.style.width = `${Math.min(100, 52 + state.cheeredIds.length * 6)}%`;
}

function renderQuests() {
  const completedCount = state.completedQuests.length;
  els.questProgressText.textContent = `已完成 ${completedCount} / ${quests.length}`;
  els.questProgressBar.style.width = `${(completedCount / quests.length) * 100}%`;

  els.questList.innerHTML = quests.map((quest) => {
    const done = state.completedQuests.includes(quest.id);
    return `
      <article class="quest-card ${done ? "completed" : ""}">
        <div class="quest-top">
          <div>
            <div class="quest-title">${quest.title}</div>
            <p class="quest-tagline">${quest.tagline}</p>
          </div>
          <span class="pill ${done ? "success" : ""}">${done ? "已完成" : "待挑战"}</span>
        </div>
        <div class="quest-rewards">
          <span class="reward-chip">+${quest.xp} XP</span>
          <span class="reward-chip">+${quest.coins} 动量币</span>
          <span class="reward-chip">${quest.social}</span>
        </div>
        <button type="button" data-quest="${quest.id}" ${done ? "disabled" : ""}>
          ${done ? "任务已完成" : "完成任务"}
        </button>
      </article>
    `;
  }).join("");

  els.questList.querySelectorAll("[data-quest]").forEach((button) => {
    button.addEventListener("click", () => completeQuest(button.dataset.quest));
  });
}

function completeQuest(questId) {
  if (state.completedQuests.includes(questId)) {
    return;
  }

  const quest = quests.find((item) => item.id === questId);
  if (!quest) {
    return;
  }

  state.completedQuests.push(questId);
  state.xp += quest.xp;
  state.contribution += 28;
  state.weeklyActivity = Math.min(99, state.weeklyActivity + 3);

  const todayIndex = state.heatmap.length - 1;
  state.heatmap[todayIndex] = Math.min(3, state.heatmap[todayIndex] + 1);

  if (state.completedQuests.length === quests.length) {
    state.streak += 1;
    state.supportCount += 2;
    showToast("全任务达成", "今日战队积分翻倍，连续打卡天数 +1。");
  } else {
    showToast("任务结算成功", `获得 ${quest.xp} XP，并为宿舍战队贡献了 28 点。`);
  }

  saveState();
  render();
}

function renderChallenges() {
  els.challengeList.innerHTML = challenges.map((challenge) => {
    const active = state.joinedChallenge === challenge.id;
    return `
      <article class="challenge-card ${active ? "active" : ""}">
        <div class="challenge-top">
          <div>
            <div class="challenge-title">${challenge.title}</div>
            <p class="challenge-meta">${challenge.description}</p>
          </div>
          <span class="pill ${active ? "accent" : ""}">${active ? "已加入" : "可加入"}</span>
        </div>
        <div class="challenge-stats">
          <span class="stat-chip">${challenge.slots}</span>
          <span class="stat-chip">${challenge.reward}</span>
        </div>
        <div class="leaderboard-bar">
          <span style="width: ${challenge.progress}%"></span>
        </div>
        <button type="button" class="${active ? "active" : ""}" data-challenge="${challenge.id}">
          ${active ? "当前挑战中" : "加入挑战"}
        </button>
      </article>
    `;
  }).join("");

  els.challengeList.querySelectorAll("[data-challenge]").forEach((button) => {
    button.addEventListener("click", () => joinChallenge(button.dataset.challenge));
  });
}

function joinChallenge(challengeId) {
  if (state.joinedChallenge === challengeId) {
    showToast("挑战已在进行中", "你已经加入当前联赛，可以继续完成今日任务提升排名。");
    return;
  }

  state.joinedChallenge = challengeId;
  state.contribution += 36;
  state.supportCount += 1;
  saveState();
  render();
  showToast("战队加入成功", "新的联赛已激活，你的社交牵引和成就线都会同步增长。");
}

function renderFeed() {
  els.feedList.innerHTML = feedItems.map((item) => {
    const cheered = state.cheeredIds.includes(item.id);
    return `
      <article class="feed-card">
        <div class="avatar">${item.avatar}</div>
        <div class="feed-body">
          <div class="feed-top">
            <div class="feed-title">${item.name} · ${item.title}</div>
            <span class="feed-meta">${item.time}</span>
          </div>
          <p>${item.note}</p>
        </div>
        <button
          type="button"
          class="${cheered ? "done" : ""}"
          data-cheer="${item.id}"
          ${cheered ? "disabled" : ""}
        >
          ${cheered ? "已鼓励" : "鼓励一下"}
        </button>
      </article>
    `;
  }).join("");

  els.feedList.querySelectorAll("[data-cheer]").forEach((button) => {
    button.addEventListener("click", () => cheerFriend(button.dataset.cheer));
  });
}

function cheerFriend(friendId) {
  if (state.cheeredIds.includes(friendId)) {
    return;
  }

  state.cheeredIds.push(friendId);
  state.supportCount += 3;
  state.xp += 12;
  saveState();
  render();
  showToast("互动已记录", "你的鼓励会让好友收到提醒，你也获得了社交协作积分。");
}

function renderCalendar() {
  els.calendarGrid.innerHTML = state.heatmap.map((level, index) => {
    const isToday = index === state.heatmap.length - 1;
    return `
      <button
        type="button"
        class="calendar-cell ${isToday ? "today is-clickable" : ""}"
        data-level="${level}"
        ${isToday ? 'data-day="today"' : "disabled"}
      >
        ${index + 1}
      </button>
    `;
  }).join("");

  const todayCell = els.calendarGrid.querySelector('[data-day="today"]');
  if (todayCell) {
    todayCell.addEventListener("click", addManualCheckin);
  }
}

function addManualCheckin() {
  const todayIndex = state.heatmap.length - 1;
  state.heatmap[todayIndex] = Math.min(3, state.heatmap[todayIndex] + 1);
  state.xp += 30;
  state.weeklyActivity = Math.min(99, state.weeklyActivity + 1);
  saveState();
  render();
  showToast("补登成功", "热力日历已更新，适合展示碎片化运动也值得被记录。");
}

function renderBadges() {
  els.badgeList.innerHTML = badges.map((badge) => {
    const unlocked = badge.check(state);
    return `
      <article class="badge-card ${unlocked ? "unlocked" : "locked"}">
        <div class="badge-top">
          <div class="badge-title">${badge.title}</div>
          <span>${unlocked ? "已解锁" : "未解锁"}</span>
        </div>
        <p>${badge.description}</p>
      </article>
    `;
  }).join("");
}

function renderSeason() {
  const fill = Math.min(100, 42 + state.completedQuests.length * 12 + state.cheeredIds.length * 4);
  els.seasonTrackFill.style.width = `${fill}%`;
}

function renderPlan() {
  const plan = state.plan || buildPlan({
    goal: "fatloss",
    time: "25",
    mood: "steady"
  });

  els.planOutput.innerHTML = `
    <h3>${plan.title}</h3>
    <p>${plan.summary}</p>
    <ul>
      ${plan.steps.map((step) => `<li>${step}</li>`).join("")}
    </ul>
    <p><strong>完成收益：</strong>${plan.reward}</p>
  `;
}

function buildPlan(values) {
  const goalMap = {
    fatloss: {
      title: "减脂塑形 · 晚饭后轻燃路线",
      reward: "预计消耗 160-220 kcal，并为联赛贡献额外 10 点冲刺值。"
    },
    endurance: {
      title: "提高体能 · 心肺推进路线",
      reward: "强化心肺耐力，适合把“跑两圈很难”过渡到“能稳定完成”。"
    },
    stress: {
      title: "缓解压力 · 舒压恢复路线",
      reward: "降低开始难度，更适合考试周与高压时段坚持。"
    },
    muscle: {
      title: "轻力量增肌 · 寝室力量路线",
      reward: "利用无器械动作强化核心和下肢，适合宿舍场景。"
    }
  };

  const moodMap = {
    low: "今天不追求强度，先完成启动动作，优先保住连续性。",
    steady: "今天适合稳步推进，控制在可持续、不过度透支的区间。",
    high: "今天状态在线，可以加入一段冲刺，把奖励感受做得更强。"
  };

  const time = Number(values.time);
  const steps = [
    `热身 ${Math.max(4, Math.round(time * 0.2))} 分钟，快速唤醒踝膝髋和肩背。`,
    `主任务 ${Math.max(8, Math.round(time * 0.5))} 分钟，围绕目标完成核心动作组合。`,
    `收尾 ${Math.max(3, Math.round(time * 0.2))} 分钟，放松并完成一次战队打卡分享。`
  ];

  if (values.goal === "endurance") {
    steps[1] = `主任务 ${Math.max(10, Math.round(time * 0.56))} 分钟，采用快走 + 慢跑交替方式提升体能。`;
  }

  if (values.goal === "stress") {
    steps[1] = `主任务 ${Math.max(10, Math.round(time * 0.52))} 分钟，选择快走、开合跳和舒展组合降低压力。`;
  }

  if (values.goal === "muscle") {
    steps[1] = `主任务 ${Math.max(10, Math.round(time * 0.55))} 分钟，完成深蹲、平板支撑和俯卧撑循环。`;
  }

  if (values.mood === "high") {
    steps.push("最后加 3 分钟冲刺挑战，完成后可触发额外 Battle Pass 碎片。");
  }

  return {
    title: goalMap[values.goal].title,
    summary: `${moodMap[values.mood]} 系统会优先匹配 ${values.time} 分钟内可完成的路线，并自动把它拆成容易执行的小段。`,
    steps,
    reward: goalMap[values.goal].reward
  };
}

function render() {
  renderHeaderStats();
  renderQuests();
  renderChallenges();
  renderFeed();
  renderCalendar();
  renderBadges();
  renderSeason();
  renderPlan();
}

els.planForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(els.planForm);
  state.plan = buildPlan({
    goal: formData.get("goal"),
    time: formData.get("time"),
    mood: formData.get("mood")
  });
  saveState();
  renderPlan();
  showToast("AI 路线已生成", "系统已经按照目标、时间和状态给出了最适合今天的运动任务。");
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "focus-quests") {
      els.questsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (action === "scroll-plan") {
      els.planPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (action === "scroll-social") {
      els.socialSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

els.resetButton.addEventListener("click", () => {
  state = structuredClone(defaultState);
  saveState();
  render();
  showToast("演示数据已重置", "页面回到了初始状态，适合重新演示完整产品流程。");
});

render();
