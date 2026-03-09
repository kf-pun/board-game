// ===== 中 Boss 資料（依 SPEC.md Boss設計章節）=====
const BOSSES = {
  boss_flame: {
    id:         'boss_flame',
    name:       '火焰守護者',
    emoji:      '🔥',
    maxHp:      550,
    hp:         550,
    atk:        176,
    def:        71,
    dodge:      0,
    isBoss:     true,
    phase:      1,
    seal:       'flame',
    phaseQuote: '「你以為這就能擊倒我？！熔焰之力，爆發！」'
  },
  boss_shadow: {
    id:         'boss_shadow',
    name:       '暗影使者',
    emoji:      '🌑',
    maxHp:      900,
    hp:         900,
    atk:        95,
    def:        38,
    dodge:      15,
    isBoss:     true,
    phase:      1,
    seal:       'shadow',
    phaseQuote: '「光明終將消逝！黑暗，吞噬一切！」'
  },
  boss_astral: {
    id:         'boss_astral',
    name:       '星界裁決者',
    emoji:      '⭐',
    maxHp:      1600,
    hp:         1600,
    atk:        135,
    def:        54,
    dodge:      5,
    isBoss:     true,
    phase:      1,
    seal:       'astral',
    phaseQuote: '「星辰的審判，降臨此刻！宇宙的意志無可抗衡！」'
  }
}
