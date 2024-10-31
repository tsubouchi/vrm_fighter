import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { createVRMAnimationClip, VRMAnimationLoaderPlugin } from '@pixiv/three-vrm-animation';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); // 背景を透明に設定
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

let mixer1, mixer2; // アニメーションミキサーを保持
let clock = new THREE.Clock(); // 時間管理用のクロック

// GLTFLoaderの初期化
const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));
loader.register((parser) => new VRMAnimationLoaderPlugin(parser));

// VRMモデルとVRMAアニメーションの読み込みと適用
async function loadVRMModel(url, position, scale, rotationY, poseUrl, isLeft) {
    loader.load(
        url,
        (gltf) => {
            const vrm = gltf.userData.vrm;
            vrm.scene.position.set(position.x, position.y, position.z);
            vrm.scene.scale.set(scale, scale, scale);
            vrm.scene.rotation.y = rotationY;

            scene.add(vrm.scene);
            console.log(`Loaded VRM from ${url}`);

            // VRMAの適用
            if (poseUrl) {
                fetch(poseUrl)
                    .then((response) => response.json())
                    .then((poseData) => applyVRMAPose(vrm, poseData))
                    .catch((error) => console.error('Error loading VRMA:', error));
            }
        },
        (progress) => console.log(`Loading model from ${url}...`, 100.0 * (progress.loaded / progress.total), '%'),
        (error) => console.error(`Error loading VRM from ${url}:`, error)
    );
}

// VRMAデータをVRMに適用する関数
function applyVRMAPose(vrm, poseData) {
    const mixer = new THREE.AnimationMixer(vrm.scene);
    const clip = createVRMAnimationClip(poseData, vrm);
    mixer.clipAction(clip).play();

    // 左右キャラクターに応じてミキサーを保持
    if (vrm === mixer1) {
        mixer1 = mixer;
    } else {
        mixer2 = mixer;
    }
}

// 左キャラクター（1.vrm）設定
loadVRMModel(
    'http://localhost:8031/uploads/1.vrm',
    { x: -1, y: 0, z: 0 },
    2.0, // サイズを大きく設定
    Math.PI / 2,  // 右向き
    'http://localhost:8031/uploads/fight.vrma',  // VRMAアニメーションのURL
    true
);

// 右キャラクター（2.vrm）設定
loadVRMModel(
    'http://localhost:8031/uploads/2.vrm',
    { x: 1, y: 0, z: 0 },
    2.0, // サイズを大きく設定
    -Math.PI / 2,  // 左向き
    'http://localhost:8031/uploads/fight.vrma',  // VRMAアニメーションのURL
    false
);

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    if (mixer1) mixer1.update(deltaTime);
    if (mixer2) mixer2.update(deltaTime);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});