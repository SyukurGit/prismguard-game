// Lumencairn: Hexagonal Grid Geometry & Coordinate Conversions
// Axial coordinate (q, r) mathematical mappings, isometric projections, and hex polygon generators.

import { CONFIG } from '../config.js';
import { Vector2 } from './optics.js';

export class HexMath {
  static hexToPixel(q, r, radius = CONFIG.HEX.RADIUS) {
    const x = CONFIG.HEX.ORIGIN_X + radius * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = CONFIG.HEX.ORIGIN_Y + radius * ((3 / 2) * r);
    return new Vector2(x, y);
  }

  static pixelToHex(x, y, radius = CONFIG.HEX.RADIUS) {
    const px = x - CONFIG.HEX.ORIGIN_X;
    const py = y - CONFIG.HEX.ORIGIN_Y;

    const q = ((Math.sqrt(3) / 3) * px - (1 / 3) * py) / radius;
    const r = ((2 / 3) * py) / radius;

    return this.axialRound(q, r);
  }

  static axialRound(q, r) {
    let s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);

    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    }
    return { q: rq, r: rr };
  }

  static getHexPolygon(center, radius = CONFIG.HEX.RADIUS) {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      points.push(new Vector2(
        center.x + radius * Math.cos(angle),
        center.y + radius * Math.sin(angle)
      ));
    }
    return points;
  }

  static distance(a, b) {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  }
}
