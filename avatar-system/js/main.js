import * as THREE from "three";
import { AvatarLoader } from "./avatarLoader.js";
import { EmotionController } from "./emotionController.js";
import { LipSyncEngine } from "./lipSyncEngine.js";
import { AnimationController } from "./animationController.js";
import { ROLE_FRAMING, SCENE_CONFIG } from "./config.js";

class AvatarApp {
  constructor() {
    this.stage = document.getElementById("avatarStage");
    this.roleSelect = document.getElementById("roleSelect");
    this.speakBtn = document.getElementById("speakBtn");
    this.emotionButtons = [...document.querySelectorAll("[data-emotion]")];

    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SCENE_CONFIG.clearColor);

    this.camera = new THREE.PerspectiveCamera(
      SCENE_CONFIG.fov,
      this.stage.clientWidth / this.stage.clientHeight,
      SCENE_CONFIG.near,
      SCENE_CONFIG.far
    );
    this.camera.position.set(
      SCENE_CONFIG.cameraStart.x,
      SCENE_CONFIG.cameraStart.y,
      SCENE_CONFIG.cameraStart.z
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.stage.clientWidth, this.stage.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.stage.appendChild(this.renderer.domElement);

    this.currentRole = "hr";
    this.cameraGoal = {
      x: SCENE_CONFIG.cameraStart.x,
      y: SCENE_CONFIG.cameraStart.y,
      z: SCENE_CONFIG.cameraStart.z,
      lookAtY: 1.4,
    };

    this.loader = new AvatarLoader(this.scene);
    this.emotions = new EmotionController();
    this.lipSync = new LipSyncEngine();
    this.idle = new AnimationController();

    this.#setupLights();
    this.#bindUi();
    this.#bindExternalApi();
    this.#onResize = this.#handleResize.bind(this);
    window.addEventListener("resize", this.#onResize);

    const initialRole = this.#getRequestedRole();
    this.roleSelect.value = initialRole;
    this.#loadAndBind(initialRole);
    this.#loop();
  }

  #getRequestedRole() {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");
    if (role === "technical" || role === "system-design" || role === "behavioral" || role === "hr") {
      return role;
    }
    return "hr";
  }

  #setupLights() {
    const ambient = new THREE.AmbientLight(
      SCENE_CONFIG.ambientLight.color,
      SCENE_CONFIG.ambientLight.intensity
    );
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(
      SCENE_CONFIG.keyLight.color,
      SCENE_CONFIG.keyLight.intensity
    );
    key.position.set(SCENE_CONFIG.keyLight.x, SCENE_CONFIG.keyLight.y, SCENE_CONFIG.keyLight.z);
    key.castShadow = true;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(
      SCENE_CONFIG.rimLight.color,
      SCENE_CONFIG.rimLight.intensity
    );
    rim.position.set(SCENE_CONFIG.rimLight.x, SCENE_CONFIG.rimLight.y, SCENE_CONFIG.rimLight.z);
    this.scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 48),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.88, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.005;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  #bindUi() {
    this.roleSelect.addEventListener("change", async (event) => {
      await this.#loadAndBind(event.target.value);
    });

    this.emotionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.emotions.setEmotion(button.dataset.emotion);
      });
    });

    this.speakBtn.addEventListener("click", () => {
      this.lipSync.speak(
        "Hello, I am your interviewer. Please walk me through a project where you solved a difficult problem with clear impact."
      );
    });
  }

  #bindExternalApi() {
    window.addEventListener("message", async (event) => {
      const payload = event?.data;
      if (!payload || typeof payload !== "object") return;

      if (payload.type === "SET_ROLE" && payload.role) {
        const nextRole = ["hr", "technical", "system-design", "behavioral"].includes(payload.role)
          ? payload.role
          : "hr";
        if (this.roleSelect.value !== nextRole) {
          this.roleSelect.value = nextRole;
        }
        await this.#loadAndBind(nextRole);
      }

      if (payload.type === "SET_EMOTION" && payload.emotion) {
        this.emotions.setEmotion(payload.emotion);
      }

      if (payload.type === "SPEAK" && payload.text) {
        this.lipSync.speak(payload.text);
      }
    });

    window.avatarModule = {
      setRole: (role) => {
        window.postMessage({ type: "SET_ROLE", role }, "*");
      },
      setEmotion: (emotion) => {
        window.postMessage({ type: "SET_EMOTION", emotion }, "*");
      },
      speak: (text) => {
        window.postMessage({ type: "SPEAK", text }, "*");
      },
    };
  }

  async #loadAndBind(role) {
    const { root, animations } = await this.loader.loadAvatar(role);
    this.currentRole = role;
    this.cameraGoal = {
      ...(ROLE_FRAMING[role]?.camera || ROLE_FRAMING.hr.camera),
    };
    this.emotions.bindAvatar(root);
    this.idle.bindAvatar(root, animations);
    this.lipSync.bindAvatar(root);
    this.emotions.setEmotion("neutral");
  }

  #handleResize() {
    this.camera.aspect = this.stage.clientWidth / this.stage.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.stage.clientWidth, this.stage.clientHeight);
  }

  #loop() {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.elapsedTime;

    this.loader.update(delta);
    this.idle.update(delta);
    this.emotions.update(delta);
    this.lipSync.update(delta);

    const breathing = Math.sin(elapsed * 0.65) * 0.012;
    this.camera.position.x += (this.cameraGoal.x - this.camera.position.x) * 0.08;
    this.camera.position.y += ((this.cameraGoal.y + breathing) - this.camera.position.y) * 0.08;
    this.camera.position.z += (this.cameraGoal.z - this.camera.position.z) * 0.08;
    this.camera.lookAt(0, this.cameraGoal.lookAtY || 1.4, 0);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.#loop());
  }
}

new AvatarApp();
