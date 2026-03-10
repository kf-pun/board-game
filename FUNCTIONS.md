# FUNCTIONS.md — 核心函式命名與架構說明
> 此檔案記錄 game.js 中各功能模組的函式清單，供開發參考。

## 棋盤相關函式
- rollDice()：擲骰子並移動角色
- triggerCellEvent(type)：依格子類型觸發對應畫面或邏輯
- afterCellEvent()：格子事件結束，currentTurn++；超過20回合則觸發最終Boss戰

## 戰鬥相關函式
- startBattle(enemies)：enemies 為 null 時使用測試哥布林並重置HP；傳入 Boss 陣列時保留玩家 HP
- playerAttack()：玩家攻擊邏輯（含爆擊、閃避、DoT附加、階段切換）
- enemyTurn()：敵方行動邏輯（含 DoT 結算、Boss技能觸發、閃避、裂甲）
- endBattle(result)：'win' 或 'lose'，含最終Boss/中Boss/普通分支
- initBattleScreen()：戰鬥畫面事件綁定（普攻按鈕、Tab切換）
- initUpgradeScreen(options)：初始化升級選擇，傳入選項陣列

## 事件相關函式
- startEvent()：隨機抽取事件並進入事件畫面
- initEventScreen(event)：初始化事件畫面，傳入事件物件
- resolveEventOption(event, index)：套用選項效果並顯示結果
- continueAfterEvent()：返回棋盤並推進回合

## 道具相關函式
- startItem()：隨機抽3個不重複道具並進入道具畫面
- initItemScreen(items)：初始化道具畫面，傳入道具陣列（3個）
- renderItemSlots(discardMode)：渲染頂部道具欄，discardMode=true 時加丟棄點擊
- selectItemCard(index)：選擇卡片，道具欄已滿時進入丟棄模式
- confirmItem()：放入空欄或觸發丟棄流程
- afterItemScreen()：重置狀態，返回棋盤並推進回合

## 商店相關函式
- startShop()：隨機抽4個道具（允許重複）並定價，呼叫 initShopScreen()
- renderShopInventory(discardMode)：渲染商店頂部道具欄，丟棄模式時格子可點擊替換
- updateShopBtns()：依金幣與已購狀態更新所有購買按鈕
- initShopScreen()：初始化商店畫面（金幣、道具欄、商品列表）
- buyItem(index)：二次確認後扣款，有空欄直接放入，滿欄進入丟棄模式
- leaveShop()：丟棄模式防呆，返回棋盤並推進回合

## Boss 相關函式
- triggerBossPhase2(enemy)：中Boss HP ≤ 50% 時觸發二階段演出（台詞＋Buff）
- triggerFinalBossPhase2(enemy)：最終Boss HP ≤ 60% 時觸發二階段（攻擊×1.2）
- triggerFinalBossPhase3(enemy)：最終Boss HP ≤ 30% 時觸發三階段狂暴（攻×1.3、防×0.5）
- generateFinalBoss()：依玩家等級動態生成最終Boss（isFinalBoss:true）
- startFinalBossBattle()：第20回合後觸發，持有全碎片削弱Boss HP 15%
- bossCastSpecial(enemy)：Boss 二/三階段隨機技能（35%/50% 機率）
- updateAilmentDisplay()：更新玩家狀態異常標籤（裂甲等）
- getSkillDamageMultiplier()：回傳技能傷害倍率（持有星界碎片時 ×1.2）

## 封印碎片被動效果
- flame：普攻命中後附加 1 層燃燒（上限 5 層，DoT 在敵方 DoT 結算步驟觸發）
- shadow：進入戰鬥時 30% 機率先制（自動觸發一次玩家普攻）
- astral：技能傷害 ×1.2；商店售價 ×0.9（向下取整）
