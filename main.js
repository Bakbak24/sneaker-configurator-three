import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GUI } from "dat.gui";
import { Text } from "troika-three-text";

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
camera.position.set(0.1, 1.2, -4.1);

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
      }
    });
    scene.add(sneakerModel);
  },
  undefined,
  (error) => {
    console.error("Error loading model:", error);
  }
);

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

function addLogo(uploadedImage) {
  if (!sneakerModel || !uploadedImage) return;

  const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
  const textureLoader = new THREE.TextureLoader();

  const imageURL = URL.createObjectURL(uploadedImage);
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
  scene.add(cylinder);

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

function addCustomText(text) {
  if (!sneakerModel || !text) return;

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
  scene.add(textMesh);
  console.log(`Gebogen tekst toegevoegd: ${text}`);
}

document.getElementById("apply-text-button").addEventListener("click", () => {
  const text = document.getElementById("custom-text-input").value;
  addCustomText(text);
});

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

  const switchStep = (currentStep, nextStep) => {
    document.querySelectorAll(".config-step").forEach((step) => {
      step.classList.add("hidden");
    });
    nextStep.classList.remove("hidden");
    if (nextStep === orderStep) {
      doneSection.classList.add("hidden");
      document.getElementById("order-button").classList.remove("hidden");
    } else {
      doneSection.classList.remove("hidden");
      document.getElementById("order-button").classList.add("hidden");
    }
  };

  // Navigation logic
  nextToSole?.addEventListener("click", () => switchStep(lacesStep, soleStep));
  backToLaces?.addEventListener("click", () => switchStep(soleStep, lacesStep));
  nextToTongue?.addEventListener("click", () =>
    switchStep(soleStep, tongueStep)
  );
  backToSole?.addEventListener("click", () => switchStep(tongueStep, soleStep));
  nextToTip?.addEventListener("click", () =>
    switchStep(tongueStep, stitchingStep)
  );
  backToTongue?.addEventListener("click", () =>
    switchStep(stitchingStep, tongueStep)
  );
  nextToLogo?.addEventListener("click", () =>
    switchStep(stitchingStep, logoStep)
  );
  backToTip?.addEventListener("click", () =>
    switchStep(logoStep, stitchingStep)
  );
  backToLogo?.addEventListener("click", () => switchStep(textStep, logoStep));
  nextToText?.addEventListener("click", () => switchStep(logoStep, textStep));
  backToText?.addEventListener("click", () => switchStep(orderStep, textStep));
  nextToOrder?.addEventListener("click", () => switchStep(textStep, orderStep));
  doneButton.addEventListener("click", () => {
    switchStep(null, orderStep);
  });

  document.getElementById("order-form-container").addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const shoeSize = document.getElementById("shoe-size").value;

    console.log(`Order submitted! Name: ${name}, Email: ${email}, Shoe Size: ${shoeSize}`);
  });

  const innerWidth = window.innerWidth - 350;
  const innerHeight = window.innerHeight;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Animation Loop
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

// Handle Resizing
window.addEventListener("resize", () => {
  const innerWidth = window.innerWidth - 350;
  const innerHeight = window.innerHeight;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Start Animation
animate();
