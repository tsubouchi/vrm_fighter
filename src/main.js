import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { VRMAnimationLoaderPlugin } from "@pixiv/three-vrm-animation";
import { createVRMAnimationClip } from "@pixiv/three-vrm-animation";

// ビューポートの高さを設定する関数
function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener("DOMContentLoaded", () => {
    // ビューポートの初期設定
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    const sceneContainer = document.getElementById("scene-container");
    if (!sceneContainer) return;

    // シーンの設定
    const scene = new THREE.Scene();
    scene.background = null;

    // カメラの設定
    const camera = new THREE.PerspectiveCamera(
        30,
        window.innerWidth / window.innerHeight,
        0.1,
        20
    );
    camera.position.set(0, 1.2, 5);
    camera.lookAt(0, 1.2, 0);

    // レンダラーの設定
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        stencil: false,
        depth: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = true;
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    sceneContainer.appendChild(renderer.domElement);

    // グリッド
    const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // ライティングの設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    let currentVrm = null;
    let currentVrmAnimation = null;
    let currentMixer = null;
    const clock = new THREE.Clock();

    // ローダーの設定
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser));

    async function disposeVRM(vrm) {
        if (!vrm) return;
        
        scene.remove(vrm.scene);
        if (vrm.dispose) {
            vrm.dispose();
        }
        
        vrm.scene.traverse((object) => {
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
            if (object.geometry) {
                object.geometry.dispose();
            }
        });
    }

    async function loadVRM(modelId) {
        if (currentVrm) {
            if (currentMixer) {
                currentMixer.stopAllAction();
                currentMixer.uncacheRoot(currentVrm.scene);
            }
            await disposeVRM(currentVrm);
            currentVrm = null;
        }

        try {
            const gltf = await loader.loadAsync(
                `http://localhost:8031/uploads/${modelId}.vrm`
            );
            const vrm = gltf.userData.vrm;
            
            if (vrm) {
                currentVrm = vrm;
                vrm.scene.position.set(0, 0, 0);
                scene.add(vrm.scene);
                
                // VRMの初期設定
                vrm.scene.rotation.y = Math.PI; // モデルを正面に向ける
                vrm.scene.renderOrder = 10000;
                
                console.log(`Loaded VRM model ${modelId}`);
                return vrm;
            }
        } catch (error) {
            console.error("Error loading VRM model:", error);
            return null;
        }
    }

    async function loadVRMA(animationId) {
        if (!currentVrm) {
            console.warn("No VRM model loaded");
            return;
        }

        try {
            const gltf = await loader.loadAsync(
                `http://localhost:8031/uploads/${animationId}.vrma`
            );
            
            if (gltf.userData.vrmAnimations?.[0]) {
                if (currentMixer) {
                    currentMixer.stopAllAction();
                    currentMixer.uncacheRoot(currentVrm.scene);
                    currentMixer = null;
                }
                
                currentVrmAnimation = gltf.userData.vrmAnimations[0];
                await initAnimationClip();
                console.log(`Loaded VRMA animation ${animationId}`);
            } else {
                console.warn("No VRM animation found in the loaded file");
            }
        } catch (error) {
            console.error("Error loading VRMA animation:", error);
        }
    }

    async function initAnimationClip() {
        if (!currentVrm || !currentVrmAnimation) return;

        try {
            currentMixer = new THREE.AnimationMixer(currentVrm.scene);
            const clip = createVRMAnimationClip(currentVrmAnimation, currentVrm);
            
            if (clip) {
                const action = currentMixer.clipAction(clip);
                action.reset();
                action.play();
                console.log("Animation applied to VRM model");
            } else {
                console.warn("Failed to create animation clip");
            }
        } catch (error) {
            console.error("Error initializing animation clip:", error);
        }
    }

    // コントロール要素の設定
    const modelSelect = document.getElementById("model-select");
    const animationSelect = document.getElementById("animation-select");
    const applyButton = document.getElementById("apply-button");

    if (applyButton && modelSelect && animationSelect) {
        applyButton.addEventListener("click", async () => {
            const selectedModel = modelSelect.value;
            const selectedAnimation = animationSelect.value;
            
            applyButton.disabled = true;
            try {
                await loadVRM(selectedModel);
                await new Promise(resolve => setTimeout(resolve, 300));
                await loadVRMA(selectedAnimation);
            } finally {
                applyButton.disabled = false;
            }
        });
    }

    // アニメーションループ
    function animate() {
        requestAnimationFrame(animate);
        
        if (currentMixer) {
            const delta = clock.getDelta();
            currentMixer.update(delta);
        }

        // レンダリング前にクリア
        renderer.clear(true, true, true);
        
        renderer.render(scene, camera);
    }

    // リサイズハンドラー
    function onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // カメラのアスペクト比を更新
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        // レンダラーのサイズを更新
        renderer.setSize(width, height, false);
        
        // ビューポートの高さも更新
        setVH();
    }

    window.addEventListener('resize', onWindowResize);

    // キーボード操作
    window.addEventListener("keydown", (event) => {
        if (!currentVrm) return;
        const rotationAmount = 0.1;

        switch (event.key) {
            case "ArrowLeft":
                currentVrm.scene.rotation.y += rotationAmount;
                break;
            case "ArrowRight":
                currentVrm.scene.rotation.y -= rotationAmount;
                break;
            case "ArrowUp":
                currentVrm.scene.rotation.x += rotationAmount;
                break;
            case "ArrowDown":
                currentVrm.scene.rotation.x -= rotationAmount;
                break;
        }
    });

    // 初期ロード
    (async function initializeScene() {
        try {
            await loadVRM("1");
            await new Promise(resolve => setTimeout(resolve, 300));
            await loadVRMA("1");
        } catch (error) {
            console.error("Error initializing scene:", error);
        }
    })();

    animate();
});