// Lumencairn: Optical FX & Caustic Particle Simulator
// Simulates photon sparks, chromatic caustics, vaporizing shadow embers, and floating tactical feedback.

export class ParticleEngine {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.caustics = [];
    this.shakeIntensity = 0;
    this.shakeX = 0;
    this.shakeY = 0;
  }

  emitPhotonSparks(x, y, color = '#f8fafc', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 220;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2.0,
        color,
        alpha: 1.0,
        decay: 2.2 + Math.random() * 1.8,
      });
    }
  }

  emitShadowEmbers(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        type: 'ember',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color: '#a855f7',
        alpha: 0.9,
        decay: 1.4,
      });
    }
  }

  emitPrismHalo(x, y, color = '#38bdf8', maxRadius = 90) {
    this.caustics.push({
      x,
      y,
      radius: 6,
      maxRadius,
      growthRate: 260,
      alpha: 0.85,
      color,
    });
  }

  addFloatingText(x, y, text, color = '#f8fafc', size = 15) {
    this.floatingTexts.push({
      x,
      y,
      vy: -50,
      text,
      color,
      size,
      alpha: 1.0,
      decay: 1.5,
    });
  }

  triggerShake(intensity = 6) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  update(dt) {
    // Screen shake decay
    if (this.shakeIntensity > 0.1) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= Math.pow(0.88, dt * 60);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;

      if (p.type === 'ember') {
        p.vy -= 40 * dt; // float upwards
      }

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Caustics & Halos
    for (let i = this.caustics.length - 1; i >= 0; i--) {
      const c = this.caustics[i];
      c.radius += c.growthRate * dt;
      c.alpha = 1.0 - (c.radius / c.maxRadius);
      if (c.radius >= c.maxRadius || c.alpha <= 0) {
        this.caustics.splice(i, 1);
      }
    }

    // Floating text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= ft.decay * dt;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    // Caustic Halos
    for (const c of this.caustics) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, c.alpha);
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Floating Texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold ${ft.size}px -apple-system, sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }
}
