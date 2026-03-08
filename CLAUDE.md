# CLAUDE.md — board-game 專案規範

## 專案簡介
大富翁形式的單人 RPG 桌面遊戲。
使用 Electron 打包，目標上架 Steam。
玩家選擇職業，在棋盤上移動觸發事件、戰鬥、收集道具，
最終挑戰 Boss。支援多周目成長系統。

## 技術規範
- Electron + HTML + CSS + JS
- renderer 資料夾內為遊戲畫面邏輯
- main.js 為 Electron 主程序，非必要不修改
- preload.js 為橋接層，非必要不修改
- 不使用任何前端框架或套件
- 所有檔案使用 UTF-8 編碼
- JS 使用 ES6 語法
- 視窗固定解析度 1280×720

## 檔案結構
board-game/
  main.js
  preload.js
  package.json
  renderer/
    index.html
    style.css
    game.js
    data/
      jobs.js
      skills.js
      events.js
      items.js
  assets/
    images/
    sounds/
  CLAUDE.md
  README.md

## 開發規範

### 回應方式
- 回應使用繁體中文
- 程式碼內的註解使用繁體中文
- 每次修改前先說明要做什麼再動手
- 修改完成後簡短說明做了什麼

### Token 節省原則
- 不重複解釋已知內容
- 不產生不必要的說明文字
- 修改現有檔案時只顯示修改的部分
- 不主動詢問已在規範中說明的事項
- 每次開始工作前先讀取 CLAUDE.md

### 程式碼規範
- 變數與函式命名使用英文駝峰式
- 每個函式只做一件事
- 相關功能集中在同一區塊並加上註解標題
- 避免重複程式碼，共用邏輯抽成函式
- 所有遊戲狀態集中在 gameState 物件管理

### 畫面開發規範
- Prototype 階段不使用任何圖片
- 角色與怪物以色塊 + 文字代替
- 動畫效果以簡單 CSS transition 實作
- 所有畫面固定 1280×720 解析度
- 畫面切換以顯示/隱藏 div 實作

### 資料結構規範
- 職業資料存放於 data/jobs.js
- 技能資料存放於 data/skills.js
- 事件劇本存放於 data/events.js
- 道具資料存放於 data/items.js
- 所有資料以 JS 物件或陣列格式儲存
- 資料與邏輯分離，data 資料夾只存資料

### Electron 規範
- main.js 負責視窗建立，非必要不修改
- preload.js 負責橋接，非必要不修改
- renderer 內的程式碼不可直接使用 Node.js API
- 需要系統功能時透過 preload.js 橋接

### Git 規範
- 每完成一個功能才 commit
- commit 訊息格式：「功能：說明」
  例：「棋盤：新增32格環狀顯示」
  例：「戰鬥：新增普通攻擊邏輯」
- 不 commit 未完成的功能

## 目前開發進度
- [ ] Electron 基礎框架
- [ ] 開始畫面
- [ ] 職業選擇畫面
- [ ] 棋盤主畫面
- [ ] 骰子與角色移動
- [ ] 戰鬥畫面
- [ ] 技能系統
- [ ] 升級選擇畫面
- [ ] 事件畫面
- [ ] 道具畫面
- [ ] 商店畫面
- [ ] 中Boss演出
- [ ] 最終Boss演出
- [ ] 結算畫面
- [ ] 周目解鎖商店

## 注意事項
- 本專案目前為 Prototype 階段，以功能完整為優先
- 視覺美化留待後期處理
- 每個功能完成後更新上方開發進度
- 啟動專案：npm start
- 打包專案：npm run build
