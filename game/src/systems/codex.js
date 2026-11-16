// Lumencairn: The Celestial Codex & Prism Forge
// Upgrades optical formulas, quartz purity, dispersion gratings, and bastion capacitor reserves.

import { CONFIG } from '../config.js';
import { audio } from '../audio.js';

export class CodexSystem {
  constructor() {
    this.purchasedUpgrades = new Set();
    this.selectedIndex = 0;

    // Active modifiers
    this.reflectivityBonus = 0;
    this.triDispersion = false;
    this.thermalOverdrive = false;
  }

  isUnlocked(id) {
    return this.purchasedUpgrades.has(id);
  }

  canAfford(id, lumens) {
    const up = CONFIG.UPGRADES.find(u => u.id === id);
    return up && lumens >= up.cost && !this.isUnlocked(id);
  }

  purchase(id, bastion) {
    if (!this.canAfford(id, bastion.lumens)) return false;

    const up = CONFIG.UPGRADES.find(u => u.id === id);
    bastion.lumens -= up.cost;
    this.purchasedUpgrades.add(id);
    audio.playUpgrade();

    switch (id) {
      case 'optic_purity':
        this.reflectivityBonus += 0.15;
        CONFIG.OPTICS.MAX_BOUNCES += 2;
        break;
      case 'dispersion_prism':
        this.triDispersion = true;
        break;
      case 'focal_overdrive':
        this.thermalOverdrive = true;
        break;
      case 'solar_capacitor':
        bastion.maxHp += 350;
        bastion.hp = Math.min(bastion.maxHp, bastion.hp + 350);
        break;
    }
    return true;
  }
}
