// Lumencairn: Optical Mirror & Crystal Tower Entities
// Implements Quartz Speculums, Prismatic Beam Splitters, Hyperbolic Concentrators, and Resonant Pylons.

import { Vector2 } from '../math/optics.js';
import { CONFIG } from '../config.js';

export class MirrorTower {
  constructor(type, hexCoord, pixelPos, angle = 0) {
    this.type = type;
    this.hex = hexCoord; // { q, r }
    this.pos = pixelPos.clone();
    this.angle = angle; // radians

    this.config = CONFIG.MIRRORS[type] || CONFIG.MIRRORS.FLAT_QUARTZ;
    this.durability = this.config.durability;
    this.maxDurability = this.durability;

    this.segmentLength = 32;
    this.storedEnergy = 0;
  }

  getSegment() {
    // Calculates the reflecting facet surface segment
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    const halfLen = this.segmentLength / 2;

    const ax = this.pos.x - cos * halfLen;
    const ay = this.pos.y - sin * halfLen;
    const bx = this.pos.x + cos * halfLen;
    const by = this.pos.y + sin * halfLen;

    return {
      a: new Vector2(ax, ay),
      b: new Vector2(bx, by),
    };
  }

  rotate(deltaRadians) {
    this.angle += deltaRadians;
  }

  takeDamage(amount) {
    this.durability -= amount;
    return this.durability <= 0;
  }
}
