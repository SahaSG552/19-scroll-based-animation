import * as THREE from "three";
import GUI from "lil-gui";
import gsap from "gsap";

/**
 * Debug
 */
const gui = new GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  toonMaterial.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});
/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// TextureLoader
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("/textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

// Materials
const toonMaterial = new THREE.MeshToonMaterial({
  gradientMap: gradientTexture,
});
//toonMaterial.color = new THREE.Color("#938379");

// Objects
const objectsDistances = 4;
const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), toonMaterial);
const torus = new THREE.Mesh(new THREE.TorusGeometry(1, 0.3), toonMaterial);
const cone = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1, 4), toonMaterial);

cube.position.y = -objectsDistances * 0;
torus.position.y = -objectsDistances * 1;
cone.position.y = -objectsDistances * 2;

cube.position.x = 1.5;
torus.position.x = -1.5;
cone.position.x = 1.5;
scene.add(cube, torus, cone);
const objects = [cube, torus, cone];

// Lights
const directionalLight = new THREE.DirectionalLight("#e3f075");
directionalLight.intensity = 2;
directionalLight.position.set(1, 0.5, 2);
// scene.add(new THREE.DirectionalLightHelper(directionalLight, 5));
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Particles
const particlesCount = 5000;
const particlesPositions = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount; i++) {
  particlesPositions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  particlesPositions[i * 3 + 1] =
    objectsDistances / 5 - Math.random() * objectsDistances * objects.length;
  particlesPositions[i * 3 + 2] = Math.random() * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlesPositions, 3)
);
const particlesMaterial = new THREE.PointsMaterial({
  color: "white",
  sizeAttenuation: true,
  size: 0.01,
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Cursor

const cursor = {};
cursor.x = 0;
cursor.y = 0;
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scroll

let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  let newSection = Math.ceil(scrollY / sizes.height);
  if (newSection != currentSection) {
    currentSection = newSection;
    gsap.to(objects[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
    });
  }
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;
  // Camera animation
  camera.position.y = (-scrollY / sizes.height) * objectsDistances;
  const parallax = {};
  parallax.x = cursor.x;
  parallax.y = -cursor.y;
  cameraGroup.position.x +=
    (parallax.x - cameraGroup.position.x) * 3 * deltaTime;
  cameraGroup.position.y +=
    (parallax.y - cameraGroup.position.y) * 3 * deltaTime;

  for (const object of objects) {
    object.rotation.x += deltaTime * 0.2;
    object.rotation.y += deltaTime * 0.1;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
