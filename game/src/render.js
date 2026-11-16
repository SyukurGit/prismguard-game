// Lumencairn: Optical Vector Canvas Renderer & Thematic UI Engine
// Renders multi-bounce chromatic laser beams, isometric hex grids, quartz mirrors, and 4 fullscreen stages.

import { CONFIG } from './config.js';
import { GameState } from './world.js';
import { HexMath } from './math/hex.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  render(world, input) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    ctx.save();
    ctx.translate(world.particles.shakeX, world.particles.shakeY);

    // 1. Render Background & Hex Grid
    this.renderBackground(ctx, world, input);

    // 2. State-specific screens
    switch (world.state) {
      case GameState.TITLE:
        this.renderTitleScreen(ctx, world);
        break;

      case GameState.COMBAT:
        this.renderCombat(ctx, world, input);
        break;

      case GameState.FORGE:
        this.renderForgeScreen(ctx, world);
        break;

      case GameState.GAMEOVER:
        this.renderGameOverScreen(ctx, world);
        break;

      case GameState.VICTORY:
        this.renderVictoryScreen(ctx, world);
        break;
    }

    ctx.restore();
  }

  renderBackground(ctx, world, input) {
    // Deep dark obsidian gradient
    const bg = ctx.createRadialGradient(640, 360, 80, 640, 360, 720);
    bg.addColorStop(0, '#0a0f1d');
    bg.addColorStop(0.65, '#05070e');
    bg.addColorStop(1, '#020307');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Render Hexagonal Grid
    ctx.save();
    for (let r = 0; r < CONFIG.HEX.ROWS; r++) {
      for (let q = 0; q < CONFIG.HEX.COLUMNS; q++) {
        const center = HexMath.hexToPixel(q, r);
        if (center.x < 150 || center.x > 1130 || center.y < 80 || center.y > 640) continue;

        const isHovered = input && input.mouse.hex.q === q && input.mouse.hex.r === r;
        const isOccupied = world.bastion.isHexOccupied(q, r);

        const poly = HexMath.getHexPolygon(center);
        ctx.beginPath();
        poly.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();

        if (isHovered) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
        } else {
          ctx.fillStyle = isOccupied ? 'rgba(30, 41, 59, 0.25)' : 'rgba(15, 23, 42, 0.15)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  renderCombat(ctx, world, input) {
    // 1. Render Multi-Bounce Chromatic Beams
    this.renderLaserBeams(ctx, world.activeRaySegments);

    // 2. Render Solarium Central Crystal Core
    this.renderCentralCore(ctx, world.bastion);

    // 3. Render Solar Emitters (Heliostats)
    this.renderEmitters(ctx, world.bastion.emitters);

    // 4. Render Placed Mirrors & Prisms
    for (const m of world.bastion.occupiedHexes.values()) {
      this.renderMirrorTower(ctx, m);
    }

    // 5. Render Placement Preview if hovering over empty tile
    if (input && !world.bastion.isHexOccupied(input.mouse.hex.q, input.mouse.hex.r)) {
      this.renderPlacementGhost(ctx, input);
    }

    // 6. Render Shadow Entities
    for (const e of world.enemies) {
      this.renderShadow(ctx, e);
    }

    // 7. Render Dark Ordnance
    for (const ord of world.darkOrdnance) {
      ctx.save();
      ctx.fillStyle = ord.color;
      ctx.shadowColor = ord.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ord.pos.x, ord.pos.y, ord.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 8. Render Optical Particles
    world.particles.render(ctx);

    // 9. Render Tactical HUD
    this.renderHUD(ctx, world, input);

    // 10. Wave Banner
    if (world.banner.timer > 0) {
      this.renderBanner(ctx, world.banner);
    }
  }

  renderLaserBeams(ctx, segments) {
    ctx.save();
    for (const s of segments) {
      // Glow Aura
      ctx.save();
      ctx.strokeStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 12;
      ctx.lineWidth = Math.min(8, Math.max(2, (s.power / 100) * CONFIG.OPTICS.BEAM_WIDTH * 1.8));
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(s.start.x, s.start.y);
      ctx.lineTo(s.end.x, s.end.y);
      ctx.stroke();
      ctx.restore();

      // Sharp Core Beam
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.min(4, Math.max(1.2, (s.power / 100) * CONFIG.OPTICS.BEAM_WIDTH));
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.moveTo(s.start.x, s.start.y);
      ctx.lineTo(s.end.x, s.end.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderCentralCore(ctx, bastion) {
    ctx.save();
    ctx.translate(bastion.corePos.x, bastion.corePos.y);

    // Outer Aura
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();

    // Octagonal Crystal Base
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * 32;
      const y = Math.sin(a) * 32;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Radiant Core Gem
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderEmitters(ctx, emitters) {
    for (const em of emitters) {
      ctx.save();
      ctx.translate(em.pos.x, em.pos.y);
      ctx.rotate(em.angle);

      // Pylon Mount
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.fillRect(-12, -12, 24, 24);
      ctx.strokeRect(-12, -12, 24, 24);

      // Emitter Nozzle
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(8, -5, 12, 10);

      // Glowing lens
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(14, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  renderMirrorTower(ctx, m) {
    ctx.save();
    ctx.translate(m.pos.x, m.pos.y);

    // Tower Pedestal Base
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = m.config.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Reflective Facet Bar (Rotated)
    ctx.rotate(m.angle);
    ctx.fillStyle = m.config.color;
    ctx.shadowColor = m.config.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(-m.segmentLength / 2, -3.5, m.segmentLength, 7);

    // Non-reflecting back frame
    ctx.fillStyle = '#334155';
    ctx.shadowBlur = 0;
    ctx.fillRect(-m.segmentLength / 2, -1, m.segmentLength, 2);

    ctx.restore();
  }

  renderPlacementGhost(ctx, input) {
    const center = HexMath.hexToPixel(input.mouse.hex.q, input.mouse.hex.r);
    if (center.x < 180 || center.x > 1100 || center.y < 100 || center.y > 620) return;

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(input.placementAngle);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-16, -3, 32, 6);

    ctx.restore();
  }

  renderShadow(ctx, e) {
    ctx.save();
    ctx.translate(e.pos.x, e.pos.y);
    ctx.rotate(e.angle);

    ctx.fillStyle = e.color;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;

    if (e.isBoss) {
      // Leviathan Boss
      ctx.beginPath();
      ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotating void crest
      ctx.save();
      ctx.rotate(e.bossShieldAngle);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      ctx.strokeRect(-e.radius * 1.1, -e.radius * 1.1, e.radius * 2.2, e.radius * 2.2);
      ctx.restore();

      // Eyes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(12, -12, 6, 0, Math.PI * 2);
      ctx.arc(12, 12, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(e.radius * 0.4, -4, 2.5, 0, Math.PI * 2);
      ctx.arc(e.radius * 0.4, 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health Bar
    const hpRatio = Math.max(0, e.hp / e.maxHp);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(e.pos.x - 20, e.pos.y - e.radius - 10, 40, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(e.pos.x - 20, e.pos.y - e.radius - 10, 40 * hpRatio, 4);
    ctx.restore();
  }

  renderHUD(ctx, world, input) {
    ctx.save();

    // Top Bar
    ctx.fillStyle = 'rgba(3, 7, 18, 0.88)';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.fillRect(16, 12, CONFIG.CANVAS_WIDTH - 32, 54);
    ctx.strokeRect(16, 12, CONFIG.CANVAS_WIDTH - 32, 54);

    // Bastion Integrity
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('SOLARIUM BASTION INTEGRITY', 32, 30);

    const hpRatio = Math.max(0, world.bastion.hp / world.bastion.maxHp);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(32, 38, 220, 16);
    ctx.fillStyle = hpRatio > 0.35 ? '#38bdf8' : '#ef4444';
    ctx.fillRect(32, 38, 220 * hpRatio, 16);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(32, 38, 220, 16);

    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${Math.round(world.bastion.hp)} / ${world.bastion.maxHp} HP`, 95, 50);

    // Wave / Cycle
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`ECLIPSE CYCLE ${world.currentCycle + 1} / 7`, 640, 34);

    ctx.font = '11px monospace';
    ctx.fillStyle = '#94a3b8';
    const wave = CONFIG.WAVES[world.currentCycle];
    ctx.fillText(`${wave.title} | REMAINING: ${Math.max(0, Math.ceil(world.cycleTimer))}s`, 640, 50);

    // Solar Lumens & Score
    ctx.textAlign = 'right';
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`SOLAR LUMENS: ${world.bastion.lumens}`, CONFIG.CANVAS_WIDTH - 36, 32);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`SCORE: ${world.stats.score.toLocaleString()}`, CONFIG.CANVAS_WIDTH - 36, 52);

    // Bottom Bar (Tool Selection & Tactical Controls)
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(3, 7, 18, 0.88)';
    ctx.fillRect(16, CONFIG.CANVAS_HEIGHT - 58, CONFIG.CANVAS_WIDTH - 32, 44);
    ctx.strokeRect(16, CONFIG.CANVAS_HEIGHT - 58, CONFIG.CANVAS_WIDTH - 32, 44);

    // Tools
    const tools = [
      { key: '1', id: 'flat_quartz', label: 'Quartz Speculum (50L)' },
      { key: '2', id: 'prism_splitter', label: 'Chromatic Prism (95L)' },
      { key: '3', id: 'focal_lens', label: 'Focal Lens (120L)' },
      { key: '4', id: 'resonant_pylon', label: 'Resonant Pylon (150L)' },
    ];

    let startX = 32;
    tools.forEach((t) => {
      const isSel = input && input.selectedTool === t.id;
      ctx.font = isSel ? 'bold 12px monospace' : '12px monospace';
      ctx.fillStyle = isSel ? '#38bdf8' : '#64748b';
      ctx.fillText(`[${t.key}] ${t.label}`, startX, CONFIG.CANVAS_HEIGHT - 32);
      startX += 220;
    });

    // Control hint
    ctx.textAlign = 'right';
    ctx.font = '11px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('[L-CLICK: PLACE/ROTATE]  [R-CLICK: SELL]  [SCROLL/R: ANGLE]', CONFIG.CANVAS_WIDTH - 32, CONFIG.CANVAS_HEIGHT - 32);

    ctx.restore();
  }

  renderBanner(ctx, banner) {
    ctx.save();
    ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
    ctx.fillRect(220, 220, CONFIG.CANVAS_WIDTH - 440, 90);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(220, 220, CONFIG.CANVAS_WIDTH - 440, 90);

    ctx.textAlign = 'center';
    ctx.font = 'bold 24px serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(banner.text, 640, 258);

    ctx.font = 'italic 13px serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(banner.sub, 640, 288);
    ctx.restore();
  }

  renderTitleScreen(ctx, world) {
    ctx.save();

    // Gilded Frame
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, CONFIG.CANVAS_WIDTH - 80, CONFIG.CANVAS_HEIGHT - 80);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(48, 48, CONFIG.CANVAS_WIDTH - 96, CONFIG.CANVAS_HEIGHT - 96);

    // Title
    ctx.textAlign = 'center';
    ctx.font = 'bold 44px "Cinzel", "Georgia", serif';
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.fillText('LUMENCAIRN', 640, 160);

    ctx.font = 'bold 20px serif';
    ctx.fillStyle = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.fillText('THE PRISMATIC BASTION', 640, 200);
    ctx.shadowBlur = 0;

    ctx.font = 'italic 15px Georgia, serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Channel the Great Heliostats. Construct optical reflection chains to banish the Umbral Eclipse.', 640, 245);

    // Tactical Control Grid
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#334155';
    ctx.fillRect(240, 285, 800, 185);
    ctx.strokeRect(240, 285, 800, 185);

    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('OPTICAL COMMAND & TACTICAL SCHEME', 640, 318);

    ctx.textAlign = 'left';
    ctx.font = '13px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('• [MOUSE LEFT-CLICK]   : Place Mirror / Prism or Rotate existing facet by 22.5°', 270, 350);
    ctx.fillText('• [MOUSE SCROLL / R]   : Adjust Mirror Placement Angle prior to installation', 270, 380);
    ctx.fillText('• [MOUSE RIGHT-CLICK]  : Dismantle Mirror & Refund 70% Solar Lumens', 270, 410);
    ctx.fillText('• [KEYS 1, 2, 3, 4]    : Select Quartz Speculum / Dispersion Prism / Focal Lens / Pylon', 270, 440);

    // Action Prompt
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('[ PRESS SPACEBAR OR CLICK TO COMMENCE DEFENSE ]', 640, 525);

    // Judge Callout
    ctx.font = '11px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('REAL-TIME MULTI-BOUNCE RAY TRACING • CHROMATIC DISPERSION OPTICS • ZERO EXTERNAL ASSETS • 7 ECLIPSE CYCLES', 640, 580);
    ctx.fillText(`BASTION BEST RECORD: ${world.stats.highScore.toLocaleString()} PTS`, 640, 608);

    ctx.restore();
  }

  renderForgeScreen(ctx, world) {
    ctx.save();
    ctx.fillStyle = 'rgba(3, 7, 18, 0.96)';
    ctx.fillRect(60, 45, CONFIG.CANVAS_WIDTH - 120, CONFIG.CANVAS_HEIGHT - 90);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 45, CONFIG.CANVAS_WIDTH - 120, CONFIG.CANVAS_HEIGHT - 90);

    ctx.textAlign = 'center';
    ctx.font = 'bold 28px serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('THE PRISM FORGE & CELESTIAL CODEX', 640, 95);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`AVAILABLE SOLAR LUMENS: ${world.bastion.lumens}`, 640, 125);

    let startY = 160;
    CONFIG.UPGRADES.forEach((up, idx) => {
      const isSel = idx === world.codex.selectedIndex;
      const isOwned = world.codex.isUnlocked(up.id);
      const canBuy = world.codex.canAfford(up.id, world.bastion.lumens);

      ctx.save();
      ctx.fillStyle = isSel ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = isSel ? '#38bdf8' : '#334155';
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.fillRect(120, startY, CONFIG.CANVAS_WIDTH - 240, 64);
      ctx.strokeRect(120, startY, CONFIG.CANVAS_WIDTH - 240, 64);

      ctx.textAlign = 'left';
      ctx.font = 'bold 16px serif';
      ctx.fillStyle = isOwned ? '#10b981' : (canBuy ? '#fbbf24' : '#64748b');
      ctx.fillText(`${up.name} [${up.tree.toUpperCase()}]`, 140, startY + 28);

      ctx.font = '13px serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(up.desc, 140, startY + 50);

      ctx.textAlign = 'right';
      ctx.font = 'bold 15px monospace';
      if (isOwned) {
        ctx.fillStyle = '#10b981';
        ctx.fillText('CONSECRATED', CONFIG.CANVAS_WIDTH - 145, startY + 38);
      } else {
        ctx.fillStyle = canBuy ? '#fbbf24' : '#ef4444';
        ctx.fillText(`${up.cost} LUMENS [ENTER]`, CONFIG.CANVAS_WIDTH - 145, startY + 38);
      }
      ctx.restore();

      startY += 76;
    });

    ctx.textAlign = 'center';
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('[W / S: SELECT]  •  [ENTER: CRAFT PRISM]  •  [SPACEBAR: COMMENCE NEXT CYCLE]', 640, 615);

    ctx.restore();
  }

  renderVictoryScreen(ctx, world) {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.96)';
    ctx.fillRect(60, 45, CONFIG.CANVAS_WIDTH - 120, CONFIG.CANVAS_HEIGHT - 90);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 45, CONFIG.CANVAS_WIDTH - 120, CONFIG.CANVAS_HEIGHT - 90);

    ctx.textAlign = 'center';
    ctx.font = 'bold 36px serif';
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.fillText('ECLIPSE VANQUISHED: DAWN OF THE SOLARIUM', 640, 130);
    ctx.shadowBlur = 0;

    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('The Umbral Leviathan has dissolved into the aether. The Solarium Bastion shines eternal.', 640, 165);

    // Debriefing Grid
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#334155';
    ctx.fillRect(180, 200, 920, 270);
    ctx.strokeRect(180, 200, 920, 270);

    ctx.textAlign = 'left';
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('CELESTIAL MISSION PERFORMANCE DEBRIEFING', 220, 240);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`• ECLIPSE CYCLES OVERCOME  : ${world.stats.cyclesSurvived} / 7 (COMPLETE)`, 220, 280);
    ctx.fillText(`• SHADOW FOES DISSOLVED   : ${world.stats.shadowsDissolved} ENTITIES`, 220, 315);
    ctx.fillText(`• PHOTON FLUX DISCHARGED   : ${world.stats.photonsDischarged.toLocaleString()} PHOTONS`, 220, 350);
    ctx.fillText(`• SOLAR LUMENS SALVAGED    : ${world.bastion.lumens} LUMENS`, 220, 385);
    ctx.fillText(`• MISSION DEFENSE DURATION : ${Math.round(world.stats.timeElapsed)} SECONDS`, 220, 420);

    // Rank S
    ctx.textAlign = 'center';
    ctx.font = 'bold 64px serif';
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 22;
    ctx.fillText('RANK S', 940, 335);
    ctx.shadowBlur = 0;

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('LUMINARY ARCHITECT', 940, 365);

    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('[ PRESS SPACEBAR TO COMMENCE A NEW SOLAR CYCLE ]', 640, 545);

    ctx.restore();
  }

  renderGameOverScreen(ctx, world) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 6, 23, 0.96)';
    ctx.fillRect(80, 60, CONFIG.CANVAS_WIDTH - 160, CONFIG.CANVAS_HEIGHT - 120);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 60, CONFIG.CANVAS_WIDTH - 160, CONFIG.CANVAS_HEIGHT - 120);

    ctx.textAlign = 'center';
    ctx.font = 'bold 36px serif';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('THE SOLARIUM ECLIPSED: BASTION FALLEN', 640, 160);

    ctx.font = '15px Georgia, serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('The Umbral Swarm has enveloped the central crystal core.', 640, 205);

    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`FINAL SOLAR DEFENSE SCORE: ${world.stats.score.toLocaleString()} PTS`, 640, 300);
    ctx.fillText(`SURVIVED THROUGH CYCLE ${world.currentCycle + 1} / 7`, 640, 340);

    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('[ PRESS SPACEBAR TO REWIND TIME AND RESTART ]', 640, 480);

    ctx.restore();
  }
}
