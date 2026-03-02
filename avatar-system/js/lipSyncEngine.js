import { LIP_SYNC_CONFIG } from "./config.js";

const norm = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export class LipSyncEngine {
  constructor() {
    this.morphMeshes = [];
    this.fallbackMouth = null;
    this.speaking = false;
    this.energy = 0;
    this.timer = null;
    this.currentUtterance = null;
  }

  bindAvatar(root) {
    this.morphMeshes = [];
    this.fallbackMouth = null;
    if (!root) return;

    root.traverse((obj) => {
      if (obj?.name === "__fallbackMouth") this.fallbackMouth = obj;
      if (obj?.isMesh && obj.morphTargetInfluences && obj.morphTargetDictionary) {
        this.morphMeshes.push(obj);
      }
    });
  }

  speak(text) {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    this.speaking = true;
    this.energy = 0.15;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 1.02;

    utterance.onboundary = () => {
      this.energy = 0.8;
    };

    utterance.onstart = () => {
      this.#startFallbackPulse();
    };

    utterance.onend = () => {
      this.#stopSpeaking();
    };

    utterance.onerror = () => {
      this.#stopSpeaking();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  update() {
    if (!this.speaking) {
      this.#applyMouthValue(0);
      return;
    }

    this.energy *= 0.78;
    const value = Math.min(LIP_SYNC_CONFIG.maxMouthOpen, Math.max(0.04, this.energy));
    this.#applyMouthValue(value);
  }

  #applyMouthValue(value) {
    this.morphMeshes.forEach((mesh) => {
      const idx = this.#findBestMouthIndex(mesh.morphTargetDictionary);
      if (idx === -1) return;

      const current = mesh.morphTargetInfluences[idx] || 0;
      mesh.morphTargetInfluences[idx] = current + (value - current) * LIP_SYNC_CONFIG.smoothing;
    });

    if (this.fallbackMouth) {
      this.fallbackMouth.scale.y = 0.7 + value * 7;
    }
  }

  #findBestMouthIndex(dictionary) {
    const entries = Object.entries(dictionary || {});

    for (const token of LIP_SYNC_CONFIG.visemeCandidates.map(norm)) {
      for (const [name, idx] of entries) {
        if (norm(name).includes(token)) return idx;
      }
    }

    return -1;
  }

  #startFallbackPulse() {
    clearInterval(this.timer);
    this.timer = window.setInterval(() => {
      if (!this.speaking) return;
      this.energy = 0.35 + Math.random() * 0.55;
    }, 90);
  }

  #stopSpeaking() {
    this.speaking = false;
    clearInterval(this.timer);
    this.timer = null;
    this.currentUtterance = null;
  }
}
