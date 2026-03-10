// ===== 道具資料（測試版，正式版替換）=====
// icon 欄位為 ICONS 字典的 key 字串，渲染時使用 ICONS[item.icon]
const TEST_ITEMS = [
  { id: 'hp_potion',    icon: 'potion',  name: '生命藥水',  timing: 'battle',  timingLabel: '戰鬥中', desc: '立即回復 50 HP' },
  { id: 'crit_rune',   icon: 'rune',    name: '爆擊符文',  timing: 'instant', timingLabel: '即生效', desc: '本場戰鬥爆擊率 +15%' },
  { id: 'def_amulet',  icon: 'amulet',  name: '防護護符',  timing: 'instant', timingLabel: '即生效', desc: '本場戰鬥防禦力 +10' },
  { id: 'wind_boots',  icon: 'boots',   name: '疾風靴',    timing: 'instant', timingLabel: '即生效', desc: '本場戰鬥閃避率 +10%' },
  { id: 'bomb_bottle', icon: 'bomb',    name: '爆炸瓶',    timing: 'battle',  timingLabel: '戰鬥中', desc: '對敵方造成 80 點固定傷害' }
]
