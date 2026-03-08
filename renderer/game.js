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
      gameState.boardCells = generateBoard()
      gameState.playerPos = 0
      gameState.currentTurn = 1
      gameState.gold = 0
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
  } else {
    const cellType = CELL_TYPES[type]
    alert(`觸發：${cellType.icon} ${cellType.label}格`)
    afterCellEvent()
  }
}

// 格子事件結束後回到棋盤流程
function afterCellEvent() {
  gameState.currentTurn++
  updateBoardStatus()
  document.getElementById('btn-roll').disabled = false
  document.getElementById('dice-msg').textContent = ''
}

// 棋盤畫面初始化
function initBoardScreen() {
  document.getElementById('btn-roll').addEventListener('click', rollDice)
}

// ===== 戰鬥畫面 =====

// 初始化並進入戰鬥
function startBattle() {
  const job = gameState.selectedJob
  gameState.playerCurrentHp = job.stats.hp
  gameState.battleRound = 1
  gameState.battlePhase = 'player'
  gameState.activeInfoTab = 'player'
  // 測試用敵人（暫時寫死）
  gameState.enemies = [
    { name: '哥布林戰士', maxHp: 60, hp: 60, atk: 20, def: 5 }
  ]
  showScreen('screen-battle')
  renderBattleScreen()
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
        ['閃避率', '0%'],
        ['爆擊率', '0%']
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

  // 更新敵人UI
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

  // 切換敵方回合
  gameState.battlePhase = 'enemy'
  updateBattleStatus()
  setTimeout(enemyTurn, 900)
}

// 敵方回合
function enemyTurn() {
  const job = gameState.selectedJob
  const enemy = gameState.enemies[0]
  // 閃避判斷（玩家閃避率）
  if (Math.random() * 100 < job.stats.dodge) {
    setActionLog(`你閃避了 ${enemy.name} 的攻擊！`)
    gameState.battleRound++
    gameState.battlePhase = 'player'
    updateBattleStatus()
    document.getElementById('btn-attack').disabled = false
    return
  }

  const dmg = Math.max(0, enemy.atk - job.stats.def)
  gameState.playerCurrentHp = Math.max(0, gameState.playerCurrentHp - dmg)

  // 更新玩家 HP UI
  updateHpBar('player-hp-bar', gameState.playerCurrentHp, job.stats.hp)
  document.getElementById('player-hp-text').textContent =
    `${gameState.playerCurrentHp} / ${job.stats.hp}`
  const playerSprite = document.getElementById('player-sprite')
  if (playerSprite) showDamagePopup(playerSprite, dmg)
  setActionLog(`${enemy.name} 對你造成 ${dmg} 點傷害`)

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

// 戰鬥結束
function endBattle(result) {
  if (result === 'win') {
    alert('戰鬥勝利！')
  } else {
    alert('戰鬥失敗！')
  }
  showScreen('screen-board')
  afterCellEvent()
}

// 戰鬥畫面初始化
function initBattleScreen() {
  document.getElementById('btn-attack').addEventListener('click', playerAttack)
  document.getElementById('tab-player').addEventListener('click', () => renderInfoContent('player'))
  document.getElementById('tab-enemy').addEventListener('click', () => renderInfoContent('enemy'))
}

// ===== 遊戲進入點 =====
function init() {
  showScreen('screen-start')
  initStartScreen()
  initJobSelectScreen()
  initBoardScreen()
  initBattleScreen()
}

init()
