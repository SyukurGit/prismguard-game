// Lumencairn: Deterministic Staging & Screenshot Generator
// Pre-configures deterministic states for the 4 competition screenshot views:
// 1. cover (Title & Architectural Portfolio)
// 2. optics (Multi-Bounce Chromatic Beam Battle)
// 3. forge (The Prism Forge & Celestial Codex)
// 4. victory (Debriefing & Rank S Luminary Architect Evaluation)

import { GameState } from './world.js';
import { HexMath } from './math/hex.js';
import { MirrorTower } from './entities/mirrors.js';
import { ShadowEntity } from './entities/shadows.js';
import { CONFIG } from './config.js';

export function stageScreenshot(world, shotName) {
  console.log(`[Staging] Configuring deterministic scene for shot: ${shotName}`);

  world.stats.highScore = 48200;

  switch (shotName) {
    case 'cover':
    case '1-cover':
    case '1-cover.jpg':
    case 'start':
      world.state = GameState.TITLE;
      break;

    case 'optics':
    case '2-optics':
    case '2-optics.jpg':
    case 'play':
    case 'combat':
      world.state = GameState.COMBAT;
      world.currentCycle = 3; // Cycle IV: Gloam Harbingers
      world.cycleTimer = 28;
      world.bastion.hp = 1120;
      world.bastion.lumens = 380;
      world.stats.score = 24650;

      // Deterministic layout of mirrors creating a multi-bounce beam network
      const m1Hex = { q: -2, r: -1 };
      const m1Pos = HexMath.hexToPixel(-2, -1);
      const m1 = new MirrorTower('flat_quartz', m1Hex, m1Pos, Math.PI * 0.35);

      const m2Hex = { q: 1, r: -2 };
      const m2Pos = HexMath.hexToPixel(1, -2);
      const m2 = new MirrorTower('prism_splitter', m2Hex, m2Pos, Math.PI * 0.72);

      const m3Hex = { q: -1, r: 2 };
      const m3Pos = HexMath.hexToPixel(-1, 2);
      const m3 = new MirrorTower('focal_lens', m3Hex, m3Pos, Math.PI * 0.15);

      const m4Hex = { q: 3, r: 1 };
      const m4Pos = HexMath.hexToPixel(3, 1);
      const m4 = new MirrorTower('flat_quartz', m4Hex, m4Pos, Math.PI * 0.58);

      world.bastion.placeMirror(m1);
      world.bastion.placeMirror(m2);
      world.bastion.placeMirror(m3);
      world.bastion.placeMirror(m4);

      // Staged enemies in path of beams
      world.enemies = [
        new ShadowEntity('obsidian_ram', 880, 260, 4),
        new ShadowEntity('phase_wraith', 360, 480, 4),
        new ShadowEntity('gloam_spitter', 980, 450, 4),
        new ShadowEntity('stalker', 320, 220, 4),
        new ShadowEntity('leech', 740, 180, 4),
      ];

      // Re-run ray tracing for staged setup
      const mirrors = Array.from(world.bastion.occupiedHexes.values());
      world.activeRaySegments = world.rayTracer.traceRays(
        world.bastion.emitters,
        mirrors,
        world.enemies,
        0.016
      );

      // Optical FX
      world.particles.emitPhotonSparks(m1Pos.x, m1Pos.y, '#ffffff', 8);
      world.particles.emitPrismHalo(m2Pos.x, m2Pos.y, '#38bdf8', 65);
      world.particles.emitPhotonSparks(880, 260, '#ef4444', 12);
      world.particles.emitShadowEmbers(360, 480, 10);
      world.particles.addFloatingText(880, 220, 'THERMAL BURN 420 DPS', '#ef4444', 16);
      world.particles.addFloatingText(360, 440, 'SAPPHIRE RESONANCE', '#38bdf8', 14);
      break;

    case 'forge':
    case '3-forge':
    case '3-forge.jpg':
    case 'workshop':
      world.state = GameState.FORGE;
      world.currentCycle = 3;
      world.bastion.lumens = 450;
      world.codex.purchasedUpgrades.add('optic_purity');
      world.codex.purchasedUpgrades.add('dispersion_prism');
      world.codex.selectedIndex = 2; // Superheated Focal Caustic
      break;

    case 'victory':
    case '4-victory':
    case '4-victory.jpg':
    case 'end':
      world.state = GameState.VICTORY;
      world.stats.cyclesSurvived = 7;
      world.stats.shadowsDissolved = 218;
      world.stats.photonsDischarged = 284500;
      world.stats.timeElapsed = 412;
      world.stats.score = 56800;
      world.bastion.lumens = 920;
      break;

    default:
      world.state = GameState.TITLE;
  }
}
