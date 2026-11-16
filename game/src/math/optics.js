// Lumencairn: Optical Ray-Tracing Physics Engine
// Computes multi-bounce specular reflections, ray-segment intersections, prism chromatic dispersion, and beam attenuation.

import { CONFIG } from '../config.js';

export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const len = this.length();
    if (len > 0.00001) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }
}

// Line Segment Intersection helper
export function intersectRaySegment(rayOrigin, rayDir, segA, segB) {
  const dx = segB.x - segA.x;
  const dy = segB.y - segA.y;

  const det = rayDir.x * dy - rayDir.y * dx;
  if (Math.abs(det) < 0.0001) return null; // parallel

  const qx = segA.x - rayOrigin.x;
  const qy = segA.y - rayOrigin.y;

  const t = (qx * dy - qy * dx) / det;
  const u = (qx * rayDir.y - qy * rayDir.x) / det;

  if (t > 0.001 && u >= 0 && u <= 1) {
    // Normal vector perpendicular to segment
    const normal = new Vector2(-dy, dx).normalize();
    // Ensure normal points against incident ray
    if (normal.dot(rayDir) > 0) {
      normal.scale(-1);
    }

    return {
      t,
      point: new Vector2(rayOrigin.x + rayDir.x * t, rayOrigin.y + rayDir.y * t),
      normal,
    };
  }
  return null;
}

// Ray-Circle intersection helper for shadow enemies
export function intersectRayCircle(rayOrigin, rayDir, center, radius) {
  const cx = center.x - rayOrigin.x;
  const cy = center.y - rayOrigin.y;

  const proj = cx * rayDir.x + cy * rayDir.y;
  if (proj < 0) return null; // Behind ray origin

  const distSq = cx * cx + cy * cy - proj * proj;
  const radSq = radius * radius;

  if (distSq > radSq) return null; // Miss

  const th = Math.sqrt(radSq - distSq);
  const t = proj - th;

  if (t > 0.001) {
    return {
      t,
      point: new Vector2(rayOrigin.x + rayDir.x * t, rayOrigin.y + rayDir.y * t),
    };
  }
  return null;
}

// Multi-Bounce Ray Tracing Engine
export class RayTracer {
  constructor() {
    this.maxBounces = CONFIG.OPTICS.MAX_BOUNCES;
  }

  traceRays(emitters, mirrors, enemies, dt) {
    const activeSegments = [];
    const queue = [];

    // Initialize ray queue from all solar emitters
    for (const em of emitters) {
      queue.push({
        origin: em.pos.clone(),
        dir: new Vector2(Math.cos(em.angle), Math.sin(em.angle)).normalize(),
        color: em.color || CONFIG.PALETTE.BEAM_SOLAR_WHITE,
        power: em.power || 100,
        bounces: 0,
      });
    }

    while (queue.length > 0 && activeSegments.length < 120) {
      const ray = queue.shift();
      if (ray.bounces >= this.maxBounces || ray.power < 5) continue;

      let nearestHit = null;
      let hitType = null;
      let hitObj = null;

      // 1. Test against all mirror segments
      for (const m of mirrors) {
        const seg = m.getSegment();
        const hit = intersectRaySegment(ray.origin, ray.dir, seg.a, seg.b);
        if (hit && (!nearestHit || hit.t < nearestHit.t)) {
          nearestHit = hit;
          hitType = 'mirror';
          hitObj = m;
        }
      }

      // 2. Test against all shadow enemies
      for (const e of enemies) {
        if (e.isDead) continue;
        const hit = intersectRayCircle(ray.origin, ray.dir, e.pos, e.radius);
        if (hit && (!nearestHit || hit.t < nearestHit.t)) {
          nearestHit = hit;
          hitType = 'enemy';
          hitObj = e;
        }
      }

      // 3. Test canvas bounding box if no obstacle hit
      if (!nearestHit) {
        const boundaryHit = this.intersectCanvasBounds(ray.origin, ray.dir);
        activeSegments.push({
          start: ray.origin.clone(),
          end: boundaryHit,
          color: ray.color,
          power: ray.power,
        });
        continue;
      }

      // Record this line segment
      activeSegments.push({
        start: ray.origin.clone(),
        end: nearestHit.point.clone(),
        color: ray.color,
        power: ray.power,
      });

      // Handle Hit Consequences
      if (hitType === 'enemy') {
        // Continuous beam DPS damage against shadow
        const dps = ray.power * 2.2;
        hitObj.burnWithBeam(dps * dt, ray.color);

        // Beam loses power piercing through shadow
        const remainingPower = ray.power * 0.45;
        if (remainingPower > 15) {
          queue.push({
            origin: nearestHit.point.clone().add(ray.dir.clone().scale(2)),
            dir: ray.dir.clone(),
            color: ray.color,
            power: remainingPower,
            bounces: ray.bounces + 1,
          });
        }
      } else if (hitType === 'mirror') {
        // Specular Reflection
        const mirrorCfg = hitObj.config;
        const reflPower = ray.power * mirrorCfg.reflectivity;

        if (mirrorCfg.isPrism) {
          // Prism dispersion: split into Ruby & Sapphire beams
          const angle = Math.atan2(ray.dir.y, ray.dir.x);
          const dirRuby = new Vector2(Math.cos(angle - 0.26), Math.sin(angle - 0.26)).normalize();
          const dirSapphire = new Vector2(Math.cos(angle + 0.26), Math.sin(angle + 0.26)).normalize();

          queue.push({
            origin: nearestHit.point.clone().add(dirRuby.clone().scale(2)),
            dir: dirRuby,
            color: CONFIG.PALETTE.BEAM_RUBY_RED,
            power: reflPower * 0.55,
            bounces: ray.bounces + 1,
          });

          queue.push({
            origin: nearestHit.point.clone().add(dirSapphire.clone().scale(2)),
            dir: dirSapphire,
            color: CONFIG.PALETTE.BEAM_SAPPHIRE_BLUE,
            power: reflPower * 0.55,
            bounces: ray.bounces + 1,
          });
        } else {
          // Standard Specular Reflection: r = d - 2 * (d . n) * n
          const dDotN = ray.dir.dot(nearestHit.normal);
          const reflDir = ray.dir.clone().sub(nearestHit.normal.clone().scale(2 * dDotN)).normalize();

          queue.push({
            origin: nearestHit.point.clone().add(reflDir.clone().scale(2)),
            dir: reflDir,
            color: mirrorCfg.isLens ? CONFIG.PALETTE.BEAM_AMBER_FUSION : ray.color,
            power: reflPower,
            bounces: ray.bounces + 1,
          });
        }
      }
    }

    return activeSegments;
  }

  intersectCanvasBounds(origin, dir) {
    let minT = Infinity;
    const w = CONFIG.CANVAS_WIDTH;
    const h = CONFIG.CANVAS_HEIGHT;

    if (dir.x > 0) minT = Math.min(minT, (w - origin.x) / dir.x);
    if (dir.x < 0) minT = Math.min(minT, (0 - origin.x) / dir.x);
    if (dir.y > 0) minT = Math.min(minT, (h - origin.y) / dir.y);
    if (dir.y < 0) minT = Math.min(minT, (0 - origin.y) / dir.y);

    return new Vector2(origin.x + dir.x * minT, origin.y + dir.y * minT);
  }
}
