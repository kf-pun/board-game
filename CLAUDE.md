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
  FUNCTIONS.md     → 核心函式命名與架構說明
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
  screen-item、screen-shop、screen-result、screen-death
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
- currentShopItems：商店當次商品陣列（含 price / purchased 欄位）
- shopDiscardMode / pendingShopItem：商店丟棄模式旗標與待放入道具
- sealFragments：已獲得的封印碎片陣列（['flame'/'shadow'/'astral']，隱藏狀態）
- playerCrackArmor：裂甲剩餘回合數（星界Boss二階段施加，防禦降 35%）

> 詳細的核心函式命名與架構說明請參考 `FUNCTIONS.md`
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
- [x] 戰鬥畫面（Prototype）
- [x] 技能系統（Prototype - 測試用升級選項）
- [x] 升級選擇畫面
- [x] 事件畫面
- [x] 道具畫面
- [x] 商店畫面
- [x] 中Boss演出
- [x] 最終Boss演出
- [x] 死亡畫面（Game Over）
- [x] 結算畫面
- [ ] 開始畫面（含存檔判斷）
- [ ] 周目解鎖商店
## Git 規範
- 每完成一個功能才 commit
- 格式：「功能：說明」
