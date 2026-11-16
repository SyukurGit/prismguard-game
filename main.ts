// Lumencairn: The Prismatic Bastion
// Node.js 22 entrypoint for make.fun best-game-01 competition
// Packages static files, 4-shot visual portfolio, and constructs deterministic dossier.json

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

console.log('[Lumencairn] Initiating build process...');
console.log(`[Lumencairn] Root: ${rootDir}`);
console.log(`[Lumencairn] Target: ${outputDir}`);

mkdirSync(outputDir, { recursive: true });

// Copy game client files
const sourceGameDir = join(rootDir, 'game');
const targetGameDir = join(outputDir, 'game');
cpSync(sourceGameDir, targetGameDir, { recursive: true });
console.log('[Lumencairn] Copied game runtime assets.');

// Copy 4-shot visual portfolio
const sourceScreenshotsDir = join(rootDir, 'screenshots');
const targetScreenshotsDir = join(outputDir, 'screenshots');
mkdirSync(targetScreenshotsDir, { recursive: true });

if (existsSync(sourceScreenshotsDir)) {
  cpSync(sourceScreenshotsDir, targetScreenshotsDir, { recursive: true });
  console.log('[Lumencairn] Copied screenshot portfolio.');
} else {
  console.warn('[Lumencairn] Screenshots directory not found.');
}

// Generate dossier
const dossierData = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

const targetDossierPath = join(outputDir, 'dossier.json');
writeFileSync(targetDossierPath, dossierData);
console.log(`[Lumencairn] Dossier written (${dossierData.length} bytes).`);
console.log('[Lumencairn] Build complete.');
