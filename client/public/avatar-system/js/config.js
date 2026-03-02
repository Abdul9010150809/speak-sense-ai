export const ROLE_TO_MODEL = {
  hr: "../models/hr.glb",
  technical: "../models/tech.glb",
  "system-design": "../models/architect.glb",
  behavioral: "../models/behavioral.glb",
};

export const ROLE_FRAMING = {
  hr: {
    targetHeight: 1.8,
    modelScaleMultiplier: 1,
    offset: { x: 0, y: 0, z: 0 },
    camera: { x: 0, y: 1.55, z: 2.6, lookAtY: 1.4 },
  },
  technical: {
    targetHeight: 1.82,
    modelScaleMultiplier: 1,
    offset: { x: 0, y: 0, z: -0.02 },
    camera: { x: 0.02, y: 1.56, z: 2.55, lookAtY: 1.42 },
  },
  "system-design": {
    targetHeight: 1.86,
    modelScaleMultiplier: 0.98,
    offset: { x: 0, y: 0, z: 0.03 },
    camera: { x: -0.02, y: 1.58, z: 2.68, lookAtY: 1.45 },
  },
  behavioral: {
    targetHeight: 1.78,
    modelScaleMultiplier: 1.03,
    offset: { x: 0, y: 0, z: -0.01 },
    camera: { x: 0, y: 1.53, z: 2.52, lookAtY: 1.38 },
  },
};

export const SCENE_CONFIG = {
  clearColor: 0x090f1c,
  fov: 38,
  near: 0.1,
  far: 100,
  cameraStart: { x: 0, y: 1.55, z: 2.6 },
  ambientLight: { color: 0xffffff, intensity: 0.65 },
  keyLight: { color: 0xdbeafe, intensity: 1.05, x: 2.4, y: 4.2, z: 3.1 },
  rimLight: { color: 0x60a5fa, intensity: 0.35, x: -2.6, y: 1.8, z: -2.2 },
  switchFadeDurationMs: 360,
};

export const IDLE_CONFIG = {
  breathingAmplitude: 0.015,
  breathingSpeed: 1.6,
  headSwayAmplitude: 0.03,
  headSwaySpeed: 0.7,
  blinkMinSec: 3,
  blinkMaxSec: 6,
  blinkDurationSec: 0.13,
};

export const EMOTION_PRESETS = {
  neutral: {
    browInnerUp: 0.08,
    browDown: 0.02,
    eyeSquint: 0.04,
    mouthSmile: 0.03,
    jawOpen: 0.0,
  },
  friendly: {
    browInnerUp: 0.18,
    browDown: 0.0,
    eyeSquint: 0.12,
    mouthSmile: 0.45,
    jawOpen: 0.04,
  },
  strict: {
    browInnerUp: 0.0,
    browDown: 0.34,
    eyeSquint: 0.22,
    mouthSmile: 0.0,
    jawOpen: 0.01,
  },
  impressed: {
    browInnerUp: 0.32,
    browDown: 0.0,
    eyeSquint: 0.08,
    mouthSmile: 0.3,
    jawOpen: 0.1,
  },
};

export const MORPH_ALIASES = {
  mouthSmile: ["smile", "mouthsmile", "mouth_smile"],
  browInnerUp: ["browinnerup", "innerbrow", "browup"],
  browDown: ["browdown", "frown", "brow_lower"],
  eyeSquint: ["eyesquint", "squint", "eyes_squint"],
  jawOpen: ["jawopen", "mouthopen", "viseme_aa"],
  blink: ["blink", "eyeblink", "eye_blink"],
};

export const LIP_SYNC_CONFIG = {
  visemeCandidates: ["viseme_aa", "viseme_oh", "viseme_ee", "jawopen", "mouthopen"],
  maxMouthOpen: 0.65,
  smoothing: 0.18,
};
