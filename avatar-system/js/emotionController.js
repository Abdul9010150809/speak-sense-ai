import { EMOTION_PRESETS, MORPH_ALIASES } from "./config.js";

const norm = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export class EmotionController {
  constructor() {
    this.morphMeshes = [];
    this.currentEmotion = "neutral";
    this.smoothing = 0.14;
  }

  bindAvatar(root) {
    this.morphMeshes = [];
    if (!root) return;

    root.traverse((obj) => {
      if (obj?.isMesh && obj.morphTargetInfluences && obj.morphTargetDictionary) {
        this.morphMeshes.push(obj);
      }
    });
  }

  setEmotion(type) {
    this.currentEmotion = EMOTION_PRESETS[type] ? type : "neutral";
  }

  update() {
    const target = EMOTION_PRESETS[this.currentEmotion] || EMOTION_PRESETS.neutral;

    this.morphMeshes.forEach((mesh) => {
      Object.entries(target).forEach(([token, value]) => {
        const index = this.#findMorphIndex(mesh.morphTargetDictionary, token);
        if (index === -1) return;

        const current = mesh.morphTargetInfluences[index] || 0;
        mesh.morphTargetInfluences[index] = current + (value - current) * this.smoothing;
      });
    });
  }

  #findMorphIndex(dictionary, token) {
    const aliases = MORPH_ALIASES[token] || [token];
    const mapEntries = Object.entries(dictionary || {});

    for (const candidate of aliases.map(norm)) {
      for (const [key, idx] of mapEntries) {
        if (norm(key).includes(candidate)) return idx;
      }
    }

    return -1;
  }
}
