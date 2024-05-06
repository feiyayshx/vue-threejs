
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import CameraControls from 'camera-controls'
import { TransformControls } from 'three/addons/controls/TransformControls.js'

CameraControls.install({ THREE: THREE })
export class VRWander {
    /**
     * @desc: 配置项
     */
    _options = {
        // 容器
        container: document.body,
        debugger: true, // 开启调试模式
        maxSize: 10,
        // 相机配置
        cameraOption: {
            position: { x: 0, y: 2, z: 0 },
            lookAt: { x: 2, y: 2, z: 2 },
        },
    }

    _scene = null // 场景
    _camera = null // 相机
    _renderer = null // 渲染器
    _controls = null // 相机控制器
    _gltfLoader = new GLTFLoader() // gltf加载器
    _textLoader = new THREE.TextureLoader()  // 纹理加载
    _transformControls = null  // 变换控制器
    _clock = new THREE.Clock()
    _raycaster = new THREE.Raycaster(); // 光线投射

    /* 默认容器大小 */
    _size = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    // 可点击事件元素
    _eventMesh = []
    _events = {}

    // 相机和视点的距离
    _EPS = 1e-5;
    // 展厅模型
    _hallMesh = null;
    // 展厅地板名称
    _planeName = "plane";

    constructor(options) {
        Object.assign(this._options, options)
        this._size.width = this._options.container.clientWidth
        this._size.height = this._options.container.clientHeight

        this._init()
        if (this._options.debugger) {
            // 变换控制器
            this._initTransformControls()
            // 坐标轴辅助对象
            this._scene.add(new THREE.AxesHelper(100))
            // 网格对象
            const gridHelper = new THREE.GridHelper(50, 50);
            gridHelper.position.y = - 1;
            this._scene.add(gridHelper);
        }
        this._animate()
        this._initEvent()

        window.addEventListener("resize", this._resize.bind(this));
        // this._controls.addEventListener('change', () => {
        //     // 浏览器控制台查看相机位置变化
        //     console.log('camera.position', this._camera.position);
        // });
    }
    /**
     * 初始化
     */
    _init() {
        // 创建场景
        this._scene = new THREE.Scene()

        // 创建相机
        const { width, height } = this._size
        this._camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000)
        this._camera.position.set(10, 10, 10)
        // 将相机添加到场景中
        this._scene.add(this._camera)

        // 创建渲染器
        this._renderer = new THREE.WebGLRenderer({
            canvas: this._options.container,
            antialias: true,// 是否执行抗锯齿
            // alpha: true,
            // transparent: true,
            // logarithmicDepthBuffer: true
        })

        this._resizeRendererToDisplaySize()

        // 环境光
        this._scene.add(new THREE.AmbientLight(0xffffff, 1));
        // 平行光
        const directionLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionLight.position.set(5, 5, 5);
        this._scene.add(directionLight);

        // 相机控制器
        this._controls = new CameraControls(this._camera, this._renderer.domElement);
        // this._controls.maxDistance = this._EPS;
        this._controls.minZoom = 0.5;
        this._controls.maxZoom = 5;
        // this._controls.dragToOffset = false;
        // this._controls.distance = 1;
        // this._controls.dampingFactor = 0.01; // 阻尼运动
        // this._controls.truckSpeed = 0.01; // 拖动速度
        // this._controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
        // this._controls.mouseButtons.right = CameraControls.ACTION.NONE;
        // this._controls.touches.two = CameraControls.ACTION.TOUCH_ZOOM;
        // this._controls.touches.three = CameraControls.ACTION.NONE;

        // 逆向控制
        // this._controls.azimuthRotateSpeed = -0.5; // 方位角旋转速度。
        // this._controls.polarRotateSpeed = -0.5; // 极旋转的速度。
        // this._controls.saveState();
    }
    /**
   * 执行渲染及动画
   */
    _animate() {
        const delta = this._clock.getDelta();
        this._controls.update(delta);
        this._renderer.render(this._scene, this._camera);
        requestAnimationFrame(this._animate.bind(this));
    }
    _initTransformControls() {
        this._transformControls = new TransformControls(this._camera, this._renderer.domElement)
        this._transformControls.setSpace("local"); // 本地坐标
        this._scene.add(this._transformControls)

        this._transformControls.addEventListener('dragging-changed', event => {
            console.log(event, 'dragging')
            // this._camera.enabled = !event.value
        })

        // 鼠标按下, 停止相机控制器
        this._transformControls.addEventListener("mouseDown", () => {
            this._controls.enabled = false;
        });

        // 鼠标放开，恢复相机控制器
        this._transformControls.addEventListener("mouseUp", () => {
            this._controls.enabled = true;
        });

        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 't':
                    this._transformControls.setMode('translate')
                    break;
                case 'r':
                    this._transformControls.setMode('rotate')
                    break;
                case 's':
                    this._transformControls.setMode('scale')
                    break
                case '+':
                    this._transformControls.setSize(this._transformControls.size + 0.1);
                    break;

                case '-':
                case '_':
                    this._transformControls.setSize(Math.max(this._transformControls.size - 0.1, 0.1));
                    break;
                case 'Escape':
                    this._transformControls.reset();
                    break;
            }
        })

        // 变换控制改变时打印位置信息
        this._transformControls.addEventListener("objectChange", () => {
            const { position, scale, rotation } = this._transformControls.object;
            console.log(
                `position:{x:${position.x},y:${position.y},z:${position.z}},scale:{x:${scale.x},y:${scale.y},z:${scale.z}},rotation:{x:${rotation.x},y:${rotation.y},z:${rotation.z}}`
            );
        });
    }

    _initEvent() {
        const pointer = new THREE.Vector2()

        this._options.container.addEventListener('mousedown', (e) => {
            this._events.startPos = { x: e.clientX, y: e.clientY }
        })

        this._options.container.addEventListener('mouseup', (event) => {
            const { x, y } = this._events.startPos
            const diff = 3
            if (Math.abs(event.clientX - x) > diff || Math.abs(event.clientY - y) > diff) return

            console.log(this._options.container.left, 'container')

            pointer.x = (event.clientX / window.innerWidth) * 2 - 1
            pointer.y = - (event.clientY / window.innerHeight) * 2 + 1
            this._raycaster.setFromCamera(pointer, this._camera)
            const intersects = this._raycaster.intersectObjects([...this._eventMesh])
            let mesh = intersects[0]
            console.log(mesh, 'click mesh0')
            if (mesh) {
                const v3 = mesh.point
                if (mesh.object.name === this._planeName) {
                    console.log(v3, '点击了地板')
                    // 点击地板移动
                    this._controls.moveTo(v3.x, v3.y, v3.z, true)
                }
            }
            if (mesh?.object.originData) {
                console.log(mesh, '点击了画板')
                this._transformControls.attach(mesh.object)

            }
            // if (mesh?.object.type === 'GridHelper') {
            //     const v3 = mesh.point
            //     this._controls.moveTo(v3.x, v3.y, v3.z, true)
            // }

        })

    }

    /**
     * @desc gltf加载器
     * @param {*} params 
     * @returns 
     */
    loadGLTF(params) {
        const { url, onProgress } = params;
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
        const { url, position, scale, onProgress } = params
        const gltf = await this.loadGLTF({ url, onProgress })
        if (position) {
            gltf.scene.position.set(position.x, position.y, position.z)
        }
        if (scale) {
            gltf.scene.scale.set(scale, scale, scale)
        }
        console.log(gltf.scene, 'gltf.scene')
        gltf.scene.traverse((child) => {
            console.log(child, 'child')
            // if (child.isMesh && child.name === 'meishu15') {
            //     this._textLoader.load('/models/images/wall.jpg', (texture) => {
            //         console.log(texture, 'texture')
            //         // child.material.color.set(0xffffff);
            //         // child.material.map = texture;

            //         // child.material = new THREE.MeshBasicMaterial({
            //         //     color: 0xffffff,
            //         //     envMap: texture,
            //         //     depthFunc: 3,
            //         //     reflectivity: 0,
            //         // })
            //         // child.material.needsUpdate = true;
            //     })
            // }
        })
        this._scene.add(gltf.scene)
        this._eventMesh.push(gltf.scene)
        return gltf
    }

    loadImages(items) {
        const { maxSize } = this._options
        items.forEach(async (item) => {
            let texture = await this._textLoader.loadAsync(item.url)
            if (texture.image.width > maxSize) {
                item.width = maxSize;
                item.height = (maxSize / texture.image.width) * texture.image.height;
            } else {
                item.height = maxSize;
                item.width = (maxSize / texture.image.height) * texture.image.width;
            }

            const geometry = new THREE.BoxGeometry(item.width, item.height, 0.05)
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
            let materialTexture = new THREE.MeshBasicMaterial({ map: texture })
            const mesh = new THREE.Mesh(geometry, [material, material, material, material, materialTexture, material])
            mesh.name = item.name;
            // mesh.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
            mesh.scale.set(item.scale.x, item.scale.y, item.scale.z);
            mesh.position.set(item.position.x, item.position.y, item.position.z);
            mesh.originData = item
            this._scene.add(mesh)
            this._eventMesh.push(mesh)
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