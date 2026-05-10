const STORAGE_KEY = "movequest-pet-v6";
const ACCOUNT_PREFIX = "movequest-account-v1:";
const EXTRA_SNACK_STEPS = 420;
const WEATHER_CACHE_MS = 18 * 60 * 1000;
const DEFAULT_CAMPUS_LOCATION = {
  latitude: 30.2741,
  longitude: 120.1551,
  place: "默认校园"
};

const petTypes = {
  sprout: {
    label: "青团球",
    defaultName: "团团",
    trait: "圆滚滚、反应快，适合从课间散步开始。",
    stages: [
      { name: "小圆球", min: 0, days: 0, copy: "刚被领养，只会轻轻弹一下。" },
      { name: "弹弹球", min: 180, days: 3, copy: "会追着你的步数左右滚动。" },
      { name: "光环球", min: 520, days: 7, copy: "连续运动后会出现柔光轨迹。" }
    ]
  },
  cloud: {
    label: "云方块",
    defaultName: "方方",
    trait: "轻盈、爱跳，适合碎片化走动。",
    stages: [
      { name: "小方块", min: 0, days: 0, copy: "像一块软糖，开心时会转角。" },
      { name: "旋转方", min: 180, days: 3, copy: "会在小屋里做轻微翻转。" },
      { name: "晴空方", min: 520, days: 7, copy: "能把运动后的心情变成天空色。" }
    ]
  },
  otter: {
    label: "橘三角",
    defaultName: "角角",
    trait: "活泼、能量高，适合操场挑战。",
    stages: [
      { name: "小三角", min: 0, days: 0, copy: "站得很稳，等你带它出门。" },
      { name: "冲刺角", min: 180, days: 3, copy: "投喂后会像箭头一样弹起。" },
      { name: "浪花角", min: 520, days: 7, copy: "完成高强度目标后，会解锁流线光纹。" }
    ]
  },
  cat: {
    label: "星胶囊",
    defaultName: "星星",
    trait: "好奇、爱探索，适合晚饭后散步。",
    stages: [
      { name: "小胶囊", min: 0, days: 0, copy: "刚住进小屋，会慢慢巡游。" },
      { name: "星光囊", min: 180, days: 3, copy: "夜晚走路后会亮起星点。" },
      { name: "月光囊", min: 520, days: 7, copy: "能在校园夜路上找到隐藏明信片。" }
    ]
  }
};

const evolutionBranches = {
  speed: {
    label: "疾行分支",
    name: "风轨形态",
    shape: "sphere",
    tone: "mint",
    condition: "累计 3 天完成今日目标",
    unlock: "适合操场快走、晨跑和连续打卡。",
    copy: "宠物会在小屋里留下短短的光轨，运动时更容易触发额外活力。"
  },
  social: {
    label: "社交分支",
    name: "团聚形态",
    shape: "cube",
    tone: "sky",
    condition: "完成 2 次好友串门或双人便当",
    unlock: "适合和同学互相提醒，但步数仍要自己完成。",
    copy: "宠物会带回更多好友合照，串门奖励更容易出现。"
  },
  explore: {
    label: "探索分支",
    name: "星旅形态",
    shape: "capsule",
    tone: "sun",
    condition: "收集 3 张校园明信片",
    unlock: "适合晚饭后散步、图书馆和食堂路线。",
    copy: "宠物会更常发现隐藏地点，明信片会出现更丰富的来信。"
  }
};

const plans = {
  easy: {
    label: "课间散步",
    target: 600,
    copy: "先走 600 步，分 3 次把宠物喂饱。",
    milestones: [
      { steps: 180, food: "bean" },
      { steps: 360, food: "berry" },
      { steps: 600, food: "milk" }
    ]
  },
  daily: {
    label: "校园快走",
    target: 1200,
    copy: "今天走 1200 步，解锁 4 份食物。",
    milestones: [
      { steps: 250, food: "bean" },
      { steps: 550, food: "berry" },
      { steps: 850, food: "toast" },
      { steps: 1200, food: "milk" }
    ]
  },
  hard: {
    label: "操场一圈",
    target: 2000,
    copy: "走到 2000 步，完成一整套照顾。",
    milestones: [
      { steps: 300, food: "bean" },
      { steps: 700, food: "berry" },
      { steps: 1100, food: "toast" },
      { steps: 1550, food: "ball" },
      { steps: 2000, food: "milk" }
    ]
  }
};

const foods = {
  bean: { name: "青柠能量豆", symbol: "豆", bond: 8, xp: 8, copy: "适合第一段路后的轻投喂。" },
  berry: { name: "蓝莓冻干", symbol: "莓", bond: 9, xp: 10, copy: "酸甜小零食，宠物会开心摇晃。" },
  toast: { name: "鸡蛋吐司", symbol: "吐", bond: 10, xp: 12, copy: "走到中段后的正餐奖励。" },
  ball: { name: "弹弹球", symbol: "球", bond: 8, xp: 8, copy: "不是食物，但能陪它玩一轮。" },
  milk: { name: "晚安奶昔", symbol: "奶", bond: 12, xp: 14, copy: "今天最后一口，喂完可以去校园探索。" },
  friend: { name: "好友蓝莓干", symbol: "友", bond: 10, xp: 0, copy: "好友宠物带来的串门礼物。" }
};

const tripLocations = [
  {
    id: "library",
    name: "图书馆窗边",
    symbol: "书",
    cost: 1,
    minSteps: 600,
    xp: 8,
    bond: 6,
    title: "窗边自习明信片",
    copy: "它在图书馆窗边睡了一小会儿，带回一枚安静贴纸。"
  },
  {
    id: "track",
    name: "操场夜风",
    symbol: "风",
    cost: 1,
    minSteps: 1000,
    xp: 10,
    bond: 6,
    title: "操场夜风明信片",
    copy: "它绕着跑道看了两圈，带回一张带风声的照片。"
  },
  {
    id: "canteen",
    name: "食堂后门",
    symbol: "饭",
    cost: 2,
    minSteps: 1500,
    xp: 14,
    bond: 8,
    title: "食堂香气明信片",
    copy: "它在食堂门口闻到了烤红薯，认真带回一张香气贴纸。"
  }
];

const achievements = [
  { id: "adopt", title: "领养伙伴", copy: "选择一只宠物。", done: (s) => s.adopted },
  { id: "walk", title: "带它出门", copy: "开始一次走动采集。", done: (s) => s.steps > 0 },
  { id: "weather", title: "顺天气运动", copy: "根据天气完成一次运动建议。", done: (s) => s.weatherEventDay === s.day },
  { id: "feed", title: "第一口", copy: "完成第一次投喂。", done: (s) => s.fed.length > 0 },
  { id: "play", title: "一起玩球", copy: "用步数活力陪宠物玩。", done: (s) => s.played },
  { id: "social", title: "好友串门", copy: "完成一次宠物社交。", done: (s) => s.friendUsed || s.visitSent },
  { id: "groupWalk", title: "结伴运动", copy: "和好友或校园 NPC 宠物一起运动。", done: (s) => s.groupWalkDone },
  { id: "invite", title: "约走成功", copy: "向好友发起一起走路。", done: (s) => s.inviteSent },
  { id: "postcard", title: "校园明信片", copy: "让宠物完成一次校园探索。", done: (s) => s.postcards.length > 0 },
  { id: "full", title: "今日喂饱", copy: "完成今日所有投喂。", done: (s) => s.completed },
  { id: "threeDays", title: "三天照料", copy: "累计完成 3 天照料。", done: (s) => s.careDays >= 3 },
  { id: "evolve", title: "第一次进化", copy: "宠物进入第二阶段。", done: () => currentStage().index > 0 }
];

const defaultState = {
  introSeen: false,
  adopted: false,
  activeTab: "home",
  day: todayKey(),
  account: "campus01",
  password: "move2026",
  name: "阿澈",
  avatar: "leaf",
  avatarImage: "",
  avatarZoom: 120,
  avatarY: 50,
  petType: "sprout",
  petName: "团团",
  plan: "daily",
  steps: 0,
  totalSteps: 0,
  fed: [],
  bond: 28,
  growth: 0,
  careEnergy: 0,
  careDays: 0,
  streak: 0,
  campusSnacks: 0,
  postcards: [],
  stamps: [],
  trips: 0,
  walkBonusesClaimed: 0,
  completionLoggedDay: "",
  friendUsed: false,
  inviteSent: false,
  visitSent: false,
  teamCompleted: false,
  groupWalkDone: false,
  eggState: "none",
  eggProgress: 0,
  eggReadyDay: "",
  played: false,
  cleaned: false,
  completed: false,
  weather: {
    temp: null,
    code: null,
    wind: null,
    precipitation: null,
    label: "获取中",
    advice: "获取天气后，会给出更适合今天的运动建议。",
    intensity: "轻松走",
    source: "未定位",
    place: "校园天气",
    updatedAt: 0
  },
  weatherEventDay: "",
  weatherEventTitle: "",
  weatherEventCopy: "",
  collecting: false
};

const els = {
  shell: document.querySelector(".app-shell"),
  screens: [...document.querySelectorAll(".screen")],
  loginStart: document.getElementById("login-start"),
  registerStart: document.getElementById("register-start"),
  authBack: document.getElementById("auth-back"),
  authModeButtons: [...document.querySelectorAll("[data-auth-mode]")],
  authEyebrow: document.getElementById("auth-eyebrow"),
  authTitle: document.getElementById("auth-title"),
  authCopy: document.getElementById("auth-copy"),
  authSubmit: document.getElementById("auth-submit"),
  setupForm: document.getElementById("setup-form"),
  accountInput: document.getElementById("account-input"),
  passwordInput: document.getElementById("password-input"),
  nameInput: document.getElementById("name-input"),
  petInput: document.getElementById("pet-input"),
  goalSelect: document.getElementById("goal-select"),
  petChoices: [...document.querySelectorAll("[data-pet-choice]")],
  avatarChoices: [...document.querySelectorAll("[data-avatar-choice]")],
  avatarUpload: document.getElementById("avatar-upload"),
  avatarPreview: document.getElementById("avatar-preview"),
  avatarEditorPreview: document.getElementById("avatar-editor-preview"),
  avatarZoom: document.getElementById("avatar-zoom"),
  avatarY: document.getElementById("avatar-y"),
  customAvatarButton: document.getElementById("custom-avatar-button"),
  userAvatar: document.getElementById("user-avatar"),
  userName: document.getElementById("user-name"),
  userLevel: document.getElementById("user-level"),
  profileBadge: document.getElementById("profile-badge"),
  profileChip: document.getElementById("profile-chip"),
  goalLabel: document.getElementById("goal-label"),
  petName: document.getElementById("pet-name"),
  streakLabel: document.getElementById("streak-label"),
  dailySummary: document.getElementById("daily-summary"),
  weatherChip: document.getElementById("weather-chip"),
  weatherCompactTitle: document.getElementById("weather-compact-title"),
  weatherSummary: document.getElementById("weather-summary"),
  weatherOrb: document.getElementById("weather-orb"),
  weatherPlace: document.getElementById("weather-place"),
  weatherTitle: document.getElementById("weather-title"),
  weatherAdvice: document.getElementById("weather-advice"),
  weatherIntensity: document.getElementById("weather-intensity"),
  weatherBonus: document.getElementById("weather-bonus"),
  weatherEventCopy: document.getElementById("weather-event-copy"),
  refreshWeather: document.getElementById("refresh-weather"),
  stepsLabel: document.getElementById("steps-label"),
  fedLabel: document.getElementById("fed-label"),
  stageLabel: document.getElementById("stage-label"),
  petRoom: document.getElementById("pet-room"),
  petButton: document.getElementById("pet-button"),
  pet3d: document.getElementById("pet-3d"),
  foodPop: document.getElementById("food-pop"),
  moodBubble: document.getElementById("mood-bubble"),
  nextLabel: document.getElementById("next-label"),
  walkTitle: document.getElementById("walk-title"),
  walkProgress: document.getElementById("walk-progress"),
  motionButton: document.getElementById("motion-button"),
  motionLabel: document.getElementById("motion-label"),
  motionSubtitle: document.getElementById("motion-subtitle"),
  patAction: document.getElementById("pat-action"),
  playAction: document.getElementById("play-action"),
  playCost: document.getElementById("play-cost"),
  cleanAction: document.getElementById("clean-action"),
  foodCount: document.getElementById("food-count"),
  foodList: document.getElementById("food-list"),
  campusSnackCount: document.getElementById("campus-snack-count"),
  postcardCount: document.getElementById("postcard-count"),
  tripList: document.getElementById("trip-list"),
  postcardGrid: document.getElementById("postcard-grid"),
  friendTitle: document.getElementById("friend-title"),
  friendCopy: document.getElementById("friend-copy"),
  friendButton: document.getElementById("friend-button"),
  socialWalkSummary: document.getElementById("social-walk-summary"),
  socialRunTitle: document.getElementById("social-run-title"),
  socialRunCopy: document.getElementById("social-run-copy"),
  eggVisual: document.getElementById("egg-visual"),
  eggTitle: document.getElementById("egg-title"),
  eggCopy: document.getElementById("egg-copy"),
  eggProgress: document.getElementById("egg-progress"),
  inviteButton: document.getElementById("invite-button"),
  teamButton: document.getElementById("team-button"),
  teamCopy: document.getElementById("team-copy"),
  teamProgress: document.getElementById("team-progress"),
  visitButton: document.getElementById("visit-button"),
  visitCopy: document.getElementById("visit-copy"),
  growthLabel: document.getElementById("growth-label"),
  evolutionTitle: document.getElementById("evolution-title"),
  evolutionCopy: document.getElementById("evolution-copy"),
  evolutionProgress: document.getElementById("evolution-progress"),
  evolutionPreview: document.getElementById("evolution-preview"),
  branchPicker: document.getElementById("branch-picker"),
  stageList: document.getElementById("stage-list"),
  achievementCount: document.getElementById("achievement-count"),
  achievementGrid: document.getElementById("achievement-grid"),
  pathSteps: [...document.querySelectorAll("[data-path-step]")],
  tabButtons: [...document.querySelectorAll("[data-tab]")],
  panels: [...document.querySelectorAll("[data-panel]")],
  badges: {
    walk: document.getElementById("badge-walk"),
    feed: document.getElementById("badge-feed"),
    full: document.getElementById("badge-full")
  },
  resultModal: document.getElementById("result-modal"),
  resultSymbol: document.getElementById("result-symbol"),
  resultTitle: document.getElementById("result-title"),
  resultCopy: document.getElementById("result-copy"),
  closeResult: document.getElementById("close-result"),
  helpButton: document.getElementById("help-button"),
  guideModal: document.getElementById("guide-modal"),
  closeGuide: document.getElementById("close-guide"),
  avatarModal: document.getElementById("avatar-modal"),
  closeAvatarEditor: document.getElementById("close-avatar-editor"),
  featureSheet: document.getElementById("feature-sheet"),
  closeFeatureSheet: document.getElementById("close-feature-sheet"),
  sheetEyebrow: document.getElementById("sheet-eyebrow"),
  sheetTitle: document.getElementById("sheet-title"),
  sheetCopy: document.getElementById("sheet-copy"),
  sheetContents: [...document.querySelectorAll("[data-sheet-content]")],
  openPanelButtons: [...document.querySelectorAll("[data-open-panel]")],
  postcardModal: document.getElementById("postcard-modal"),
  closePostcard: document.getElementById("close-postcard"),
  letterSymbol: document.getElementById("letter-symbol"),
  letterPlace: document.getElementById("letter-place"),
  letterTitle: document.getElementById("letter-title"),
  letterCopy: document.getElementById("letter-copy"),
  letterSign: document.getElementById("letter-sign"),
  petFloat: document.getElementById("pet-float"),
  petFloatMain: document.getElementById("pet-float-main"),
  petFloatClose: document.getElementById("pet-float-close"),
  petFloatRestore: document.getElementById("pet-float-restore"),
  floatPetName: document.getElementById("float-pet-name"),
  floatPetStatus: document.getElementById("float-pet-status"),
  toastRegion: document.getElementById("toast-region"),
  confettiLayer: document.getElementById("confetti-layer")
};

let state = loadState();
let selectedPetType = state.petType;
let selectedAvatar = state.avatar;
let selectedAvatarImage = state.avatarImage || "";
let selectedAvatarZoom = state.avatarZoom || 120;
let selectedAvatarY = state.avatarY || 50;
let collectTimer = null;
let lastMotionAt = 0;
let currentSheet = "";
let authMode = "login";
let previewBranchId = "speed";

const sheetMeta = {
  daily: {
    eyebrow: "今日计划",
    title: "今天只需要按三步走",
    copy: "先走路解锁食物，再投喂，喂饱后继续探索校园。"
  },
  weather: {
    eyebrow: "天气建议",
    title: "按今天的天气安排运动",
    copy: "真实天气会影响建议，也会影响随机宠物事件。"
  },
  feed: {
    eyebrow: "小屋投喂",
    title: "投喂和互动都在这里",
    copy: "走到节点解锁食物，活力可以用来陪宠物玩。"
  },
  care: {
    eyebrow: "小屋互动",
    title: "摸摸、玩球和洗澡都在这里",
    copy: "日常互动可以提升亲密度，但运动节点仍然是核心来源。"
  },
  explore: {
    eyebrow: "校园探索",
    title: "已合并到校园来信",
    copy: "探索和明信片放在同一个抽屉里。"
  },
  postcards: {
    eyebrow: "校园来信",
    title: "派宠物探索，再读它带回来的信",
    copy: "每次探索都需要你先完成现实运动。"
  },
  invite: {
    eyebrow: "结伴运动",
    title: "和好友、校园 NPC 宠物一起动起来",
    copy: "同屏运动动画负责制造陪伴感，真实步数仍然来自你自己。"
  },
  team: {
    eyebrow: "双人协作",
    title: "一起做一份宠物便当",
    copy: "你和好友合计达标后，两只宠物都能获得奖励。"
  },
  visit: {
    eyebrow: "宠物串门",
    title: "让宠物去好友小屋玩",
    copy: "喂饱后开放，带回一张社交明信片。"
  },
  friendsBoard: {
    eyebrow: "好友小屋",
    title: "协作、串门和动态放在一起",
    copy: "社交负责启动行动，但不会替代自己的步数。"
  },
  achievements: {
    eyebrow: "成就墙",
    title: "每个徽章都对应一次真实行动",
    copy: "成就不是虚拟积分，而是运动、照顾和社交行为的记录。"
  },
  stages: {
    eyebrow: "进化图鉴",
    title: "宠物不会一天毕业",
    copy: "进化需要连续照料天数和成长值，适合长期坚持。"
  }
};

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeState(savedState) {
  const today = todayKey();
  const next = { ...structuredClone(defaultState), ...savedState };
  const validTabs = ["home", "friends", "growth"];

  next.fed = Array.isArray(next.fed) ? next.fed : [];
  next.postcards = Array.isArray(next.postcards) ? next.postcards : [];
  next.stamps = Array.isArray(next.stamps) ? next.stamps : [];
  next.weather = { ...structuredClone(defaultState.weather), ...(savedState?.weather || {}) };
  next.activeTab = validTabs.includes(next.activeTab) ? next.activeTab : "home";
  next.day = next.day || today;

  if (next.day !== today) {
    next.day = today;
    next.activeTab = "home";
    next.steps = 0;
    next.fed = [];
    next.careEnergy = 0;
    next.walkBonusesClaimed = 0;
    next.friendUsed = false;
    next.inviteSent = false;
    next.visitSent = false;
    next.teamCompleted = false;
    next.groupWalkDone = false;
    next.eggReadyDay = "";
    next.played = false;
    next.cleaned = false;
    next.completed = false;
    next.weatherEventDay = "";
    next.weatherEventTitle = "";
    next.weatherEventCopy = "";
    next.collecting = false;
  }

  return next;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (state.account) {
    localStorage.setItem(accountStorageKey(state.account), JSON.stringify(state));
  }
}

function accountStorageKey(account) {
  return `${ACCOUNT_PREFIX}${account.trim().toLowerCase()}`;
}

function loadAccountState(account) {
  try {
    const raw = localStorage.getItem(accountStorageKey(account));
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function petType() {
  return petTypes[state.petType] || petTypes.sprout;
}

function selectedPet() {
  return petTypes[selectedPetType] || petTypes.sprout;
}

function avatarText() {
  return (state.name || els.nameInput.value || "我").trim().slice(0, 1) || "我";
}

function formAvatarText() {
  return (els.nameInput.value || state.name || "我").trim().slice(0, 1) || "我";
}

function userLevel() {
  return Math.max(1, Math.floor((state.growth + state.totalSteps / 80 + state.careDays * 40) / 120) + 1);
}

function plan() {
  return plans[state.plan] || plans.daily;
}

function milestones() {
  return plan().milestones;
}

function switchScreen(name) {
  els.screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });
}

function setAuthMode(mode) {
  authMode = mode === "register" ? "register" : "login";
  const isRegister = authMode === "register";
  const adoptScreen = document.querySelector(".adopt-screen");
  adoptScreen.dataset.mode = authMode;
  els.authModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === authMode);
  });
  els.authEyebrow.textContent = isRegister ? "注册账号" : "登录账号";
  els.authTitle.textContent = isRegister ? "创建你的校园小屋。" : "回到你的宠物小屋。";
  els.authCopy.textContent = isRegister
    ? "设置账号、头像和宠物，今天的步数会从这里开始记录。"
    : "输入校园账号和密码，继续照顾你的宠物。";
  els.authSubmit.textContent = isRegister ? "创建账号并进入小屋" : "登录并进入小屋";
  els.passwordInput.autocomplete = isRegister ? "new-password" : "current-password";
  els.passwordInput.value = "";
  if (!els.accountInput.value.trim()) els.accountInput.value = isRegister ? "campus01" : "";
}

function openAuth(mode) {
  setAuthMode(mode);
  switchScreen("adopt");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fedCount() {
  return state.fed.length;
}

function stageReached(stage) {
  return state.growth >= stage.min && state.careDays >= (stage.days || 0);
}

function currentStage() {
  const stages = petType().stages;
  return stages.reduce((current, stage, index) => {
    return stageReached(stage) ? { ...stage, index } : current;
  }, { ...stages[0], index: 0 });
}

function nextStage() {
  return petType().stages.find((stage) => !stageReached(stage));
}

function unlockedIndexes() {
  return milestones()
    .map((item, index) => ({ ...item, index }))
    .filter((item) => state.steps >= item.steps);
}

function availableIndexes() {
  return unlockedIndexes().filter((item) => !state.fed.includes(item.index));
}

function nextMilestone() {
  return milestones().find((item, index) => state.steps < item.steps && !state.fed.includes(index));
}

function petMood() {
  if (state.collecting) return "walking";
  if (state.completed) return "full";
  if (availableIndexes().length > 0) return "ready";
  if (state.careEnergy > 0) return "playful";
  if (fedCount() === 0) return "hungry";
  return state.bond >= 70 ? "happy" : "calm";
}

function moodText() {
  const available = availableIndexes();
  const next = nextMilestone();
  if (state.completed) return `${state.petName}已经吃饱，可以带着便当去探索校园。`;
  if (available.length > 0) return `${foods[available[0].food].name}已经解锁，可以去投喂页喂它。`;
  if (state.collecting) return `${state.petName}在等你走到下一个投喂节点。`;
  if (next) return `再走 ${next.steps - state.steps} 步，解锁下一份食物。`;
  return "食物都解锁了，把它们喂给宠物吧。";
}

function weatherKind(code = 0, precipitation = 0, wind = 0, temp = 22) {
  if (precipitation > 0.1 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(Number(code))) {
    return "rain";
  }
  if (wind >= 28) return "wind";
  if (temp >= 31) return "hot";
  if (temp <= 7) return "cold";
  if ([0, 1].includes(Number(code))) return "sun";
  if ([2, 3, 45, 48].includes(Number(code))) return "cloud";
  return "mild";
}

function weatherLabel(kind) {
  const labels = {
    sun: "晴",
    cloud: "多云",
    rain: "有雨",
    wind: "风大",
    hot: "偏热",
    cold: "偏冷",
    mild: "适合运动"
  };
  return labels[kind] || labels.mild;
}

function weatherSuggestion(weather = state.weather) {
  const temp = Number(weather.temp ?? 22);
  const wind = Number(weather.wind ?? 0);
  const precipitation = Number(weather.precipitation ?? 0);
  const kind = weatherKind(weather.code, precipitation, wind, temp);
  const suggestions = {
    sun: {
      intensity: "户外快走",
      advice: "天气适合出门。建议走到教学楼或操场边，完成一段 10 分钟快走。",
      eventTitle: "追光弹跳",
      eventCopy: `${state.petName}追着阳光滚了一圈，成长值 +12。`
    },
    cloud: {
      intensity: "舒适散步",
      advice: "云量适中，适合课间走一段。建议用碎片时间凑齐下一个投喂节点。",
      eventTitle: "云影转圈",
      eventCopy: `${state.petName}踩着云影转了一圈，亲密度 +8。`
    },
    rain: {
      intensity: "室内路线",
      advice: "外面可能下雨。建议走教学楼连廊、宿舍楼道或室内场馆，避免湿滑路面。",
      eventTitle: "伞下散步",
      eventCopy: `${state.petName}听着雨声慢慢弹跳，成长值 +10。`
    },
    wind: {
      intensity: "低风阻路线",
      advice: "风比较大。建议选择楼宇之间或室内路线，降低强度，完成短段步行即可。",
      eventTitle: "顺风滑行",
      eventCopy: `${state.petName}被风轻轻推着滑了一小段，获得 1 份便当。`
    },
    hot: {
      intensity: "避暑慢走",
      advice: "天气偏热。建议避开午后，选择傍晚树荫路线，带水，降低强度。",
      eventTitle: "冰饮休息",
      eventCopy: `${state.petName}喝到一口冰饮，心情明显变好了。`
    },
    cold: {
      intensity: "热身短走",
      advice: "天气偏冷。建议先热身，再走宿舍到食堂这类短路线，注意保暖。",
      eventTitle: "围巾蹦跳",
      eventCopy: `${state.petName}裹着小围巾蹦了一下，亲密度 +8。`
    },
    mild: {
      intensity: "轻松快走",
      advice: "天气稳定。建议完成一段校园快走，把下一个食物节点走出来。",
      eventTitle: "稳定节奏",
      eventCopy: `${state.petName}跟上了你的节奏，成长值 +10。`
    }
  };
  return { kind, label: weatherLabel(kind), ...suggestions[kind] };
}

function updateWeatherState(payload, source, place) {
  const nextWeather = {
    ...state.weather,
    temp: payload.temp,
    code: payload.code,
    wind: payload.wind,
    precipitation: payload.precipitation,
    source,
    place,
    updatedAt: Date.now()
  };
  const suggestion = weatherSuggestion(nextWeather);
  state.weather = {
    ...nextWeather,
    label: suggestion.label,
    advice: suggestion.advice,
    intensity: suggestion.intensity
  };
}

function fallbackWeather(reason = "定位不可用") {
  updateWeatherState(
    {
      temp: 23,
      code: 2,
      wind: 9,
      precipitation: 0
    },
    reason,
    DEFAULT_CAMPUS_LOCATION.place
  );
  saveState();
  render();
}

async function fetchWeatherByCoords(latitude, longitude, source = "当前位置") {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,precipitation,weather_code,wind_speed_10m",
    timezone: "auto"
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) throw new Error("weather request failed");
  const data = await response.json();
  const current = data.current || {};
  updateWeatherState(
    {
      temp: Math.round(Number(current.temperature_2m ?? 23)),
      code: Number(current.weather_code ?? 2),
      wind: Math.round(Number(current.wind_speed_10m ?? 9)),
      precipitation: Number(current.precipitation ?? 0)
    },
    source,
    source
  );
  saveState();
  render();
}

function refreshWeather(force = false) {
  if (!force && Date.now() - Number(state.weather.updatedAt || 0) < WEATHER_CACHE_MS) return;

  if (!navigator.geolocation) {
    fallbackWeather("默认校园");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeatherByCoords(position.coords.latitude, position.coords.longitude, "当前位置").catch(() => {
        fetchWeatherByCoords(DEFAULT_CAMPUS_LOCATION.latitude, DEFAULT_CAMPUS_LOCATION.longitude, "默认校园").catch(() => fallbackWeather("天气服务不可用"));
      });
    },
    () => {
      fetchWeatherByCoords(DEFAULT_CAMPUS_LOCATION.latitude, DEFAULT_CAMPUS_LOCATION.longitude, "默认校园").catch(() => fallbackWeather("默认校园"));
    },
    { enableHighAccuracy: false, timeout: 3800, maximumAge: WEATHER_CACHE_MS }
  );
}

function maybeTriggerWeatherEvent(amount) {
  if (state.weatherEventDay === state.day || state.steps < 180 || amount < 60) return;
  const suggestion = weatherSuggestion();
  const baseChance = ["rain", "wind", "hot", "cold"].includes(suggestion.kind) ? 0.28 : 0.2;
  const stepBonus = clamp(amount / 900, 0, 0.18);
  if (Math.random() > baseChance + stepBonus) return;

  const beforeStage = currentStage().index;
  state.weatherEventDay = state.day;
  state.weatherEventTitle = suggestion.eventTitle;
  state.weatherEventCopy = suggestion.eventCopy;
  state.bond = clamp(state.bond + 8, 0, 100);
  state.growth += suggestion.kind === "wind" ? 8 : 10;
  if (suggestion.kind === "wind") state.campusSnacks += 1;
  setPetReaction("pet-play", 980);
  showGrowthResult(beforeStage, "天", suggestion.eventTitle, suggestion.eventCopy);
  confetti(16);
}

function showToast(title, text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong><p>${text}</p>`;
  els.toastRegion.appendChild(toast);
  setTimeout(() => toast.remove(), 2300);
}

function showResult(symbol, title, copy) {
  els.resultSymbol.textContent = symbol;
  els.resultTitle.textContent = title;
  els.resultCopy.textContent = copy;
  els.resultModal.classList.add("active");
  els.resultModal.setAttribute("aria-hidden", "false");
}

function closeResult() {
  els.resultModal.classList.remove("active");
  els.resultModal.setAttribute("aria-hidden", "true");
}

function openSheet(name) {
  const meta = sheetMeta[name];
  if (!meta) return;

  currentSheet = name;
  els.sheetEyebrow.textContent = meta.eyebrow;
  els.sheetTitle.textContent = meta.title;
  els.sheetCopy.textContent = meta.copy;
  els.sheetContents.forEach((content) => {
    content.classList.toggle("active", content.dataset.sheetContent === name);
  });
  els.featureSheet.classList.add("active");
  els.featureSheet.setAttribute("aria-hidden", "false");
}

function closeSheet() {
  currentSheet = "";
  els.featureSheet.classList.remove("active");
  els.featureSheet.setAttribute("aria-hidden", "true");
}

function openPostcard(cardId) {
  const card = state.postcards.find((item) => item.id === cardId);
  if (!card) return;

  els.letterSymbol.textContent = card.symbol;
  els.letterPlace.textContent = card.place;
  els.letterTitle.textContent = card.title;
  els.letterCopy.textContent = `“${card.copy}”`;
  els.letterSign.textContent = `${card.day.slice(5)} · 来自 ${state.petName}`;
  els.postcardModal.classList.add("active");
  els.postcardModal.setAttribute("aria-hidden", "false");
}

function closePostcard() {
  els.postcardModal.classList.remove("active");
  els.postcardModal.setAttribute("aria-hidden", "true");
}

function setPetFloatHidden(hidden) {
  els.petFloat.classList.toggle("hidden", hidden);
  els.petFloatRestore.classList.toggle("active", hidden);
}

function confetti(count = 14) {
  const colors = ["#dfff4f", "#ff7a59", "#3f6df6", "#ffd166", "#68e0c2"];
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${Math.random() * 32}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 160}ms`;
    els.confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 1200);
  }
}

function setPetReaction(className, duration = 720) {
  els.pet3d.classList.remove("pet-fed", "pet-patted", "pet-walk", "pet-evolve", "pet-play", "pet-clean");
  void els.pet3d.offsetWidth;
  els.pet3d.classList.add(className);
  setTimeout(() => els.pet3d.classList.remove(className), duration);
}

function popFood(food) {
  els.foodPop.textContent = food.symbol;
  els.foodPop.classList.remove("active");
  void els.foodPop.offsetWidth;
  els.foodPop.classList.add("active");
  setTimeout(() => els.foodPop.classList.remove("active"), 900);
}

function addSteps(amount) {
  const before = unlockedIndexes().length;
  const beforeSteps = state.steps;
  state.steps = clamp(state.steps + amount, 0, 99999);
  state.totalSteps += Math.max(0, state.steps - beforeSteps);
  const after = unlockedIndexes().length;

  if (after > before) {
    const unlocked = unlockedIndexes()[after - 1];
    const food = foods[unlocked.food];
    state.careEnergy += after - before;
    showToast("食物已解锁", `${food.name}可以投喂了。`);
    setPetReaction("pet-walk", 680);
  }

  const extraSnacks = Math.floor(Math.max(0, state.steps - plan().target) / EXTRA_SNACK_STEPS);
  if (extraSnacks > state.walkBonusesClaimed) {
    const earned = extraSnacks - state.walkBonusesClaimed;
    state.walkBonusesClaimed = extraSnacks;
    state.campusSnacks += earned;
    showToast("找到旅行便当", `继续散步获得 ${earned} 份便当，可用于校园探索。`);
  }

  maybeTriggerWeatherEvent(amount);
  saveState();
  render();
}

function showGrowthResult(beforeStage, symbol, title, copy) {
  const afterStage = currentStage();
  if (afterStage.index > beforeStage) {
    setPetReaction("pet-evolve", 1100);
    showResult("进", `${state.petName}进化到${afterStage.name}`, afterStage.copy);
    confetti(30);
    return;
  }

  showResult(symbol, title, copy);
}

async function toggleCollecting() {
  if (state.collecting) {
    stopCollecting();
    return;
  }

  state.collecting = true;
  saveState();
  render();

  if (window.DeviceMotionEvent?.requestPermission) {
    try {
      await window.DeviceMotionEvent.requestPermission();
    } catch {
      // Timed collection keeps the product playable in a browser demo.
    }
  }

  collectTimer = setInterval(() => {
    addSteps(Math.floor(Math.random() * 55) + 95);
  }, 760);
}

function stopCollecting() {
  state.collecting = false;
  if (collectTimer) {
    clearInterval(collectTimer);
    collectTimer = null;
  }
  saveState();
  render();
}

function handleMotion(event) {
  if (!state.collecting) return;
  const acc = event.accelerationIncludingGravity;
  if (!acc) return;
  const power = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
  const now = Date.now();
  if (power > 24 && now - lastMotionAt > 420) {
    lastMotionAt = now;
    addSteps(22);
  }
}

function feed(index) {
  const milestone = milestones()[index];
  if (!milestone || state.fed.includes(index)) return;
  if (state.steps < milestone.steps) {
    showToast("还没解锁", `再走 ${milestone.steps - state.steps} 步才能投喂。`);
    return;
  }

  const beforeStage = currentStage().index;
  const food = foods[milestone.food];
  state.fed.push(index);
  state.bond = clamp(state.bond + food.bond, 0, 100);
  state.growth += food.xp;
  const afterStage = currentStage();
  popFood(food);
  confetti(afterStage.index > beforeStage ? 30 : 16);

  if (afterStage.index > beforeStage) {
    setPetReaction("pet-evolve", 1100);
    showResult("进", `${state.petName}进化到${afterStage.name}`, afterStage.copy);
  } else {
    setPetReaction("pet-fed", 900);
    showResult(food.symbol, `喂了${food.name}`, `${state.petName}亲密度 +${food.bond}，成长值 +${food.xp}。`);
  }

  if (state.fed.length >= milestones().length && !state.completed) {
    state.completed = true;
    if (state.completionLoggedDay !== state.day) {
      state.streak += 1;
      state.careDays += 1;
      state.campusSnacks += 1;
      state.completionLoggedDay = state.day;
      showToast("今日照料完成", "获得 1 份旅行便当，宠物可以去校园探索。");
    }
  }

  saveState();
  render();
}

function patPet() {
  state.bond = clamp(state.bond + 2, 0, 100);
  setPetReaction("pet-patted", 620);
  showToast("摸摸成功", `${state.petName}蹭了蹭你的手。`);
  saveState();
  render();
}

function playWithPet() {
  if (state.careEnergy <= 0) {
    showToast("还没有活力", "走到一个步数节点后，就能陪它玩球。");
    return;
  }

  const beforeStage = currentStage().index;
  state.careEnergy -= 1;
  state.played = true;
  state.bond = clamp(state.bond + 8, 0, 100);
  state.growth += 6;
  popFood({ symbol: "球" });
  setPetReaction("pet-play", 900);
  showGrowthResult(beforeStage, "球", "玩球成功", `${state.petName}追着球跑了一圈，成长值 +6。`);
  confetti(12);
  saveState();
  render();
}

function cleanPet() {
  if (fedCount() === 0) {
    showToast("还不能洗澡", "先完成一次投喂，它才愿意进浴盆。");
    return;
  }

  if (state.cleaned) {
    showToast("已经洗香香", "今天的小澡已经完成。");
    return;
  }

  const beforeStage = currentStage().index;
  state.cleaned = true;
  state.bond = clamp(state.bond + 6, 0, 100);
  state.growth += 6;
  popFood({ symbol: "泡" });
  setPetReaction("pet-clean", 900);
  showGrowthResult(beforeStage, "泡", "洗澡完成", `${state.petName}变得亮晶晶，成长值 +6。`);
  confetti(10);
  saveState();
  render();
}

function useFriendSnack() {
  if (state.friendUsed) return;
  const food = foods.friend;
  state.friendUsed = true;
  state.bond = clamp(state.bond + food.bond, 0, 100);
  popFood(food);
  setPetReaction("pet-fed", 850);
  showResult(food.symbol, "小雨送来蓝莓干", "串门礼物只加心情，不替代你的步数目标。");
  confetti(12);
  saveState();
  render();
}

function inviteFriendWalk() {
  const beforeStage = currentStage().index;
  const gainedSteps = state.groupWalkDone ? 120 : 260;
  state.inviteSent = true;
  state.groupWalkDone = true;
  state.bond = clamp(state.bond + 10, 0, 100);
  state.growth += 8;
  state.eggProgress = clamp(state.eggProgress + (state.steps >= 600 ? 34 : 24), 0, 100);
  addSteps(gainedSteps);

  if (state.eggState === "none") {
    state.eggState = "warming";
    state.eggProgress = Math.max(state.eggProgress, 28);
    popFood({ symbol: "蛋" });
    setPetReaction("pet-play", 960);
    showGrowthResult(beforeStage, "蛋", "获得步步蛋", "三只宠物一起跑完一段路，带回了一枚会随步数孵化的步步蛋。");
  } else if (state.eggProgress >= 100 && state.eggState !== "hatched") {
    state.eggState = "hatched";
    state.eggReadyDay = state.day;
    state.campusSnacks += 2;
    popFood({ symbol: "生" });
    setPetReaction("pet-evolve", 1100);
    showGrowthResult(beforeStage, "生", "步步蛋孵化了", "蛋里跑出一枚校园贴纸宠物，获得 2 份旅行便当。");
    confetti(24);
  } else {
    if (state.eggState === "hatched") state.campusSnacks += 1;
    popFood({ symbol: "跑" });
    setPetReaction("pet-walk", 900);
    showGrowthResult(beforeStage, "跑", "结伴运动完成", state.eggState === "hatched"
      ? `新伙伴跟着队伍一起跑，带回 1 份旅行便当。`
      : `你和小雨、风团一起完成 ${gainedSteps} 步热身，步步蛋进度 +${state.steps >= 600 ? 34 : 24}。`);
  }

  saveState();
  render();
}

function completeTeamChallenge() {
  const friendSteps = 920;
  const total = state.steps + friendSteps;
  if (state.teamCompleted) {
    showToast("已经合喂", "今天的双人便当已经做好。");
    return;
  }

  if (total < 1500) {
    showToast("还差一点", `你们合计还差 ${1500 - total} 步做便当。`);
    return;
  }

  const beforeStage = currentStage().index;
  state.teamCompleted = true;
  state.bond = clamp(state.bond + 12, 0, 100);
  state.growth += 10;
  state.campusSnacks += 1;
  popFood({ symbol: "盒" });
  setPetReaction("pet-fed", 900);
  showGrowthResult(beforeStage, "盒", "双人便当完成", `${state.petName}和团团一起吃了便当，获得 1 份旅行便当，成长值 +10。`);
  confetti(18);
  saveState();
  render();
}

function addPostcard(location, source = "trip") {
  state.postcards.push({
    id: `${location.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: location.title,
    place: location.name,
    symbol: location.symbol,
    copy: location.copy,
    source,
    day: state.day
  });

  if (!state.stamps.includes(location.id)) {
    state.stamps.push(location.id);
  }

  if (state.postcards.length > 24) {
    state.postcards = state.postcards.slice(-24);
  }
}

function startTrip(locationId) {
  const location = tripLocations.find((item) => item.id === locationId);
  if (!location) return;

  if (!state.completed) {
    showToast("先完成投喂", "宠物吃饱后才有力气去校园探索。");
    return;
  }

  if (state.steps < location.minSteps) {
    showToast("步数还不够", `今天走到 ${location.minSteps} 步，才能去${location.name}。`);
    return;
  }

  if (state.campusSnacks < location.cost) {
    showToast("便当不够", "完成今日投喂或继续散步，可以获得旅行便当。");
    return;
  }

  const beforeStage = currentStage().index;
  state.campusSnacks -= location.cost;
  state.trips += 1;
  state.bond = clamp(state.bond + location.bond, 0, 100);
  state.growth += location.xp;
  addPostcard(location);
  popFood({ symbol: location.symbol });
  setPetReaction("pet-play", 900);
  showGrowthResult(beforeStage, location.symbol, `${state.petName}去了${location.name}`, `${location.copy} 成长值 +${location.xp}。`);
  confetti(14);
  saveState();
  render();
}

function sendPetVisit() {
  if (state.visitSent) {
    showToast("已经串门", "今天已经去小雨的小屋玩过了。");
    return;
  }

  if (!state.completed) {
    showToast("先喂饱它", "今日喂饱后，再让宠物去好友小屋串门。");
    return;
  }

  const location = {
    id: "friend-room",
    name: "小雨的小屋",
    symbol: "合",
    title: "好友小屋合照",
    copy: `${state.petName}和团团在小屋里交换了贴纸。`
  };
  const beforeStage = currentStage().index;
  state.visitSent = true;
  state.bond = clamp(state.bond + 8, 0, 100);
  state.growth += 6;
  addPostcard(location, "social");
  setPetReaction("pet-patted", 760);
  showGrowthResult(beforeStage, "合", "串门成功", `${location.copy} 成长值 +6。`);
  confetti(12);
  saveState();
  render();
}

function setTab(tab) {
  state.activeTab = tab;
  els.shell.dataset.activeTab = tab;
  els.tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  els.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tab));
  saveState();
}

function selectPet(type) {
  selectedPetType = type;
  const pet = selectedPet();
  els.petChoices.forEach((button) => button.classList.toggle("selected", button.dataset.petChoice === type));
  els.shell.dataset.pet = type;
  els.petInput.value = pet.defaultName;
}

function selectAvatar(type, clearImage = true) {
  selectedAvatar = type;
  if (clearImage) selectedAvatarImage = "";
  els.avatarChoices.forEach((button) => button.classList.toggle("selected", button.dataset.avatarChoice === type));
  renderAvatarPreview();
}

function applyAvatar(el, type, text, image = "", zoom = 120, y = 50) {
  if (!el) return;
  if (image) {
    el.className = "user-avatar avatar-custom";
    el.textContent = "";
    el.style.backgroundImage = `url("${image}")`;
    el.style.backgroundSize = `${zoom}%`;
    el.style.backgroundPosition = `50% ${y}%`;
    return;
  }

  el.className = `user-avatar avatar-${type}`;
  el.textContent = text;
  el.style.removeProperty("background-image");
  el.style.removeProperty("background-size");
  el.style.removeProperty("background-position");
}

function renderAvatarPreview() {
  if (!els.avatarPreview) return;
  applyAvatar(els.avatarPreview, selectedAvatar, formAvatarText(), selectedAvatarImage, selectedAvatarZoom, selectedAvatarY);
  applyAvatar(els.avatarEditorPreview, selectedAvatar, formAvatarText(), selectedAvatarImage, selectedAvatarZoom, selectedAvatarY);
  if (els.avatarZoom) els.avatarZoom.value = selectedAvatarZoom;
  if (els.avatarY) els.avatarY.value = selectedAvatarY;
}

function renderFoodList() {
  els.foodList.innerHTML = milestones().map((item, index) => {
    const food = foods[item.food];
    const done = state.fed.includes(index);
    const ready = state.steps >= item.steps && !done;
    const left = Math.max(0, item.steps - state.steps);
    const status = done ? "已投喂" : ready ? "可以投喂" : `还差 ${left} 步`;
    const button = done ? "已吃掉" : ready ? "投喂" : `${item.steps} 步`;
    return `
      <article class="food-card ${ready ? "ready" : ""} ${done ? "done" : ""}">
        <div class="food-symbol">${food.symbol}</div>
        <div>
          <strong>${food.name}</strong>
          <p>${food.copy}</p>
          <span>${status}</span>
        </div>
        <button type="button" data-feed="${index}" ${ready ? "" : "disabled"}>${button}</button>
      </article>
    `;
  }).join("");

  els.foodList.querySelectorAll("[data-feed]").forEach((button) => {
    button.addEventListener("click", () => feed(Number(button.dataset.feed)));
  });
}

function renderExplore() {
  els.campusSnackCount.textContent = String(state.campusSnacks);
  els.postcardCount.textContent = state.postcards.length;
  els.tripList.innerHTML = tripLocations.map((location) => {
    const enoughSteps = state.steps >= location.minSteps;
    const enoughSnacks = state.campusSnacks >= location.cost;
    const ready = state.completed && enoughSteps && enoughSnacks;
    const status = !state.completed
      ? "今日喂饱后开放"
      : !enoughSteps
        ? `还差 ${location.minSteps - state.steps} 步`
        : !enoughSnacks
          ? "便当不足"
          : "可以出发";

    return `
      <article class="trip-card ${ready ? "ready" : ""}">
        <div class="trip-symbol">${location.symbol}</div>
        <div>
          <strong>${location.name}</strong>
          <p>${location.title} · 需要 ${location.cost} 份便当</p>
          <span>${status}</span>
        </div>
        <button type="button" data-trip="${location.id}">出发</button>
      </article>
    `;
  }).join("");

  els.tripList.querySelectorAll("[data-trip]").forEach((button) => {
    button.addEventListener("click", () => startTrip(button.dataset.trip));
  });

  const recentPostcards = state.postcards.slice(-4).reverse();
  els.postcardGrid.innerHTML = recentPostcards.length
    ? recentPostcards.map((card) => `
      <button class="postcard-card" type="button" data-postcard="${card.id}">
        <span>${card.symbol}</span>
        <strong>${card.title}</strong>
        <small>${card.place} · ${card.day.slice(5)}</small>
      </button>
    `).join("")
    : `
      <article class="empty-card">
        <span>空</span>
        <strong>还没有明信片</strong>
        <small>完成投喂后，派宠物去校园探索。</small>
      </article>
    `;

  els.postcardGrid.querySelectorAll("[data-postcard]").forEach((button) => {
    button.addEventListener("click", () => openPostcard(button.dataset.postcard));
  });
}

function renderBadges() {
  if (!els.badges.walk || !els.badges.feed || !els.badges.full) return;
  const walked = state.steps > 0;
  const fed = fedCount() > 0;
  const full = state.completed;
  els.badges.walk.classList.toggle("done", walked);
  els.badges.feed.classList.toggle("done", fed);
  els.badges.full.classList.toggle("done", full);
  els.badges.walk.querySelector("strong").textContent = `${walked ? 1 : 0}/1`;
  els.badges.feed.querySelector("strong").textContent = `${fed ? 1 : 0}/1`;
  els.badges.full.querySelector("strong").textContent = `${full ? 1 : 0}/1`;
}

function renderAchievements() {
  const items = achievements.map((achievement) => ({
    ...achievement,
    unlocked: achievement.done(state)
  }));
  const unlockedCount = items.filter((item) => item.unlocked).length;
  els.achievementCount.textContent = `${unlockedCount}/${items.length}`;
  els.achievementGrid.innerHTML = items.map((item) => `
    <article class="${item.unlocked ? "unlocked" : ""}">
      <strong>${item.title}</strong>
      <span>${item.unlocked ? "已解锁" : "未解锁"}</span>
      <p>${item.copy}</p>
    </article>
  `).join("");
}

function renderStages() {
  const current = currentStage();
  const branches = Object.entries(evolutionBranches);
  const selectedBranch = evolutionBranches[previewBranchId] || evolutionBranches.speed;
  const selectedEntry = branches.find(([id]) => id === previewBranchId) || branches[0];

  els.evolutionPreview.innerHTML = `
    <article class="branch-preview-card branch-${selectedBranch.tone}">
      <div class="branch-pet branch-shape-${selectedBranch.shape}" aria-hidden="true">
        <i></i><b></b><em></em>
      </div>
      <div>
        <span>未来预览</span>
        <strong>${selectedBranch.name}</strong>
        <p>${selectedBranch.copy}</p>
      </div>
    </article>
    <article class="branch-condition-card">
      <span>解锁条件</span>
      <strong>${selectedBranch.condition}</strong>
      <p>${selectedBranch.unlock}</p>
    </article>
  `;

  els.branchPicker.innerHTML = branches.map(([id, branch]) => `
    <button class="${id === selectedEntry[0] ? "active" : ""}" type="button" data-branch="${id}">
      <span>${branch.label}</span>
      <strong>${branch.name}</strong>
    </button>
  `).join("");

  els.branchPicker.querySelectorAll("[data-branch]").forEach((button) => {
    button.addEventListener("click", () => {
      previewBranchId = button.dataset.branch;
      renderStages();
    });
  });

  els.stageList.innerHTML = petType().stages.map((stage, index) => {
    const reached = stageReached(stage);
    const active = current.index === index;
    return `
      <article class="${reached ? "reached" : ""} ${active ? "active" : ""}">
        <strong>${stage.name}</strong>
        <span>${stage.days || 0} 天照料 · ${stage.min} 成长值</span>
        <p>${stage.copy}</p>
      </article>
    `;
  }).join("");
}

function renderEvolution() {
  const current = currentStage();
  const next = nextStage();
  const nextMin = next ? next.min : current.min + 100;
  const prevMin = current.min;
  const growthProgress = next ? clamp(((state.growth - prevMin) / (nextMin - prevMin)) * 100, 0, 100) : 100;
  const dayProgress = next ? clamp((state.careDays / Math.max(1, next.days || 1)) * 100, 0, 100) : 100;
  const progress = next ? Math.min(growthProgress, dayProgress) : 100;
  const growthLeft = next ? Math.max(0, next.min - state.growth) : 0;
  const daysLeft = next ? Math.max(0, (next.days || 0) - state.careDays) : 0;
  els.stageLabel.textContent = current.name;
  els.growthLabel.textContent = state.growth;
  els.evolutionTitle.textContent = `${petType().label} · ${current.name}`;
  els.evolutionCopy.textContent = next
    ? `进化到${next.name}还需要 ${daysLeft} 天照料、${growthLeft} 成长值。`
    : "已达到当前版本最高形态，继续收集校园明信片。";
  els.evolutionProgress.style.width = `${progress}%`;
  renderStages();
}

function renderPath() {
  const available = availableIndexes().length > 0;
  const steps = {
    walk: {
      done: state.steps > 0,
      active: !state.completed && !available
    },
    feed: {
      done: fedCount() > 0,
      active: !state.completed && available
    },
    explore: {
      done: state.postcards.length > 0 || state.trips > 0,
      active: state.completed
    }
  };

  els.pathSteps.forEach((item) => {
    const status = steps[item.dataset.pathStep];
    item.classList.toggle("done", Boolean(status?.done));
    item.classList.toggle("active", Boolean(status?.active));
  });
}

function renderWeatherSummary() {
  const suggestion = weatherSuggestion();
  const hasWeather = state.weather.temp !== null && state.weather.temp !== undefined;
  const tempText = hasWeather ? `${state.weather.temp}°` : "--";
  if (!hasWeather) {
    els.weatherChip.textContent = "天气";
    els.weatherCompactTitle.textContent = "获取中";
    els.weatherSummary.textContent = "自动生成运动建议";
    els.weatherOrb.textContent = "--";
    els.weatherPlace.textContent = "校园天气";
    els.weatherTitle.textContent = "正在获取天气";
    els.weatherAdvice.textContent = state.weather.advice;
    els.weatherIntensity.textContent = "待生成";
    els.weatherBonus.textContent = "运动后有概率触发";
    els.weatherEventCopy.textContent = "获取天气后，系统会根据晴雨冷热推荐更合适的校园运动路线。";
    return;
  }

  els.weatherChip.textContent = state.weather.label || suggestion.label;
  els.weatherCompactTitle.textContent = `${suggestion.intensity}`;
  els.weatherSummary.textContent = `${tempText} · ${suggestion.label}`;
  els.weatherOrb.textContent = tempText;
  els.weatherPlace.textContent = state.weather.place || "校园天气";
  els.weatherTitle.textContent = `${suggestion.label} · ${suggestion.intensity}`;
  els.weatherAdvice.textContent = state.weather.advice || suggestion.advice;
  els.weatherIntensity.textContent = suggestion.intensity;
  els.weatherBonus.textContent = state.weatherEventDay === state.day ? state.weatherEventTitle || "已触发" : "运动后有概率触发";
  els.weatherEventCopy.textContent = state.weatherEventDay === state.day
    ? state.weatherEventCopy
    : "例如晴天会触发“追光弹跳”，雨天会触发“伞下散步”，奖励成长值和亲密度。";
}

function renderSocialRun() {
  const eggReady = state.eggState === "hatched";
  const eggWarming = state.eggState === "warming";
  els.socialWalkSummary.textContent = eggReady ? "步步蛋已孵化" : eggWarming ? `${state.eggProgress}% 孵化` : "好友 + NPC";
  els.inviteButton.textContent = eggReady ? "继续结伴" : eggWarming ? "继续孵化" : "开始结伴";
  els.socialRunTitle.textContent = eggWarming
    ? "步步蛋正在跟着队伍发光"
    : eggReady
      ? "新伙伴也加入了跑道"
      : "三只宠物在操场集合";
  els.socialRunCopy.textContent = eggWarming
    ? "继续完成结伴运动，蛋会随真实步数慢慢孵化。"
    : eggReady
      ? "孵化后的贴纸宠物会跟着队伍跑，继续结伴可获得便当和成长值。"
      : "你、小雨和校园 NPC「风团」一起完成一段短走。真实步数越多，步步蛋越容易孵化。";
  els.eggVisual.textContent = eggReady ? "生" : "蛋";
  els.eggVisual.classList.toggle("hatched", eggReady);
  els.eggTitle.textContent = eggReady ? "贴纸宠物已孵化" : eggWarming ? "步步蛋孵化中" : "步步蛋";
  els.eggCopy.textContent = eggReady
    ? "它会作为结伴运动的小队成员出现，继续运动可获得额外便当。"
    : eggWarming
      ? `当前孵化进度 ${state.eggProgress}%。完成结伴运动或更多步数会继续升温。`
      : "完成结伴运动后，有机会获得一枚蛋。蛋会随每日步数慢慢孵化。";
  els.eggProgress.style.width = `${eggReady ? 100 : state.eggProgress}%`;
}

function render() {
  const currentPlan = plan();
  const available = availableIndexes();
  const next = nextMilestone();
  const progress = clamp((state.steps / currentPlan.target) * 100, 0, 100);
  const mood = petMood();
  const stage = currentStage();

  els.shell.dataset.pet = state.adopted ? state.petType : selectedPetType;
  els.shell.dataset.mood = mood;
  els.shell.dataset.stage = String(stage.index);
  els.shell.classList.toggle("walking", state.collecting);
  els.pet3d.style.setProperty("--growth", `${Math.min(1.16, 1 + state.growth / 1200)}`);
  els.nameInput.value = state.name;
  els.goalSelect.value = state.plan;
  if (state.adopted) els.petInput.value = state.petName;
  applyAvatar(els.userAvatar, state.avatar, avatarText(), state.avatarImage, state.avatarZoom, state.avatarY);
  els.userName.textContent = state.name;
  els.userLevel.textContent = `@${state.account} · Lv.${userLevel()}`;
  els.profileBadge.textContent = state.completed ? "可去校园探索" : available.length ? "有食物待喂" : "今日照顾中";
  els.goalLabel.textContent = currentPlan.label;
  els.petName.textContent = state.petName;
  els.floatPetName.textContent = state.petName;
  els.floatPetStatus.textContent = state.completed ? "想去校园探索" : available.length ? "等你投喂" : "在小屋等你";
  els.streakLabel.textContent = state.streak;
  els.dailySummary.textContent = `${state.steps}/${currentPlan.target} 步 · ${fedCount()}/${milestones().length} 已喂`;
  els.stepsLabel.textContent = state.steps;
  els.fedLabel.textContent = `${fedCount()}/${milestones().length}`;
  els.walkProgress.style.width = `${progress}%`;
  els.nextLabel.textContent = state.completed
    ? `已喂饱 · 继续走每 ${EXTRA_SNACK_STEPS} 步攒便当`
    : next
      ? `下个投喂：${next.steps} 步`
      : "食物已全部解锁";
  els.walkTitle.textContent = state.completed ? "带它去校园探索" : available.length ? "有食物可以投喂" : currentPlan.copy;
  els.motionLabel.textContent = state.collecting ? "暂停采集" : state.completed ? "继续散步" : "开始走动";
  els.motionSubtitle.textContent = state.completed ? "攒旅行便当和明信片" : available.length ? "去投喂页喂一口" : "走到节点解锁食物";
  els.motionButton.disabled = false;
  els.playAction.disabled = state.careEnergy <= 0;
  els.playCost.textContent = state.careEnergy;
  els.cleanAction.disabled = fedCount() === 0 || state.cleaned;
  els.cleanAction.querySelector("small").textContent = state.cleaned ? "今日已完成" : fedCount() > 0 ? "洗香香 +成长" : "投喂后解锁";
  els.foodCount.textContent = state.completed ? "0" : String(available.length);
  renderWeatherSummary();
  els.moodBubble.textContent = moodText();
  els.friendButton.disabled = state.friendUsed;
  els.friendButton.textContent = state.friendUsed ? "已收下" : "收下";
  els.friendTitle.textContent = state.friendUsed ? "团团已经回家" : "小雨的团团在门口";
  els.friendCopy.textContent = state.friendUsed ? `${state.petName}心情变好了，但步数还要自己走。` : "收下蓝莓干，给宠物加一点心情。";
  renderSocialRun();
  const teamTotal = state.steps + 920;
  const teamProgress = clamp((teamTotal / 1500) * 100, 0, 100);
  if (els.teamProgress) els.teamProgress.style.width = `${teamProgress}%`;
  if (els.teamButton) {
    els.teamButton.disabled = state.teamCompleted;
    els.teamButton.textContent = state.teamCompleted ? "已完成" : "合喂";
  }
  if (els.teamCopy) {
    els.teamCopy.textContent = state.teamCompleted ? "双人便当已完成，今天的好友协作达成。" : `你和小雨合计 ${Math.min(teamTotal, 1500)}/1500 步，可一起做便当。`;
  }
  if (els.visitButton) {
    els.visitButton.disabled = state.visitSent;
    els.visitButton.textContent = state.visitSent ? "已串门" : "串门";
  }
  if (els.visitCopy) els.visitCopy.textContent = state.visitSent
    ? `${state.petName}带回了一张好友小屋合照。`
    : state.completed
      ? `${state.petName}已经吃饱，可以去小雨的小屋玩一会儿。`
      : "今日喂饱后，可以让它去小雨的小屋玩一会儿。";

  renderFoodList();
  renderExplore();
  renderBadges();
  renderAchievements();
  renderEvolution();
  renderPath();
  setTab(state.activeTab);
  if (currentSheet) openSheet(currentSheet);
}

function tiltPet(event) {
  const rect = els.petRoom.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
  els.petRoom.style.setProperty("--tilt-x", `${y}deg`);
  els.petRoom.style.setProperty("--tilt-y", `${x}deg`);
}

els.loginStart.addEventListener("click", () => openAuth("login"));
els.registerStart.addEventListener("click", () => openAuth("register"));
els.authBack.addEventListener("click", () => switchScreen("intro"));
els.authModeButtons.forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
});

els.petChoices.forEach((button) => {
  button.addEventListener("click", () => selectPet(button.dataset.petChoice));
});

els.avatarChoices.forEach((button) => {
  button.addEventListener("click", () => selectAvatar(button.dataset.avatarChoice));
});

els.nameInput.addEventListener("input", renderAvatarPreview);

els.customAvatarButton.addEventListener("click", () => {
  els.avatarModal.classList.add("active");
  els.avatarModal.setAttribute("aria-hidden", "false");
});

els.avatarZoom.addEventListener("input", () => {
  selectedAvatarZoom = Number(els.avatarZoom.value);
  renderAvatarPreview();
});

els.avatarY.addEventListener("input", () => {
  selectedAvatarY = Number(els.avatarY.value);
  renderAvatarPreview();
});

els.avatarUpload.addEventListener("change", () => {
  const file = els.avatarUpload.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    selectedAvatarImage = String(reader.result || "");
    selectedAvatarZoom = Number(els.avatarZoom.value || 120);
    selectedAvatarY = Number(els.avatarY.value || 50);
    renderAvatarPreview();
  });
  reader.readAsDataURL(file);
});

els.profileChip.addEventListener("click", () => setTab("growth"));

els.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const account = els.accountInput.value.trim() || "campus01";
  const password = els.passwordInput.value.trim();

  if (password.length < 6) {
    showToast("密码太短", "为了像真实 App 一样完整，请设置至少 6 位密码。");
    return;
  }

  if (authMode === "login") {
    const savedAccount = loadAccountState(account);
    if (!savedAccount) {
      showToast("账号不存在", "请检查账号，或切换到注册新账号。");
      return;
    }
    if (savedAccount.password !== password) {
      showToast("密码不正确", "请重新输入旧账号的密码。");
      return;
    }

    state = normalizeState(savedAccount);
    state.collecting = false;
    selectedPetType = state.petType;
    selectedAvatar = state.avatar;
    selectedAvatarImage = state.avatarImage || "";
    selectedAvatarZoom = state.avatarZoom || 120;
    selectedAvatarY = state.avatarY || 50;
    selectPet(selectedPetType);
    selectAvatar(selectedAvatar, false);
    renderAvatarPreview();
    saveState();
    switchScreen("app");
    render();
    refreshWeather();
    showToast("登录成功", `${state.petName}已经在小屋等你。`);
    return;
  }

  if (loadAccountState(account)) {
    showToast("账号已存在", "请登录旧账号，或换一个校园账号。");
    return;
  }

  state = {
    ...structuredClone(defaultState),
    introSeen: true,
    adopted: true,
    activeTab: "home",
    day: todayKey(),
    account,
    password,
    name: els.nameInput.value.trim() || "阿澈",
    avatar: selectedAvatar,
    avatarImage: selectedAvatarImage,
    avatarZoom: selectedAvatarZoom,
    avatarY: selectedAvatarY,
    petType: selectedPetType,
    petName: els.petInput.value.trim() || selectedPet().defaultName,
    plan: els.goalSelect.value
  };
  saveState();
  switchScreen("app");
  render();
  refreshWeather(true);
  showResult("蛋", "领养成功", `${state.petName}住进小屋了。先走到第一个步数节点，再去投喂页喂它。`);
});

els.motionButton.addEventListener("click", toggleCollecting);
els.refreshWeather.addEventListener("click", () => {
  showToast("正在刷新天气", "会根据当前位置或默认校园生成建议。");
  refreshWeather(true);
});
els.petButton.addEventListener("click", patPet);
els.patAction.addEventListener("click", patPet);
els.playAction.addEventListener("click", playWithPet);
els.cleanAction.addEventListener("click", cleanPet);
els.friendButton.addEventListener("click", useFriendSnack);
els.inviteButton.addEventListener("click", inviteFriendWalk);
if (els.teamButton) els.teamButton.addEventListener("click", completeTeamChallenge);
if (els.visitButton) els.visitButton.addEventListener("click", sendPetVisit);
els.tabButtons.forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});
els.openPanelButtons.forEach((button) => {
  button.addEventListener("click", () => openSheet(button.dataset.openPanel));
});
els.petRoom.addEventListener("pointermove", tiltPet);
els.petRoom.addEventListener("pointerleave", () => {
  els.petRoom.style.setProperty("--tilt-x", "0deg");
  els.petRoom.style.setProperty("--tilt-y", "0deg");
});
els.closeFeatureSheet.addEventListener("click", closeSheet);
els.featureSheet.addEventListener("click", (event) => {
  if (event.target === els.featureSheet) closeSheet();
});
els.closePostcard.addEventListener("click", closePostcard);
els.postcardModal.addEventListener("click", (event) => {
  if (event.target === els.postcardModal) closePostcard();
});
els.petFloatMain.addEventListener("click", () => {
  setTab("home");
  closeSheet();
});
els.petFloatClose.addEventListener("click", () => setPetFloatHidden(true));
els.petFloatRestore.addEventListener("click", () => setPetFloatHidden(false));
els.closeResult.addEventListener("click", closeResult);
els.resultModal.addEventListener("click", (event) => {
  if (event.target === els.resultModal) closeResult();
});
els.helpButton.addEventListener("click", () => {
  els.guideModal.classList.add("active");
  els.guideModal.setAttribute("aria-hidden", "false");
});
els.closeGuide.addEventListener("click", () => {
  els.guideModal.classList.remove("active");
  els.guideModal.setAttribute("aria-hidden", "true");
});
els.guideModal.addEventListener("click", (event) => {
  if (event.target === els.guideModal) {
    els.guideModal.classList.remove("active");
    els.guideModal.setAttribute("aria-hidden", "true");
  }
});
els.closeAvatarEditor.addEventListener("click", () => {
  els.avatarModal.classList.remove("active");
  els.avatarModal.setAttribute("aria-hidden", "true");
});
els.avatarModal.addEventListener("click", (event) => {
  if (event.target === els.avatarModal) {
    els.avatarModal.classList.remove("active");
    els.avatarModal.setAttribute("aria-hidden", "true");
  }
});
window.addEventListener("devicemotion", handleMotion);

selectedPetType = state.petType;
selectedAvatar = state.avatar;
selectedAvatarImage = state.avatarImage || "";
selectedAvatarZoom = state.avatarZoom || 120;
selectedAvatarY = state.avatarY || 50;
selectPet(selectedPetType);
selectAvatar(selectedAvatar, false);
renderAvatarPreview();
setAuthMode("login");
switchScreen("intro");
render();
