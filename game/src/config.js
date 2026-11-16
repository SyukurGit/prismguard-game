// Lumencairn: Game Configuration & Optics Balancing Constants
// Establishes chromatic wavelengths, hex geometry, mirror archetypes, and 7-cycle eclipse progression.

export const CONFIG = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  TARGET_FPS: 60,
  FIXED_STEP: 1 / 60,

  HEX: {
    RADIUS: 38,
    COLUMNS: 17,
    ROWS: 10,
    ORIGIN_X: 120,
    ORIGIN_Y: 85,
  },

  PALETTE: {
    BG_SPACE: '#030712',
    GRID_HEX: 'rgba(30, 41, 59, 0.45)',
    GRID_ACTIVE: 'rgba(56, 189, 248, 0.25)',
    QUARTZ_BRIGHT: '#f8fafc',
    GOLD_ACCENT: '#fbbf24',
    OBSIDIAN_DARK: '#0f172a',

    // Chromatic Spectrum Wavelengths
    BEAM_SOLAR_WHITE: '#ffffff',
    BEAM_RUBY_RED: '#ef4444',
    BEAM_EMERALD_GREEN: '#10b981',
    BEAM_SAPPHIRE_BLUE: '#38bdf8',
    BEAM_AMBER_FUSION: '#f59e0b',
    BEAM_AMETHYST_VOID: '#a855f7',

    SHADOW_PURPLE: '#6b21a8',
    SHADOW_CRIMSON: '#991b1b',
  },

  OPTICS: {
    MAX_BOUNCES: 12,
    RAY_SPEED: 1800,
    SOLAR_EMISSION_RATE: 120, // base photon flux per second
    BEAM_WIDTH: 3.5,
  },

  BASTION: {
    INITIAL_HP: 1200,
    MAX_HP: 1200,
    SOLAR_CAPACITY: 500,
    SOLAR_START: 150,
  },

  MIRRORS: {
    FLAT_QUARTZ: {
      id: 'flat_quartz',
      name: 'Quartz Speculum',
      desc: 'Precision silvered mirror. Deflects incoming beams with 95% photon retention.',
      cost: 50,
      durability: 100,
      reflectivity: 0.95,
      color: '#f8fafc',
    },
    PRISM_SPLITTER: {
      id: 'prism_splitter',
      name: 'Refractive Quartz Prism',
      desc: 'Splits incident white solar beams into dispersed Ruby & Sapphire chromatic rays.',
      cost: 95,
      durability: 80,
      reflectivity: 0.88,
      isPrism: true,
      color: '#38bdf8',
    },
    FOCAL_LENS: {
      id: 'focal_lens',
      name: 'Hyperbolic Concentrator',
      desc: 'Condenses light into an intense thermal pin-point, amplifying damage by 240%.',
      cost: 120,
      durability: 90,
      reflectivity: 1.15,
      isLens: true,
      color: '#f59e0b',
    },
    RESONANT_PYLON: {
      id: 'resonant_pylon',
      name: 'Harmonic Pylon Battery',
      desc: 'Absorbs crossing light rays to project a protective kinetic nullification field.',
      cost: 150,
      durability: 160,
      reflectivity: 0.70,
      isPylon: true,
      color: '#10b981',
    },
  },

  WAVES: [
    {
      cycle: 1,
      title: 'Cycle I: The Penumbra Vanguard',
      duration: 35,
      enemyCount: 20,
      types: ['stalker', 'mite'],
      rewardLumens: 140,
      flavor: 'First twilight falls as crawling shadow-stalkers probe the perimeter.'
    },
    {
      cycle: 2,
      title: 'Cycle II: Creeping Umbra',
      duration: 42,
      enemyCount: 28,
      types: ['stalker', 'mite', 'leech'],
      rewardLumens: 190,
      flavor: 'Light-devouring leeches emerge to siphon unguided solar conduits.'
    },
    {
      cycle: 3,
      title: 'Cycle III: Obsidian Siege Rams',
      duration: 48,
      enemyCount: 36,
      types: ['mite', 'leech', 'obsidian_ram'],
      rewardLumens: 250,
      flavor: 'Heavily faceted obsidian rams advance, reflecting scattered dark radiation.'
    },
    {
      cycle: 4,
      title: 'Cycle IV: Gloam Harbingers',
      duration: 54,
      enemyCount: 44,
      types: ['leech', 'obsidian_ram', 'gloam_spitter'],
      rewardLumens: 320,
      flavor: 'Long-range artillery spitters lob corrosive shadow-caustics.'
    },
    {
      cycle: 5,
      title: 'Cycle V: Spectral Eclipse Influx',
      duration: 60,
      enemyCount: 52,
      types: ['stalker', 'obsidian_ram', 'gloam_spitter', 'phase_wraith'],
      rewardLumens: 400,
      flavor: 'Phase wraiths phase through physical barbs, vulnerable only to refracted sapphire beams.'
    },
    {
      cycle: 6,
      title: 'Cycle VI: The Total Occlusion',
      duration: 66,
      enemyCount: 64,
      types: ['leech', 'gloam_spitter', 'phase_wraith', 'abyssal_goliath'],
      rewardLumens: 480,
      flavor: 'Darkness blankets the Solarium; only disciplined optical chains survive.'
    },
    {
      cycle: 7,
      title: 'Cycle VII: The Umbral Leviathan',
      duration: 85,
      enemyCount: 75,
      types: ['phase_wraith', 'abyssal_goliath', 'umbral_leviathan'],
      rewardLumens: 650,
      flavor: 'The ancient sovereign of darkness rises to engulf the Solarium crystal core.'
    }
  ],

  UPGRADES: [
    {
      id: 'optic_purity',
      tree: 'reflection',
      name: 'Vitreous Silica Polishing',
      desc: '+15% Mirror reflectivity and +2 maximum ray bounce depth.',
      cost: 110,
    },
    {
      id: 'dispersion_prism',
      tree: 'dispersion',
      name: 'Tri-Chromatic Dispersion Grating',
      desc: 'Prisms split incoming rays into 3 separate beams: Red, Green, and Blue.',
      cost: 160,
    },
    {
      id: 'focal_overdrive',
      tree: 'thermal',
      name: 'Superheated Focal Caustic',
      desc: 'Focused beams cause enemy armor to ignite in secondary thermal shockwaves.',
      cost: 180,
    },
    {
      id: 'solar_capacitor',
      tree: 'bastion',
      name: 'Resonant Crystal Capacitor',
      desc: '+350 Bastion Core HP and +50% Solar Energy storage capacity.',
      cost: 150,
    },
  ],
};
