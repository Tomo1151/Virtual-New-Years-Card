import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { Reflector } from "three/addons/objects/Reflector.js";

let LOADED = false;
const COLOR_WHITE = new THREE.Color(0xffffff);
const PATH_ASSETS = "./assets/";

const loadingScreen = document.getElementById("loading");
const progress = document.getElementById("progress");
const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas,
});

const width = window.innerWidth;
const height = window.innerHeight;

renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.setClearColor(COLOR_WHITE);

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLOR_WHITE);

const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
camera.position.set(250, 50, 250);
camera.lookAt(new THREE.Vector3(0, 50, 0));

const controls = new OrbitControls(camera, document.body);
controls.enableDamping = true;

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100000, 100000, 100, 100),
  new THREE.MeshStandardMaterial({
    color: COLOR_WHITE,
    metalness: 0.9,
    transparent: true,
    roughness: 0.25,
    opacity: 0.95,
  })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -99.9;

const groundReflector = new Reflector(ground.geometry, {
  color: 0x777777,
  textureWidth: width * window.devicePixelRatio,
  textureHeight: height * window.devicePixelRatio,
  clipBias: 0.003,
});

groundReflector.position.y = -100;
groundReflector.rotation.x = -Math.PI / 2;

const gridHelper = new THREE.GridHelper(10000, 250, 0xf2f2f2, 0xf2f2f2);
gridHelper.position.y = -99;

const textureLoader = new THREE.TextureLoader();
const cardTopTexture = textureLoader.load("./assets/card_top.png");
const cardBottomTexture = textureLoader.load("./assets/card_bottom.png");

const cardMaterials = [
  new THREE.MeshPhongMaterial({ map: cardTopTexture, transparent: true }),
  new THREE.MeshPhongMaterial({ map: cardBottomTexture, transparent: true }),
  new THREE.MeshPhongMaterial({ map: cardTopTexture, transparent: true }),
  new THREE.MeshPhongMaterial({ map: cardBottomTexture, transparent: true }),
  new THREE.MeshPhongMaterial({
    map: cardTopTexture,
    side: THREE.DoubleSide,
    transparent: true,
  }),
  new THREE.MeshPhongMaterial({
    map: cardBottomTexture,
    side: THREE.DoubleSide,
    transparent: true,
  }),
];

const card = new THREE.Mesh(
  new THREE.BoxGeometry(118.1, 174.8, 0.1),
  cardMaterials
);
card.position.set(0, 25, 0);
card.rotation.y = (Math.PI / 2) * 3;

const light_0 = new THREE.DirectionalLight(COLOR_WHITE, 2);
const light_1 = new THREE.DirectionalLight(COLOR_WHITE, 1);
const light_2 = new THREE.DirectionalLight(COLOR_WHITE, 1);
light_0.position.set(100, 100, 100);
light_1.position.set(0, 100, 100);
light_2.position.set(100, 100, 0);
light_0.target.position.set(0, (174.8 + 25) / 2, 0);
light_1.target.position.set(0, (174.8 + 25) / 2, 0);
light_2.target.position.set(0, (174.8 + 25) / 2, 0);

const ambient = new THREE.AmbientLight(COLOR_WHITE, 0.1);
const exrloader = new EXRLoader();

await exrloader.load(
  PATH_ASSETS + "kloofendal_misty_morning_puresky_4k.exr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
    LOADED = true;
    loadingScreen.style.opacity = 0;
  },
  function (xhr) {
    progress.value = (xhr.loaded / xhr.total) * 100;
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  }
);

scene.add(card);
scene.add(light_0);
scene.add(light_1);
scene.add(light_2);
scene.add(groundReflector);
scene.add(gridHelper);
scene.add(ambient);
scene.add(ground);

function tick() {
  if (LOADED) {
    card.rotation.y += 0.005;
    controls.update();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
}

function onResize(renderer, camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

tick();
window.addEventListener("resize", onResize.bind(null, renderer, camera));
