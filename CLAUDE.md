# CLAUDE.md
## 專案簡介
Electron 桌面遊戲，目標上架 Steam。
大富翁形式單人 RPG，玩家選職業在棋盤冒險挑戰 Boss。
## 技術規範
- Electron + HTML + CSS + JS，無任何前端框架
- 視窗 1280×720，畫面高度使用 100vh（非 720px）
- 所有檔案 UTF-8，JS 使用 ES6
## 檔案結構
board-game/
  main.js          → Electron 主程序，勿修改
  preload.js       → 橋接層，勿修改
  renderer/
    index.html     → 畫面 DOM 結構
    style.css      → 所有樣式
    game.js        → 遊戲邏輯
    data/
      jobs.js      → 職業資料
      skills.js    → 技能邏輯
      events.js    → 事件資料
      items.js     → 道具資料
  CLAUDE.md
  SPEC.md
## 開發規範
- 回應與註解使用繁體中文
- 修改前說明要做什麼，完成後簡短說明結果
- 修改檔案時只顯示修改的部分
- 每次開始前先讀取 CLAUDE.md
## 程式碼規範
- 命名：英文駝峰式
- 遊戲狀態統一存放在 gameState 物件
- 畫面切換使用 showScreen(screenId)
- 畫面 ID：screen-start、screen-job-select、screen-board、
  screen-battle、screen-upgrade、screen-event、
  screen-item、screen-shop、screen-result
- 畫面初始化函式命名：initXxxScreen()
### gameState 欄位
- currentScreen：當前畫面 ID
- selectedJobIndex / selectedJob：職業索引與物件
- playerLevel / playerExp / playerSkills：等級、經驗、技能清單（最多3個）
- playerCurrentHp：當前HP（選職業時初始化為 job.stats.hp）
- gold：金幣（測試初始50，正式應為0）
- currentTurn / playerPos / boardCells：回合、棋盤位置、格子陣列
- inventory：道具欄3格（預設null）
- battleRound / battlePhase / enemies / activeInfoTab：戰鬥狀態
- pendingUpgradeOptions / selectedUpgradeCard：升級選擇暫存
- pendingItemOptions / selectedItemCard / itemDiscardMode：道具選擇暫存與丟棄旗標
### 棋盤相關函式命名
- rollDice()：擲骰子並移動角色
- triggerCellEvent(type)：依格子類型觸發對應畫面或邏輯
- afterCellEvent()：格子事件結束，currentTurn++、啟用骰子
### 戰鬥相關函式命名
- playerAttack()：玩家攻擊邏輯
- enemyTurn()：敵方行動邏輯
- endBattle(result)：'win'或'lose'
- initBattleScreen(enemies)：初始化戰鬥，傳入敵人陣列
- initUpgradeScreen(options)：初始化升級選擇，傳入選項陣列
### 事件相關函式命名
- startEvent()：隨機抽取事件並進入事件畫面
- initEventScreen(event)：初始化事件畫面，傳入事件物件
- resolveEventOption(event, index)：套用選項效果並顯示結果
- continueAfterEvent()：返回棋盤並推進回合
### 道具相關函式命名
- startItem()：隨機抽3個不重複道具並進入道具畫面
- initItemScreen(items)：初始化道具畫面，傳入道具陣列（3個）
- renderItemSlots(discardMode)：渲染頂部道具欄，discardMode=true 時加丟棄點擊
- selectItemCard(index)：選擇卡片，道具欄已滿時進入丟棄模式
- confirmItem()：放入空欄或觸發丟棄流程
- afterItemScreen()：重置狀態，返回棋盤並推進回合
## 色彩規範
- 主背景：#1a1a2e
- 次背景：#16213e
- 頂底列：#0f0f23
- 強調金色：#f0c040
- disabled：背景 #2a2a4a、文字 #666
## 已知注意事項
- macOS 標題列佔用約 28px，畫面元素總高度勿超過 692px
- html/body/.screen 高度一律使用 100vh
- 測試用怪物攻擊力需高於玩家最高防禦力(15)
- 戰鬥畫面分兩區：上方表演區(#1a1a2e)、下方操作區(#0d0d1a)
- GM Tools：棋盤畫面按 G 鍵開關浮動測試面板，正式上線前需移除
## 開發進度
- [x] Electron 基礎框架
- [x] 開始畫面
- [x] 職業選擇畫面
- [x] 棋盤主畫面
- [x] 骰子與角色移動
- [ ] 戰鬥畫面
- [ ] 技能系統
- [x] 升級選擇畫面
- [x] 事件畫面
- [x] 道具畫面
- [ ] 商店畫面
- [ ] 中Boss演出
- [ ] 最終Boss演出
- [ ] 結算畫面
- [ ] 開始畫面（含存檔判斷）
- [ ] 周目解鎖商店
## Git 規範
- 每完成一個功能才 commit
- 格式：「功能：說明」
