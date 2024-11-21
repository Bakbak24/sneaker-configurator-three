import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GUI } from "dat.gui";

console.log("Script gestart");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2, 2, 5);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("three-canvas"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const controls = new OrbitControls(camera, renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

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
scene.background = envMap;

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

const shoeSizeInput = document.getElementById("shoe-size");
shoeSizeInput.addEventListener("change", () => {
  const selectedSize = parseInt(shoeSizeInput.value, 10);
  if (!sneakerModel) return;
  const baseScale = 15;
  const scaleAdjustment = 0.2;
  const defaultSize = 40;
  const newScale = baseScale + (selectedSize - defaultSize) * scaleAdjustment;
  sneakerModel.scale.set(newScale, newScale, newScale);
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

const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

animate();

window.addEventListener("resize", () => {
  const { innerWidth, innerHeight } = window;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
