// ===== 狀態效果說明對照表 =====
const STATUS_EFFECTS = {
  '強化': '攻擊力 +8（每層）',
  '鞏固': '防禦力 +6（每層）',
  '恢復': '每回合回復 15 HP（每層）',
  '神速': '閃避率 +8%（每層）',
  '集中': '爆擊率 +8%（每層）',
  '荊棘': '受擊反傷 12（每層）',
  '燃燒': '每回合傷害 4 + 攻擊力×12%（每層）',
  '中毒': '每回合傷害 8（每層）',
  '詛咒': '受到傷害 +20~40%',
  '虛弱': '攻擊力 -25~45%',
  '裂甲': '防禦力 -20~35%',
  '混亂': '50% 機率攻擊自身',
  '冰凍': '跳過當回合行動'
}

// ===== 測試事件資料 =====
const TEST_EVENTS = [
  {
    id: 'merchant',
    type: '商人',
    color: '#8e44ad',
    emoji: '🧳',
    title: '旅行商人',
    desc: '一名旅行商人笑著攔住你：「客官！要看看我的珍貴寶物嗎？」',
    options: [
      {
        text: '購買補給品（30 金幣）',
        cost: { gold: 30 },
        result: '你花費 30 金幣購買了補給品，恢復 30 HP！',
        effect: { hp: 30 }
      },
      {
        text: '隨便聊聊（免費）',
        cost: null,
        result: '商人感謝你耐心聆聽，臨別塞給你 10 金幣。',
        effect: { gold: 10 }
      }
    ]
  },
  {
    id: 'bandit',
    type: '危險',
    color: '#c0392b',
    emoji: '⚠️',
    title: '山賊攔路',
    desc: '一群山賊突然從樹叢中跳出將你包圍！「把錢交出來，或者嚐嚐我們的厲害！」',
    options: [
      {
        text: '正面迎戰（損失 20 HP）',
        cost: null,
        result: '激烈搏鬥後，你成功擊退了山賊！但也受了點傷。獲得 20 金幣作為戰利品。',
        effect: { hp: -20, gold: 20 }
      },
      {
        text: '拋出金幣逃脫（20 金幣）',
        cost: { gold: 20 },
        result: '趁山賊忙著搶錢的混亂，你迅速拔腿逃跑！',
        effect: {}
      }
    ]
  },
  {
    id: 'stone_tablet',
    type: '神秘',
    color: '#16213e',
    borderColor: '#4a4a8a',
    emoji: '🗿',
    title: '古老石碑',
    desc: '路旁矗立著一塊散發幽光的古老石碑，上面刻著難以辨識的遠古文字。',
    options: [
      {
        text: '誦讀碑文',
        cost: null,
        result: '碑文中蘊藏著古老的智慧！你感到思緒豁然開朗，獲得 50 金幣。',
        effect: { gold: 50 }
      },
      {
        text: '無視石碑，繼續前行',
        cost: null,
        result: '你選擇不去招惹這神秘的石碑，繼續踏上旅途。',
        effect: {}
      }
    ]
  }
]

// ===== 格子類型定義 =====
const CELL_TYPES = {
  start:   { label: '起點', icon: '🏁', color: '#f0c040' },
  battle:  { label: '戰鬥', icon: '⚔️', color: '#c0392b' },
  item:    { label: '道具', icon: '🎁', color: '#27ae60' },
  event:   { label: '事件', icon: '📖', color: '#2980b9' },
  shop:    { label: '商店', icon: '🏪', color: '#8e44ad' },
  trap:    { label: '陷阱', icon: '💀', color: '#7f8c8d' },
  bless:   { label: '祝福', icon: '✨', color: '#f39c12' },
  element: { label: '元素', icon: '🔴', color: '#e74c3c' }
}

// ===== 遊戲狀態 =====
const gameState = {
  currentScreen: 'start',
  totalScore: 0,
  selectedJobIndex: 0,
  selectedJob: null,
  currentTurn: 1,
  gold: 0,
  playerPos: 0,
  boardCells: [],
  inventory: [null, null, null],
  // 角色成長
  playerLevel: 1,
  playerExp: 0,
  playerSkills: [],
  // 升級選擇
  pendingUpgradeOptions: [],
  selectedUpgradeCard: null,
  // 道具選擇
  pendingItemOptions: [],
  selectedItemCard: null,
  itemDiscardMode: false,
  // 商店
  currentShopItems: [],
  shopDiscardMode: false,
  pendingShopItem: null,
  // 封印碎片（隱藏狀態，不顯示在任何 UI 上）
  sealFragments: [],        // 已獲得的碎片 ['flame'/'shadow'/'astral']
  // 玩家狀態異常
  playerCrackArmor: 0,      // 裂甲剩餘回合數（防禦降低）
  // 戰鬥狀態
  playerCurrentHp: 0,
  battleRound: 1,
  battlePhase: 'player',  // 'player' | 'enemy'
  enemies: [],
  activeInfoTab: 'player'
}

// ===== 畫面管理 =====
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById(screenId).classList.add('active')
  gameState.currentScreen = screenId
}

// ===== 開始畫面初始化 =====
function initStartScreen() {
  document.getElementById('btn-new-game').addEventListener('click', () => {
    showScreen('screen-job-select')
    renderJobCard()
  })
}

// ===== 職業選擇畫面 =====

// 渲染職業卡片內容
function renderJobCard() {
  const job = JOBS[gameState.selectedJobIndex]

  document.getElementById('job-color').style.backgroundColor = job.color
  document.getElementById('job-name').textContent = job.name

  document.getElementById('stat-hp').textContent = job.stats.hp
  document.getElementById('stat-atk').textContent = job.stats.atk
  document.getElementById('stat-def').textContent = job.stats.def
  document.getElementById('stat-dodge').textContent = job.stats.dodge + '%'
  document.getElementById('stat-crit').textContent = job.stats.crit + '%'
  document.getElementById('stat-critdmg').textContent = job.stats.critDmg + '%'

  const featuresEl = document.getElementById('job-features')
  featuresEl.innerHTML = ''
  job.features.forEach(f => {
    const p = document.createElement('p')
    p.className = 'job-feature-line'
    p.textContent = f
    featuresEl.appendChild(p)
  })

  renderDots()
}

// 渲染圓點指示器
function renderDots() {
  const dotsEl = document.getElementById('job-dots')
  dotsEl.innerHTML = ''
  JOBS.forEach((_, i) => {
    const dot = document.createElement('div')
    dot.className = 'job-dot' + (i === gameState.selectedJobIndex ? ' active' : '')
    dotsEl.appendChild(dot)
  })
}

// 職業選擇畫面初始化
function initJobSelectScreen() {
  document.getElementById('btn-job-prev').addEventListener('click', () => {
    gameState.selectedJobIndex = (gameState.selectedJobIndex - 1 + JOBS.length) % JOBS.length
    renderJobCard()
  })

  document.getElementById('btn-job-next').addEventListener('click', () => {
    gameState.selectedJobIndex = (gameState.selectedJobIndex + 1) % JOBS.length
    renderJobCard()
  })

  document.getElementById('btn-select-job').addEventListener('click', () => {
    const job = JOBS[gameState.selectedJobIndex]
    const confirmed = confirm(`確定選擇「${job.name}」作為你的職業嗎？`)
    if (confirmed) {
      gameState.selectedJob = job
      gameState.playerCurrentHp = job.stats.hp  // 初始化 HP
      gameState.boardCells = generateBoard()
      gameState.playerPos = 0
      gameState.currentTurn = 1
      gameState.gold = 50  // 測試用初始金幣
      showScreen('screen-board')
      renderBoard()
      updateBoardStatus()
      updateCellDesc()
    }
  })
}

// ===== 棋盤主畫面 =====

// 產生棋盤格子（隨機分配，固定格除外）
function generateBoard() {
  // 隨機池：28格（扣除起點1格 + 元素格3格）
  const pool = [
    'battle','battle','battle','battle','battle','battle','battle','battle',
    'item','item','item','item','item',
    'event','event','event','event','event','event',
    'shop','shop','shop',
    'trap','trap','trap',
    'bless','bless','bless'
  ]
  // Fisher-Yates 洗牌
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }

  let poolIdx = 0
  const cells = []
  for (let i = 0; i < 32; i++) {
    if (i === 0)                        cells.push('start')
    else if (i === 10 || i === 20 || i === 30) cells.push('element')
    else                                cells.push(pool[poolIdx++])
  }
  return cells
}

// 計算格子在 CSS Grid 中的位置（row/col 皆為 1-indexed）
function getCellGridPos(index) {
  if (index <= 9)  return { row: 1, col: index + 1 }        // 上排 0-9
  if (index <= 15) return { row: index - 8, col: 10 }       // 右排 10-15
  if (index <= 25) return { row: 8, col: 26 - index }       // 下排 16-25（反向）
  return           { row: 33 - index, col: 1 }              // 左排 26-31（反向）
}

// 渲染整個棋盤
function renderBoard() {
  const grid = document.getElementById('board-grid')
  // 清除舊格子（保留 dice-center）
  grid.querySelectorAll('.board-cell').forEach(el => el.remove())

  gameState.boardCells.forEach((type, index) => {
    const { row, col } = getCellGridPos(index)
    const cellType = CELL_TYPES[type]

    const cell = document.createElement('div')
    cell.className = 'board-cell'
    cell.id = `cell-${index}`
    cell.style.gridRow = row
    cell.style.gridColumn = col
    cell.style.backgroundColor = cellType.color
    cell.innerHTML = `
      <span class="cell-icon">${cellType.icon}</span>
      <span class="cell-num">${index}</span>
    `
    grid.appendChild(cell)
  })

  updatePlayerMarker()
}

// 更新角色標記位置
function updatePlayerMarker() {
  document.querySelectorAll('.player-marker').forEach(el => el.remove())
  document.querySelectorAll('.board-cell.current').forEach(el => el.classList.remove('current'))

  const currentCell = document.getElementById(`cell-${gameState.playerPos}`)
  if (!currentCell) return

  currentCell.classList.add('current')
  const marker = document.createElement('div')
  marker.className = 'player-marker'
  marker.style.backgroundColor = gameState.selectedJob.color
  currentCell.appendChild(marker)
}

// 更新頂部狀態列
function updateBoardStatus() {
  document.getElementById('board-job-info').textContent = `${gameState.selectedJob.name} Lv.1`
  document.getElementById('board-turn').textContent = `回合 ${gameState.currentTurn} / 20`
  document.getElementById('board-gold').textContent = `💰 ${gameState.gold}`
}

// 更新底部格子說明
function updateCellDesc() {
  const type = gameState.boardCells[gameState.playerPos]
  const cellType = CELL_TYPES[type]
  document.getElementById('board-cell-desc').textContent =
    `當前格子：${cellType.icon} ${cellType.label}格（第 ${gameState.playerPos} 格）`
}

// 擲骰子並移動角色
function rollDice() {
  const result = Math.floor(Math.random() * 6) + 1
  document.getElementById('dice-face').textContent = result
  document.getElementById('btn-roll').disabled = true
  document.getElementById('dice-msg').textContent = `移動 ${result} 格…`

  setTimeout(() => {
    gameState.playerPos = (gameState.playerPos + result) % 32
    updatePlayerMarker()
    updateCellDesc()

    const type = gameState.boardCells[gameState.playerPos]
    const cellType = CELL_TYPES[type]

    document.getElementById('dice-msg').textContent = `落在第 ${gameState.playerPos} 格`

    setTimeout(() => {
      triggerCellEvent(type)
    }, 300)
  }, 400)
}

// 格子事件觸發
function triggerCellEvent(type) {
  if (type === 'battle') {
    startBattle()
  } else if (type === 'event') {
    startEvent()
  } else if (type === 'item') {
    startItem()
  } else if (type === 'shop') {
    startShop()
  } else if (type === 'element') {
    // 元素格：依位置觸發對應 Boss
    const pos = gameState.playerPos
    let bossId = null
    if (pos === 10) bossId = 'boss_flame'
    else if (pos === 20) bossId = 'boss_shadow'
    else if (pos === 30) bossId = 'boss_astral'
    if (bossId) {
      startBattle([{ ...BOSSES[bossId] }])
    } else {
      afterCellEvent()
    }
  } else {
    const cellType = CELL_TYPES[type]
    alert(`觸發：${cellType.icon} ${cellType.label}格`)
    afterCellEvent()
  }
}

// 格子事件結束後回到棋盤流程
function afterCellEvent() {
  gameState.currentTurn++
  // 第20回合結算後觸發最終Boss（不回棋盤）
  if (gameState.currentTurn > 20) {
    startFinalBossBattle()
    return
  }
  updateBoardStatus()
  document.getElementById('btn-roll').disabled = false
  document.getElementById('dice-msg').textContent = ''
}

// 棋盤畫面初始化
function initBoardScreen() {
  document.getElementById('btn-roll').addEventListener('click', rollDice)
}

// ===== 戰鬥畫面 =====

// 初始化並進入戰鬥（enemies 為 null 時使用測試哥布林）
function startBattle(enemies = null) {
  const job = gameState.selectedJob
  if (!enemies) {
    // 普通戰鬥（測試用）：重置 HP
    gameState.playerCurrentHp = job.stats.hp
    enemies = [{ name: '哥布林戰士', maxHp: 60, hp: 60, atk: 20, def: 5 }]
  }
  // Boss 戰保留玩家當前 HP（不重置）
  gameState.battleRound = 1
  gameState.battlePhase = 'player'
  gameState.activeInfoTab = 'player'
  gameState.enemies = enemies
  gameState.playerCrackArmor = 0  // 重置裂甲狀態
  showScreen('screen-battle')
  renderBattleScreen()

  // 最終Boss開場台詞（不觸發暗影先制，演出期間讓玩家讀台詞）
  const firstEnemy = enemies[0]
  if (firstEnemy && firstEnemy.isFinalBoss) {
    const hasAllFragments = gameState.sealFragments.length === 3
    const quote = hasAllFragments ? firstEnemy.allFragmentsQuote : firstEnemy.phaseQuotes[1]
    const extra = hasAllFragments ? '　封印之力令黑暗之主受到削傷！' : ''
    setTimeout(() => setActionLog(`👁️ ${quote}${extra}`), 400)
    return
  }

  // 暗影碎片：30% 機率奪得先機（自動觸發一次玩家攻擊）
  if (gameState.sealFragments.includes('shadow') && Math.random() < 0.3) {
    setActionLog('暗影之力讓你奪得先機！')
    setTimeout(() => {
      if (gameState.battlePhase === 'player') playerAttack()
    }, 1200)
  }
}

// 渲染戰鬥畫面
function renderBattleScreen() {
  const job = gameState.selectedJob

  // 我方角色
  document.getElementById('player-sprite').style.backgroundColor = job.color
  document.getElementById('player-sprite').textContent = job.name[0]
  document.getElementById('player-name').textContent = job.name
  updateHpBar('player-hp-bar', gameState.playerCurrentHp, job.stats.hp)
  document.getElementById('player-hp-text').textContent =
    `${gameState.playerCurrentHp} / ${job.stats.hp}`

  // 敵方
  const enemiesEl = document.getElementById('battle-enemies')
  enemiesEl.innerHTML = ''
  gameState.enemies.forEach((enemy, i) => {
    const div = document.createElement('div')
    div.className = 'battle-enemy'
    div.id = `enemy-${i}`
    div.innerHTML = `
      <div class="battle-sprite enemy-sprite" id="enemy-sprite-${i}">${enemy.name[0]}</div>
      <div class="battle-name">${enemy.name}</div>
      <div class="hp-bar-wrap">
        <div class="hp-bar" id="enemy-hp-bar-${i}"></div>
      </div>
      <div class="hp-text" id="enemy-hp-text-${i}"></div>
    `
    enemiesEl.appendChild(div)
    updateHpBar(`enemy-hp-bar-${i}`, enemy.hp, enemy.maxHp)
    document.getElementById(`enemy-hp-text-${i}`).textContent = `${enemy.hp} / ${enemy.maxHp}`
  })

  updateBattleStatus()
  renderInfoContent(gameState.activeInfoTab)
  setActionLog('')
}

// 更新 HP 條寬度與顏色
function updateHpBar(barId, current, max) {
  const bar = document.getElementById(barId)
  if (!bar) return
  const pct = Math.max(0, current / max * 100)
  bar.style.width = pct + '%'
  bar.className = 'hp-bar ' + (pct > 50 ? 'high' : pct > 25 ? 'mid' : 'low')
}

// 更新頂部狀態列
function updateBattleStatus() {
  document.getElementById('battle-round').textContent = `戰鬥回合 ${gameState.battleRound}`
  const phaseEl = document.getElementById('battle-phase')
  if (gameState.battlePhase === 'player') {
    phaseEl.textContent = '我方行動'
    phaseEl.className = 'battle-status-center player-turn'
  } else {
    phaseEl.textContent = '敵方行動'
    phaseEl.className = 'battle-status-center enemy-turn'
  }
}

// 渲染資訊面板內容
function renderInfoContent(tab) {
  gameState.activeInfoTab = tab
  document.querySelectorAll('.info-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tab)
  )
  const job = gameState.selectedJob
  const enemy = gameState.enemies[0]
  const rows = tab === 'player'
    ? [
        ['攻擊', job.stats.atk],
        ['防禦', job.stats.def],
        ['閃避率', job.stats.dodge + '%'],
        ['爆擊率', job.stats.crit + '%']
      ]
    : [
        ['攻擊', enemy.atk],
        ['防禦', enemy.def],
        ['閃避率', (enemy.dodge ?? 0) + '%'],
        ['爆擊率', '0%'],
        ...(enemy.isBoss ? [['階段', `Phase ${enemy.phase}`]] : [])
      ]
  document.getElementById('info-content').innerHTML =
    rows.map(([label, val]) =>
      `<div class="info-row">
        <span class="info-row-label">${label}</span>
        <span class="info-row-value">${val}</span>
      </div>`
    ).join('')
}

// 顯示傷害跳字
function showDamagePopup(targetEl, amount) {
  const pop = document.createElement('div')
  pop.className = 'dmg-popup'
  pop.textContent = `-${amount}`
  targetEl.style.position = 'relative'
  targetEl.appendChild(pop)
  setTimeout(() => pop.remove(), 900)
}

// 設定行動 log 文字
function setActionLog(text) {
  document.getElementById('action-log').textContent = text
}

// 玩家普攻
function playerAttack() {
  if (gameState.battlePhase !== 'player') return

  document.getElementById('btn-attack').disabled = true
  const job = gameState.selectedJob
  const enemy = gameState.enemies[0]

  // Boss 免疫狀態（暗影使者二階段）
  if ((enemy.immune || 0) > 0) {
    const remaining = enemy.immune - 1
    enemy.immune--
    setActionLog(
      `${enemy.name} 的免疫護盾化解了攻擊！` +
      (remaining > 0 ? `（剩餘 ${remaining} 回合）` : `（護盾消散！）`)
    )
    gameState.battlePhase = 'enemy'
    updateBattleStatus()
    setTimeout(enemyTurn, 900)
    return
  }

  // 閃避判斷（敵方閃避率）
  const enemyDodge = enemy.dodge ?? 0
  if (Math.random() * 100 < enemyDodge) {
    setActionLog(`${enemy.name} 閃避了你的攻擊！`)
    gameState.battlePhase = 'enemy'
    updateBattleStatus()
    setTimeout(enemyTurn, 900)
    return
  }

  // 爆擊判斷
  let dmg = Math.max(0, job.stats.atk - enemy.def)
  let logText = `對 ${enemy.name} 造成 ${dmg} 點傷害`
  if (Math.random() * 100 < job.stats.crit) {
    dmg = Math.floor(dmg * job.stats.critDmg / 100)
    logText = `爆擊！對 ${enemy.name} 造成 ${dmg} 點傷害`
  }
  enemy.hp = Math.max(0, enemy.hp - dmg)

  // 烈焰碎片：命中後附加 1 層燃燒（上限 5 層）
  if (dmg > 0 && gameState.sealFragments.includes('flame')) {
    enemy.burning = Math.min(5, (enemy.burning || 0) + 1)
    logText += `，附加燃燒（${enemy.burning} 層）`
  }

  // 更新敵人 UI
  updateHpBar('enemy-hp-bar-0', enemy.hp, enemy.maxHp)
  document.getElementById('enemy-hp-text-0').textContent = `${enemy.hp} / ${enemy.maxHp}`
  const enemySprite = document.getElementById('enemy-sprite-0')
  if (enemySprite) showDamagePopup(enemySprite, dmg)
  setActionLog(logText)

  // 檢查敵人死亡
  if (enemy.hp <= 0) {
    setTimeout(() => endBattle('win'), 600)
    return
  }

  // Boss 階段切換
  if (enemy.isFinalBoss) {
    // 最終Boss：60% → 第二階段，30% → 第三階段
    if (enemy.hp <= enemy.maxHp * 0.3 && enemy.phase < 3) {
      triggerFinalBossPhase3(enemy)
      return
    }
    if (enemy.hp <= enemy.maxHp * 0.6 && enemy.phase === 1) {
      triggerFinalBossPhase2(enemy)
      return
    }
  } else if (enemy.isBoss && enemy.hp <= enemy.maxHp * 0.5 && enemy.phase === 1) {
    // 中Boss二階段切換（HP 降至 50%）
    triggerBossPhase2(enemy)
    return  // triggerBossPhase2 內部接管後續流程
  }

  // 切換敵方回合
  gameState.battlePhase = 'enemy'
  updateBattleStatus()
  setTimeout(enemyTurn, 900)
}

// 敵方回合
function enemyTurn() {
  const job = gameState.selectedJob
  const enemy = gameState.enemies[0]

  // ④ 敵方 DoT 結算（燃燒）
  if ((enemy.burning || 0) > 0) {
    const burnDmg = Math.floor((4 + job.stats.atk * 0.12) * enemy.burning)
    enemy.hp = Math.max(0, enemy.hp - burnDmg)
    updateHpBar('enemy-hp-bar-0', enemy.hp, enemy.maxHp)
    document.getElementById('enemy-hp-text-0').textContent = `${enemy.hp} / ${enemy.maxHp}`
    setActionLog(`🔥 燃燒：${enemy.name} 受到 ${burnDmg} 點持續傷害（${enemy.burning} 層）`)
    if (enemy.hp <= 0) {
      setTimeout(() => endBattle('win'), 600)
      return
    }
  }

  // ⑤ Boss 二/三階段專屬技能
  if (enemy.isBoss && enemy.phase >= 2) {
    const specialChance = (enemy.isFinalBoss && enemy.phase === 3) ? 0.5 : 0.35
    if (Math.random() < specialChance) {
      bossCastSpecial(enemy)
      return
    }
  }

  // 閃避判斷（玩家閃避率）
  if (Math.random() * 100 < job.stats.dodge) {
    setActionLog(`你閃避了 ${enemy.name} 的攻擊！`)
    gameState.battleRound++
    gameState.battlePhase = 'player'
    updateBattleStatus()
    document.getElementById('btn-attack').disabled = false
    return
  }

  // 裂甲：玩家防禦降低 35%（星界裁決者二階段施加）
  let playerDef = job.stats.def
  let crackActive = false
  if (gameState.playerCrackArmor > 0) {
    playerDef = Math.floor(playerDef * 0.65)
    gameState.playerCrackArmor--
    crackActive = true
    updateAilmentDisplay()
  }

  const dmg = Math.max(0, enemy.atk - playerDef)
  gameState.playerCurrentHp = Math.max(0, gameState.playerCurrentHp - dmg)

  // 更新玩家 HP UI
  updateHpBar('player-hp-bar', gameState.playerCurrentHp, job.stats.hp)
  document.getElementById('player-hp-text').textContent =
    `${gameState.playerCurrentHp} / ${job.stats.hp}`
  const playerSprite = document.getElementById('player-sprite')
  if (playerSprite) showDamagePopup(playerSprite, dmg)
  setActionLog(`${enemy.name} 對你造成 ${dmg} 點傷害${crackActive ? '（裂甲）' : ''}`)

  // 檢查玩家死亡
  if (gameState.playerCurrentHp <= 0) {
    setTimeout(() => endBattle('lose'), 600)
    return
  }

  // 回到玩家回合
  gameState.battleRound++
  gameState.battlePhase = 'player'
  updateBattleStatus()
  document.getElementById('btn-attack').disabled = false
  setActionLog('你的回合')
}

// ===== Boss 特殊系統 =====

// 更新玩家狀態異常顯示
function updateAilmentDisplay() {
  const ailments = []
  if (gameState.playerCrackArmor > 0) {
    ailments.push(`🪓裂甲（${gameState.playerCrackArmor}回合）`)
  }
  document.getElementById('ailment-list').textContent =
    ailments.length > 0 ? ailments.join('、') : '無'
}

// Boss 二階段切換
function triggerBossPhase2(enemy) {
  enemy.phase = 2
  let buffDesc = ''
  if (enemy.seal === 'flame') {
    enemy.atk = Math.floor(enemy.atk * 1.2)
    buffDesc = `攻擊力狂化至 ${enemy.atk}！`
  } else if (enemy.seal === 'shadow') {
    enemy.immune = 2  // 免疫護盾 2 回合
    buffDesc = '獲得免疫護盾 2 回合！'
  } else if (enemy.seal === 'astral') {
    enemy.atk = Math.floor(enemy.atk * 1.15)
    enemy.def = Math.floor(enemy.def * 1.15)
    gameState.playerCrackArmor = 3  // 玩家裂甲 3 回合
    buffDesc = `攻防強化（攻${enemy.atk}／防${enemy.def}）！對你施加裂甲 3 回合！`
  }
  setActionLog(`⚡ ${enemy.name}：${enemy.phaseQuote}　${buffDesc}`)
  updateAilmentDisplay()
  // 重新渲染敵人面板（數值已變）
  if (gameState.activeInfoTab === 'enemy') renderInfoContent('enemy')
  // 切換敵方回合（留時間讓玩家讀台詞）
  gameState.battlePhase = 'enemy'
  updateBattleStatus()
  setTimeout(enemyTurn, 1600)
}

// 最終Boss第二階段切換（HP ≤ 60%）
function triggerFinalBossPhase2(enemy) {
  enemy.phase = 2
  enemy.atk = Math.floor(enemy.atk * 1.2)
  setActionLog(`⚡ ${enemy.name}：${enemy.phaseQuotes[2]}　攻擊力強化至 ${enemy.atk}！`)
  if (gameState.activeInfoTab === 'enemy') renderInfoContent('enemy')
  gameState.battlePhase = 'enemy'
  updateBattleStatus()
  setTimeout(enemyTurn, 1600)
}

// 最終Boss第三階段切換（HP ≤ 30%）狂暴：防禦削半、攻擊再提升
function triggerFinalBossPhase3(enemy) {
  enemy.phase = 3
  enemy.atk = Math.floor(enemy.atk * 1.3)
  enemy.def = Math.floor(enemy.def * 0.5)
  setActionLog(`💀 ${enemy.name}：${enemy.phaseQuotes[3]}　進入狂暴！攻擊暴增，防禦崩潰！`)
  if (gameState.activeInfoTab === 'enemy') renderInfoContent('enemy')
  gameState.battlePhase = 'enemy'
  updateBattleStatus()
  setTimeout(enemyTurn, 1600)
}

// Boss 二階段專屬技能
function bossCastSpecial(enemy) {
  const job = gameState.selectedJob
  let skillName = ''
  let dmg = 0
  if (enemy.isFinalBoss) {
    // 最終Boss技能池：Phase2三選一、Phase3選後兩種強技能
    const finalSkills = [
      { name: '暗黑衝擊', mult: 1.3, ignoresDef: false },
      { name: '虛空斬擊', mult: 1.8, ignoresDef: false },
      { name: '末日審判', mult: 2.5, ignoresDef: true }
    ]
    const pool = enemy.phase === 3 ? finalSkills.slice(1) : finalSkills
    const skill = pool[Math.floor(Math.random() * pool.length)]
    skillName = skill.name
    const rawDmg = Math.floor(enemy.atk * skill.mult)
    dmg = skill.ignoresDef ? rawDmg : Math.max(0, rawDmg - job.stats.def)
    gameState.playerCurrentHp = Math.max(0, gameState.playerCurrentHp - dmg)
  } else if (enemy.seal === 'flame') {
    skillName = '烈焰爆發'
    dmg = 200  // 固定傷害，無視防禦
    gameState.playerCurrentHp = Math.max(0, gameState.playerCurrentHp - dmg)
  } else if (enemy.seal === 'shadow') {
    skillName = '黑暗侵蝕'
    dmg = Math.max(0, Math.floor(enemy.atk * 1.5) - job.stats.def)
    gameState.playerCurrentHp = Math.max(0, gameState.playerCurrentHp - dmg)
  } else if (enemy.seal === 'astral') {
    skillName = '星界審判'
    dmg = Math.max(0, Math.floor(enemy.atk * 2) - job.stats.def)
    gameState.playerCurrentHp = Math.max(0, gameState.playerCurrentHp - dmg)
  }
  updateHpBar('player-hp-bar', gameState.playerCurrentHp, job.stats.hp)
  document.getElementById('player-hp-text').textContent =
    `${gameState.playerCurrentHp} / ${job.stats.hp}`
  const playerSprite = document.getElementById('player-sprite')
  if (playerSprite) showDamagePopup(playerSprite, dmg)
  setActionLog(`💥 ${enemy.name} 發動「${skillName}」！造成 ${dmg} 點傷害！`)
  if (gameState.playerCurrentHp <= 0) {
    setTimeout(() => endBattle('lose'), 600)
    return
  }
  gameState.battleRound++
  gameState.battlePhase = 'player'
  updateBattleStatus()
  document.getElementById('btn-attack').disabled = false
}

// 最終Boss動態生成（依玩家等級計算數值）
function generateFinalBoss() {
  const lv = gameState.playerLevel
  const hp  = 2500 + lv * 150
  const atk = 80   + lv * 5
  const def = 40   + lv * 2
  return {
    id: 'boss_final',
    name: '黑暗之主',
    emoji: '👁️',
    maxHp: hp, hp,
    atk, def,
    dodge: 10,
    isBoss: true,
    isFinalBoss: true,
    phase: 1,
    seal: null,
    phaseQuotes: {
      1: '「愚蠢的凡人，你的旅程到此為止了⋯⋯」',
      2: '「黑暗在湧動⋯⋯真正的恐懼現在才開始！」',
      3: '「不⋯⋯這不可能！與我一同墮入深淵吧！」'
    },
    allFragmentsQuote: '「這股力量⋯⋯你竟然解除了三大封印？！但那又如何，黑暗將吞噬一切！」'
  }
}

// 最終Boss戰觸發：生成Boss（持有全碎片則削弱15% HP）並進入戰鬥
function startFinalBossBattle() {
  const boss = generateFinalBoss()
  if (gameState.sealFragments.length === 3) {
    boss.hp = Math.floor(boss.hp * 0.85)
  }
  startBattle([boss])
}

// 下一級所需經驗（Lv1→2：100，每級+40）
function getNextLevelExp(level) {
  return 100 + (level - 1) * 40
}

// 測試用升級選項（暫時寫死）
function getTestUpgradeOptions() {
  return [
    {
      id: 'crack_strike',
      emoji: '⚔️', name: '裂甲重擊',
      type: '主動', tag: 'new',
      desc: '造成攻擊力×180%傷害，附加裂甲2回合',
      cd: 3
    },
    {
      id: 'blood_rage',
      emoji: '💢', name: '血怒',
      type: '主動', tag: 'new',
      desc: '獲得強化3層（2回合）',
      cd: 4
    },
    {
      id: 'fighting_spirit',
      emoji: '💪', name: '鬥魂',
      type: '被動', tag: 'new',
      desc: 'HP低於30%時每回合自動獲得恢復1層',
      cd: null
    }
  ]
}

// 戰鬥結束
function endBattle(result) {
  if (result === 'win') {
    const defeated = gameState.enemies[0]

    // 最終Boss通關
    if (defeated && defeated.isFinalBoss) {
      const hasAllFragments = gameState.sealFragments.length === 3
      if (hasAllFragments) {
        setActionLog('✨ 你以封印之力擊敗了黑暗之主！世界恢復了平靜...')
      } else {
        setActionLog('⚔️ 你憑藉意志力擊敗了黑暗之主！')
      }
      setTimeout(() => {
        alert('恭喜通關！即將進入結算... (待實作結算畫面)')
        showScreen('screen-board')
      }, 1500)
      return
    }

    // 中Boss 勝利：發放封印碎片（靜默提示）
    if (defeated && defeated.isBoss && defeated.seal) {
      if (!gameState.sealFragments.includes(defeated.seal)) {
        gameState.sealFragments.push(defeated.seal)
      }
      setActionLog('你感受到一股神秘的力量融入體內...')
      setTimeout(() => {
        showScreen('screen-board')
        updateBoardStatus()
        afterCellEvent()
      }, 1800)
      return
    }

    // 普通戰鬥勝利：累積經驗
    gameState.playerExp += 100
    const needed = getNextLevelExp(gameState.playerLevel)
    if (gameState.playerExp >= needed) {
      gameState.playerExp -= needed
      gameState.playerLevel++
      initUpgradeScreen(getTestUpgradeOptions())
      return
    }
    alert('戰鬥勝利！')
  } else {
    showDeathScreen()
    return
  }
  showScreen('screen-board')
  afterCellEvent()
}

// 顯示死亡畫面
function showDeathScreen() {
  document.getElementById('death-stat-turn').textContent = gameState.currentTurn
  document.getElementById('death-stat-level').textContent = gameState.playerLevel
  showScreen('screen-death')
}

// 返回標題並重置單局狀態
function returnToTitle() {
  gameState.selectedJobIndex = 0
  gameState.selectedJob = null
  gameState.currentTurn = 1
  gameState.gold = 50
  gameState.playerPos = 0
  gameState.boardCells = []
  gameState.inventory = [null, null, null]
  gameState.playerLevel = 1
  gameState.playerExp = 0
  gameState.playerSkills = []
  gameState.pendingUpgradeOptions = []
  gameState.selectedUpgradeCard = null
  gameState.pendingItemOptions = []
  gameState.selectedItemCard = null
  gameState.itemDiscardMode = false
  gameState.currentShopItems = []
  gameState.shopDiscardMode = false
  gameState.pendingShopItem = null
  gameState.sealFragments = []
  gameState.playerCrackArmor = 0
  gameState.playerCurrentHp = 0
  gameState.battleRound = 1
  gameState.battlePhase = 'player'
  gameState.enemies = []
  gameState.activeInfoTab = 'player'
  showScreen('screen-start')
}

// ===== 升級選擇畫面 =====

// 初始化升級畫面（每次觸發時呼叫）
function initUpgradeScreen(options) {
  gameState.pendingUpgradeOptions = options
  gameState.selectedUpgradeCard = null

  // 更新等級文字
  document.getElementById('upgrade-level-text').textContent =
    `⭐ 升級！Lv.${gameState.playerLevel - 1} → Lv.${gameState.playerLevel}`

  // 渲染技能持有欄（最多3格）
  const skillsBar = document.getElementById('upgrade-skills-bar')
  skillsBar.innerHTML = ''
  for (let i = 0; i < 3; i++) {
    const skill = gameState.playerSkills[i]
    const slot = document.createElement('div')
    slot.className = 'upgrade-skill-slot ' + (skill ? 'has-skill' : 'empty-slot')
    slot.textContent = skill ? `${skill.emoji} ${skill.name}` : '空'
    skillsBar.appendChild(slot)
  }

  // 渲染選項卡片
  const cardsEl = document.getElementById('upgrade-cards')
  cardsEl.innerHTML = ''
  options.forEach((opt, i) => {
    const card = document.createElement('div')
    card.className = 'upgrade-card'

    let tagHtml = ''
    if (opt.tag === 'new')     tagHtml = '<span class="tag tag-new">NEW</span>'
    else if (opt.tag === 'upgrade') tagHtml = `<span class="tag tag-upgrade">Lv.${opt.currentLv}→${opt.currentLv + 1}</span>`
    else if (opt.tag === 'max') tagHtml = '<span class="tag tag-max">MAX</span>'

    const cdHtml = (opt.type === '主動' && opt.cd)
      ? `<div class="upgrade-card-cd">⏱ CD：${opt.cd}回合</div>`
      : ''

    // 偵測說明中的狀態關鍵字，生成提示區
    const matchedStatuses = Object.keys(STATUS_EFFECTS).filter(name => opt.desc.includes(name))
    const hintsHtml = matchedStatuses.length > 0
      ? `<div class="card-status-hints">${
          matchedStatuses.map(name =>
            `<div class="card-status-line">🔸 ${name}：${STATUS_EFFECTS[name]}</div>`
          ).join('')
        }</div>`
      : ''

    card.innerHTML = `
      <div class="upgrade-card-title">${opt.emoji} ${opt.name}</div>
      <div class="upgrade-card-tags">
        <span class="tag tag-type">${opt.type}</span>
        ${tagHtml}
      </div>
      <div class="upgrade-card-desc">${opt.desc}</div>
      ${hintsHtml}
      ${cdHtml}
    `
    card.addEventListener('click', () => selectUpgradeCard(i))
    cardsEl.appendChild(card)
  })

  // 重置確認按鈕
  const confirmBtn = document.getElementById('btn-confirm-upgrade')
  confirmBtn.disabled = true
  confirmBtn.onclick = confirmUpgrade

  showScreen('screen-upgrade')
}

// 選擇卡片
function selectUpgradeCard(index) {
  gameState.selectedUpgradeCard = index
  document.querySelectorAll('.upgrade-card').forEach((card, i) => {
    card.classList.toggle('selected', i === index)
  })
  document.getElementById('btn-confirm-upgrade').disabled = false
}

// 確認選擇
function confirmUpgrade() {
  const selected = gameState.pendingUpgradeOptions[gameState.selectedUpgradeCard]
  if (selected && gameState.playerSkills.length < 3) {
    gameState.playerSkills.push(selected)
  }
  showScreen('screen-board')
  afterCellEvent()
}

// ===== 事件畫面 =====

// 隨機抽取事件並進入事件畫面
function startEvent() {
  const event = TEST_EVENTS[Math.floor(Math.random() * TEST_EVENTS.length)]
  initEventScreen(event)
}

// 初始化事件畫面
function initEventScreen(event) {
  // 左側場景區顏色
  const sceneEl = document.getElementById('event-scene')
  sceneEl.style.backgroundColor = event.color
  sceneEl.style.border = event.borderColor ? `2px solid ${event.borderColor}` : 'none'
  document.getElementById('event-scene-emoji').textContent = event.emoji
  document.getElementById('event-type-label').textContent = event.type

  // 右側文字
  document.getElementById('event-title').textContent = event.title
  document.getElementById('event-desc').textContent = event.desc

  // 渲染選項按鈕
  const optionsEl = document.getElementById('event-options')
  optionsEl.innerHTML = ''
  event.options.forEach((opt, i) => {
    const btn = document.createElement('button')
    btn.className = 'event-option-btn'
    const goldShort = opt.cost?.gold
    if (goldShort && gameState.gold < goldShort) {
      btn.textContent = opt.text + '（金幣不足）'
      btn.disabled = true
    } else {
      btn.textContent = opt.text
      btn.addEventListener('click', () => resolveEventOption(event, i))
    }
    optionsEl.appendChild(btn)
  })

  // 隱藏結果區
  document.getElementById('event-result').classList.remove('visible')

  showScreen('screen-event')
}

// 選擇事件選項，套用效果並顯示結果
function resolveEventOption(event, optionIndex) {
  const opt = event.options[optionIndex]
  const job = gameState.selectedJob

  // 套用效果
  if (opt.cost?.gold) {
    gameState.gold = Math.max(0, gameState.gold - opt.cost.gold)
  }
  if (opt.effect.hp) {
    gameState.playerCurrentHp = Math.min(
      job.stats.hp,
      Math.max(0, gameState.playerCurrentHp + opt.effect.hp)
    )
  }
  // 血量歸零觸發死亡畫面
  if (gameState.playerCurrentHp <= 0) {
    setTimeout(() => showDeathScreen(), 400)
    return
  }
  if (opt.effect.gold) {
    gameState.gold += opt.effect.gold
  }

  // 停用所有選項
  document.querySelectorAll('.event-option-btn').forEach(btn => { btn.disabled = true })

  // 顯示結果
  document.getElementById('event-result-text').textContent = opt.result
  document.getElementById('event-result').classList.add('visible')
}

// 繼續前進（返回棋盤）
function continueAfterEvent() {
  showScreen('screen-board')
  updateBoardStatus()
  afterCellEvent()
}

// ===== 道具畫面 =====

// timing 對應標籤顏色
const ITEM_TIMING_COLOR = {
  instant: '#f0c040',
  battle:  '#e74c3c',
  board:   '#27ae60'
}

// 隨機抽取3個不重複道具
function startItem() {
  const shuffled = [...TEST_ITEMS].sort(() => Math.random() - 0.5)
  initItemScreen(shuffled.slice(0, 3))
}

// 渲染頂部道具欄（discardMode=true 時加可點擊丟棄樣式）
function renderItemSlots(discardMode) {
  const slotsEl = document.getElementById('item-slots')
  slotsEl.innerHTML = ''
  gameState.inventory.forEach((item, i) => {
    const slot = document.createElement('div')
    slot.className = 'item-slot ' + (item ? 'has-item' : 'empty-slot')
    if (discardMode && item) {
      slot.classList.add('discard-mode')
      slot.textContent = `${item.emoji} ${item.name}`
      slot.addEventListener('click', () => {
        const selected = gameState.pendingItemOptions[gameState.selectedItemCard]
        gameState.inventory[i] = selected
        afterItemScreen()
      })
    } else {
      slot.textContent = item ? `${item.emoji} ${item.name}` : '空'
    }
    slotsEl.appendChild(slot)
  })
}

// 初始化道具畫面
function initItemScreen(items) {
  gameState.pendingItemOptions = items
  gameState.selectedItemCard = null
  gameState.itemDiscardMode = false

  renderItemSlots(false)

  // 渲染三張道具卡片
  const cardsEl = document.getElementById('item-cards')
  cardsEl.innerHTML = ''
  items.forEach((item, i) => {
    const card = document.createElement('div')
    card.className = 'item-card'
    const tagColor = ITEM_TIMING_COLOR[item.timing] || '#aabbcc'
    card.innerHTML = `
      <div class="item-card-emoji">${item.emoji}</div>
      <div class="item-card-name">${item.name}</div>
      <div class="item-card-tag" style="background-color:${tagColor}20;color:${tagColor};border-color:${tagColor}60">${item.timingLabel}</div>
      <div class="item-card-desc">${item.desc}</div>
    `
    card.addEventListener('click', () => selectItemCard(i))
    cardsEl.appendChild(card)
  })

  // 重置確認按鈕
  const confirmBtn = document.getElementById('btn-confirm-item')
  confirmBtn.textContent = '放入道具欄'
  confirmBtn.disabled = true
  confirmBtn.onclick = confirmItem

  showScreen('screen-item')
}

// 選擇道具卡片
function selectItemCard(index) {
  gameState.selectedItemCard = index
  document.querySelectorAll('.item-card').forEach((card, i) => {
    card.classList.toggle('selected', i === index)
  })
  const confirmBtn = document.getElementById('btn-confirm-item')
  const isFull = gameState.inventory.every(slot => slot !== null)
  if (isFull) {
    confirmBtn.textContent = '選擇後丟棄'
    gameState.itemDiscardMode = true
  } else {
    confirmBtn.textContent = '放入道具欄'
    gameState.itemDiscardMode = false
  }
  confirmBtn.disabled = false
}

// 確認選擇道具
function confirmItem() {
  const selected = gameState.pendingItemOptions[gameState.selectedItemCard]
  if (!selected) return

  if (!gameState.itemDiscardMode) {
    // 道具欄有空位，直接放入
    const emptyIdx = gameState.inventory.findIndex(s => s === null)
    gameState.inventory[emptyIdx] = selected
    afterItemScreen()
  } else {
    // 道具欄已滿 → 進入丟棄模式，讓玩家點擊要替換的格子
    renderItemSlots(true)
    const confirmBtn = document.getElementById('btn-confirm-item')
    confirmBtn.textContent = '請選擇要丟棄的道具'
    confirmBtn.disabled = true
  }
}

// 道具畫面結束，返回棋盤
function afterItemScreen() {
  gameState.selectedItemCard = null
  gameState.itemDiscardMode = false
  showScreen('screen-board')
  updateBoardStatus()
  afterCellEvent()
}

// ===== 商店畫面 =====

// 隨機抽取 4 個道具（允許重複），各自隨機定價 20~50 金幣
// 星界碎片：所有售價打 9 折
function startShop() {
  const hasAstral = gameState.sealFragments.includes('astral')
  gameState.currentShopItems = Array.from({ length: 4 }, () => {
    const item = TEST_ITEMS[Math.floor(Math.random() * TEST_ITEMS.length)]
    let price = 20 + Math.floor(Math.random() * 31)  // 20~50
    if (hasAstral) price = Math.floor(price * 0.9)   // 星界碎片：9折
    return { ...item, price, purchased: false }
  })
  gameState.shopDiscardMode = false
  gameState.pendingShopItem = null
  initShopScreen()
}

// 星界碎片：技能傷害倍率（+20%）
function getSkillDamageMultiplier() {
  return gameState.sealFragments.includes('astral') ? 1.2 : 1.0
}

// 渲染商店頂部道具欄（discardMode=true 時格子可點擊替換）
function renderShopInventory(discardMode) {
  const slotsEl = document.getElementById('shop-item-slots')
  slotsEl.innerHTML = ''
  gameState.inventory.forEach((item, i) => {
    const slot = document.createElement('div')
    slot.className = 'item-slot ' + (item ? 'has-item' : 'empty-slot')
    if (discardMode && item) {
      slot.classList.add('discard-mode')
      slot.textContent = `${item.emoji} ${item.name}`
      slot.addEventListener('click', () => {
        // 替換此格，結束丟棄模式
        gameState.inventory[i] = gameState.pendingShopItem
        gameState.pendingShopItem = null
        gameState.shopDiscardMode = false
        renderShopInventory(false)
        updateShopBtns()
        document.getElementById('btn-leave-shop').disabled = false
      })
    } else {
      slot.textContent = item ? `${item.emoji} ${item.name}` : '空'
    }
    slotsEl.appendChild(slot)
  })
}

// 更新所有購買按鈕狀態（金幣不足 / 已售出 / 可購買）
function updateShopBtns() {
  gameState.currentShopItems.forEach((shopItem, i) => {
    const btn = document.getElementById(`shop-buy-${i}`)
    if (!btn) return
    if (shopItem.purchased) {
      btn.textContent = '已售出'
      btn.disabled = true
      btn.classList.remove('can-buy')
    } else if (gameState.gold < shopItem.price) {
      btn.textContent = `${shopItem.price} G`
      btn.disabled = true
      btn.classList.remove('can-buy')
    } else {
      btn.textContent = `${shopItem.price} G`
      btn.disabled = false
      btn.classList.add('can-buy')
    }
  })
}

// 初始化商店畫面
function initShopScreen() {
  // 更新金幣顯示
  document.getElementById('shop-gold-amount').textContent = gameState.gold

  // 渲染頂部道具欄
  renderShopInventory(false)

  // 渲染商品列表（4 列）
  const listEl = document.getElementById('shop-list')
  listEl.innerHTML = ''
  gameState.currentShopItems.forEach((shopItem, i) => {
    const row = document.createElement('div')
    row.className = 'shop-row'
    const tagColor = ITEM_TIMING_COLOR[shopItem.timing] || '#aabbcc'
    row.innerHTML = `
      <div class="shop-row-emoji">${shopItem.emoji}</div>
      <div class="shop-row-info">
        <div class="shop-row-name">${shopItem.name}</div>
        <div class="shop-row-desc">${shopItem.desc}</div>
      </div>
      <div class="shop-row-tag" style="background-color:${tagColor}20;color:${tagColor};border-color:${tagColor}60">${shopItem.timingLabel}</div>
      <button class="shop-buy-btn" id="shop-buy-${i}">${shopItem.price} G</button>
    `
    row.querySelector(`#shop-buy-${i}`).addEventListener('click', () => buyItem(i))
    listEl.appendChild(row)
  })

  updateShopBtns()
  document.getElementById('btn-leave-shop').disabled = false
  showScreen('screen-shop')
}

// 購買道具
function buyItem(index) {
  const shopItem = gameState.currentShopItems[index]
  if (!shopItem || shopItem.purchased) return
  if (gameState.gold < shopItem.price) return
  if (!confirm(`確定購買「${shopItem.name}」（${shopItem.price} 金幣）？`)) return

  // 扣款 & 標記已購
  gameState.gold -= shopItem.price
  shopItem.purchased = true
  document.getElementById('shop-gold-amount').textContent = gameState.gold

  // 取得純道具資料（去掉 price / purchased 欄位）
  const { price, purchased, ...itemData } = shopItem

  const emptyIdx = gameState.inventory.findIndex(s => s === null)
  if (emptyIdx !== -1) {
    // 有空位，直接放入
    gameState.inventory[emptyIdx] = itemData
    renderShopInventory(false)
    updateShopBtns()
  } else {
    // 道具欄已滿 → 進入丟棄模式，讓玩家點擊要替換的格子
    gameState.pendingShopItem = itemData
    gameState.shopDiscardMode = true
    renderShopInventory(true)
    updateShopBtns()
    document.getElementById('btn-leave-shop').disabled = true
  }
}

// 離開商店
function leaveShop() {
  if (gameState.shopDiscardMode) return  // 丟棄模式防呆，不可離開
  showScreen('screen-board')
  updateBoardStatus()
  afterCellEvent()
}

// 戰鬥畫面初始化
function initBattleScreen() {
  document.getElementById('btn-attack').addEventListener('click', playerAttack)
  document.getElementById('tab-player').addEventListener('click', () => renderInfoContent('player'))
  document.getElementById('tab-enemy').addEventListener('click', () => renderInfoContent('enemy'))
}

// ===== GM Tools（開發用，上線前移除） =====
function initGmTools() {
  const panel = document.getElementById('gm-tools')
  const hide = () => panel.classList.remove('visible')

  // G 鍵開關（只在棋盤畫面有效）
  document.addEventListener('keydown', e => {
    if ((e.key === 'g' || e.key === 'G') && gameState.currentScreen === 'screen-board') {
      panel.classList.toggle('visible')
    }
  })

  // 觸發格子類型
  document.getElementById('gm-battle').addEventListener('click', () => { hide(); startBattle() })
  document.getElementById('gm-item').addEventListener('click', () => { hide(); startItem() })
  document.getElementById('gm-event').addEventListener('click', () => { hide(); startEvent() })
  document.getElementById('gm-shop').addEventListener('click', () => { hide(); startShop() })
  document.getElementById('gm-trap').addEventListener('click', () => { hide(); alert('觸發：💀 陷阱格'); afterCellEvent() })
  document.getElementById('gm-bless').addEventListener('click', () => { hide(); alert('觸發：✨ 祝福格'); afterCellEvent() })
  // Boss 戰鬥（直接觸發）
  document.getElementById('gm-boss-flame').addEventListener('click', () => { hide(); startBattle([{ ...BOSSES.boss_flame }]) })
  document.getElementById('gm-boss-shadow').addEventListener('click', () => { hide(); startBattle([{ ...BOSSES.boss_shadow }]) })
  document.getElementById('gm-boss-astral').addEventListener('click', () => { hide(); startBattle([{ ...BOSSES.boss_astral }]) })
  document.getElementById('gm-boss-final').addEventListener('click', () => { hide(); startFinalBossBattle() })

  // 快速調整
  document.getElementById('gm-add-gold').addEventListener('click', () => {
    gameState.gold += 100
    updateBoardStatus()
  })
  document.getElementById('gm-lose-hp').addEventListener('click', () => {
    if (!gameState.selectedJob) return
    gameState.playerCurrentHp = Math.max(0, gameState.playerCurrentHp - 50)
  })
  document.getElementById('gm-upgrade').addEventListener('click', () => {
    hide()
    gameState.playerLevel++
    initUpgradeScreen(getTestUpgradeOptions())
  })
  document.getElementById('gm-set-turn-20').addEventListener('click', () => {
    gameState.currentTurn = 20
    updateBoardStatus()
  })
}

// ===== 遊戲進入點 =====
function init() {
  showScreen('screen-start')
  initStartScreen()
  initJobSelectScreen()
  initBoardScreen()
  initBattleScreen()
  initGmTools()
  document.getElementById('btn-event-continue').addEventListener('click', continueAfterEvent)
  document.getElementById('btn-skip-item').addEventListener('click', () => {
    if (confirm('確定放棄本次道具？')) afterItemScreen()
  })
  document.getElementById('btn-leave-shop').addEventListener('click', leaveShop)
}

init()
