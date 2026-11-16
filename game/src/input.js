// Lumencairn: Tactical Input Controller
// Manages hex tile selection, precision mirror rotation, optical tool switching, and viewport mapping.

import { HexMath } from './math/hex.js';

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.justPressedKeys = new Set();

    this.mouse = {
      x: 640,
      y: 360,
      down: false,
      rightDown: false,
      justClicked: false,
      justRightClicked: false,
      hex: { q: 0, r: 0 },
    };

    this.selectedTool = 'flat_quartz'; // default mirror
    this.placementAngle = 0; // mirror placement angle in radians

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (!this.keys.has(code)) {
        this.justPressedKeys.add(code);
      }
      this.keys.add(code);

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
        e.preventDefault();
      }

      // Rotate placement angle (R or Q/E)
      if (code === 'KeyR' || code === 'KeyE') {
        this.placementAngle += Math.PI / 12; // 15 degrees step
      } else if (code === 'KeyQ') {
        this.placementAngle -= Math.PI / 12;
      }

      // Tool selection hotkeys
      if (code === 'Digit1') this.selectedTool = 'flat_quartz';
      if (code === 'Digit2') this.selectedTool = 'prism_splitter';
      if (code === 'Digit3') this.selectedTool = 'focal_lens';
      if (code === 'Digit4') this.selectedTool = 'resonant_pylon';
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;

      // Map to hex coordinate
      this.mouse.hex = HexMath.pixelToHex(this.mouse.x, this.mouse.y);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.down = true;
        this.mouse.justClicked = true;
      } else if (e.button === 2) {
        this.mouse.rightDown = true;
        this.mouse.justRightClicked = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.down = false;
      if (e.button === 2) this.mouse.rightDown = false;
    });

    // Scroll wheel rotates placement angle smoothly
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      this.placementAngle += delta * (Math.PI / 24);
    }, { passive: false });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isDown(code) {
    return this.keys.has(code);
  }

  justPressed(code) {
    return this.justPressedKeys.has(code);
  }

  flush() {
    this.justPressedKeys.clear();
    this.mouse.justClicked = false;
    this.mouse.justRightClicked = false;
  }
}
