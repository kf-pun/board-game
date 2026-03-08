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
  inventory: [null, null, null]
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

    alert(`觸發：${cellType.icon} ${cellType.label}格`)

    gameState.currentTurn++
    updateBoardStatus()
    document.getElementById('btn-roll').disabled = false
  }, 400)
}

// 棋盤畫面初始化
function initBoardScreen() {
  document.getElementById('btn-roll').addEventListener('click', rollDice)
}

// ===== 遊戲進入點 =====
function init() {
  showScreen('screen-start')
  initStartScreen()
  initJobSelectScreen()
  initBoardScreen()
}

init()
