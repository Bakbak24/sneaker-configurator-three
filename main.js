import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GUI } from "dat.gui";
import { Text } from "troika-three-text";
import { gsap } from "gsap";
import JSConfetti from "js-confetti";

console.log("Script gestart");

// Initialize Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

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
renderer.shadowMap.enabled = true;

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// Add Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
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
  },
  undefined,
  (error) => {
    console.error("Error loading environment map:", error);
  }
);
scene.environment = envMap;

// Load Sneaker Model
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://cdn.jsdelivr.net/npm/three/examples/jsm/libs/draco/"
);

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

let defaultMaterials = {};
let sneakerGroup = new THREE.Group();

let sneakerModel;
loader.load(
  "/assets/Shoe_compressed.glb",
  (gltf) => {
    console.log("Model geladen:", gltf.scene);
    sneakerModel = gltf.scene;
    sneakerModel.scale.set(15, 15, 15);
    sneakerModel.rotation.y = Math.PI / 2;
    sneakerModel.position.y = 0.1;
    sneakerModel.traverse((node) => {
      if (node.isMesh) {
        console.log("Mesh gevonden:", node.name);
        node.castShadow = true;
        defaultMaterials[node.material.name] = node.material.clone();
      }
    });

    sneakerGroup.add(sneakerModel);
    scene.add(sneakerGroup);
  },
  undefined,
  (error) => {
    console.error("Error loading model:", error);
  }
);

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

const gui = new GUI({ autoPlace: false });
document.getElementById("gui-container").appendChild(gui.domElement);

const lightFolder = gui.addFolder("Light Settings");
lightFolder.add(directionalLight.position, "x", -10, 10, 0.1).name("Light X");
lightFolder.add(directionalLight.position, "y", -10, 10, 0.1).name("Light Y");
lightFolder.add(directionalLight.position, "z", -10, 10, 0.1).name("Light Z");
lightFolder.open();

const cameraFolder = gui.addFolder("Camera Settings");
cameraFolder.add(camera.position, "x", -10, 10, 0.1).name("Camera X");
cameraFolder.add(camera.position, "y", -10, 10, 0.1).name("Camera Y");
cameraFolder.add(camera.position, "z", -10, 10, 0.1).name("Camera Z");
cameraFolder.open();

const textureLoader = new THREE.TextureLoader();

const leatherBlack = textureLoader.load(
  "/assets/textures/materials/leather/black_leather_color.jpg"
);
const leatherNormalBlack = textureLoader.load(
  "/assets/textures/materials/leather/black_leather_normal.jpg"
);
const leatherRoughnessBlack = textureLoader.load(
  "/assets/textures/materials/leather/black_leather_roughness.jpg"
);

const leatherRed = textureLoader.load(
  "/assets/textures/materials/leather/leather_red.png"
);

const leatherBrown = textureLoader.load(
  "/assets/textures/materials/leather/brown_leather_albedo.jpg"
);
const leatherRoughnessBrown = textureLoader.load(
  "/assets/textures/materials/leather/brown_leather_rough.jpg"
);

const leatherGray = textureLoader.load(
  "/assets/textures/materials/leather/gray_leather_color.jpg"
);
const leatherNormalGray = textureLoader.load(
  "/assets/textures/materials/leather/gray_leather_normal.jpg"
);
const leatherRoughnessGray = textureLoader.load(
  "/assets/textures/materials/leather/gray_leather_roughness.jpg"
);

const leatherWhite = textureLoader.load(
  "/assets/textures/materials/leather/leather_white.jpg"
);
const leatherRedish = textureLoader.load(
  "/assets/textures/materials/leather/redish_leather_color.jpg"
);
const leatherNormalRedish = textureLoader.load(
  "/assets/textures/materials/leather/redish_leather_normal.jpg"
);
const leatherRoughnessRedish = textureLoader.load(
  "/assets/textures/materials/leather/redish_leather_roughness.jpg"
);

const materials = {
  leatherBlack: new THREE.MeshStandardMaterial({
    map: leatherBlack,
    normalMap: leatherNormalBlack,
    roughnessMap: leatherRoughnessBlack,
    roughness: 1,
  }),
  leatherRed: new THREE.MeshStandardMaterial({
    map: leatherRed,
    roughness: 1,
  }),
  leatherBrown: new THREE.MeshStandardMaterial({
    map: leatherBrown,
    roughnessMap: leatherRoughnessBrown,
    roughness: 1,
  }),
  leatherGray: new THREE.MeshStandardMaterial({
    map: leatherGray,
    normalMap: leatherNormalGray,
    roughnessMap: leatherRoughnessGray,
    roughness: 1,
  }),
  leatherWhite: new THREE.MeshStandardMaterial({
    map: leatherWhite,
    roughness: 1,
  }),
  leatherRedish: new THREE.MeshStandardMaterial({
    map: leatherRedish,
    normalMap: leatherNormalRedish,
    roughnessMap: leatherRoughnessRedish,
    roughness: 1,
  }),
};

function applyMaterialToPart(partNames, materialKey) {
  if (!sneakerModel || !materials[materialKey]) return;

  const parts = Array.isArray(partNames) ? partNames : [partNames];

  sneakerModel.traverse((child) => {
    if (child.isMesh && parts.includes(child.material.name)) {
      const selectedMaterial = materials[materialKey];
      child.material.map = selectedMaterial.map || null;
      child.material.normalMap = selectedMaterial.normalMap || null;
      child.material.roughnessMap = selectedMaterial.roughnessMap || null;
      child.material.roughness = selectedMaterial.roughness || 1;
      child.material.needsUpdate = true;

      // Voegt de naam van het materiaal toe aan het mesh-object
      child.material.selectedMaterialKey = materialKey;

      console.log(
        `Material applied to ${child.material.name} using ${materialKey}`
      );
    }
  });
}

function setupMaterialEventListeners(partNames, containerId) {
  document
    .querySelectorAll(`#${containerId} .material-button`)
    .forEach((button) => {
      button.addEventListener("click", () => {
        const materialKey = button.getAttribute("data-material");
        applyMaterialToPart(partNames, materialKey);
      });
    });
}

function resetMaterialForPart(partNames) {
  if (!sneakerModel) return;

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

document.querySelector(".reset-laces-button").addEventListener("click", () => {
  resetMaterialForPart("mat_laces");
});

document.querySelector(".reset-sole-button").addEventListener("click", () => {
  resetMaterialForPart(["mat_sole_top", "mat_sole_bottom"]);
});

document.querySelector(".reset-tongue-button").addEventListener("click", () => {
  resetMaterialForPart("inside");
});

document.querySelector(".reset-tip-button").addEventListener("click", () => {
  resetMaterialForPart(["mat_outside_1", "mat_outside_2", "mat_outside_3"]);
});

document
  .getElementById("reset-materials-button")
  .addEventListener("click", () => {
    resetMaterials();
  });

setupMaterialEventListeners("mat_laces", "laces-material-options");

setupMaterialEventListeners(
  ["mat_sole_top", "mat_sole_bottom"],
  "sole-material-options"
);

setupMaterialEventListeners("inside", "tongue-material-options");

setupMaterialEventListeners(
  ["mat_outside_1", "mat_outside_2", "mat_outside_3"],
  "tip-material-options"
);

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
  console.log("New Logo toegevoegd");

  const logoFolder = gui.addFolder("Logo Settings");
  logoFolder.add(cylinder.position, "x", -10, 10, 0.1).name("Logo X");
  logoFolder.add(cylinder.position, "y", -10, 10, 0.1).name("Logo Y");
  logoFolder.add(cylinder.position, "z", -10, 10, 0.1).name("Logo Z");
  logoFolder
    .add(cylinder.rotation, "x", -Math.PI, Math.PI, 0.1)
    .name("Logo Rotation X");
  logoFolder
    .add(cylinder.rotation, "y", -Math.PI, Math.PI, 0.1)
    .name("Logo Rotation Y");
  logoFolder
    .add(cylinder.rotation, "z", -Math.PI, Math.PI, 0.1)
    .name("Logo Rotation Z");
  logoFolder.open();
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

const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

window.addEventListener("resize", () => {
  const innerWidth = window.innerWidth - 350;
  const innerHeight = window.innerHeight;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

animate();
