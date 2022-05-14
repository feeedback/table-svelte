/* eslint-disable no-irregular-whitespace */
import { getXDigits, getPercent } from './utils.js';

import __ from './const.js';
// propertiesMapNameToValue;
export const properties = {
  Defensive: {
    name: 'Defensive Abillity',
    value: 1400,
    format: 'num',
    valueView: (value) =>
      // `hit you ${getXDigits(100 * 0.88 ** (1 + (value - __.ENEMY.OFFENSIVE) / 100) + 10, 2)}%`,
      `hit you ${getXDigits(100 * 0.88 ** (1 + (value - __.ENEMY.OFFENSIVE) / 100) + 10)}%`,
    infoName: `protect to phys melee crit and hit you chance`,
  },

  ShieldBlockChance: {
    name: 'Shield Block Chance',
    value: 0.57 + 0.15,
    // value: 0.64 + 0.15,
    // value: 0.53 + 0.14,
    info: `defensiveBlock (shieldBase) & defensiveBlockModifier`,
  },
  ProjectileBlockChance: {
    name: 'Projectile Block Chance',
    format: 'fn',
    valueRaw: () => properties.ShieldBlockChance.value * (1 + __.MY_ATTR.DEX / 1000),
    value: () => `${getXDigits(properties.ShieldBlockChance.value * (1 + __.MY_ATTR.DEX / 1000) * 100, 1)}%`,
    info: `ShieldBlockChance & DEX`,
  },
  HitYouMeleeChance: {
    name: 'Hit You Melee Chance',
    format: 'fn',
    valueRaw: () => (100 * 0.88 ** (1 + (properties.Defensive.value - __.ENEMY.OFFENSIVE) / 100) + 10) / 100,
    value: () =>
      getPercent((100 * 0.88 ** (1 + (properties.Defensive.value - __.ENEMY.OFFENSIVE) / 100) + 10) / 100, 1),
    infoName: `hit you projectile - 100% (expect avoid and block)`,
    info: `Defensive`,
  },
  MeleeBlockChance: {
    name: 'Melee Block Chance',
    format: 'fn',
    valueRaw: () => properties.ShieldBlockChance.value - 0.5 * (properties.HitYouMeleeChance.valueRaw() - 1),
    value: () =>
      getPercent(properties.ShieldBlockChance.value - 0.5 * (properties.HitYouMeleeChance.valueRaw() - 1), 1),
    info: `BlockChance & HitYouMeleeChance`,
  },
  ShieldBlockDamage: {
    name: 'Shield Max Damage to Block',
    value: 828,
    format: 'num',
    info: `defensiveBlock (shieldBase)`,
  },
  ShieldRecovery: {
    name: 'Shield Recovery Time',
    value: 0.67 + 0.15,
    valueView: (value) => `per ${getXDigits(2.5 * (1 - value), 2)}s`,
    info: `2.5s (3s in vers AE+) & characterDefensiveBlockRecoveryReduction`,
  },

  ArmorAbsorption: {
    name: 'Armor Absorption',
    // value: 0.66,
    value: 0.66 * 1.26,
    infoName: `Increase you armor efficiency`,
    info: `66% & defensiveAbsorptionModifier`,
  },
  ArmorProtection: {
    name: 'Armor Protection',
    // value: 0.66,
    value: 0.2,
    infoName: `Increase you armor`,
    info: `defensiveProtectionModifier`,
  },
  // Armor: {
  //   name: 'Armor',
  //   value: 0.2,
  //   infoName: `Reduce phys damage to you`,
  //   info: `defensiveProtection`,
  // },
  ArmorHead: {
    name: 'Head',
    format: 'num',
    value: 600,
  },
  ArmorTorso: {
    name: 'Torso',
    format: 'num',
    value: 750,
  },
  ArmorArm: {
    name: 'Arm',
    format: 'num',
    value: 600,
  },
  ArmorLeg: {
    name: 'Leg',
    format: 'num',
    value: 600,
  },
  ArmorJewelry: {
    name: 'Jewelry',
    format: 'num',
    value: 0,
  },
  ArmorBonus: {
    name: 'Bonus',
    format: 'num',
    value: 40,
  },
  DodgeAttacks: {
    name: 'Chance to Dodge Attacks',
    value: 0,
    info: `characterDodgePercent`,
  },
  AvoidProjectiles: {
    name: 'Chance to Avoid Projectiles',
    value: 0,
    info: `characterDeflectProjectile`,
  },

  // ATTACK

  // Offensive: {
  //   name: 'Offensive Abillity',
  //   value: 500,
  //   format: 'num',
  //   valueView: (value) =>
  //     // `hit you ${getXDigits(100 * 0.88 ** (1 + (value - __.ENEMY.OFFENSIVE) / 100) + 10, 2)}%`,
  //     `hit ${getXDigits(100 * 0.88 ** (1 + (__.ENEMY.DEFENSIVE - value) / 100) + 10)}%`,
  //   infoName: `phys melee crit and hit chance\n*hit projectile - 100% (expect avoid and block)`,
  // },
};
