// ===== 職業資料 =====
const JOBS = [
  {
    id: 'warrior',
    name: '戰士',
    color: '#c0392b',
    stats: {
      hp: 150,
      atk: 18,
      def: 15,
      dodge: 5,
      crit: 8,
      critDmg: 150
    },
    features: [
      '高防禦高HP',
      '利用厚實肉身反傷敵人'
    ]
  },
  {
    id: 'assassin',
    name: '刺客',
    color: '#2c3e50',
    stats: {
      hp: 90,
      atk: 22,
      def: 5,
      dodge: 25,
      crit: 12,
      critDmg: 160
    },
    features: [
      '超高閃避與連擊',
      '普攻可攻擊2次'
    ]
  },
  {
    id: 'mage',
    name: '法師',
    color: '#8e44ad',
    stats: {
      hp: 80,
      atk: 25,
      def: 3,
      dodge: 8,
      crit: 20,
      critDmg: 220
    },
    features: [
      '極高爆擊傷害的玻璃砲台'
    ]
  },
  {
    id: 'warlock',
    name: '術士',
    color: '#27ae60',
    stats: {
      hp: 85,
      atk: 12,
      def: 6,
      dodge: 10,
      crit: 8,
      critDmg: 140
    },
    features: [
      '普攻附加中毒',
      '持久DoT消耗流'
    ]
  }
]
