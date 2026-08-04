/**
 * 3d-visualizer.js - 3D可视化模块
 * 使用Three.js创建3D场景，将Python代码输出映射为3D模型
 * 支持：基本几何体、参数化曲线、建筑结构、数学曲面
 */

const Visualizer3D = {
    // ============================================================
    // Three.js 对象
    // ============================================================
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    container: null,
    animationId: null,
    autoRotate: false,

    // 当前场景中的模型
    currentModels: [],
    // 当前参数
    currentParams: {},
    // 参数滑块配置
    paramSliders: [],

    // Three.js CDN
    THREE_CDN: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js',
    ORBIT_CDN: 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/controls/OrbitControls.js',

    // 是否已加载Three.js
    threeLoaded: false,

    // ============================================================
    // 初始化
    // ============================================================

    /**
     * 初始化3D可视化
     * @param {string} containerId - 容器元素ID
     * @param {Object} demoConfig - 3D演示配置
     */
    async init(containerId = 'threejs-container', demoConfig = null) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn('[Visualizer3D] 容器元素不存在:', containerId);
            return;
        }

        // 加载Three.js
        if (!this.threeLoaded) {
            await this.loadThreeJS();
        }

        // 清除旧场景
        this.dispose();

        // 创建场景
        this.createScene();

        // 创建相机
        this.createCamera();

        // 创建渲染器
        this.createRenderer();

        // 创建控制器
        this.createControls();

        // 添加灯光
        this.addLights();

        // 添加辅助网格
        this.addGridHelper();

        // 如果有演示配置，创建对应模型
        if (demoConfig) {
            this.createModelFromConfig(demoConfig);
        } else {
            // 默认显示一个示例模型
            this.createDefaultModel();
        }

        // 开始动画循环
        this.animate();

        // 创建参数滑块
        this.createParameterSliders(demoConfig);

        console.log('[Visualizer3D] 3D可视化初始化完成');
    },

    /**
     * 动态加载Three.js
     */
    async loadThreeJS() {
        return new Promise((resolve, reject) => {
            if (window.THREE) {
                this.threeLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = this.THREE_CDN;
            script.async = true;

            script.onload = () => {
                console.log('[Visualizer3D] Three.js加载完成');
                this.threeLoaded = true;

                // 加载OrbitControls
                const orbitScript = document.createElement('script');
                orbitScript.src = this.ORBIT_CDN;
                orbitScript.onload = () => {
                    console.log('[Visualizer3D] OrbitControls加载完成');
                    resolve();
                };
                orbitScript.onerror = () => {
                    console.warn('[Visualizer3D] OrbitControls加载失败，使用简单控制器');
                    resolve();
                };
                document.head.appendChild(orbitScript);
            };

            script.onerror = () => {
                reject(new Error('无法加载Three.js'));
            };

            document.head.appendChild(script);
        });
    },

    // ============================================================
    // 场景创建
    // ============================================================

    /**
     * 创建场景
     */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f5);
        this.scene.fog = new THREE.Fog(0xf0f0f5, 20, 60);
    },

    /**
     * 创建相机
     */
    createCamera() {
        const width = this.container.clientWidth || 600;
        const height = this.container.clientHeight || 400;

        this.camera = new THREE.PerspectiveCamera(
            60,           // 视角
            width / height, // 宽高比
            0.1,          // 近裁面
            1000          // 远裁面
        );

        // 设置相机位置
        this.camera.position.set(8, 8, 12);
        this.camera.lookAt(0, 0, 0);
    },

    /**
     * 创建渲染器
     */
    createRenderer() {
        const width = this.container.clientWidth || 600;
        const height = this.container.clientHeight || 400;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true // 用于截图
        });

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 清空容器并添加渲染器
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
    },

    /**
     * 创建控制器
     */
    createControls() {
        if (window.THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(
                this.camera,
                this.renderer.domElement
            );

            // 启用阻尼（惯性）
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;

            // 旋转速度
            this.controls.rotateSpeed = 0.5;

            // 缩放
            this.controls.enableZoom = true;
            this.controls.zoomSpeed = 0.8;

            // 平移
            this.controls.enablePan = true;

            // 最小/最大距离
            this.controls.minDistance = 3;
            this.controls.maxDistance = 50;
        }
    },

    /**
     * 添加灯光
     */
    addLights() {
        // 环境光
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        // 主光源（平行光）
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(10, 15, 10);
        directional.castShadow = true;

        // 阴影设置
        directional.shadow.mapSize.width = 2048;
        directional.shadow.mapSize.height = 2048;
        directional.shadow.camera.near = 0.5;
        directional.shadow.camera.far = 50;
        directional.shadow.camera.left = -15;
        directional.shadow.camera.right = 15;
        directional.shadow.camera.top = 15;
        directional.shadow.camera.bottom = -15;

        this.scene.add(directional);

        // 辅助光源
        const helper = new THREE.DirectionalLight(0xffffff, 0.3);
        helper.position.set(-10, 10, -10);
        this.scene.add(helper);

        // 点光源（增加立体感）
        const point = new THREE.PointLight(0x4488ff, 0.5, 30);
        point.position.set(0, 10, 0);
        this.scene.add(point);
    },

    /**
     * 添加网格辅助
     */
    addGridHelper() {
        // 地面网格
        const grid = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
        grid.position.y = 0;
        this.scene.add(grid);

        // 地面平面（接收阴影）
        const planeGeo = new THREE.PlaneGeometry(20, 20);
        const planeMat = new THREE.MeshStandardMaterial({
            color: 0xe0e0e0,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.01;
        plane.receiveShadow = true;
        this.scene.add(plane);

        // 坐标轴
        const axes = new THREE.AxesHelper(5);
        this.scene.add(axes);
    },

    // ============================================================
    // 模型创建
    // ============================================================

    /**
     * 默认模型
     */
    createDefaultModel() {
        this.createCube({ size: 2, color: 0x4488ff });
    },

    /**
     * 从配置创建模型
     */
    createModelFromConfig(config) {
        this.clearModels();

        if (!config || !config.type) {
            this.createDefaultModel();
            return;
        }

        switch (config.type) {
            case 'cube':
            case 'box':
                this.createCube(config.params || {});
                break;
            case 'sphere':
                this.createSphere(config.params || {});
                break;
            case 'cylinder':
                this.createCylinder(config.params || {});
                break;
            case 'cone':
                this.createCone(config.params || {});
                break;
            case 'torus':
                this.createTorus(config.params || {});
                break;
            case 'sine_wave':
                this.createSineWave(config.params || {});
                break;
            case 'helix':
                this.createHelix(config.params || {});
                break;
            case 'rose':
                this.createRoseCurve(config.params || {});
                break;
            case 'surface':
                this.createSurface(config.params || {});
                break;
            case 'building':
            case 'assembly':
                this.createBuilding(config.params || {});
                break;
            case 'pen_holder':
                this.createPenHolder(config.params || {});
                break;
            case 'bracket':
                this.createBracket(config.params || {});
                break;
            default:
                this.createDefaultModel();
        }
    },

    /**
     * 创建立方体
     */
    createCube(params = {}) {
        const size = params.size || 2;
        const color = this.parseColor(params.color) || 0x4488ff;
        const x = params.x || 0;
        const y = params.y || size / 2;
        const z = params.z || 0;

        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.4,
            metalness: 0.3
        });

        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);
        cube.castShadow = true;
        cube.receiveShadow = true;

        this.addModel(cube, '立方体');
        return cube;
    },

    /**
     * 创建球体
     */
    createSphere(params = {}) {
        const radius = Math.max(0.1, params.radius || params.size || 1.5);
        const color = this.parseColor(params.color) || 0xff8844;
        const x = params.x || 0;
        const y = params.y || radius;
        const z = params.z || 0;

        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.5
        });

        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        sphere.castShadow = true;
        sphere.receiveShadow = true;

        this.addModel(sphere, '球体');
        return sphere;
    },

    /**
     * 创建圆柱体
     */
    createCylinder(params = {}) {
        const radius = Math.max(0.1, params.radius || 1);
        const height = Math.max(0.1, params.height || 3);
        const color = this.parseColor(params.color) || 0x44ff88;
        const x = params.x || 0;
        const y = params.y || height / 2;
        const z = params.z || 0;

        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.2
        });

        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(x, y, z);
        cylinder.castShadow = true;
        cylinder.receiveShadow = true;

        this.addModel(cylinder, '圆柱体');
        return cylinder;
    },

    /**
     * 创建圆锥体
     */
    createCone(params = {}) {
        const radius = Math.max(0.1, params.radius || 1.5);
        const height = Math.max(0.1, params.height || 3);
        const color = this.parseColor(params.color) || 0xff44aa;
        const x = params.x || 0;
        const y = params.y || height / 2;
        const z = params.z || 0;

        const geometry = new THREE.ConeGeometry(radius, height, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.4,
            metalness: 0.3
        });

        const cone = new THREE.Mesh(geometry, material);
        cone.position.set(x, y, z);
        cone.castShadow = true;
        cone.receiveShadow = true;

        this.addModel(cone, '圆锥体');
        return cone;
    },

    /**
     * 创建圆环
     */
    createTorus(params = {}) {
        const radius = Math.max(0.1, params.radius || 2);
        const tube = Math.max(0.05, params.tube || 0.4);
        const color = this.parseColor(params.color) || 0xffaa44;
        const x = params.x || 0;
        const y = params.y || radius;
        const z = params.z || 0;

        const geometry = new THREE.TorusGeometry(radius, tube, 16, 100);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.6
        });

        const torus = new THREE.Mesh(geometry, material);
        torus.position.set(x, y, z);
        torus.castShadow = true;
        torus.receiveShadow = true;

        this.addModel(torus, '圆环');
        return torus;
    },

    /**
     * 创建正弦波曲线
     */
    createSineWave(params = {}) {
        const amplitude = params.amplitude || 1;
        const frequency = params.frequency || 1;
        const length = params.length || 10;
        const color = this.parseColor(params.color) || 0x4488ff;

        const points = [];
        const segments = 200;

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * length - length / 2;
            const y = amplitude * Math.sin(frequency * t);
            points.push(new THREE.Vector3(t, y, 0));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: color,
            linewidth: 3
        });

        const wave = new THREE.Line(geometry, material);
        wave.position.y = 2;

        this.addModel(wave, '正弦波');

        // 同时创建管道版本（更立体）
        const tubeGeo = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points),
            100,
            0.08,
            16,
            false
        );
        const tubeMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.5
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.position.y = 2;
        tube.castShadow = true;
        this.addModel(tube, '正弦波(管)');

        return wave;
    },

    /**
     * 创建螺旋线
     */
    createHelix(params = {}) {
        const radius = Math.max(0.1, params.radius || 2);
        const height = Math.max(0.1, params.height || 5);
        const turns = Math.max(1, params.turns || 3);
        const color = this.parseColor(params.color) || 0xff44ff;

        const points = [];
        const segments = 300;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const angle = t * turns * Math.PI * 2;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            const y = t * height;
            points.push(new THREE.Vector3(x, y, z));
        }

        // 创建管道
        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 100, 0.1, 16, false);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.6
        });

        const helix = new THREE.Mesh(geometry, material);
        helix.castShadow = true;
        helix.receiveShadow = true;

        this.addModel(helix, '螺旋线');
        return helix;
    },

    /**
     * 创建玫瑰线
     */
    createRoseCurve(params = {}) {
        const n = params.n || 5;
        const d = params.d || 1;
        const radius = params.radius || 3;
        const color = this.parseColor(params.color) || 0xff3366;

        const points = [];
        const segments = 500;

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2 * d;
            const r = radius * Math.cos(n * theta / d);
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            points.push(new THREE.Vector3(x, 1, z));
        }

        const curve = new THREE.CatmullRomCurve3(points, true);
        const geometry = new THREE.TubeGeometry(curve, 200, 0.08, 16, true);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.5
        });

        const rose = new THREE.Mesh(geometry, material);
        rose.castShadow = true;
        rose.receiveShadow = true;

        this.addModel(rose, '玫瑰线');
        return rose;
    },

    /**
     * 创建数学曲面 z=f(x,y)
     */
    createSurface(params = {}) {
        const funcType = params.func || 'saddle';
        const range = params.range || 5;
        const resolution = params.resolution || 40;
        const color = this.parseColor(params.color) || 0x44aaff;

        const geometry = new THREE.PlaneGeometry(range * 2, range * 2, resolution, resolution);
        const vertices = geometry.attributes.position;

        for (let i = 0; i < vertices.count; i++) {
            const x = vertices.getX(i);
            const y = vertices.getY(i);
            let z = 0;

            switch (funcType) {
                case 'saddle':
                    z = (x * x - y * y) / 4;
                    break;
                case 'peak':
                    z = Math.exp(-(x * x + y * y) / 4) * 3;
                    break;
                case 'wave':
                    z = Math.sin(x) * Math.cos(y);
                    break;
                case 'ripple':
                    const r = Math.sqrt(x * x + y * y);
                    z = Math.sin(r * 2) / (r + 0.5);
                    break;
                case 'gaussian':
                    z = Math.exp(-(x * x + y * y) / 8) * 4;
                    break;
                default:
                    z = Math.sin(x) * Math.cos(y);
            }

            vertices.setZ(i, z);
        }

        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.2,
            side: THREE.DoubleSide,
            wireframe: params.wireframe || false
        });

        const surface = new THREE.Mesh(geometry, material);
        surface.rotation.x = -Math.PI / 2;
        surface.position.y = 3;
        surface.castShadow = true;
        surface.receiveShadow = true;

        this.addModel(surface, '数学曲面');
        return surface;
    },

    /**
     * 创建建筑结构（类似笔筒）
     */
    createPenHolder(params = {}) {
        const radius = Math.max(0.5, params.radius || 2);
        const height = Math.max(0.5, params.height || 4);
        const color = this.parseColor(params.color) || 0x8B4513;

        // 笔筒主体（空心圆柱）
        const outerGeo = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
        const innerGeo = new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, height, 32, 1, true);
        const bottomGeo = new THREE.CylinderGeometry(radius, radius, 0.2, 32);

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        const outer = new THREE.Mesh(outerGeo, material);
        outer.position.y = height / 2;
        outer.castShadow = true;
        outer.receiveShadow = true;
        this.addModel(outer, '笔筒外壁');

        const inner = new THREE.Mesh(innerGeo, material);
        inner.position.y = height / 2;
        this.addModel(inner, '笔筒内壁');

        const bottom = new THREE.Mesh(bottomGeo, material);
        bottom.position.y = 0.1;
        bottom.castShadow = true;
        this.addModel(bottom, '笔筒底部');

        // 添加几支笔
        const penColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const penGeo = new THREE.CylinderGeometry(0.1, 0.1, height * 0.9, 8);
            const penMat = new THREE.MeshStandardMaterial({
                color: penColors[i],
                roughness: 0.5
            });
            const pen = new THREE.Mesh(penGeo, penMat);
            pen.position.set(
                Math.cos(angle) * radius * 0.5,
                height * 0.55,
                Math.sin(angle) * radius * 0.5
            );
            pen.castShadow = true;
            this.addModel(pen, `笔${i + 1}`);
        }
    },

    /**
     * 创建支架结构
     */
    createBracket(params = {}) {
        const width = params.width || 4;
        const height = params.height || 3;
        const thickness = params.thickness || 0.3;
        const color = this.parseColor(params.color) || 0x666666;

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.6,
            metalness: 0.4
        });

        // 底座
        const baseGeo = new THREE.BoxGeometry(width, thickness, width * 0.6);
        const base = new THREE.Mesh(baseGeo, material);
        base.position.y = thickness / 2;
        base.castShadow = true;
        base.receiveShadow = true;
        this.addModel(base, '底座');

        // 左立柱
        const leftPostGeo = new THREE.BoxGeometry(thickness, height, thickness);
        const leftPost = new THREE.Mesh(leftPostGeo, material);
        leftPost.position.set(-width / 2 + thickness / 2, height / 2 + thickness / 2, 0);
        leftPost.castShadow = true;
        this.addModel(leftPost, '左立柱');

        // 右立柱
        const rightPostGeo = new THREE.BoxGeometry(thickness, height, thickness);
        const rightPost = new THREE.Mesh(rightPostGeo, material);
        rightPost.position.set(width / 2 - thickness / 2, height / 2 + thickness / 2, 0);
        rightPost.castShadow = true;
        this.addModel(rightPost, '右立柱');

        // 横梁
        const beamGeo = new THREE.BoxGeometry(width, thickness, thickness);
        const beam = new THREE.Mesh(beamGeo, material);
        beam.position.set(0, height + thickness / 2, 0);
        beam.castShadow = true;
        this.addModel(beam, '横梁');

        // 斜撑（左）
        const supportGeo = new THREE.BoxGeometry(width * 0.4, thickness * 0.8, thickness * 0.8);
        const supportLeft = new THREE.Mesh(supportGeo, material);
        supportLeft.position.set(-width * 0.25, height * 0.5, 0);
        supportLeft.rotation.z = Math.PI / 4;
        supportLeft.castShadow = true;
        this.addModel(supportLeft, '左斜撑');

        const supportRight = new THREE.Mesh(supportGeo, material);
        supportRight.position.set(width * 0.25, height * 0.5, 0);
        supportRight.rotation.z = -Math.PI / 4;
        supportRight.castShadow = true;
        this.addModel(supportRight, '右斜撑');
    },

    /**
     * 创建组合建筑
     */
    createBuilding(params = {}) {
        const floors = params.floors || 3;
        const width = params.width || 4;
        const floorHeight = params.floorHeight || 1.5;
        const color = this.parseColor(params.color) || 0x88aacc;

        for (let i = 0; i < floors; i++) {
            const w = width - i * 0.3;
            const geometry = new THREE.BoxGeometry(w, floorHeight, w);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.5,
                metalness: 0.3
            });
            const floor = new THREE.Mesh(geometry, material);
            floor.position.y = i * floorHeight + floorHeight / 2;
            floor.castShadow = true;
            floor.receiveShadow = true;
            this.addModel(floor, `第${i + 1}层`);

            // 添加窗户（简单的发光面）
            const windowGeo = new THREE.PlaneGeometry(w * 0.6, floorHeight * 0.6);
            const windowMat = new THREE.MeshStandardMaterial({
                color: 0xffff88,
                emissive: 0xffff00,
                emissiveIntensity: 0.3
            });
            const window1 = new THREE.Mesh(windowGeo, windowMat);
            window1.position.set(0, i * floorHeight + floorHeight / 2, w / 2 + 0.01);
            this.addModel(window1, `窗户${i + 1}-1`);

            const window2 = new THREE.Mesh(windowGeo, windowMat);
            window2.position.set(0, i * floorHeight + floorHeight / 2, -w / 2 - 0.01);
            window2.rotation.y = Math.PI;
            this.addModel(window2, `窗户${i + 1}-2`);
        }
    },

    // ============================================================
    // 模型管理
    // ============================================================

    /**
     * 添加模型到场景
     */
    addModel(mesh, name = '') {
        if (this.scene) {
            mesh.name = name;
            this.scene.add(mesh);
            this.currentModels.push({ mesh, name });
        }
    },

    /**
     * 清除所有模型
     */
    clearModels() {
        this.currentModels.forEach(({ mesh }) => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
            if (this.scene) {
                this.scene.remove(mesh);
            }
        });
        this.currentModels = [];
    },

    /**
     * 释放资源
     */
    dispose() {
        this.clearModels();

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
            this.renderer = null;
        }

        this.scene = null;
        this.camera = null;
        this.controls = null;
    },

    // ============================================================
    // 动画循环
    // ============================================================

    /**
     * 动画循环
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (this.controls) {
            this.controls.update();
        }

        // 自动旋转
        if (this.autoRotate && this.currentModels.length > 0) {
            this.currentModels.forEach(({ mesh }) => {
                mesh.rotation.y += 0.005;
            });
        }

        // 渲染
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    },

    // ============================================================
    // 交互控制
    // ============================================================

    /**
     * 切换自动旋转
     */
    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
        if (typeof showToast === 'function') {
            showToast(this.autoRotate ? '自动旋转已开启' : '自动旋转已关闭', 'info');
        }
    },

    /**
     * 重置视角
     */
    resetView() {
        if (this.camera) {
            this.camera.position.set(8, 8, 12);
            this.camera.lookAt(0, 0, 0);
        }
        if (this.controls) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
    },

    /**
     * 响应窗口大小变化
     */
    onResize() {
        if (!this.container || !this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    /**
     * 截图
     */
    takeScreenshot() {
        if (!this.renderer) return;

        // 确保渲染最新画面
        this.renderer.render(this.scene, this.camera);

        // 获取截图数据
        const dataURL = this.renderer.domElement.toDataURL('image/png');

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `3d_screenshot_${Date.now()}.png`;
        link.href = dataURL;
        link.click();

        if (typeof showToast === 'function') {
            showToast('截图已保存', 'success');
        }

        // 评价系统记录
        if (typeof EvaluationSystem !== 'undefined') {
            EvaluationSystem.recordAction('parameter_changed');
        }
    },

    // ============================================================
    // 参数滑块
    // ============================================================

    /**
     * 创建参数滑块
     */
    createParameterSliders(config) {
        const container = document.getElementById('parameter-sliders');
        if (!container) return;

        container.innerHTML = '';

        if (!config || !config.parameters) {
            return;
        }

        this.paramSliders = config.parameters;

        this.paramSliders.forEach(param => {
            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'param-slider-wrapper';

            sliderWrapper.innerHTML = `
                <label class="param-label">
                    ${param.label || param.name}:
                    <span class="param-value" id="param-value-${param.name}">${param.default}</span>
                </label>
                <input
                    type="range"
                    class="param-slider"
                    min="${param.min}"
                    max="${param.max}"
                    step="${param.step || 0.1}"
                    value="${param.default}"
                    id="param-slider-${param.name}"
                    oninput="Visualizer3D.onParameterChange('${param.name}', this.value)"
                />
            `;

            container.appendChild(sliderWrapper);

            // 保存当前参数值
            this.currentParams[param.name] = param.default;
        });
    },

    /**
     * 参数变化回调
     */
    onParameterChange(paramName, value) {
        this.currentParams[paramName] = parseFloat(value);

        // 更新显示
        const valueEl = document.getElementById(`param-value-${paramName}`);
        if (valueEl) {
            valueEl.textContent = parseFloat(value).toFixed(2);
        }

        // 重新生成模型
        this.updateModelWithParams();

        // 评价系统记录
        if (typeof EvaluationSystem !== 'undefined') {
            EvaluationSystem.recordAction('parameter_changed');
        }
    },

    /**
     * 用新参数更新模型
     */
    updateModelWithParams() {
        if (this.paramSliders.length === 0) return;

        // 清除旧模型
        this.clearModels();

        // 用新参数创建模型
        const params = { ...this.currentParams };

        // 根据当前模型类型重新创建
        // 这里简化处理，实际应根据课时配置决定
        if (params.size !== undefined) {
            this.createCube(params);
        } else if (params.radius !== undefined && params.height !== undefined) {
            this.createCylinder(params);
        } else if (params.radius !== undefined) {
            this.createSphere(params);
        }
    },

    // ============================================================
    // Python代码输出解析
    // ============================================================

    /**
     * 解析Python输出并可视化
     */
    parseAndVisualize(output, code = '') {
        if (!output) {
            if (typeof showToast === 'function') {
                showToast('没有可可视化的输出', 'warning');
            }
            return;
        }

        // 尝试解析3D参数
        let params = {};

        // 方法1：解析特殊标记的3D参数
        if (output.includes('___3D_PARAMS___')) {
            const match = output.match(/___3D_PARAMS___\n([\s\S]*?)\n___END_3D_PARAMS___/);
            if (match) {
                try {
                    params = JSON.parse(match[1]);
                } catch (e) {
                    console.warn('[Visualizer3D] 解析3D参数失败:', e);
                }
            }
        }

        // 方法2：解析JSON格式输出
        if (Object.keys(params).length === 0) {
            try {
                params = JSON.parse(output);
            } catch (e) {
                // 不是JSON，尝试其他解析方式
            }
        }

        // 方法3：从代码中分析模型类型
        const modelType = this.detectModelType(code, params);

        // 创建模型
        if (modelType) {
            this.createModelFromConfig({
                type: modelType,
                params: params
            });
        } else if (Object.keys(params).length > 0) {
            // 有参数但没有确定类型，根据参数推断
            this.createModelFromParams(params);
        } else {
            if (typeof showToast === 'function') {
                showToast('无法从代码输出中识别3D模型，请确保代码定义了相关参数', 'info');
            }
        }
    },

    /**
     * 从代码检测模型类型
     */
    detectModelType(code, params) {
        const codeLower = code.toLowerCase();

        if (codeLower.includes('cube') || codeLower.includes('box') || codeLower.includes('立方体')) {
            return 'cube';
        }
        if (codeLower.includes('sphere') || codeLower.includes('球')) {
            return 'sphere';
        }
        if (codeLower.includes('cylinder') || codeLower.includes('圆柱')) {
            return 'cylinder';
        }
        if (codeLower.includes('cone') || codeLower.includes('圆锥')) {
            return 'cone';
        }
        if (codeLower.includes('torus') || codeLower.includes('圆环') || codeLower.includes('甜甜圈')) {
            return 'torus';
        }
        if (codeLower.includes('sine') || codeLower.includes('正弦')) {
            return 'sine_wave';
        }
        if (codeLower.includes('helix') || codeLower.includes('螺旋')) {
            return 'helix';
        }
        if (codeLower.includes('rose') || codeLower.includes('玫瑰')) {
            return 'rose';
        }
        if (codeLower.includes('surface') || codeLower.includes('曲面')) {
            return 'surface';
        }
        if (codeLower.includes('pen_holder') || codeLower.includes('笔筒')) {
            return 'pen_holder';
        }
        if (codeLower.includes('bracket') || codeLower.includes('支架')) {
            return 'bracket';
        }
        if (codeLower.includes('building') || codeLower.includes('建筑')) {
            return 'building';
        }

        return null;
    },

    /**
     * 根据参数创建模型
     */
    createModelFromParams(params) {
        this.clearModels();

        // 根据参数推断模型类型
        if (params.radius !== undefined && params.height !== undefined) {
            // 有半径和高度 -> 圆柱
            this.createCylinder(params);
        } else if (params.size !== undefined) {
            // 有size -> 立方体
            this.createCube(params);
        } else if (params.radius !== undefined) {
            // 只有半径 -> 球体
            this.createSphere(params);
        } else if (params.amplitude !== undefined) {
            // 有振幅 -> 正弦波
            this.createSineWave(params);
        } else {
            // 默认：创建立方体
            this.createCube(params);
        }
    },

    // ============================================================
    // 工具函数
    // ============================================================

    /**
     * 解析颜色
     */
    parseColor(color) {
        if (!color) return null;

        if (typeof color === 'number') {
            return color;
        }

        if (typeof color === 'string') {
            // 常见颜色名
            const colorMap = {
                'red': 0xff0000,
                'green': 0x00ff00,
                'blue': 0x0000ff,
                'yellow': 0xffff00,
                'cyan': 0x00ffff,
                'magenta': 0xff00ff,
                'white': 0xffffff,
                'black': 0x000000,
                'orange': 0xff8800,
                'purple': 0x8800ff,
                'pink': 0xffaaaa,
                'brown': 0x8B4513,
                'gray': 0x808080,
                'grey': 0x808080,
                '红色': 0xff0000,
                '绿色': 0x00ff00,
                '蓝色': 0x0000ff,
                '黄色': 0xffff00,
                '青色': 0x00ffff,
                '紫色': 0x8800ff,
                '粉色': 0xffaaaa,
                '白色': 0xffffff,
                '黑色': 0x000000,
                '橙色': 0xff8800,
                '棕色': 0x8B4513,
                '灰色': 0x808080
            };

            const lower = color.toLowerCase();
            if (colorMap[lower] !== undefined) {
                return colorMap[lower];
            }

            // 十六进制颜色
            if (color.startsWith('#')) {
                return parseInt(color.substring(1), 16);
            }

            // 尝试直接解析
            try {
                return parseInt(color, 16);
            } catch (e) {
                return null;
            }
        }

        return null;
    },

    /**
     * 获取场景信息
     */
    getSceneInfo() {
        return {
            modelCount: this.currentModels.length,
            models: this.currentModels.map(m => m.name),
            autoRotate: this.autoRotate,
            cameraPosition: this.camera ? {
                x: this.camera.position.x,
                y: this.camera.position.y,
                z: this.camera.position.z
            } : null
        };
    }
};

// ============================================================
// 导出模块
// ============================================================
window.Visualizer3D = Visualizer3D;
