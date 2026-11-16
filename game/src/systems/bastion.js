// Lumencairn: Solarium Bastion Core System
// Manages central crystal emitter, hex grid occupancy, solar lumen reserves, and citadel integrity.

import { CONFIG } from '../config.js';
import { Vector2 } from '../math/optics.js';
import { HexMath } from '../math/hex.js';

export class BastionSystem {
  constructor() {
    this.corePos = new Vector2(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
    this.hp = CONFIG.BASTION.INITIAL_HP;
    this.maxHp = CONFIG.BASTION.MAX_HP;
    this.lumens = CONFIG.BASTION.SOLAR_START;

    this.occupiedHexes = new Map(); // "q,r" -> MirrorTower

    // Solar Emitters (The Prismatic Heliostats)
    this.emitters = [
      {
        pos: new Vector2(160, 140),
        angle: 0.65, // pointing towards center
        power: 100,
        color: CONFIG.PALETTE.BEAM_SOLAR_WHITE,
      },
      {
        pos: new Vector2(1120, 160),
        angle: 2.45,
        power: 100,
        color: CONFIG.PALETTE.BEAM_SOLAR_WHITE,
      },
    ];
  }

  getHexKey(q, r) {
    return `${q},${r}`;
  }

  isHexOccupied(q, r) {
    return this.occupiedHexes.has(this.getHexKey(q, r));
  }

  placeMirror(mirror) {
    const key = this.getHexKey(mirror.hex.q, mirror.hex.r);
    this.occupiedHexes.set(key, mirror);
    this.lumens -= mirror.config.cost;
  }

  removeMirror(q, r) {
    const key = this.getHexKey(q, r);
    const m = this.occupiedHexes.get(key);
    if (m) {
      // Refund 70% lumens
      this.lumens += Math.floor(m.config.cost * 0.7);
      this.occupiedHexes.delete(key);
      return true;
    }
    return false;
  }

  takeCoreDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp <= 0;
  }
}
