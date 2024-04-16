
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export class VRWander {
    /**
     * @desc: 配置项
     */
    _options = {
        // 容器
        container: document.body,
    }

    _scene = null // 场景
    _camera = null // 相机
    _renderer = null // 渲染器
    _controls = null // 控制器
    _gltfLoader = new GLTFLoader() // gltf加载器

    /* 默认容器大小 */
    _size = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    constructor(options) {
        Object.assign(this._options,options)
        this._size.width = this._options.container.clientWidth
        this._size.height = this._options.container.clientHeight

        this._init()
        this._animate()
        window.addEventListener("resize", this._resize.bind(this));
    }
    /**
     * 初始化
     */
    _init() {
        // 创建场景
        this._scene = new THREE.Scene()
        // 创建相机
        this._camera = new THREE.PerspectiveCamera(60, this._size.width / this._size.height, 0.1, 1000)
        // 将相机添加到场景中
        this._scene.add(this._camera)
        // 创建渲染器
        this._renderer = new THREE.WebGLRenderer({
            canvas: this._options.container,
            antialias: true // 是否执行抗锯齿
        })
        this._resizeRendererToDisplaySize()
    }
    /**
   * 执行渲染及动画
   */
    _animate() {
        if (this._renderer) {
        this._renderer.render(this._scene, this._camera);
        }

        if (this._animates) {
            //   this._animates.forEach((afun) => {
            //     afun(delta);
            //   });
        }

        requestAnimationFrame(this._animate.bind(this));
    }
    /**
     * @desc gltf加载器
     * @param {*} params 
     * @returns 
     */
    loadGLTF(params) {
        return new Promise((resolve) => {
            const {
                url,
                position,
                scale = 1,
                rotation,
                onProgress,
                animate,
                autoLight, // 自动增亮
            } = params;
            this._gltfLoader.load(url, (gltf) => {
                const mesh = gltf.scene;
                const box = new THREE.Box3()
                .setFromObject(mesh)
                .getSize(new THREE.Vector3());
                console.log("box模型大小", url, box, mesh);

                if (autoLight) {
                    gltf.scene.traverse((child) => {
                        if (child.isMesh) {
                        // child.frustumCulled = false;
                        //模型阴影，开启阴影比较消耗性能
                        child.castShadow = true;
                        //模型自发光
                        child.material.emissive = child.material.color;
                        child.material.emissiveMap = child.material.map;
                        }
                    });
                }

                mesh.scale.set(scale, scale, scale);
                if (position) {
                    mesh.position.y = position.y;
                    mesh.position.x = position.x;
                    mesh.position.z = position.z;
                }
                if (rotation) {
                    mesh.rotation.y = rotation.y;
                    mesh.rotation.x = rotation.x;
                    mesh.rotation.z = rotation.z;
                }
                this._scene.add(mesh);
                if (animate) {
                    mesh.animations = animate;
                }
                resolve(gltf);
            },
            (progress) => {
                if (onProgress) {
                    onProgress(progress);
                }
            },
            (err) => {
                console.error(err);
            }
            );
        });
    }
    async loadHall(params) {
        this._hallPlaneName = params.planeName;
        return await this.loadGLTF({ ...params }).then((gltf) => {
            this._hallMesh = gltf.scene;
            gltf.scene.traverse((mesh) => {
            if (mesh.name === params.planeName) {
                this._planeMesh = mesh;
            }
            });
            return gltf;
        });
    }
    /**
   * 重新设置大小
   */
    _resize() {
        this._size.width = this._options.container.clientWidth;
        this._size.height = this._options.container.clientHeight;
        if (this._resizeRendererToDisplaySize()) {
            this._camera.aspect = this._size.width / this._size.height
            this._camera.updateProjectionMatrix()
        }
    }
    /**
     * @desc 设置渲染器内部尺寸大小
     * @return { Boolean } 是否需要更新渲染器的内部尺寸及相机的宽高比  
     */
    _resizeRendererToDisplaySize() {
        const canvas = this._renderer.domElement
        const pixelRatio = window.devicePixelRatio
        const width = (canvas.clientWidth * pixelRatio) | 0
        const height = (canvas.clientHeight * pixelRatio) | 0
        const needResize = canvas.width !== width || canvas.height !== height
        if (needResize) {
            this._renderer.setSize(width, height, false)
        }
        return needResize
    }
}