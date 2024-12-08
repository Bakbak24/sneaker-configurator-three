import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Text } from "troika-three-text";
import { gsap } from "gsap";
import JSConfetti from "js-confetti";

console.log("Script gestart");

const scene = new THREE.Scene();
const createGradientTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#444"); // Donkergrijs
  gradient.addColorStop(1, "#D9D9D9"); // Lichtgrijs

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

scene.background = createGradientTexture();

// Initialize Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2.5, 4.5, 0);

// Initialize Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("three-canvas"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// Add Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 2);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Add Environment Map
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMap = cubeTextureLoader.load(
  [
    "./envmaps/blocky/px.png",
    "./envmaps/blocky/nx.png",
    "./envmaps/blocky/py.png",
    "./envmaps/blocky/ny.png",
    "./envmaps/blocky/pz.png",
    "./envmaps/blocky/nz.png",
  ],
  () => {
    console.log("Environment map loaded successfully");
  }
);
scene.environment = envMap;

// Add Floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.5;
floor.receiveShadow = true;
scene.add(floor);

// Load Sneaker Model
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://cdn.jsdelivr.net/npm/three/examples/jsm/libs/draco/"
);

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let defaultMaterials = {};
let sneakerModel = null;
const sneakerGroup = new THREE.Group();
loader.load(
  "/assets/Shoe_compressed.glb",
  (gltf) => {
    sneakerModel= gltf.scene;
    sneakerModel.scale.set(15, 15, 15);
    sneakerModel.rotation.y = Math.PI / 2;
    sneakerModel.position.y = 0.1;

    sneakerModel.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        defaultMaterials[node.material.name] = node.material.clone();
      }
    });

    sneakerGroup.add(sneakerModel);
    scene.add(sneakerGroup);
  },
  (xhr) => {
    console.log(`Model loaded: ${(xhr.loaded / xhr.total) * 100}%`);
  },
  (error) => {
    console.error("Error loading model:", error);
  }
);

const lod = new THREE.LOD();
sneakerGroup.traverse((child) => {
  if (child.isMesh) {
    const lowDetail = child.clone();
    lowDetail.geometry = child.geometry.clone();
    lowDetail.geometry.scale(0.5, 0.5, 0.5);
    lod.addLevel(child, 10);
    lod.addLevel(lowDetail, 50);
  }
});
scene.add(lod);

const cameraPositions = {
  laces: { position: { x: 2.5, y: 4.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  sole: {
    position: { x: 0.1, y: 1.2, z: -4.1 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  tongue: {
    position: { x: -2.1, y: 4.5, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  tip: {
    position: { x: 1.2, y: 3.1, z: -3.2 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  logo: { position: { x: -0.4, y: 4.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  text: {
    position: { x: -3.2, y: 1.6, z: -0.2 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  order: { position: { x: 1.2, y: 3.1, z: -3.2 }, rotation: { x: 0, y: 0, z: 0 } },
  done: { position: { x: 1.2, y: 3.1, z: -3.2  }, rotation: { x: 0, y: 0, z: 0 } },
};

function animateCamera(target) {
  const { position, rotation } = cameraPositions[target];

  gsap.to(camera.position, {
    x: position.x,
    y: position.y,
    z: position.z,
    duration: 1.5,
    ease: "power3.out",
  });

  gsap.to(camera.rotation, {
    x: rotation.x,
    y: rotation.y,
    z: rotation.z,
    duration: 1.5,
    ease: "power3.out",
  });

  console.log(`Camera moved to ${target}`);
}

// Setup Texture Loader with Promises
const textureLoader = new THREE.TextureLoader();
const textureCache = {};

const loadTexture = (url) => {
  if (textureCache[url]) {
    console.log(`Texture from cache: ${url}`);
    return Promise.resolve(textureCache[url]);
  }
  console.log(`Loading texture: ${url}`);
  return new Promise((resolve, reject) => {
    textureLoader.load(
      url,
      (texture) => {
        textureCache[url] = texture;
        console.log(`Texture loaded: ${url}`);
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error(`Error loading texture ${url}`, error);
        reject(error);
      }
    );
  });
};

// Parallel Loading of Textures
const loadAllTextures = async () => {
  console.log("Starting to load textures...");
  const textures = await Promise.all([
    loadTexture("/assets/textures/materials/leather/black_leather_color.jpg"),
    loadTexture("/assets/textures/materials/leather/black_leather_normal.jpg"),
    loadTexture("/assets/textures/materials/leather/black_leather_roughness.jpg"),
    loadTexture("/assets/textures/materials/leather/leather_red.png"),
    loadTexture("/assets/textures/materials/leather/brown_leather_albedo.jpg"),
    loadTexture("/assets/textures/materials/leather/brown_leather_rough_.jpg"),
    loadTexture("/assets/textures/materials/leather/gray_leather_color.jpg"),
    loadTexture("/assets/textures/materials/leather/gray_leather_normal.jpg"),
    loadTexture("/assets/textures/materials/leather/gray_leather_roughness.jpg"),
    loadTexture("/assets/textures/materials/leather/leather_white.jpg"),
    loadTexture("/assets/textures/materials/leather/redish_leather_color.jpg"),
    loadTexture("/assets/textures/materials/leather/redish_leather_normal.jpg"),
    loadTexture("/assets/textures/materials/leather/redish_leather_roughness.jpg"),
  ]);

  console.log("All textures loaded successfully");
  return {
    leatherBlack: textures[0],
    leatherNormalBlack: textures[1],
    leatherRoughnessBlack: textures[2],
    leatherRed: textures[3],
    leatherBrown: textures[4],
    leatherRoughnessBrown: textures[5],
    leatherGray: textures[6],
    leatherNormalGray: textures[7],
    leatherRoughnessGray: textures[8],
    leatherWhite: textures[9],
    leatherRedish: textures[10],
    leatherNormalRedish: textures[11],
    leatherRoughnessRedish: textures[12],
  };
};

const initializeMaterials = async () => {
  console.log("Initializing materials...");
  const textures = await loadAllTextures();

  const materials = {
    leatherBlack: new THREE.MeshStandardMaterial({
      map: textures.leatherBlack,
      normalMap: textures.leatherNormalBlack,
      roughnessMap: textures.leatherRoughnessBlack,
      roughness: 1,
    }),
    leatherRed: new THREE.MeshStandardMaterial({
      map: textures.leatherRed,
      roughness: 1,
    }),
    leatherBrown: new THREE.MeshStandardMaterial({
      map: textures.leatherBrown,
      roughnessMap: textures.leatherRoughnessBrown,
      roughness: 1,
    }),
    leatherGray: new THREE.MeshStandardMaterial({
      map: textures.leatherGray,
      normalMap: textures.leatherNormalGray,
      roughnessMap: textures.leatherRoughnessGray,
      roughness: 1,
    }),
    leatherWhite: new THREE.MeshStandardMaterial({
      map: textures.leatherWhite,
      roughness: 1,
    }),
    leatherRedish: new THREE.MeshStandardMaterial({
      map: textures.leatherRedish,
      normalMap: textures.leatherNormalRedish,
      roughnessMap: textures.leatherRoughnessRedish,
      roughness: 1,
    }),
  };

  console.log("Materials initialized successfully", materials);
  return materials;
};

function applyMaterialToPart(partNames, materialKey, materials) {
  if (!sneakerModel || !materials[materialKey]) {
    console.error(
      `Cannot apply material. Sneaker model or material ${materialKey} not found.`
    );
    return;
  }

  console.log(`Applying material ${materialKey} to part(s):`, partNames);
  const parts = Array.isArray(partNames) ? partNames : [partNames];

  sneakerModel.traverse((child) => {
    if (child.isMesh && parts.includes(child.material.name)) {
      const selectedMaterial = materials[materialKey];
      child.material.map = selectedMaterial.map || null;
      child.material.normalMap = selectedMaterial.normalMap || null;
      child.material.roughnessMap = selectedMaterial.roughnessMap || null;
      child.material.roughness = selectedMaterial.roughness || 1;
      child.material.needsUpdate = true;

      console.log(
        `Material ${materialKey} applied to ${child.material.name}`
      );
    }
  });
}

function resetMaterialForPart(partNames) {
  if (!sneakerModel) {
    console.error("Sneaker model not found. Cannot reset material.");
    return;
  }

  console.log(`Resetting material for part(s):`, partNames);
  const parts = Array.isArray(partNames) ? partNames : [partNames];

  sneakerModel.traverse((child) => {
    if (child.isMesh && parts.includes(child.material.name)) {
      child.material.map = null;
      child.material.normalMap = null;
      child.material.roughnessMap = null;
      child.material.roughness = 1;
      child.material.needsUpdate = true;

      console.log(`Material reset for ${child.material.name}`);
    }
  });
}

function setupMaterialEventListeners(partNames, containerId, materials) {
  console.log(`Setting up event listeners for ${containerId}`);
  document
    .querySelectorAll(`#${containerId} .material-button`)
    .forEach((button) => {
      button.addEventListener("click", () => {
        const materialKey = button.getAttribute("data-material");
        console.log(`Material button clicked: ${materialKey}`);
        applyMaterialToPart(partNames, materialKey, materials);
      });
    });
}

(async () => {
  const materials = await initializeMaterials();

  setupMaterialEventListeners("mat_laces", "laces-material-options", materials);
  setupMaterialEventListeners(
    ["mat_sole_top", "mat_sole_bottom"],
    "sole-material-options",
    materials
  );
  setupMaterialEventListeners("inside", "tongue-material-options", materials);
  setupMaterialEventListeners(
    ["mat_outside_1", "mat_outside_2", "mat_outside_3"],
    "tip-material-options",
    materials
  );
  document.querySelector(".reset-laces-button").addEventListener("click", () => {
    console.log("Resetting laces material");
    resetMaterialForPart("mat_laces");
  });

  document
    .querySelector(".reset-sole-button")
    .addEventListener("click", () => {
      console.log("Resetting sole material");
      resetMaterialForPart(["mat_sole_top", "mat_sole_bottom"]);
    });

  document
    .querySelector(".reset-tongue-button")
    .addEventListener("click", () => {
      console.log("Resetting tongue material");
      resetMaterialForPart("inside");
    });

  document.querySelector(".reset-tip-button").addEventListener("click", () => {
    console.log("Resetting tip material");
    resetMaterialForPart(["mat_outside_1", "mat_outside_2", "mat_outside_3"]);
  });
})();

let currentLogo = null;
function addLogo(uploadedImage) {
  if (!sneakerModel || !uploadedImage) return;

  if (currentLogo) {
    sneakerGroup.remove(currentLogo);
    currentLogo.geometry.dispose();
    currentLogo.material.dispose();
    currentLogo = null;
  }

  const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
  const textureLoader = new THREE.TextureLoader();

  const imageURL = URL.createObjectURL(uploadedImage);

  const logoPreview = document.getElementById("logo-preview");
  logoPreview.src = imageURL;
  logoPreview.style.display = "block";

  const logoTexture = textureLoader.load(
    imageURL,
    (texture) => {
      console.log("Logo texture loaded successfully");
    },
    undefined,
    (error) => {
      console.error("Error loading logo texture:", error);
    }
  );

  const logoMaterial = new THREE.MeshStandardMaterial({
    map: logoTexture,
    transparent: true,
    roughness: 0.5,
    metalness: 0.3,
  });

  const cylinder = new THREE.Mesh(cylinderGeometry, logoMaterial);

  cylinder.position.set(-0.6, 0.2, 0);
  cylinder.rotation.x = 0;
  sneakerGroup.add(cylinder);
  currentLogo = cylinder;
  updateSidebarPreview(imageURL);
}

document
  .getElementById("upload-logo-button")
  .addEventListener("change", (event) => {
    const uploadedImage = event.target.files[0];
    if (uploadedImage) {
      addLogo(uploadedImage);
    }
  });

function updateSidebarPreview(imageURL) {
  const sidebarPreview = document.getElementById("logo-preview");
  if (!sidebarPreview) {
    console.warn("Logo preview element not found.");
    return;
  }
  sidebarPreview.style.backgroundImage = `url('${imageURL}')`;
  sidebarPreview.style.backgroundSize = "contain";
  sidebarPreview.style.backgroundRepeat = "no-repeat";
  sidebarPreview.style.backgroundPosition = "center";
}

let currentTextMesh = null;

function addCustomText(text) {
  if (!sneakerModel || !text) return;

  if (currentTextMesh) {
    sneakerGroup.remove(currentTextMesh);
    currentTextMesh.geometry.dispose();
    currentTextMesh.material.dispose();
    currentTextMesh = null;
  }

  const textMesh = new Text();
  textMesh.text = text;
  textMesh.fontSize = 0.1;
  textMesh.color = 0x000000;
  textMesh.rotation.y = -1.64;
  textMesh.position.set(-1.7, 1, -0.1);
  textMesh.font = "/assets/fonts/KronaOne-Regular.ttf";
  textMesh.curveRadius = -1.5;
  textMesh.letterSpacing = 0.02;
  textMesh.anchorX = "center";
  textMesh.anchorY = "middle";

  const textMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.3,
  });

  textMesh.material = textMaterial;

  textMesh.sync();
  sneakerGroup.add(textMesh);
  currentTextMesh = textMesh;
  updateTextPreview(text);

  console.log(`Gebogen tekst toegevoegd: ${text}`);
}

document.getElementById("apply-text-button").addEventListener("click", () => {
  let text = document.getElementById("custom-text-input").value.trim();
  if (text.length > 6) {
    alert("Text cannot be longer than 6 characters.");
    return;
  }
  text = text.toUpperCase();
  addCustomText(text);
  document.getElementById("custom-text-input").value = "";
});

const colorSquares = document.querySelectorAll(".color-square");
colorSquares.forEach((square) => {
  square.addEventListener("click", () => {
    colorSquares.forEach((sq) => sq.classList.remove("active"));
    square.classList.add("active");
  });
});

function updateTextPreview(text) {
  const textPreview = document.getElementById("text-preview");
  if (!textPreview) {
    console.warn("Text preview element not found.");
    return;
  }

  textPreview.textContent = text;
}

function changeLaces(color) {
  if (sneakerModel) {
    sneakerModel.traverse((child) => {
      if (child.isMesh && child.material.name === "mat_laces") {
        child.material.color.set(color);
        console.log(`Laces color changed to ${color}`);
      }
    });
  }
}

function changeSoles(color) {
  if (sneakerModel) {
    sneakerModel.traverse((child) => {
      if (
        child.isMesh &&
        (child.material.name === "mat_sole_top" ||
          child.material.name === "mat_sole_bottom")
      ) {
        child.material.color.set(color);
        console.log(`Sole color changed to ${color}`);
      }
    });
  }
}

function changeTongue(color) {
  if (sneakerModel) {
    sneakerModel.traverse((child) => {
      if (child.isMesh && child.material.name === "inside") {
        child.material.color.set(color);
        console.log(`Tongue color changed to ${color}`);
      }
    });
  }
}

function changeTip(color) {
  if (sneakerModel) {
    sneakerModel.traverse((child) => {
      if (
        child.isMesh &&
        (child.material.name === "mat_outside_1" ||
          child.material.name === "mat_outside_2" ||
          child.material.name === "mat_outside_3")
      ) {
        child.material.color.set(color);
        console.log(`Tip color changed to ${color}`);
      }
    });
  }
}

document.querySelectorAll("#laces-colors .color-square").forEach((square) => {
  square.addEventListener("click", () => {
    const color = square.getAttribute("data-color");
    changeLaces(color);
  });
});

document.querySelectorAll("#sole-colors .color-square").forEach((square) => {
  square.addEventListener("click", () => {
    const color = square.getAttribute("data-color");
    changeSoles(color);
  });
});

document.querySelectorAll("#tongue-colors .color-square").forEach((square) => {
  square.addEventListener("click", () => {
    const color = square.getAttribute("data-color");
    changeTongue(color);
  });
});

document.querySelectorAll("#tip-colors .color-square").forEach((square) => {
  square.addEventListener("click", () => {
    const color = square.getAttribute("data-color");
    changeTip(color);
  });
});

function playGlowEffect() {
  if (!sneakerModel) return;

  const glowMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xffa500, // orange
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.6,
  });

  sneakerModel.traverse((child) => {
    if (child.isMesh) {
      child.originalMaterial = child.material;
      child.material = glowMaterial;
    }
  });

  let intensity = 0.5;
  let growing = true;
  let isAnimating = true;

  const animateGlow = () => {
    if (!isAnimating) return;

    if (growing) {
      intensity += 0.01;
      if (intensity > 1.2) growing = false;
    } else {
      intensity -= 0.01;
      if (intensity < 0.5) growing = true;
    }

    glowMaterial.emissiveIntensity = intensity;
    requestAnimationFrame(animateGlow);
  };
  animateGlow();
}

const updateCanvasSize = (isSidebarVisible) => {
  const sidebarWidth = isSidebarVisible ? 350 : 0;
  const innerWidth = window.innerWidth - sidebarWidth;
  const innerHeight = window.innerHeight;

  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
};

const updateProgressDots = (currentStepIndex) => {
  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, index) => {
    if (index === currentStepIndex) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
};

// Switch Steps Logic
document.addEventListener("DOMContentLoaded", () => {
  const lacesStep = document.getElementById("step-laces");
  const soleStep = document.getElementById("step-sole");
  const tongueStep = document.getElementById("step-tongue");
  const stitchingStep = document.getElementById("step-tip");
  const logoStep = document.getElementById("step-logo");
  const textStep = document.getElementById("step-text");
  const orderStep = document.getElementById("step-order");

  // Arrows
  const nextToSole = document.getElementById("next-to-sole");
  const backToLaces = document.getElementById("back-to-laces");
  const nextToTongue = document.getElementById("next-to-tongue");
  const backToSole = document.getElementById("back-to-sole");
  const nextToTip = document.getElementById("next-to-tip");
  const backToTongue = document.getElementById("back-to-tongue");
  const nextToLogo = document.getElementById("next-to-logo");
  const backToTip = document.getElementById("back-to-tip");
  const backToLogo = document.getElementById("back-to-logo");
  const nextToText = document.getElementById("next-to-text");
  const nextToOrder = document.getElementById("next-to-order");
  const backToText = document.getElementById("back-to-text");

  const doneButton = document.getElementById("done-button");
  const doneSection = document.getElementById("done-section");
  const createNewShoeButton = document.getElementById("create-new-shoe");

  // SwitchStep function with camera animations
  const switchStep = (currentStep, nextStep, cameraTarget = null) => {
    document.querySelectorAll(".config-step").forEach((step) => {
      step.classList.add("hidden");
    });
    nextStep.classList.remove("hidden");

    if (cameraTarget) {
      animateCamera(cameraTarget);
    }

    if (nextStep === orderStep) {
      doneSection.classList.add("hidden");
      document.getElementById("order-button").classList.remove("hidden");
    } else {
      doneSection.classList.remove("hidden");
      document.getElementById("order-button").classList.add("hidden");
    }
  };

  let currentStepIndex = 0;

  // Navigation logic with camera targets
  nextToSole?.addEventListener("click", () => {
    currentStepIndex = 1; // Index van soleStep
    switchStep(lacesStep, soleStep, "sole");
    updateProgressDots(currentStepIndex);
  });

  backToLaces?.addEventListener("click", () => {
    currentStepIndex = 0; // Index van lacesStep
    switchStep(soleStep, lacesStep, "laces");
    updateProgressDots(currentStepIndex);
  });

  nextToTongue?.addEventListener("click", () => {
    currentStepIndex = 2; // Index van tongueStep
    switchStep(soleStep, tongueStep, "tongue");
    updateProgressDots(currentStepIndex);
  });

  backToSole?.addEventListener("click", () => {
    currentStepIndex = 1; // Index van soleStep
    switchStep(tongueStep, soleStep, "sole");
    updateProgressDots(currentStepIndex);
  });

  nextToTip?.addEventListener("click", () => {
    currentStepIndex = 3; // Index van stitchingStep
    switchStep(tongueStep, stitchingStep, "tip");
    updateProgressDots(currentStepIndex);
  });

  backToTongue?.addEventListener("click", () => {
    currentStepIndex = 2; // Index van tongueStep
    switchStep(stitchingStep, tongueStep, "tongue");
    updateProgressDots(currentStepIndex);
  });

  nextToLogo?.addEventListener("click", () => {
    currentStepIndex = 4; // Index van logoStep
    switchStep(stitchingStep, logoStep, "logo");
    updateProgressDots(currentStepIndex);
  });

  backToTip?.addEventListener("click", () => {
    currentStepIndex = 3; // Index van stitchingStep
    switchStep(logoStep, stitchingStep, "tip");
    updateProgressDots(currentStepIndex);
  });

  backToLogo?.addEventListener("click", () => {
    currentStepIndex = 4; // Index van logoStep
    switchStep(textStep, logoStep, "logo");
    updateProgressDots(currentStepIndex);
  });

  nextToText?.addEventListener("click", () => {
    currentStepIndex = 5; // Index van textStep
    switchStep(logoStep, textStep, "text");
    updateProgressDots(currentStepIndex);
  });

  backToText?.addEventListener("click", () => {
    currentStepIndex = 5; // Index van textStep
    switchStep(orderStep, textStep, "text");
    updateProgressDots(currentStepIndex);
  });

  nextToOrder?.addEventListener("click", () => {
    currentStepIndex = 6; // Index van orderStep
    switchStep(textStep, orderStep, "order");
    updateProgressDots(currentStepIndex);
  });

  doneButton.addEventListener("click", () => {
    currentStepIndex = 6; // Index van orderStep
    switchStep(null, orderStep, "done");
    updateProgressDots(currentStepIndex);
  });

  const rotateShoe = () => {
    gsap.to(sneakerGroup.rotation, {
      y: "+=6.28",
      duration: 4,
      ease: "linear",
      repeat: -1,
    });
    gsap.to(camera.position, {
      z: -4.3,
      y: 3.8,
      duration: 1,
      ease: "linear",
    });
  };

  document
    .getElementById("order-form-container")
    .addEventListener("submit", (e) => {
      e.preventDefault();

      const jsConfetti = new JSConfetti();

      playGlowEffect();
      const sidebar = document.querySelector(".config-sidebar");
      sidebar.classList.add("hide-sidebar");
      updateCanvasSize(false);
      rotateShoe();

      const popup = document.getElementById("order-confirmation");

      popup.textContent = "📦Placing Your Order!📦";
      popup.style.visibility = "visible";
      gsap.fromTo(
        popup,
        { y: "-100px", opacity: 0 },
        { y: "-50px", opacity: 1, duration: 1.5, ease: "power2.out" }
      );

      setTimeout(() => {
        // Verbergt eerste popup
        gsap.to(popup, {
          y: "-100px",
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            popup.style.visibility = "hidden";

            // glow effect stopt na 4 seconden
            setTimeout(() => {
              stopGlowEffect();

              popup.textContent = "🎉Placed Your Order!🎉";
              popup.style.visibility = "visible";
              gsap.fromTo(
                popup,
                { y: "-100px", opacity: 0 },
                { y: "-50px", opacity: 1, duration: 1.5, ease: "power2.out" }
              );
              jsConfetti.addConfetti({
                emojis: ["🎉", "👟"],
                emojiSize: 30,
                confettiNumber: 120,
              });
              createNewShoeButton.classList.remove("hidden");

              gsap.fromTo(
                createNewShoeButton,
                { bottom: "-200px", opacity: 0 },
                { bottom: "80px", opacity: 1, duration: 2, ease: "power2.out" }
              );

              setTimeout(() => {
                // Verbergt de tweede popup na 3 seconden
                gsap.to(popup, {
                  y: "-100px",
                  opacity: 0,
                  duration: 0.5,
                  ease: "power2.in",
                  onComplete: () => {
                    popup.style.visibility = "hidden";
                  },
                });
              }, 3000);
            }, 3000); // Glow-effect stopt hier
          },
        });
      }, 2000);
    });

  createNewShoeButton.addEventListener("click", () => {
    location.reload();
  });
  updateCanvasSize(true);
});

document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading-screen");

  window.addEventListener("load", () => {
    setTimeout(() => {
      gsap.to(loadingScreen, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          loadingScreen.style.display = "none";
        },
      });
    }, 1000);
  });
});

function stopGlowEffect() {
  if (!sneakerModel) return;

  sneakerModel.traverse((child) => {
    if (child.isMesh && child.originalMaterial) {
      child.material = child.originalMaterial;
      delete child.originalMaterial;
    }
  });
  console.log("Glow effect stopped.");
}

document
  .getElementById("order-form-container")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const customerName = document.getElementById("name").value;
    const customerEmail = document.getElementById("email").value;
    const shoeSize = parseFloat(document.getElementById("shoe-size").value);

    const laceDetails = getSelectedDetails("mat_laces");
    const soleDetails = getSelectedDetails(["mat_sole_top", "mat_sole_bottom"]);
    const tongueDetails = getSelectedDetails("inside");
    const tipDetails = getSelectedDetails([
      "mat_outside_1",
      "mat_outside_2",
      "mat_outside_3",
    ]);

    const extraOptions = {
      logo: currentLogo ? currentLogo.material.map.image.src : null,
      customText: currentTextMesh ? currentTextMesh.text : null,
    };

    const payload = {
      customerName,
      customerEmail,
      shoeSize,
      laceColor: laceDetails,
      soleColor: soleDetails,
      tongueColor: tongueDetails,
      tipColor: tipDetails,
      extraOptions,
      status: "in productie",
    };

    console.log("Payload to send:", payload);

    try {
      const response = await fetch(
        "https://sneaker-configurator-backend.onrender.com/api/v1/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        console.log("Order succesvol geplaatst!");
      } else {
        console.error("Fout bij plaatsen van bestelling:", response.statusText);
      }
    } catch (error) {
      console.error("Netwerkfout:", error);
    }
  });

function getSelectedDetails(materialNames) {
  if (!sneakerModel) return null;

  const materials = Array.isArray(materialNames)
    ? materialNames
    : [materialNames];
  let selectedDetails = { color: null, material: null };

  sneakerModel.traverse((child) => {
    if (child.isMesh && materials.includes(child.material.name)) {
      selectedDetails.color = child.material.color.getStyle();
      selectedDetails.material = child.material.selectedMaterialKey || null;
    }
  });

  return selectedDetails;
}


window.addEventListener("resize", () => {
  const innerWidth = window.innerWidth - 350;
  const innerHeight = window.innerHeight;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

animate();
