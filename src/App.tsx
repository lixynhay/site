import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  generateSunTexture,
  generateMercuryTexture,
  generateVenusTexture,
  generateEarthTexture,
  generateMarsTexture,
  generateJupiterTexture,
  generateSaturnTexture,
  generateSaturnRingTexture,
  generateUranusTexture,
  generateNeptuneTexture,
  generateNebulaTexture,
  generateBumpMap,
  generateColoredNebulaTexture,
  generateGalaxyTexture,
} from './textures';
import {
  sunCoronaVertexShader,
  sunCoronaFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
  sunSurfaceVertexShader,
  sunSurfaceFragmentShader,
  auroraVertexShader,
  auroraFragmentShader,
  marsDustVertexShader,
  marsDustFragmentShader,
  cmeVertexShader,
  cmeFragmentShader,
} from './shaders';

interface MoonData {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color: string;
}

interface PlanetData {
  name: string;
  nameRu: string;
  radius: number;
  distance: number;
  realDiameter: number;
  realDistance: number;
  orbitalPeriod: number;
  speed: number;
  rotationSpeed: number;
  tilt: number;
  orbitalTilt: number;
  hasAtmosphere: boolean;
  atmosphereColor: string;
  description: string;
  temperature: string;
  moons: number;
  type: string;
  gravity: string;
  dayLength: string;
  moonData?: MoonData[];
}

const planets: PlanetData[] = [
  {
    name: 'Mercury', nameRu: 'Меркурий', radius: 0.5, distance: 12,
    realDiameter: 4879, realDistance: 57.9, orbitalPeriod: 88, speed: 4.15,
    rotationSpeed: 0.005, tilt: 0.03, orbitalTilt: 0.12, hasAtmosphere: false, atmosphereColor: '#b5b5b5',
    description: 'Самая маленькая планета. Поверхность покрыта кратерами, похожа на Луну. Нет атмосферы и спутников.',
    temperature: '-180°C до +430°C', moons: 0, type: 'Скалистая', gravity: '3.7 м/с²', dayLength: '59 дней',
  },
  {
    name: 'Venus', nameRu: 'Венера', radius: 1.1, distance: 18,
    realDiameter: 12104, realDistance: 108.2, orbitalPeriod: 225, speed: 1.62,
    rotationSpeed: -0.002, tilt: 2.64, orbitalTilt: 0.06, hasAtmosphere: true, atmosphereColor: '#e8cda0',
    description: 'Самая горячая планета из-за парникового эффекта. Плотная атмосфера из CO₂ создаёт давление в 90 раз выше земного.',
    temperature: '+462°C', moons: 0, type: 'Скалистая', gravity: '8.87 м/с²', dayLength: '243 дня',
  },
  {
    name: 'Earth', nameRu: 'Земля', radius: 1.2, distance: 25,
    realDiameter: 12756, realDistance: 149.6, orbitalPeriod: 365, speed: 1.0,
    rotationSpeed: 0.02, tilt: 0.41, orbitalTilt: 0.0, hasAtmosphere: true, atmosphereColor: '#4da6ff',
    description: 'Единственная известная планета с жизнью. 71% поверхности покрыт водой. Магнитное поле защищает от солнечного ветра.',
    temperature: '-89°C до +57°C', moons: 1, type: 'Скалистая', gravity: '9.81 м/с²', dayLength: '24 часа',
    moonData: [
      { name: 'Луна', radius: 0.3, distance: 2.5, speed: 2.5, color: '#cccccc' }
    ]
  },
  {
    name: 'Mars', nameRu: 'Марс', radius: 0.8, distance: 33,
    realDiameter: 6792, realDistance: 227.9, orbitalPeriod: 687, speed: 0.53,
    rotationSpeed: 0.018, tilt: 0.44, orbitalTilt: 0.03, hasAtmosphere: true, atmosphereColor: '#e85d3a',
    description: 'Красная планета. Здесь находится гора Олимп — высочайший вулкан в Солнечной системе (21.9 км).',
    temperature: '-140°C до +20°C', moons: 2, type: 'Скалистая', gravity: '3.72 м/с²', dayLength: '24.6 часа',
    moonData: [
      { name: 'Фобос', radius: 0.1, distance: 1.5, speed: 4.0, color: '#888888' },
      { name: 'Деймос', radius: 0.08, distance: 2.0, speed: 2.5, color: '#999999' }
    ]
  },
  {
    name: 'Jupiter', nameRu: 'Юпитер', radius: 3.5, distance: 50,
    realDiameter: 142984, realDistance: 778.5, orbitalPeriod: 4333, speed: 0.084,
    rotationSpeed: 0.04, tilt: 0.05, orbitalTilt: 0.02, hasAtmosphere: true, atmosphereColor: '#e8a952',
    description: 'Крупнейшая планета. Большое Красное Пятно — гигантский шторм, бушующий более 350 лет. Мощнейшее магнитное поле.',
    temperature: '-110°C', moons: 95, type: 'Газовый гигант', gravity: '24.79 м/с²', dayLength: '9.9 часа',
    moonData: [
      { name: 'Ио', radius: 0.25, distance: 5.0, speed: 3.0, color: '#ffcc00' },
      { name: 'Европа', radius: 0.22, distance: 6.0, speed: 2.2, color: '#ddddff' },
      { name: 'Ганимед', radius: 0.35, distance: 7.5, speed: 1.5, color: '#aaaaaa' },
      { name: 'Каллисто', radius: 0.3, distance: 9.0, speed: 1.0, color: '#888888' }
    ]
  },
  {
    name: 'Saturn', nameRu: 'Сатурн', radius: 3.0, distance: 70,
    realDiameter: 120536, realDistance: 1434, orbitalPeriod: 10759, speed: 0.034,
    rotationSpeed: 0.038, tilt: 0.47, orbitalTilt: 0.04, hasAtmosphere: true, atmosphereColor: '#f0d68a',
    description: 'Знаменит кольцами из льда и камней шириной 282 000 км, но толщиной всего 10 метров. Плотность меньше воды.',
    temperature: '-178°C', moons: 146, type: 'Газовый гигант', gravity: '10.44 м/с²', dayLength: '10.7 часа',
    moonData: [
      { name: 'Титан', radius: 0.4, distance: 6.5, speed: 1.2, color: '#ffaa44' },
      { name: 'Рея', radius: 0.15, distance: 5.0, speed: 2.0, color: '#cccccc' }
    ]
  },
  {
    name: 'Uranus', nameRu: 'Уран', radius: 2.0, distance: 90,
    realDiameter: 51118, realDistance: 2871, orbitalPeriod: 30687, speed: 0.012,
    rotationSpeed: 0.03, tilt: 1.71, orbitalTilt: 0.01, hasAtmosphere: true, atmosphereColor: '#7de8e8',
    description: 'Ледяной гигант с уникальным наклоном оси 98° — вращается «лёжа на боку». Атмосфера содержит метан, придающий голубой цвет.',
    temperature: '-224°C', moons: 27, type: 'Ледяной гигант', gravity: '8.87 м/с²', dayLength: '17.2 часа',
    moonData: [
      { name: 'Титания', radius: 0.2, distance: 4.0, speed: 1.5, color: '#bbbbbb' },
      { name: 'Оберон', radius: 0.18, distance: 5.0, speed: 1.2, color: '#aaaaaa' }
    ]
  },
  {
    name: 'Neptune', nameRu: 'Нептун', radius: 1.9, distance: 110,
    realDiameter: 49528, realDistance: 4495, orbitalPeriod: 60190, speed: 0.006,
    rotationSpeed: 0.032, tilt: 0.49, orbitalTilt: 0.03, hasAtmosphere: true, atmosphereColor: '#4166f5',
    description: 'Самая далёкая планета. Здесь дуют самые быстрые ветры в Солнечной системе — до 2100 км/ч. Открыт математически.',
    temperature: '-218°C', moons: 16, type: 'Ледяной гигант', gravity: '11.15 м/с²', dayLength: '16.1 часа',
    moonData: [
      { name: 'Тритон', radius: 0.25, distance: 4.5, speed: 1.8, color: '#aaccdd' }
    ]
  },
];

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetMeshesRef = useRef<THREE.Group[]>([]);
  const moonMeshesRef = useRef<THREE.Mesh[][]>([]);
  const anglesRef = useRef<number[]>(planets.map(() => Math.random() * Math.PI * 2));
  const moonAnglesRef = useRef<number[][]>(planets.map(p => 
    (p.moonData || []).map(() => Math.random() * Math.PI * 2)
  ));
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const hoverOutlinesRef = useRef<THREE.Mesh[]>([]);
  const hoveredIndexRef = useRef<number | null>(null);
  const sunCoronaRef = useRef<THREE.Mesh | null>(null);
  const sunMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const asteroidBeltRef = useRef<THREE.Points | null>(null);
  const atmosphereMaterialsRef = useRef<THREE.ShaderMaterial[]>([]);
  const auroraMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const marsDustMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const cmeParticlesRef = useRef<THREE.Points | null>(null);
  const cmeVelocitiesRef = useRef<Float32Array | null>(null);
  const cmeLifetimesRef = useRef<Float32Array | null>(null);
  const freeFlyModeRef = useRef<boolean>(false);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseMovementRef = useRef({ x: 0, y: 0 });

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [freeFlyMode, setFreeFlyMode] = useState(false);
  const [simulationDate, setSimulationDate] = useState(new Date());
  const [useRealTextures, setUseRealTextures] = useState(false);

  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const dateRef = useRef(simulationDate);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { dateRef.current = simulationDate; }, [simulationDate]);
  useEffect(() => { freeFlyModeRef.current = freeFlyMode; }, [freeFlyMode]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Keyboard controls for free fly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') {
        setFreeFlyMode(prev => !prev);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000005, 0.00015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 60, 140);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false, 
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2, 0.6, 0.75
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0x111122, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfff5e0, 4, 500, 0.5);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    createStarfield(scene);
    createNebulae(scene);
    createSun(scene);
    createAsteroidBelt(scene);
    createPlanets(scene);
    createCME(scene);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    setLoading(false);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const createStarfield = (scene: THREE.Scene) => {
    const layers = [
      { count: 15000, size: 0.15, spread: 3000, color: 0xffffff, type: 'distant' },
      { count: 8000, size: 0.25, spread: 2500, color: 0xffeedd, type: 'warm' },
      { count: 4000, size: 0.4, spread: 2000, color: 0xaaccff, type: 'blue' },
      { count: 1500, size: 0.6, spread: 1800, color: 0xffddaa, type: 'bright' },
      { count: 500, size: 1.0, spread: 1500, color: 0xffffee, type: 'giant' },
      { count: 100, size: 2.0, spread: 1200, color: 0xffffff, type: 'supergiant' },
    ];

    layers.forEach(layer => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(layer.count * 3);
      const colors = new Float32Array(layer.count * 3);

      const baseColor = new THREE.Color(layer.color);

      for (let i = 0; i < layer.count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = layer.spread + Math.random() * 500;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const variation = 0.7 + Math.random() * 0.5;
        const tempShift = (Math.random() - 0.5) * 0.2;
        colors[i * 3] = Math.min(1, baseColor.r * variation + tempShift);
        colors[i * 3 + 1] = Math.min(1, baseColor.g * variation);
        colors[i * 3 + 2] = Math.min(1, baseColor.b * variation - tempShift);
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: layer.size,
        vertexColors: true,
        transparent: true,
        opacity: layer.type === 'supergiant' ? 1.0 : layer.type === 'giant' ? 0.95 : 0.85,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });

      const stars = new THREE.Points(geometry, material);
      scene.add(stars);
    });

    const milkyWayGeometry = new THREE.BufferGeometry();
    const mwCount = 25000;
    const mwPositions = new Float32Array(mwCount * 3);
    const mwColors = new Float32Array(mwCount * 3);

    for (let i = 0; i < mwCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spread = (Math.random() - 0.5) * 0.4;
      const r = 2000 + Math.random() * 800;
      
      mwPositions[i * 3] = r * Math.cos(angle);
      mwPositions[i * 3 + 1] = r * spread * 0.15;
      mwPositions[i * 3 + 2] = r * Math.sin(angle);

      const brightness = 0.3 + Math.random() * 0.5;
      const hue = Math.random();
      if (hue < 0.3) {
        mwColors[i * 3] = brightness * 0.7;
        mwColors[i * 3 + 1] = brightness * 0.8;
        mwColors[i * 3 + 2] = brightness;
      } else if (hue < 0.6) {
        mwColors[i * 3] = brightness * 0.9;
        mwColors[i * 3 + 1] = brightness * 0.85;
        mwColors[i * 3 + 2] = brightness * 0.7;
      } else {
        mwColors[i * 3] = brightness;
        mwColors[i * 3 + 1] = brightness * 0.6;
        mwColors[i * 3 + 2] = brightness * 0.4;
      }
    }

    milkyWayGeometry.setAttribute('position', new THREE.BufferAttribute(mwPositions, 3));
    milkyWayGeometry.setAttribute('color', new THREE.BufferAttribute(mwColors, 3));

    const milkyWayMaterial = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    const milkyWay = new THREE.Points(milkyWayGeometry, milkyWayMaterial);
    milkyWay.rotation.x = Math.PI * 0.3;
    scene.add(milkyWay);
  };

  const createNebulae = (scene: THREE.Scene) => {
    const nebulaTypes = [
      { color1: [255, 50, 100], color2: [255, 100, 150], color3: [200, 50, 80], count: 12, size: 1500, spread: 3500 },
      { color1: [50, 100, 255], color2: [100, 150, 255], color3: [80, 120, 200], count: 10, size: 1300, spread: 3200 },
      { color1: [50, 255, 200], color2: [100, 255, 220], color3: [80, 200, 180], count: 8, size: 1100, spread: 3000 },
      { color1: [100, 50, 150], color2: [150, 80, 200], color3: [80, 40, 120], count: 10, size: 1600, spread: 3800 },
      { color1: [255, 150, 50], color2: [255, 200, 100], color3: [200, 120, 40], count: 9, size: 1400, spread: 3400 },
    ];

    nebulaTypes.forEach((type) => {
      for (let i = 0; i < type.count; i++) {
        const nebulaTexture = generateColoredNebulaTexture(
          type.color1 as [number, number, number],
          type.color2 as [number, number, number],
          type.color3 as [number, number, number]
        );

        const layerCount = 4 + Math.floor(Math.random() * 3);
        
        for (let layer = 0; layer < layerCount; layer++) {
          const size = type.size * (0.6 + layer * 0.35);
          const geometry = new THREE.PlaneGeometry(size, size);
          const material = new THREE.MeshBasicMaterial({
            map: nebulaTexture,
            transparent: true,
            opacity: 0.15 - layer * 0.025,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          
          const nebula = new THREE.Mesh(geometry, material);

          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const dist = type.spread + Math.random() * 800;
          
          nebula.position.set(
            dist * Math.sin(phi) * Math.cos(theta),
            dist * Math.sin(phi) * Math.sin(theta) * 0.6,
            dist * Math.cos(phi)
          );
          
          nebula.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          
          scene.add(nebula);
        }
      }
    });

    for (let i = 0; i < 25; i++) {
      const galaxyTexture = generateGalaxyTexture();
      const size = 500 + Math.random() * 700;
      const geometry = new THREE.PlaneGeometry(size, size);
      const material = new THREE.MeshBasicMaterial({
        map: galaxyTexture,
        transparent: true,
        opacity: 0.25 + Math.random() * 0.15,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      
      const galaxy = new THREE.Mesh(geometry, material);
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dist = 4000 + Math.random() * 2000;
      
      galaxy.position.set(
        dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.sin(phi) * Math.sin(theta),
        dist * Math.cos(phi)
      );
      
      galaxy.lookAt(0, 0, 0);
      galaxy.rotation.z = Math.random() * Math.PI * 2;
      
      scene.add(galaxy);
    }

    for (let i = 0; i < 30; i++) {
      const dustTexture = generateColoredNebulaTexture(
        [150, 150, 200],
        [100, 100, 150],
        [80, 80, 120]
      );
      const size = 800 + Math.random() * 1200;
      const geometry = new THREE.PlaneGeometry(size, size);
      const material = new THREE.MeshBasicMaterial({
        map: dustTexture,
        transparent: true,
        opacity: 0.08 + Math.random() * 0.06,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      
      const dust = new THREE.Mesh(geometry, material);
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dist = 2000 + Math.random() * 1500;
      
      dust.position.set(
        dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.sin(phi) * Math.sin(theta),
        dist * Math.cos(phi)
      );
      
      dust.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      scene.add(dust);
    }
  };

  const createSun = (scene: THREE.Scene) => {
    const sunTexture = generateSunTexture();

    const sunGeometry = new THREE.SphereGeometry(5, 96, 96);
    const sunMaterial = new THREE.ShaderMaterial({
      vertexShader: sunSurfaceVertexShader,
      fragmentShader: sunSurfaceFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: sunTexture },
      },
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    sunMaterialRef.current = sunMaterial;

    const coronaLayers = [
      { radius: 6, opacity: 0.7 },
      { radius: 7.5, opacity: 0.5 },
      { radius: 9, opacity: 0.3 },
      { radius: 11, opacity: 0.15 },
    ];

    coronaLayers.forEach((layer, i) => {
      const coronaGeometry = new THREE.SphereGeometry(layer.radius, 64, 64);
      const coronaMaterial = new THREE.ShaderMaterial({
        vertexShader: sunCoronaVertexShader,
        fragmentShader: sunCoronaFragmentShader,
        uniforms: {
          uTime: { value: 0 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        depthWrite: false,
      });
      const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
      scene.add(corona);
      if (i === 0) sunCoronaRef.current = corona;
    });

    const glowSizes = [
      { size: 35, opacity: 0.6 },
      { size: 55, opacity: 0.3 },
      { size: 80, opacity: 0.15 },
    ];

    glowSizes.forEach(glowConfig => {
      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = 512;
      glowCanvas.height = 512;
      const glowCtx = glowCanvas.getContext('2d')!;
      
      const gradient = glowCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, `rgba(255, 240, 200, ${glowConfig.opacity})`);
      gradient.addColorStop(0.1, `rgba(255, 200, 100, ${glowConfig.opacity * 0.8})`);
      gradient.addColorStop(0.3, `rgba(255, 150, 50, ${glowConfig.opacity * 0.5})`);
      gradient.addColorStop(0.5, `rgba(255, 100, 20, ${glowConfig.opacity * 0.25})`);
      gradient.addColorStop(0.7, `rgba(255, 50, 0, ${glowConfig.opacity * 0.1})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      glowCtx.fillStyle = gradient;
      glowCtx.fillRect(0, 0, 512, 512);

      const glowTexture = new THREE.CanvasTexture(glowCanvas);
      const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowSprite = new THREE.Sprite(glowMaterial);
      glowSprite.scale.set(glowConfig.size, glowConfig.size, 1);
      scene.add(glowSprite);
    });
  };

  const createAsteroidBelt = (scene: THREE.Scene) => {
    const count = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const innerRadius = 38;
    const outerRadius = 43;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const height = (Math.random() - 0.5) * 1.5;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const brightness = 0.3 + Math.random() * 0.4;
      colors[i * 3] = brightness * 0.8;
      colors[i * 3 + 1] = brightness * 0.7;
      colors[i * 3 + 2] = brightness * 0.6;

      sizes[i] = 0.05 + Math.random() * 0.15;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    const belt = new THREE.Points(geometry, material);
    scene.add(belt);
    asteroidBeltRef.current = belt;
  };

  const createCME = (scene: THREE.Scene) => {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const lifetimes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      sizes[i] = 0.3 + Math.random() * 0.5;
      lifetimes[i] = 1.0; // Start dead
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.5 + Math.random() * 1.5;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i * 3 + 2] = Math.cos(phi) * speed;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aLife', new THREE.BufferAttribute(lifetimes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: cmeVertexShader,
      fragmentShader: cmeFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    cmeParticlesRef.current = particles;
    cmeVelocitiesRef.current = velocities;
    cmeLifetimesRef.current = lifetimes;
  };

  const createPlanets = (scene: THREE.Scene) => {
    const textureGenerators = [
      generateMercuryTexture,
      generateVenusTexture,
      generateEarthTexture,
      generateMarsTexture,
      generateJupiterTexture,
      generateSaturnTexture,
      generateUranusTexture,
      generateNeptuneTexture,
    ];

    // NASA texture URLs (public domain)
    const nasaTextureUrls = [
      'https://svs.gsfc.nasa.gov/vis/images/disk/TOPO_MERCURY_2016_2K.jpg',
      'https://svs.gsfc.nasa.gov/vis/images/disk/TOPO_VENUS_2016_2K.jpg',
      'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/blue_marble_topo.world.200412.3x21600x10800.jpg',
      'https://svs.gsfc.nasa.gov/vis/images/disk/TOPO_MARS_2016_2K.jpg',
      'https://svs.gsfc.nasa.gov/vis/images/disk/jupiter.jpg',
      'https://svs.gsfc.nasa.gov/vis/images/disk/saturn.jpg',
      'https://svs.gsfc.nasa.gov/vis/images/disk/uranus.jpg',
      'https://svs.gsfc.nasa.gov/vis/images/disk/neptune.jpg',
    ];

    const bumpConfigs = [
      { scale: 12, octaves: 5, strength: 0.3 },
      { scale: 8, octaves: 4, strength: 0.1 },
      { scale: 10, octaves: 5, strength: 0.2 },
      { scale: 10, octaves: 5, strength: 0.25 },
      { scale: 15, octaves: 3, strength: 0.05 },
      { scale: 15, octaves: 3, strength: 0.05 },
      { scale: 12, octaves: 3, strength: 0.05 },
      { scale: 12, octaves: 3, strength: 0.05 },
    ];

    planets.forEach((planetData, index) => {
      const group = new THREE.Group();

      // Apply orbital tilt
      group.rotation.x = planetData.orbitalTilt;

      const geometry = new THREE.SphereGeometry(planetData.radius, 64, 64);
      
      // Use procedural texture by default, NASA texture can be loaded later
      const texture = textureGenerators[index]();
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 8;

      // Try to load NASA texture
      const loader = new THREE.TextureLoader();
      loader.load(
        nasaTextureUrls[index],
        (nasaTexture) => {
          nasaTexture.wrapS = THREE.RepeatWrapping;
          nasaTexture.wrapT = THREE.RepeatWrapping;
          nasaTexture.anisotropy = 8;
          const planetMesh = group.children[0] as THREE.Mesh;
          if (planetMesh && planetMesh.material instanceof THREE.MeshStandardMaterial) {
            planetMesh.material.map = nasaTexture;
            planetMesh.material.needsUpdate = true;
          }
        },
        undefined,
        (error) => {
          console.log(`Using procedural texture for ${planetData.name}`);
        }
      );

      const bumpConfig = bumpConfigs[index];
      const bumpMap = generateBumpMap(512, bumpConfig.scale, bumpConfig.octaves);
      bumpMap.wrapS = THREE.RepeatWrapping;
      bumpMap.wrapT = THREE.RepeatWrapping;

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        bumpMap: bumpMap,
        bumpScale: bumpConfig.strength,
        roughness: planetData.name === 'Venus' ? 0.9 : 0.7,
        metalness: 0.05,
      });

      const planet = new THREE.Mesh(geometry, material);
      planet.rotation.z = planetData.tilt;
      planet.userData = { planetIndex: index };
      group.add(planet);

      // Aurora for Earth
      if (planetData.name === 'Earth') {
        const auroraGeometry = new THREE.SphereGeometry(planetData.radius * 1.02, 32, 32);
        const auroraMaterial = new THREE.ShaderMaterial({
          vertexShader: auroraVertexShader,
          fragmentShader: auroraFragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uCameraPosition: { value: cameraRef.current?.position || new THREE.Vector3() },
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.FrontSide,
          depthWrite: false,
        });
        const aurora = new THREE.Mesh(auroraGeometry, auroraMaterial);
        aurora.rotation.z = planetData.tilt;
        group.add(aurora);
        auroraMaterialRef.current = auroraMaterial;
      }

      // Mars dust storms
      if (planetData.name === 'Mars') {
        const dustGeometry = new THREE.SphereGeometry(planetData.radius * 1.03, 32, 32);
        const dustMaterial = new THREE.ShaderMaterial({
          vertexShader: marsDustVertexShader,
          fragmentShader: marsDustFragmentShader,
          uniforms: {
            uTime: { value: 0 },
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.FrontSide,
          depthWrite: false,
        });
        const dust = new THREE.Mesh(dustGeometry, dustMaterial);
        dust.rotation.z = planetData.tilt;
        group.add(dust);
        marsDustMaterialRef.current = dustMaterial;
      }

      // Hover outline
      const outlineGeometry = new THREE.SphereGeometry(planetData.radius * 1.12, 32, 32);
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide,
        depthWrite: false,
      });
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      outline.rotation.z = planetData.tilt;
      group.add(outline);
      hoverOutlinesRef.current.push(outline);

      // Atmosphere
      if (planetData.hasAtmosphere) {
        const atmosGeometry = new THREE.SphereGeometry(planetData.radius * 1.06, 32, 32);
        const atmosColor = new THREE.Color(planetData.atmosphereColor);
        const atmosMaterial = new THREE.ShaderMaterial({
          vertexShader: atmosphereVertexShader,
          fragmentShader: atmosphereFragmentShader,
          uniforms: {
            uColor: { value: atmosColor },
            uCameraPosition: { value: cameraRef.current?.position || new THREE.Vector3() },
            uIntensity: { value: planetData.name === 'Earth' ? 1.0 : 0.6 },
          },
          transparent: true,
          blending: THREE.NormalBlending,
          side: THREE.FrontSide,
          depthWrite: false,
        });
        const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
        group.add(atmosphere);
        atmosphereMaterialsRef.current.push(atmosMaterial);
      }

      // Saturn's rings
      if (planetData.name === 'Saturn') {
        const ringTexture = generateSaturnRingTexture();
        const ringGeometry = new THREE.RingGeometry(planetData.radius * 1.4, planetData.radius * 2.8, 128);
        const pos = ringGeometry.attributes.position;
        const uv = ringGeometry.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const z = pos.getZ(i);
          const dist = Math.sqrt(x * x + z * z);
          const normalizedDist = (dist - planetData.radius * 1.4) / (planetData.radius * 1.4);
          uv.setXY(i, normalizedDist, 0.5);
        }

        const ringMaterial = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2 + 0.47;
        group.add(ring);
      }

      // Moons
      const moonMeshes: THREE.Mesh[] = [];
      if (planetData.moonData) {
        planetData.moonData.forEach((moon) => {
          const moonGeometry = new THREE.SphereGeometry(moon.radius, 24, 24);
          const moonMaterial = new THREE.MeshStandardMaterial({
            color: moon.color,
            roughness: 0.8,
            metalness: 0.1,
          });
          const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
          group.add(moonMesh);
          moonMeshes.push(moonMesh);
        });
      }
      moonMeshesRef.current.push(moonMeshes);

      // Orbit line
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const angle = (i / 128) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(
          Math.cos(angle) * planetData.distance,
          0,
          Math.sin(angle) * planetData.distance
        ));
      }
      orbitGeometry.setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.12,
      });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      orbit.rotation.x = planetData.orbitalTilt;
      scene.add(orbit);

      scene.add(group);
      planetMeshesRef.current.push(group);
    });
  };

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  const animate = useCallback(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const elapsed = clockRef.current.getElapsedTime();
    const timestamp = performance.now();

    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // Update sun shader
    if (sunMaterialRef.current) {
      sunMaterialRef.current.uniforms.uTime.value = elapsed;
    }

    // Update corona
    if (sunCoronaRef.current) {
      const coronaMat = sunCoronaRef.current.material as THREE.ShaderMaterial;
      coronaMat.uniforms.uTime.value = elapsed;
    }

    // Update aurora
    if (auroraMaterialRef.current) {
      auroraMaterialRef.current.uniforms.uTime.value = elapsed;
    }

    // Update Mars dust
    if (marsDustMaterialRef.current) {
      marsDustMaterialRef.current.uniforms.uTime.value = elapsed;
    }

    // Update CME
    if (cmeParticlesRef.current && cmeVelocitiesRef.current && cmeLifetimesRef.current) {
      const positions = cmeParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const lifetimes = cmeParticlesRef.current.geometry.attributes.aLife.array as Float32Array;
      
      // Randomly spawn new CME particles
      if (Math.random() < 0.02) {
        for (let i = 0; i < 10; i++) {
          const idx = Math.floor(Math.random() * lifetimes.length);
          if (lifetimes[idx] >= 1.0) {
            positions[idx * 3] = 0;
            positions[idx * 3 + 1] = 0;
            positions[idx * 3 + 2] = 0;
            lifetimes[idx] = 0.0;
          }
        }
      }

      // Update particles
      for (let i = 0; i < lifetimes.length; i++) {
        if (lifetimes[i] < 1.0) {
          positions[i * 3] += cmeVelocitiesRef.current[i * 3] * dt * 10;
          positions[i * 3 + 1] += cmeVelocitiesRef.current[i * 3 + 1] * dt * 10;
          positions[i * 3 + 2] += cmeVelocitiesRef.current[i * 3 + 2] * dt * 10;
          lifetimes[i] += dt * 0.3;
        }
      }

      cmeParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      cmeParticlesRef.current.geometry.attributes.aLife.needsUpdate = true;
    }

    // Update planets
    if (isPlayingRef.current) {
      planets.forEach((planet, i) => {
        anglesRef.current[i] += planet.speed * speedRef.current * dt * 0.3;
        const angle = anglesRef.current[i];
        const x = Math.cos(angle) * planet.distance;
        const z = Math.sin(angle) * planet.distance;
        const group = planetMeshesRef.current[i];
        if (group) {
          group.position.set(x, 0, z);
          const planetMesh = group.children[0] as THREE.Mesh;
          if (planetMesh) {
            planetMesh.rotation.y += planet.rotationSpeed * speedRef.current;
          }

          // Update moons
          if (planet.moonData && moonMeshesRef.current[i]) {
            planet.moonData.forEach((moon, moonIdx) => {
              moonAnglesRef.current[i][moonIdx] += moon.speed * speedRef.current * dt;
              const moonAngle = moonAnglesRef.current[i][moonIdx];
              const moonX = Math.cos(moonAngle) * moon.distance;
              const moonZ = Math.sin(moonAngle) * moon.distance;
              const moonMesh = moonMeshesRef.current[i][moonIdx];
              if (moonMesh) {
                moonMesh.position.set(moonX, 0, moonZ);
              }
            });
          }
        }
      });
    }

    // Rotate asteroid belt
    if (asteroidBeltRef.current && isPlayingRef.current) {
      asteroidBeltRef.current.rotation.y += 0.0002 * speedRef.current;
    }

    // Update atmosphere camera positions
    atmosphereMaterialsRef.current.forEach(mat => {
      mat.uniforms.uCameraPosition.value.copy(cameraRef.current!.position);
    });

    // Update aurora camera position
    if (auroraMaterialRef.current) {
      auroraMaterialRef.current.uniforms.uCameraPosition.value.copy(cameraRef.current!.position);
    }

    // Update hover outlines
    hoverOutlinesRef.current.forEach((outline, i) => {
      const mat = outline.material as THREE.MeshBasicMaterial;
      const isHovered = hoveredIndexRef.current === i;
      const targetOpacity = isHovered ? 0.6 : 0;
      mat.opacity += (targetOpacity - mat.opacity) * 0.15;
    });

    // Free fly mode
    if (freeFlyModeRef.current && cameraRef.current) {
      const moveSpeed = 0.5;
      const direction = new THREE.Vector3();
      cameraRef.current.getWorldDirection(direction);
      
      const right = new THREE.Vector3();
      right.crossVectors(direction, cameraRef.current.up).normalize();

      if (keysRef.current.has('w')) {
        cameraRef.current.position.add(direction.multiplyScalar(moveSpeed));
      }
      if (keysRef.current.has('s')) {
        cameraRef.current.position.add(direction.multiplyScalar(-moveSpeed));
      }
      if (keysRef.current.has('a')) {
        cameraRef.current.position.add(right.multiplyScalar(-moveSpeed));
      }
      if (keysRef.current.has('d')) {
        cameraRef.current.position.add(right.multiplyScalar(moveSpeed));
      }
      if (keysRef.current.has(' ')) {
        cameraRef.current.position.y += moveSpeed;
      }
      if (keysRef.current.has('shift')) {
        cameraRef.current.position.y -= moveSpeed;
      }

      controlsRef.current!.enabled = false;
    } else {
      controlsRef.current!.enabled = true;
      controlsRef.current?.update();
    }

    // Use composer for post-processing
    if (composerRef.current) {
      composerRef.current.render();
    } else {
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  // Update simulation date in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulationDate(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleHover = useCallback((clientX: number, clientY: number) => {
    if (!cameraRef.current || !rendererRef.current || freeFlyModeRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    const meshes: THREE.Mesh[] = [];
    planetMeshesRef.current.forEach(group => {
      group.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.userData.planetIndex !== undefined) {
          meshes.push(child);
        }
      });
    });

    const intersects = raycasterRef.current.intersectObjects(meshes);
    if (intersects.length > 0) {
      const planetIndex = intersects[0].object.userData.planetIndex;
      if (hoveredIndexRef.current !== planetIndex) {
        hoveredIndexRef.current = planetIndex;
        setHoveredPlanet(planets[planetIndex]);
      }
      rendererRef.current.domElement.style.cursor = 'pointer';
    } else {
      if (hoveredIndexRef.current !== null) {
        hoveredIndexRef.current = null;
        setHoveredPlanet(null);
      }
      rendererRef.current.domElement.style.cursor = 'grab';
    }
  }, []);

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (!cameraRef.current || !rendererRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    const meshes: THREE.Mesh[] = [];
    planetMeshesRef.current.forEach(group => {
      group.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.userData.planetIndex !== undefined) {
          meshes.push(child);
        }
      });
    });

    const intersects = raycasterRef.current.intersectObjects(meshes);
    if (intersects.length > 0) {
      const planetIndex = intersects[0].object.userData.planetIndex;
      setSelectedPlanet(planets[planetIndex]);
    } else {
      setSelectedPlanet(null);
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleHover(e.clientX, e.clientY);
  }, [handleHover]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      handleInteraction(touch.clientX, touch.clientY);
    }
  }, [handleInteraction]);

  const speedOptions = [0.25, 0.5, 1, 2, 5, 10];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="absolute inset-0"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onTouchEnd={handleTouchEnd}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-400 border-r-pink-400 animate-spin" />
              <div className="absolute inset-4 rounded-full border-4 border-transparent border-b-blue-400 border-l-cyan-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 animate-pulse shadow-2xl shadow-orange-500/50" />
            </div>
            <p className="text-white/90 text-base font-medium tracking-wide">Загрузка Солнечной системы</p>
            <p className="text-white/40 text-xs mt-2">Подготовка 3D моделей...</p>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-xl shadow-orange-500/30 btn-elevated">
              <span className="text-2xl md:text-3xl">☀️</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Солнечная система
              </h1>
              <p className="text-xs md:text-sm text-white/50 font-normal mt-0.5">
                {simulationDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          {!isMobile && (
            <div className="text-right">
              <p className="text-xs text-white/40 font-normal">
                {hoveredPlanet ? hoveredPlanet.nameRu : freeFlyMode ? 'Свободный полёт (WASD)' : 'Наведите курсор на планету'}
              </p>
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <button
          onClick={() => setShowControls(!showControls)}
          className="absolute top-20 right-4 z-20 w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/10 text-white btn-elevated"
        >
          {showControls ? '✕' : '⚙️'}
        </button>
      )}

      {(!isMobile || showControls) && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-blue-900/80 backdrop-blur-2xl rounded-3xl px-5 md:px-8 py-4 md:py-5 border border-white/10 shadow-2xl shadow-purple-500/20">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="group relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex-shrink-0 shadow-xl shadow-purple-500/40 btn-elevated"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-white/5 transition-all" />
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="relative">
                  <rect x="3" y="2" width="4" height="12" rx="1" />
                  <rect x="9" y="2" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="relative">
                  <path d="M4 2l10 6-10 6V2z" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-white/70 text-sm font-medium">Скорость</span>
              </div>
              <div className="flex gap-2">
                {speedOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-3 md:px-4 py-2 rounded-full text-sm font-semibold transition-all flex-shrink-0 ${
                      speed === s
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/40 scale-110'
                        : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/90 border border-white/10'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setFreeFlyMode(!freeFlyMode)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                freeFlyMode
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/40'
                  : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/90 border border-white/10'
              }`}
            >
              {freeFlyMode ? '🚀 Полёт' : '🎮 Полёт'}
            </button>

            <button
              onClick={() => setUseRealTextures(!useRealTextures)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                useRealTextures
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40'
                  : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/90 border border-white/10'
              }`}
            >
              {useRealTextures ? '🛰️ NASA' : '🎨 Процедурные'}
            </button>
          </div>
        </div>
      )}

      {selectedPlanet && (
        <div className="absolute top-24 md:top-28 right-4 md:right-8 w-80 md:w-96 animate-fadeIn z-20">
          <div className="bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-blue-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-purple-500/20 overflow-hidden">
            <div className="relative p-5 md:p-6 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-2xl"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${selectedPlanet.atmosphereColor})`,
                        boxShadow: `0 0 40px ${selectedPlanet.atmosphereColor}60`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">{selectedPlanet.nameRu}</h2>
                    <p className="text-sm text-white/50 font-normal mt-1">{selectedPlanet.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlanet(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white/60 hover:text-white transition-all btn-elevated"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-white/20 text-xs md:text-sm text-white/80 font-semibold shadow-lg">
                  {selectedPlanet.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <StatCard icon="📏" label="Диаметр" value={`${selectedPlanet.realDiameter.toLocaleString()}`} unit="км" color="blue" />
                <StatCard icon="☀️" label="До Солнца" value={`${selectedPlanet.realDistance}`} unit="млн км" color="yellow" />
                <StatCard icon="🌡️" label="Температура" value={selectedPlanet.temperature} unit="" color="red" />
                <StatCard icon="⚖️" label="Гравитация" value={selectedPlanet.gravity} unit="" color="green" />
                <StatCard icon="🔄" label="Год" value={formatOrbitalPeriod(selectedPlanet.orbitalPeriod)} unit="" color="purple" />
                <StatCard icon="🌙" label="Спутники" value={`${selectedPlanet.moons}`} unit="" color="pink" />
                <StatCard icon="⏱️" label="Длина дня" value={selectedPlanet.dayLength} unit="" color="cyan" wide />
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm md:text-base text-white/70 leading-relaxed font-normal">
                  {selectedPlanet.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Free fly mode hints */}
      {freeFlyMode && !isMobile && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 animate-fadeIn">
          <div className="bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 px-6 py-3 text-center">
            <p className="text-white/80 text-sm font-medium mb-1">🚀 Свободный полёт активен</p>
            <p className="text-white/50 text-xs">
              <span className="inline-block bg-white/10 px-2 py-0.5 rounded mr-1">W</span>
              <span className="inline-block bg-white/10 px-2 py-0.5 rounded mr-1">A</span>
              <span className="inline-block bg-white/10 px-2 py-0.5 rounded mr-1">S</span>
              <span className="inline-block bg-white/10 px-2 py-0.5 rounded mr-1">D</span>
              движение • 
              <span className="inline-block bg-white/10 px-2 py-0.5 rounded mx-1">Space</span>
              вверх • 
              <span className="inline-block bg-white/10 px-2 py-0.5 rounded mx-1">Shift</span>
              вниз • 
              <span className="inline-block bg-white/10 px-2 py-0.5 rounded mx-1">F</span>
              выход
            </p>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="absolute top-28 left-6 z-10">
          <div className="bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-blue-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-3 shadow-2xl shadow-purple-500/20">
            <div className="flex flex-col gap-2">
              {planets.map((planet, index) => (
                <button
                  key={planet.name}
                  onClick={() => setSelectedPlanet(planet)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                    selectedPlanet?.name === planet.name
                      ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-white/20 shadow-lg shadow-purple-500/20 scale-105'
                      : 'text-white/60 hover:bg-white/10 hover:text-white/90 hover:scale-102'
                  }`}
                >
                  <div className="relative">
                    <div
                      className="w-4 h-4 rounded-full transition-all group-hover:scale-125"
                      style={{ 
                        backgroundColor: planet.atmosphereColor,
                        boxShadow: selectedPlanet?.name === planet.name ? `0 0 15px ${planet.atmosphereColor}` : 'none'
                      }}
                    />
                    {selectedPlanet?.name === planet.name && (
                      <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: planet.atmosphereColor, opacity: 0.4 }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{planet.nameRu}</p>
                    <p className="text-xs text-white/40 truncate">{planet.name}</p>
                  </div>
                  <span className="text-xs text-white/30 font-medium">{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, unit, color, wide }: { 
  icon: string; 
  label: string; 
  value: string; 
  unit: string;
  color: string;
  wide?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-cyan-500/10 border-blue-400/30 shadow-blue-500/10',
    yellow: 'from-yellow-500/20 to-orange-500/10 border-yellow-400/30 shadow-yellow-500/10',
    purple: 'from-purple-500/20 to-pink-500/10 border-purple-400/30 shadow-purple-500/10',
    green: 'from-green-500/20 to-emerald-500/10 border-green-400/30 shadow-green-500/10',
    red: 'from-red-500/20 to-orange-500/10 border-red-400/30 shadow-red-500/10',
    pink: 'from-pink-500/20 to-rose-500/10 border-pink-400/30 shadow-pink-500/10',
    cyan: 'from-cyan-500/20 to-teal-500/10 border-cyan-400/30 shadow-cyan-500/10',
  };

  return (
    <div className={`stat-card ${wide ? 'col-span-2' : ''} shadow-lg hover:shadow-xl`}>
      <div className={`relative p-3 md:p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-xs text-white/50 font-normal mb-1">{label}</p>
            <p className="text-sm md:text-base font-bold text-white truncate">
              {value}
              {unit && <span className="text-xs md:text-sm text-white/60 font-normal ml-1">{unit}</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatOrbitalPeriod(days: number): string {
  if (days < 365) return `${days} дней`;
  const years = (days / 365.25).toFixed(1);
  return `${years} лет`;
}

export default App;
