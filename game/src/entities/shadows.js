// Lumencairn: Shadow Entities (The Umbral Eclipse Incursion)
// Procedurally spawned void stalkers, light-devouring leeches, obsidian siege rams, and the Umbral Leviathan boss.

import { Vector2 } from '../math/optics.js';
import { audio } from '../audio.js';

export class ShadowEntity {
  constructor(type, x, y, cycleNumber = 1) {
    this.type = type;
    this.pos = new Vector2(x, y);
    this.vel = new Vector2(0, 0);
    this.angle = 0;
    this.cycle = cycleNumber;
    this.isDead = false;

    this.configureArchetype();
  }

  configureArchetype() {
    switch (this.type) {
      case 'mite':
        this.radius = 12;
        this.maxHp = 35 + this.cycle * 10;
        this.speed = 120 + Math.random() * 30;
        this.damage = 12;
        this.lumensValue = 5;
        this.color = '#7e22ce';
        break;

      case 'stalker':
        this.radius = 16;
        this.maxHp = 65 + this.cycle * 15;
        this.speed = 95;
        this.damage = 20;
        this.lumensValue = 10;
        this.color = '#581c87';
        break;

      case 'leech':
        this.radius = 19;
        this.maxHp = 110 + this.cycle * 22;
        this.speed = 70;
        this.damage = 28;
        this.lumensValue = 18;
        this.color = '#4c1d95';
        this.isLeech = true;
        break;

      case 'obsidian_ram':
        this.radius = 26;
        this.maxHp = 280 + this.cycle * 45;
        this.speed = 55;
        this.damage = 60;
        this.lumensValue = 35;
        this.color = '#3b0764';
        this.armor = 25; // mitigated without thermal ruby beam
        break;

      case 'gloam_spitter':
        this.radius = 22;
        this.maxHp = 160 + this.cycle * 30;
        this.speed = 50;
        this.damage = 32;
        this.lumensValue = 28;
        this.color = '#831843';
        this.hasRanged = true;
        this.shootTimer = 2.5;
        break;

      case 'phase_wraith':
        this.radius = 20;
        this.maxHp = 210 + this.cycle * 35;
        this.speed = 85;
        this.damage = 40;
        this.lumensValue = 45;
        this.color = '#1e1b4b';
        this.phaseTimer = 0;
        break;

      case 'abyssal_goliath':
        this.radius = 36;
        this.maxHp = 580 + this.cycle * 90;
        this.speed = 40;
        this.damage = 80;
        this.lumensValue = 85;
        this.color = '#18181b';
        break;

      case 'umbral_leviathan':
        this.radius = 62;
        this.maxHp = 3600;
        this.speed = 32;
        this.damage = 140;
        this.lumensValue = 500;
        this.color = '#09090b';
        this.isBoss = true;
        this.bossShieldAngle = 0;
        this.attackTimer = 3.0;
        break;

      default:
        this.radius = 16;
        this.maxHp = 60;
        this.speed = 80;
        this.damage = 20;
        this.lumensValue = 10;
        this.color = '#4c1d95';
    }
    this.hp = this.maxHp;
  }

  update(dt, targetPos, spawnDarkOrdnance, particles) {
    if (this.isDead) return;

    const dx = targetPos.x - this.pos.x;
    const dy = targetPos.y - this.pos.y;
    const dist = Math.hypot(dx, dy);

    this.angle = Math.atan2(dy, dx);

    if (dist > 15) {
      this.vel.set((dx / dist) * this.speed, (dy / dist) * this.speed);
    } else {
      this.vel.set(0, 0);
    }

    this.pos.add(this.vel.clone().scale(dt));

    // Boss Mechanics
    if (this.isBoss) {
      this.bossShieldAngle += dt * 1.6;
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.attackTimer = 3.5;
        // Radial darkness wave
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          spawnDarkOrdnance({
            pos: this.pos.clone().add(new Vector2(Math.cos(a) * 50, Math.sin(a) * 50)),
            vel: new Vector2(Math.cos(a) * 180, Math.sin(a) * 180),
            damage: 40,
            radius: 6,
            color: '#a855f7',
          });
        }
        particles.emitPrismHalo(this.pos.x, this.pos.y, '#9333ea', 160);
      }
    }
  }

  burnWithBeam(damageAmount, beamColor) {
    let effectiveDamage = damageAmount;

    // Chromatic vulnerability mechanics
    if (this.type === 'obsidian_ram' && beamColor === '#ef4444') {
      effectiveDamage *= 2.5; // Ruby thermal beam shatters obsidian
    } else if (this.type === 'phase_wraith' && beamColor === '#38bdf8') {
      effectiveDamage *= 2.8; // Sapphire beam crystallizes phase wraith
    }

    this.hp -= effectiveDamage;

    if (this.hp <= 0 && !this.isDead) {
      this.isDead = true;
      audio.playShadowVaporize();
    }
  }
}
