
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import CameraControls from 'camera-controls'
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
CameraControls.install({ THREE: THREE })
export class VRWander {
    /**
     * @desc: 配置项
     */
    _options = {
        // 容器
        container: document.body,
        // 相机配置
        cameraOption: {
            position: { x: 0, y: 2, z: 0 },
            lookAt: { x: 2, y: 2, z: 2 },
        },
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

    // 相机和视点的距离
    _EPS = 1e-5;
    // 展厅模型
    _hallMesh = null;
    // 展厅地板名称
    _planeName = "plane";
    _planeMesh = null;
    _eventMesh = []

    constructor(options) {
        this._options = Object.assign({}, options)
        this._size.width = this._options.container.clientWidth
        this._size.height = this._options.container.clientHeight

        this._init()
        this._initEvent()
        this._animate()

        // window.addEventListener("resize", this._resize.bind(this));
        // this._controls.addEventListener('change', () => {
        //     // 浏览器控制台查看相机位置变化
        //     console.log('camera.position', this._camera.position);
        // });
    }
    /**
     * 初始化
     */
    _init() {
        // 创建渲染器
        this._renderer = new THREE.WebGLRenderer({
            canvas: this._options.container,
            antialias: true,// 是否执行抗锯齿
            // alpha: true,
            // transparent: true,
            // logarithmicDepthBuffer: true
        })

        this._resizeRendererToDisplaySize()
        // this._renderer.sortObjects = true

        // 创建场景
        this._scene = new THREE.Scene()

        // 创建相机
        const { width, height } = this._size
        this._camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 10000)
        this._camera.position.set(10,10,10)
        // 将相机添加到场景中
        this._scene.add(this._camera)

        // 环境光
        this._scene.add(new THREE.AmbientLight(0xffffff, 1));
        // 平行光
        // const directionLight = new THREE.DirectionalLight(0xffffff, 0.7);
        // directionLight.position.set(5, 5, 5);
        // this._scene.add(directionLight);

        // 坐标轴辅助对象
        this._scene.add(new THREE.AxesHelper(1000))

        // 相机控制器
        this._controls = new CameraControls(this._camera, this._renderer.domElement);
        this._controls.update()

        this._controls.maxDistance = this._EPS;
        // this._controls.minZoom = 0.5;
        // this._controls.maxZoom = 5;
        // this._controls.dragToOffset = false;
        // this._controls.distance = 1;
        // this._controls.dampingFactor = 0.01; // 阻尼运动
        // this._controls.truckSpeed = 0.01; // 拖动速度
        // this._controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
        // this._controls.mouseButtons.right = CameraControls.ACTION.NONE;
        // this._controls.touches.two = CameraControls.ACTION.TOUCH_ZOOM;
        // this._controls.touches.three = CameraControls.ACTION.NONE;

        // // 逆向控制
        // this._controls.azimuthRotateSpeed = -0.5; // 方位角旋转速度。
        // this._controls.polarRotateSpeed = -0.5; // 极旋转的速度。
        // this._controls.saveState();
    }
    /**
   * 执行渲染及动画
   */
    _animate() {
        requestAnimationFrame(this._animate.bind(this));
        this._renderer.render(this._scene, this._camera);
        this._controls.update()
    }

    _initEvent() {
        const raycaster = new THREE.Raycaster()
        const pointer = new THREE.Vector2()
        this._options.container.addEventListener('click', event => {
            pointer.x = (event.clientX/window.innerWidth)*2-1
            pointer.y = - (event.clientY/window.innerHeight)*2+1
            raycaster.setFromCamera(pointer,this._camera)
            const intersects = raycaster.intersectObjects(this._eventMesh)
            let mesh = intersects[0]
            if (mesh) {
                console.log(mesh,'intersects')
                const v3 = mesh.point
                if(mesh.object.name === this._planeName) {
                    console.log('点击了地板')
                    // 点击地板移动
                    console.log(this._options.movieHeight,'h')
                    this._controls.moveTo(v3.x,v3.y,v3.z,false)
                }
            }
        })
        
    }

    async _lookat() {
        if (!this._options.cameraOption) {
            return;
        }
        const { position, lookAt } = this._options.cameraOption;
        const lookatV3 = new THREE.Vector3(position.x, position.y, position.z);
        lookatV3.lerp(new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z), this._EPS);
        this._controls.zoomTo(0.8);
        // this._controls.setTatget(-2, 1, 0)
        // this._controls.update()
        await this._controls.setLookAt(
            position.x,
            position.y,
            position.z,
            lookatV3.x,
            lookatV3.y,
            lookatV3.z,
            false
        );
        // this._controls.update()
    }
    /**
     * @desc gltf加载器
     * @param {*} params 
     * @returns 
     */
    loadGLTF(params) {
        const {url, onProgress } = params;
        return new Promise((resolve) => {
            this._gltfLoader.load(url, (gltf) => {
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
        this._planeName = params.planeName;
        const { url, position,scale,onProgress} = params
        const gltf = await this.loadGLTF({url, onProgress})
        if(position) {
            gltf.scene.position.set(position.x, position.y,position.z)
        }
        this._scene.add(gltf.scene)
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