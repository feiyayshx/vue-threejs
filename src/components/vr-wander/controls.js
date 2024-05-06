
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
    _clock = new THREE.Clock()

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
    _hallPlaneName = "plane";
    _planeMesh = null;

    constructor(options) {
        Object.assign(this._options, options)
        this._size.width = this._options.container.clientWidth
        this._size.height = this._options.container.clientHeight

        this._init()
        this._animate()
        this._initEvent()

        window.addEventListener("resize", this._resize.bind(this));
    }
    /**
     * 初始化
     */
    _init() {
        // 创建场景
        this._scene = new THREE.Scene()
        // 创建相机
        const { width, height } = this._size
        this._camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100)
        this._camera.position.set(0, 0, 5)
        // 将相机添加到场景中
        // this._scene.add(this._camera)

        // 创建渲染器
        this._renderer = new THREE.WebGLRenderer({
            canvas: this._options.container,
            // alpha: true,
            antialias: true,// 是否执行抗锯齿
            // transparent: true,
            // logarithmicDepthBuffer: true
        })
        this._resizeRendererToDisplaySize()

        // 环境光
        this._scene.add(new THREE.AmbientLight(0xffffff, 1));

        // 坐标轴辅助对象
        const axesHelper = new THREE.AxesHelper(10)
        this._scene.add(axesHelper)

        // 相机控制器
        this._controls = new CameraControls(this._camera, this._renderer.domElement)
        // this._controls.update()

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
        );
        this._scene.add(mesh);

        const gridHelper = new THREE.GridHelper(50, 50);
        gridHelper.position.y = - 1;
        this._scene.add(gridHelper);

        this._renderer.render(this._scene, this._camera)


        // this._controls.maxDistance = this._EPS;
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
        const delta = this._clock.getDelta();
        // const elapsed = this._clock.getElapsedTime();
        const updated = this._controls.update(delta);

        // if ( elapsed > 30 ) { return; }

        requestAnimationFrame(this._animate.bind(this));

        if (updated) {
            this._renderer.render(this._scene, this._camera);
        }
    }

    moveToEvent() {
        this._controls.moveTo(3, 0, 2, true)
    }

    _initEvent() {
        const raycaster = new THREE.Raycaster()
        const pointer = new THREE.Vector2()

        this._options.container.addEventListener('click', (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

            raycaster.setFromCamera(pointer, this._camera)
            const intersect = raycaster.intersectObjects(this._scene.children)
            let mesh = intersect[0]
            if (mesh.object.type === "GridHelper") {
                let v = mesh.point
                this._controls.moveTo(v.x, v.y, v.z, true)
            }
            console.log(intersect, 'intersect')
        })

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
        this._renderer.render(this._scene, this._camera)
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