// Lumencairn: Main Client Entrypoint & 60 FPS Fixed-Step Engine
// Manages real-time animation loop, deterministic screenshot staging hooks, and responsive viewport sizing.

import { CONFIG } from './config.js';
import { InputManager } from './input.js';
import { World } from './world.js';
import { Renderer } from './render.js';
import { stageScreenshot } from './shots.js';
import { audio } from './audio.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('viewport');
  if (!canvas) {
    console.error('[Lumencairn] Canvas #viewport not found.');
    return;
  }

  const input = new InputManager(canvas);
  const world = new World();
  const renderer = new Renderer(canvas);

  // Audio unlock listener
  const unlockAudio = () => {
    audio.ensureContext();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // Check URL query parameters for automated screenshot staging (?shot=<name>)
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');

  if (shot) {
    console.log(`[Lumencairn] Screenshot mode active: shot=${shot}`);
    stageScreenshot(world, shot);

    renderer.render(world, input);

    window.__shotReady = true;
    window.__renderShot = () => renderer.render(world, input);

    window.addEventListener('resize', () => {
      renderer.render(world, input);
    });
    return;
  }

  // 60 FPS Fixed-Step Simulation Loop
  let lastTime = performance.now();
  let accumulator = 0;

  function loop(currentTime) {
    const elapsed = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    accumulator += elapsed;

    while (accumulator >= CONFIG.FIXED_STEP) {
      world.update(CONFIG.FIXED_STEP, input);
      accumulator -= CONFIG.FIXED_STEP;
    }

    renderer.render(world, input);
    input.flush();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});
