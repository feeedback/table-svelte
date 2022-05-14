export default {
  TQ: 'Titan Quest',
  ENEMY: {
    OFFENSIVE: 550,
    DEFENSIVE: 650,
    HIT: 4000,
    ARMOR: 400,
  },
  MY_ATTR: {
    STR: 670,
    DEX: 400,
    INT: 700,
  },
  START_ATTR_70: {
    // RUNE + SPIRIT
    STR: (1.12 + 1.21) * (74 + 40 + 0 + 4 * 35 + 50),
    DEX: 1.2 * (60 + 60 + 60 + 4 * 40),
    INT: 1.2 * (60 + 80 + 120 + 4 * 40 + 40),

    HEALTH: 1.25 * (755 + 800 + 800 + 170 + 100 + 40 * 51),
    ENERGY: 300 + 0 + 320,

    // 0	'STR'	708
    // 1	'DEX'	408
    // 2	'INT'	552
    // 3	'HEALTH'	5831.25
    // 4	'ENERGY'	620
  },

  // START_ATTR_70: {
  //   // DEFENSE + SPIRIT
  //   STR: 1.21 * (74 + 60 + 0 + 4 * 55 + 50),
  //   DEX: 1.2 * (60 + 80 + 60 + 4 * 35),
  //   INT: 1.2 * (60 + 0 + 120 + 4 * 60 + 36),

  //   HEALTH: 1.25 * (755 + 800 + 2000 + 170 + 100 + 40 * 10),
  //   ENERGY: 300 + 0 + 320,

  //   // 0	'STR'	488.84
  //   // 1	'DEX'	408
  //   // 2	'INT'	504
  //   // 3	'HEALTH'	5281.25
  //   // 4	'ENERGY'	620
  // },
  ATTRIBUTE_POINT_70: 156,
  GET_ATTRIBUTE_POINT: (lvl) => lvl + 86,

  //  40 lvl
  //  {
  //     "characterDexterity": "+60 Dexterity",
  //     "characterIntelligence": "+80 Intelligence",
  //     "characterLife": "+800 Health",
  //     "characterStrength": "+40 Strength"
  //   }
  // ],
  // "tag": "x2tagSkillRunesName001"

  // 40 lvl
  // {
  //     "characterDexterity": "+60 Dexterity",
  //     "characterIntelligence": "+120 Intelligence",
  //     "characterLife": "+800 Health",
  //     "characterMana": "+320 Energy"
  //   }
  // ],
  // "tag": "tagSkillName030"

  // DEFENSE
  //   {
  //     "characterDexterity": "+80 Dexterity",
  //     "characterLife": "+2000 Health",
  //     "characterStrength": "+60 Strength"
  //   }
  // ],
  // "tag": "tagSkillName116"

  // 10s / 45s
  // defensiveProtection: '75 Armor',
  // defensiveElementalResistance: '65% Elemental Resistance',
  // defensiveReflect: '80% Damage Reflected',

  // characterDefensiveAbility: '+238 Defensive Ability',
  // characterManaLimitReserve: '75 Energy Reserved',
  // defensiveProtection: '58 Armor',

  MAX_SKILL_POINT: {
    base: 222,
    normal: 7,
    epic: 7 * 2,
    legend: 7 * 3,
  },
};
