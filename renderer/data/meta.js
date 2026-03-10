// ===== 周目解鎖升級資料 =====
// tab: 'common' | 'warrior' | 'assassin' | 'mage' | 'warlock'
// req: 前置條件的 id（null 表示無前置）
// jobId: 職業專屬升級才填（undefined 表示共通）
// effect: 套用至 gameState.selectedJob.stats 或 gameState.gold

const META_UPGRADES = [
  // ── 共通 ──────────────────────────────────────────────
  {
    id: 'common_gold',
    name: '富足之源',
    desc: '每局開始時額外擁有 50 金幣',
    cost: 100,
    tab: 'common',
    req: null,
    effect: { gold: 50 }
  },
  {
    id: 'common_hp',
    name: '鐵骨強身',
    desc: '每局開始時最大 HP +20',
    cost: 200,
    tab: 'common',
    req: null,
    effect: { hp: 20 }
  },
  {
    id: 'common_atk',
    name: '武藝精進',
    desc: '每局開始時攻擊力 +2',
    cost: 300,
    tab: 'common',
    req: 'common_hp',
    effect: { atk: 2 }
  },

  // ── 戰士 ──────────────────────────────────────────────
  {
    id: 'warrior_def',
    name: '堅韌',
    desc: '戰士初始防禦力 +5',
    cost: 1800,
    tab: 'warrior',
    jobId: 'warrior',
    req: 'common_atk',
    effect: { def: 5 }
  },

  // ── 刺客 ──────────────────────────────────────────────
  {
    id: 'assassin_dodge',
    name: '殘影',
    desc: '刺客初始閃避率 +10%',
    cost: 1800,
    tab: 'assassin',
    jobId: 'assassin',
    req: 'common_atk',
    effect: { dodge: 10 }
  },

  // ── 法師 ──────────────────────────────────────────────
  {
    id: 'mage_crit',
    name: '深淵之眼',
    desc: '法師初始爆擊率 +5%',
    cost: 1800,
    tab: 'mage',
    jobId: 'mage',
    req: 'common_atk',
    effect: { crit: 5 }
  },

  // ── 術士 ──────────────────────────────────────────────
  {
    id: 'warlock_hp',
    name: '黑暗契約',
    desc: '術士初始最大 HP +30',
    cost: 1800,
    tab: 'warlock',
    jobId: 'warlock',
    req: 'common_atk',
    effect: { hp: 30 }
  }
]
