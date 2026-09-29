import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
} from './textures';
import {
  sunCoronaVertexShader,
  sunCoronaFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
  sunSurfaceVertexShader,
  sunSurfaceFragmentShader,
} from './shaders';

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
  hasAtmosphere: boolean;
  atmosphereColor: string;
  description: string;
  temperature: string;
  moons: number;
  type: string;
  gravity: string;
  dayLength: string;
}

const planets: PlanetData[] = [
  {
    name: 'Mercury', nameRu: 'Меркурий', radius: 0.4, distance: 8,
    realDiameter: 4879, realDistance: 57.9, orbitalPeriod: 88, speed: 4.15,
    rotationSpeed: 0.005, tilt: 0.03, hasAtmosphere: false, atmosphereColor: '#b5b5b5',
    description: 'Самая маленькая планета. Поверхность покрыта кратерами, похожа на Луну. Нет атмосферы и спутников.',
    temperature: '-180°C до +430°C', moons: 0, type: 'Скалистая', gravity: '3.7 м/с²', dayLength: '59 дней',
  },
  {
    name: 'Venus', nameRu: 'Венера', radius: 0.9, distance: 12,
    realDiameter: 12104, realDistance: 108.2, orbitalPeriod: 225, speed: 1.62,
    rotationSpeed: -0.002, tilt: 2.64, hasAtmosphere: true, atmosphereColor: '#e8cda0',
    description: 'Самая горячая планета из-за парникового эффекта. Плотная атмосфера из CO₂ создаёт давление в 90 раз выше земного.',
    temperature: '+462°C', moons: 0, type: 'Скалистая', gravity: '8.87 м/с²', dayLength: '243 дня',
  },
  {
    name: 'Earth', nameRu: 'Земля', radius: 1, distance: 16,
    realDiameter: 12756, realDistance: 149.6, orbitalPeriod: 365, speed: 1.0,
    rotationSpeed: 0.02, tilt: 0.41, hasAtmosphere: true, atmosphereColor: '#4da6ff',
    description: 'Единственная известная планета с жизнью. 71% поверхности покрыт водой. Магнитное поле защищает от солнечного ветра.',
    temperature: '-89°C до +57°C', moons: 1, type: 'Скалистая', gravity: '9.81 м/с²', dayLength: '24 часа',
  },
  {
    name: 'Mars', nameRu: 'Марс', radius: 0.6, distance: 21,
    realDiameter: 6792, realDistance: 227.9, orbitalPeriod: 687, speed: 0.53,
    rotationSpeed: 0.018, tilt: 0.44, hasAtmosphere: true, atmosphereColor: '#e85d3a',
    description: 'Красная планета. Здесь находится гора Олимп — высочайший вулкан в Солнечной системе (21.9 км).',
    temperature: '-140°C до +20°C', moons: 2, type: 'Скалистая', gravity: '3.72 м/с²', dayLength: '24.6 часа',
  },
  {
    name: 'Jupiter', nameRu: 'Юпитер', radius: 2.8, distance: 30,
    realDiameter: 142984, realDistance: 778.5, orbitalPeriod: 4333, speed: 0.084,
    rotationSpeed: 0.04, tilt: 0.05, hasAtmosphere: true, atmosphereColor: '#e8a952',
    description: 'Крупнейшая планета. Большое Красное Пятно — гигантский шторм, бушующий более 350 лет. Мощнейшее магнитное поле.',
    temperature: '-110°C', moons: 95, type: 'Газовый гигант', gravity: '24.79 м/с²', dayLength: '9.9 часа',
  },
  {
    name: 'Saturn', nameRu: 'Сатурн', radius: 2.4, distance: 40,
    realDiameter: 120536, realDistance: 1434, orbitalPeriod: 10759, speed: 0.034,
    rotationSpeed: 0.038, tilt: 0.47, hasAtmosphere: true, atmosphereColor: '#f0d68a',
    description: 'Знаменит кольцами из льда и камней шириной 282 000 км, но толщиной всего 10 метров. Плотность меньше воды.',
    temperature: '-178°C', moons: 146, type: 'Газовый гигант', gravity: '10.44 м/с²', dayLength: '10.7 часа',
  },
  {
    name: 'Uranus', nameRu: 'Уран', radius: 1.6, distance: 50,
    realDiameter: 51118, realDistance: 2871, orbitalPeriod: 30687, speed: 0.012,
    rotationSpeed: 0.03, tilt: 1.71, hasAtmosphere: true, atmosphereColor: '#7de8e8',
    description: 'Ледяной гигант с уникальным наклоном оси 98° — вращается «лёжа на боку». Атмосфера содержит метан, придающий голубой цвет.',
    temperature: '-224°C', moons: 27, type: 'Ледяной гигант', gravity: '8.87 м/с²', dayLength: '17.2 часа',
  },
  {
    name: 'Neptune', nameRu: 'Нептун', radius: 1.5, distance: 60,
    realDiameter: 49528, realDistance: 4495, orbitalPeriod: 60190, speed: 0.006,
    rotationSpeed: 0.032, tilt: 0.49, hasAtmosphere: true, atmosphereColor: '#4166f5',
    description: 'Самая далёкая планета. Здесь дуют самые быстрые ветры в Солнечной системе — до 2100 км/ч. Открыт математически.',
    temperature: '-218°C', moons: 16, type: 'Ледяной гигант', gravity: '11.15 м/с²', dayLength: '16.1 часа',
  },
];

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetMeshesRef = useRef<THREE.Group[]>([]);
  const anglesRef = useRef<number[]>(planets.map(() => Math.random() * Math.PI * 2));
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const sunCoronaRef = useRef<THREE.Mesh | null>(null);
  const sunMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const asteroidBeltRef = useRef<THREE.Points | null>(null);
  const atmosphereMaterialsRef = useRef<THREE.ShaderMaterial[]>([]);
  const hoverOutlinesRef = useRef<THREE.Mesh[]>([]);
  const hoveredIndexRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);

  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000011, 0.002);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 35, 70);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 250;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x111122, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfff5e0, 3, 300, 0.5);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // === STARFIELD ===
    createStarfield(scene);

    // === NEBULAE ===
    createNebulae(scene);

    // === SUN ===
    createSun(scene);

    // === ASTEROID BELT ===
    createAsteroidBelt(scene);

    // === PLANETS ===
    createPlanets(scene);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
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
    // Layered starfield for depth
    const layers = [
      { count: 3000, size: 0.3, spread: 500, color: 0xffffff },
      { count: 2000, size: 0.5, spread: 400, color: 0xffeedd },
      { count: 500, size: 0.8, spread: 300, color: 0xaaccff },
      { count: 200, size: 1.2, spread: 350, color: 0xffddaa },
    ];

    layers.forEach(layer => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(layer.count * 3);
      const colors = new Float32Array(layer.count * 3);
      const sizes = new Float32Array(layer.count);

      const baseColor = new THREE.Color(layer.color);

      for (let i = 0; i < layer.count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = layer.spread + Math.random() * 100;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const variation = 0.8 + Math.random() * 0.4;
        colors[i * 3] = baseColor.r * variation;
        colors[i * 3 + 1] = baseColor.g * variation;
        colors[i * 3 + 2] = baseColor.b * variation;

        sizes[i] = layer.size * (0.5 + Math.random());
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: layer.size,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });

      const stars = new THREE.Points(geometry, material);
      scene.add(stars);
    });
  };

  const createNebulae = (scene: THREE.Scene) => {
    const nebulaTexture = generateNebulaTexture();

    for (let i = 0; i < 4; i++) {
      const geometry = new THREE.PlaneGeometry(200, 200);
      const material = new THREE.MeshBasicMaterial({
        map: nebulaTexture,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const nebula = new THREE.Mesh(geometry, material);

      const angle = (i / 4) * Math.PI * 2;
      const dist = 200 + Math.random() * 100;
      nebula.position.set(
        Math.cos(angle) * dist,
        (Math.random() - 0.5) * 100,
        Math.sin(angle) * dist
      );
      nebula.lookAt(0, 0, 0);
      nebula.rotation.z = Math.random() * Math.PI;
      scene.add(nebula);
    }
  };

  const createSun = (scene: THREE.Scene) => {
    const sunTexture = generateSunTexture();

    // Sun surface with custom shader
    const sunGeometry = new THREE.SphereGeometry(3.5, 64, 64);
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

    // Corona layers
    for (let i = 0; i < 3; i++) {
      const coronaGeometry = new THREE.SphereGeometry(4 + i * 0.8, 32, 32);
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
    }

    // Sun glow sprite
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 256;
    glowCanvas.height = 256;
    const glowCtx = glowCanvas.getContext('2d')!;
    const gradient = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
    gradient.addColorStop(0.2, 'rgba(255, 150, 0, 0.4)');
    gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
    glowCtx.fillStyle = gradient;
    glowCtx.fillRect(0, 0, 256, 256);

    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.scale.set(25, 25, 1);
    scene.add(glowSprite);
  };

  const createAsteroidBelt = (scene: THREE.Scene) => {
    const count = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const innerRadius = 24;
    const outerRadius = 27;

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

    planets.forEach((planetData, index) => {
      const group = new THREE.Group();

      // Planet mesh
      const geometry = new THREE.SphereGeometry(planetData.radius, 48, 48);
      const texture = textureGenerators[index]();
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.1,
      });

      const planet = new THREE.Mesh(geometry, material);
      planet.rotation.z = planetData.tilt;
      planet.userData = { planetIndex: index };
      group.add(planet);

      // Hover outline (initially invisible)
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
        // Fix UV for ring
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
          // Planet self-rotation
          const planetMesh = group.children[0] as THREE.Mesh;
          if (planetMesh) {
            planetMesh.rotation.y += planet.rotationSpeed * speedRef.current;
          }
        }
      });
    }

    // Rotate asteroid belt slowly
    if (asteroidBeltRef.current && isPlayingRef.current) {
      asteroidBeltRef.current.rotation.y += 0.0002 * speedRef.current;
    }

    // Update atmosphere camera positions
    atmosphereMaterialsRef.current.forEach(mat => {
      mat.uniforms.uCameraPosition.value.copy(cameraRef.current!.position);
    });

    // Update hover outlines
    hoverOutlinesRef.current.forEach((outline, i) => {
      const mat = outline.material as THREE.MeshBasicMaterial;
      const isHovered = hoveredIndexRef.current === i;
      const targetOpacity = isHovered ? 0.6 : 0;
      mat.opacity += (targetOpacity - mat.opacity) * 0.15;
    });

    controlsRef.current?.update();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  const handleHover = useCallback((clientX: number, clientY: number) => {
    if (!cameraRef.current || !rendererRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    // Check planet hits
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

    // Check planet hits
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

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-orange-400 animate-spin" style={{ animationDuration: '1.5s' }} />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse" />
            </div>
            <p className="text-white/80 text-sm font-light tracking-wider">ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-xl border border-yellow-400/30 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="text-xl md:text-2xl">☀️</span>
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold text-white tracking-wide">
                Солнечная система
              </h1>
              <p className="text-[10px] md:text-xs text-white/40 font-light">
                Интерактивная 3D модель
              </p>
            </div>
          </div>
          
          {!isMobile && (
            <div className="text-right">
              <p className="text-[10px] text-white/30 font-light">
                {hoveredPlanet ? hoveredPlanet.nameRu : 'Наведите на планету'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile toggle */}
      {isMobile && (
        <button
          onClick={() => setShowControls(!showControls)}
          className="absolute top-16 right-3 z-20 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all shadow-lg"
        >
          {showControls ? '✕' : '⚙️'}
        </button>
      )}

      {/* Controls */}
      {(!isMobile || showControls) && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-2xl px-4 md:px-6 py-3 md:py-4 border border-white/10 shadow-2xl shadow-black/50">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="group relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-white/10 transition-all text-white flex-shrink-0 shadow-lg"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/10 group-hover:to-purple-400/10 transition-all" />
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="relative">
                  <rect x="3" y="2" width="4" height="12" rx="1" />
                  <rect x="9" y="2" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="relative">
                  <path d="M4 2l10 6-10 6V2z" />
                </svg>
              )}
            </button>

            {/* Speed control */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-white/50 text-xs font-medium">Скорость</span>
              </div>
              <div className="flex gap-1">
                {speedOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                      speed === s
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/5'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Planet info panel */}
      {selectedPlanet && (
        <div className="absolute top-20 md:top-24 right-2 md:right-6 w-72 md:w-80 animate-fadeIn z-20">
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header with gradient */}
            <div className="relative p-4 md:p-5 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl shadow-2xl"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${selectedPlanet.atmosphereColor})`,
                        boxShadow: `0 0 30px ${selectedPlanet.atmosphereColor}40`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white">{selectedPlanet.nameRu}</h2>
                    <p className="text-xs text-white/40 font-light">{selectedPlanet.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlanet(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats grid */}
            <div className="p-4 md:p-5 space-y-3">
              {/* Type badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 text-[10px] md:text-xs text-white/70 font-medium">
                  {selectedPlanet.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <StatCard
                  icon="📏"
                  label="Диаметр"
                  value={`${selectedPlanet.realDiameter.toLocaleString()}`}
                  unit="км"
                  color="blue"
                />
                <StatCard
                  icon="☀️"
                  label="До Солнца"
                  value={`${selectedPlanet.realDistance}`}
                  unit="млн км"
                  color="yellow"
                />
                <StatCard
                  icon="🌡️"
                  label="Температура"
                  value={selectedPlanet.temperature}
                  unit=""
                  color="red"
                />
                <StatCard
                  icon="⚖️"
                  label="Гравитация"
                  value={selectedPlanet.gravity}
                  unit=""
                  color="green"
                />
                <StatCard
                  icon="🔄"
                  label="Год"
                  value={formatOrbitalPeriod(selectedPlanet.orbitalPeriod)}
                  unit=""
                  color="purple"
                />
                <StatCard
                  icon="🌙"
                  label="Спутники"
                  value={`${selectedPlanet.moons}`}
                  unit=""
                  color="pink"
                />
                <StatCard
                  icon="⏱️"
                  label="Длина дня"
                  value={selectedPlanet.dayLength}
                  unit=""
                  color="cyan"
                  wide
                />
              </div>

              {/* Description */}
              <div className="pt-3 border-t border-white/5">
                <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                  {selectedPlanet.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Planet list - desktop */}
      {!isMobile && (
        <div className="absolute top-24 left-4 md:left-6 z-10">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-2 shadow-2xl shadow-black/50">
            <div className="flex flex-col gap-1">
              {planets.map((planet, index) => (
                <button
                  key={planet.name}
                  onClick={() => setSelectedPlanet(planet)}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                    selectedPlanet?.name === planet.name
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <div className="relative">
                    <div
                      className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                      style={{ 
                        backgroundColor: planet.atmosphereColor,
                        boxShadow: selectedPlanet?.name === planet.name ? `0 0 10px ${planet.atmosphereColor}` : 'none'
                      }}
                    />
                    {selectedPlanet?.name === planet.name && (
                      <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: planet.atmosphereColor, opacity: 0.3 }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{planet.nameRu}</p>
                    <p className="text-[10px] text-white/30 truncate">{planet.name}</p>
                  </div>
                  <span className="text-[10px] text-white/30">{index + 1}</span>
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
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-400/20',
    yellow: 'from-yellow-500/10 to-orange-500/5 border-yellow-400/20',
    purple: 'from-purple-500/10 to-pink-500/5 border-purple-400/20',
    green: 'from-green-500/10 to-emerald-500/5 border-green-400/20',
    red: 'from-red-500/10 to-orange-500/5 border-red-400/20',
    pink: 'from-pink-500/10 to-rose-500/5 border-pink-400/20',
    cyan: 'from-cyan-500/10 to-teal-500/5 border-cyan-400/20',
  };

  return (
    <div className={`relative p-2.5 md:p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm ${wide ? 'col-span-2' : ''}`}>
      <div className="flex items-start gap-2">
        <span className="text-sm md:text-base">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] md:text-[10px] text-white/40 font-light mb-0.5">{label}</p>
          <p className="text-xs md:text-sm font-bold text-white truncate">
            {value}
            {unit && <span className="text-[10px] md:text-xs text-white/50 font-normal ml-1">{unit}</span>}
          </p>
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
