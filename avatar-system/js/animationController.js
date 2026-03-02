import * as THREE from "three";
import { IDLE_CONFIG, MORPH_ALIASES } from "./config.js";

const randomInRange = (min, max) => min + Math.random() * (max - min);
const norm = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export class AnimationController {
  constructor() {
    this.root = null;
    this.head = null;
    this.morphMeshes = [];
    this.mixer = null;
    this.clockTime = 0;
    this.blinkTimer = randomInRange(IDLE_CONFIG.blinkMinSec, IDLE_CONFIG.blinkMaxSec);
    this.blinkRemaining = 0;
  }

  bindAvatar(root, animations = []) {
    this.root = root;
    this.head = null;
    this.morphMeshes = [];

    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }

    if (!root) return;

    root.traverse((obj) => {
      if (!this.head && /(head)/i.test(obj.name || "")) this.head = obj;
      if (obj?.isMesh && obj.morphTargetDictionary && obj.morphTargetInfluences) this.morphMeshes.push(obj);
    });

    if (animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(root);
      const action = this.mixer.clipAction(animations[0]);
      action.play();
    }
  }

  update(deltaSec) {
    if (!this.root) return;

    this.clockTime += deltaSec;

    if (this.mixer) this.mixer.update(deltaSec);

    const breath = Math.sin(this.clockTime * IDLE_CONFIG.breathingSpeed) * IDLE_CONFIG.breathingAmplitude;
    this.root.position.y = breath;

    if (this.head) {
      this.head.rotation.y = Math.sin(this.clockTime * IDLE_CONFIG.headSwaySpeed) * IDLE_CONFIG.headSwayAmplitude;
      this.head.rotation.x = Math.sin(this.clockTime * (IDLE_CONFIG.headSwaySpeed + 0.2)) * IDLE_CONFIG.headSwayAmplitude * 0.35;
    }

    this.#updateBlink(deltaSec);
  }

  #updateBlink(deltaSec) {
    if (!this.morphMeshes.length) return;

    if (this.blinkRemaining > 0) {
      this.blinkRemaining -= deltaSec;
    } else {
      this.blinkTimer -= deltaSec;
      if (this.blinkTimer <= 0) {
        this.blinkRemaining = IDLE_CONFIG.blinkDurationSec;
        this.blinkTimer = randomInRange(IDLE_CONFIG.blinkMinSec, IDLE_CONFIG.blinkMaxSec);
      }
    }

    const blinkIntensity = this.blinkRemaining > 0 ? 1 : 0;
    this.morphMeshes.forEach((mesh) => {
      const idx = this.#findMorphIndex(mesh.morphTargetDictionary, "blink");
      if (idx === -1) return;
      const current = mesh.morphTargetInfluences[idx] || 0;
      mesh.morphTargetInfluences[idx] = current + (blinkIntensity - current) * 0.5;
    });
  }

  #findMorphIndex(dictionary, token) {
    const aliases = MORPH_ALIASES[token] || [token];
    const entries = Object.entries(dictionary || {});

    for (const candidate of aliases.map(norm)) {
      for (const [name, idx] of entries) {
        if (norm(name).includes(candidate)) return idx;
      }
    }

    return -1;
  }
}
