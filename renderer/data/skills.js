// ===== 技能資料庫 =====
// icon 欄位為 ICONS 字典的 key 字串，渲染時使用 ICONS[skill.icon]
// maxCd: 主動技能冷卻回合數，null 代表被動技能
// effect.type 清單：
//   crackArmor   - 對敵施加裂甲 N 回合（防禦 -35%）
//   burn         - 對敵附加燃燒 N 層
//   poison       - 對敵附加中毒 N 層
//   freeze       - 凍結敵方 N 回合（跳過行動）
//   lifeDrain    - 吸血：回復等同 ratio 比例傷害的 HP
//   ignoreDef    - 本次傷害無視防禦
//   passiveDef   - 被動：防禦力 +bonus
//   passiveDodge - 被動：閃避率 +bonus%
//   passiveCrit  - 被動：爆擊率 +bonus%
//   passiveDotBoost - 被動：DoT 傷害 ×ratio

const SKILLS = [

  // ============================================================
  // 戰士 (warrior)
  // ============================================================
  {
    id:         'crack_strike',
    name:       '破甲重擊',
    icon:       'crackArmor',
    job:        'warrior',
    type:       '主動',
    desc:       '造成攻擊力×150%傷害，並對敵方施加裂甲2回合（防禦-35%）',
    maxCd:      3,
    multiplier: 1.5,
    effect:     { type: 'crackArmor', duration: 2 }
  },
  {
    id:         'blood_charge',
    name:       '血怒衝鋒',
    icon:       'skillRage',
    job:        'warrior',
    type:       '主動',
    desc:       '造成攻擊力×200%傷害，並吸收傷害量30%作為HP',
    maxCd:      4,
    multiplier: 2.0,
    effect:     { type: 'lifeDrain', ratio: 0.3 }
  },
  {
    id:         'iron_will',
    name:       '鐵甲意志',
    icon:       'defense',
    job:        'warrior',
    type:       '被動',
    desc:       '裝備後防禦力永久+8',
    maxCd:      null,
    multiplier: null,
    effect:     { type: 'passiveDef', bonus: 8 }
  },

  // ============================================================
  // 刺客 (assassin)
  // ============================================================
  {
    id:         'poison_blade',
    name:       '淬毒暗器',
    icon:       'poison',
    job:        'assassin',
    type:       '主動',
    desc:       '造成攻擊力×120%傷害，附加中毒2層（每回合固定8傷害/層）',
    maxCd:      2,
    multiplier: 1.2,
    effect:     { type: 'poison', layers: 2 }
  },
  {
    id:         'shadow_kill',
    name:       '影殺',
    icon:       'berserk',
    job:        'assassin',
    type:       '主動',
    desc:       '造成攻擊力×250%傷害，完全無視敵方防禦',
    maxCd:      5,
    multiplier: 2.5,
    effect:     { type: 'ignoreDef' }
  },
  {
    id:         'shadow_step',
    name:       '影蹤步法',
    icon:       'dodge',
    job:        'assassin',
    type:       '被動',
    desc:       '裝備後閃避率永久+12%',
    maxCd:      null,
    multiplier: null,
    effect:     { type: 'passiveDodge', bonus: 12 }
  },

  // ============================================================
  // 法師 (mage)
  // ============================================================
  {
    id:         'flame_burst',
    name:       '炎爆術',
    icon:       'burning',
    job:        'mage',
    type:       '主動',
    desc:       '造成攻擊力×200%傷害，附加燃燒2層（每回合(4+攻×12%)×層數傷害）',
    maxCd:      4,
    multiplier: 2.0,
    effect:     { type: 'burn', layers: 2 }
  },
  {
    id:         'frost_bolt',
    name:       '冰霜衝擊',
    icon:       'skillCrack',
    job:        'mage',
    type:       '主動',
    desc:       '造成攻擊力×150%傷害，凍結敵方1回合（跳過下次攻擊，即「冰凍」效果）',
    maxCd:      3,
    multiplier: 1.5,
    effect:     { type: 'freeze', duration: 1 }
  },
  {
    id:         'arcane_insight',
    name:       '奧術洞察',
    icon:       'crit',
    job:        'mage',
    type:       '被動',
    desc:       '裝備後爆擊率永久+10%',
    maxCd:      null,
    multiplier: null,
    effect:     { type: 'passiveCrit', bonus: 10 }
  },

  // ============================================================
  // 術士 (warlock)
  // ============================================================
  {
    id:         'life_drain',
    name:       '生命吸取',
    icon:       'hp',
    job:        'warlock',
    type:       '主動',
    desc:       '造成攻擊力×100%傷害，回復等同傷害值的HP',
    maxCd:      3,
    multiplier: 1.0,
    effect:     { type: 'lifeDrain', ratio: 1.0 }
  },
  {
    id:         'plague_curse',
    name:       '瘟疫詛咒',
    icon:       'poison',
    job:        'warlock',
    type:       '主動',
    desc:       '造成攻擊力×80%傷害，附加中毒3層（每回合固定8傷害/層）',
    maxCd:      3,
    multiplier: 0.8,
    effect:     { type: 'poison', layers: 3 }
  },
  {
    id:         'void_echo',
    name:       '虛空共鳴',
    icon:       'skillEye',
    job:        'warlock',
    type:       '被動',
    desc:       '裝備後燃燒與中毒的DoT傷害提升50%',
    maxCd:      null,
    multiplier: null,
    effect:     { type: 'passiveDotBoost', ratio: 1.5 }
  }

]
