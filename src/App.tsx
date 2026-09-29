import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface PlanetData {
  name: string;
  nameRu: string;
  radius: number;
  distance: number;
  realDiameter: number;
  realDistance: number;
  orbitalPeriod: number;
  color: string;
  speed: number;
  texture?: string;
  ring?: boolean;
  description: string;
}

const planets: PlanetData[] = [
  {
    name: 'Mercury',
    nameRu: 'Меркурий',
    radius: 0.4,
    distance: 8,
    realDiameter: 4879,
    realDistance: 57.9,
    orbitalPeriod: 88,
    color: '#b5b5b5',
    speed: 4.15,
    description: 'Самая маленькая планета и ближайшая к Солнцу. Температура колеблется от -180°C до +430°C.',
  },
  {
    name: 'Venus',
    nameRu: 'Венера',
    radius: 0.9,
    distance: 12,
    realDiameter: 12104,
    realDistance: 108.2,
    orbitalPeriod: 225,
    color: '#e8cda0',
    speed: 1.62,
    description: 'Самая горячая планета из-за парникового эффекта. Вращается в обратном направлении.',
  },
  {
    name: 'Earth',
    nameRu: 'Земля',
    radius: 1,
    distance: 16,
    realDiameter: 12756,
    realDistance: 149.6,
    orbitalPeriod: 365,
    color: '#4da6ff',
    speed: 1.0,
    description: 'Единственная известная планета с жизнью. 71% поверхности покрыт водой.',
  },
  {
    name: 'Mars',
    nameRu: 'Марс',
    radius: 0.6,
    distance: 20,
    realDiameter: 6792,
    realDistance: 227.9,
    orbitalPeriod: 687,
    color: '#e85d3a',
    speed: 0.53,
    description: 'Красная планета. Здесь находится самая высокая гора в Солнечной системе — Олимп (21.9 км).',
  },
  {
    name: 'Jupiter',
    nameRu: 'Юпитер',
    radius: 2.5,
    distance: 28,
    realDiameter: 142984,
    realDistance: 778.5,
    orbitalPeriod: 4333,
    color: '#e8a952',
    speed: 0.084,
    description: 'Самая большая планета. Большое Красное Пятно — шторм, бушующий более 350 лет.',
  },
  {
    name: 'Saturn',
    nameRu: 'Сатурн',
    radius: 2.2,
    distance: 36,
    realDiameter: 120536,
    realDistance: 1434,
    orbitalPeriod: 10759,
    color: '#f0d68a',
    speed: 0.034,
    ring: true,
    description: 'Знаменит своими кольцами из льда и камней. Плотность меньше воды.',
  },
  {
    name: 'Uranus',
    nameRu: 'Уран',
    radius: 1.5,
    distance: 44,
    realDiameter: 51118,
    realDistance: 2871,
    orbitalPeriod: 30687,
    color: '#7de8e8',
    speed: 0.012,
    description: 'Вращается «лёжа на боку» — ось наклонена на 98°. Самая холодная планета.',
  },
  {
    name: 'Neptune',
    nameRu: 'Нептун',
    radius: 1.4,
    distance: 52,
    realDiameter: 49528,
    realDistance: 4495,
    orbitalPeriod: 60190,
    color: '#4166f5',
    speed: 0.006,
    description: 'Самая далёкая планета. Ветры достигают 2100 км/ч — самые быстрые в Солнечной системе.',
  },
];

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetsRef = useRef<THREE.Mesh[]>([]);
  const orbitsRef = useRef<THREE.Line[]>([]);
  const anglesRef = useRef<number[]>(planets.map(() => Math.random() * Math.PI * 2));
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 40, 80);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI / 2 + 0.5;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 2, 500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 5000;
    const positions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 1000;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd44 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Sun glow
    const glowGeometry = new THREE.SphereGeometry(4, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.3,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Planets
    planets.forEach((planetData, index) => {
      // Planet mesh
      const geometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: planetData.color,
        roughness: 0.7,
        metalness: 0.3,
      });
      const planet = new THREE.Mesh(geometry, material);
      planet.userData = { planetIndex: index };
      scene.add(planet);
      planetsRef.current.push(planet);

      // Orbit line
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        orbitPoints.push(
          new THREE.Vector3(
            Math.cos(angle) * planetData.distance,
            0,
            Math.sin(angle) * planetData.distance
          )
        );
      }
      orbitGeometry.setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
      });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbit);
      orbitsRef.current.push(orbit);

      // Saturn's ring
      if (planetData.ring) {
        const ringGeometry = new THREE.RingGeometry(
          planetData.radius * 1.5,
          planetData.radius * 2.5,
          64
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xf0d68a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
      }
    });

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  const animate = useCallback((timestamp: number) => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    // Calculate delta time
    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // Update planet positions
    if (isPlayingRef.current) {
      planets.forEach((planet, i) => {
        anglesRef.current[i] += planet.speed * speedRef.current * dt * 0.5;
        const angle = anglesRef.current[i];
        const x = Math.cos(angle) * planet.distance;
        const z = Math.sin(angle) * planet.distance;
        planetsRef.current[i].position.set(x, 0, z);
      });
    }

    // Update controls
    controlsRef.current?.update();

    // Render
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (!cameraRef.current || !rendererRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(planetsRef.current);

    if (intersects.length > 0) {
      const planetIndex = intersects[0].object.userData.planetIndex;
      setSelectedPlanet(planets[planetIndex]);
    } else {
      setSelectedPlanet(null);
    }
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      handleInteraction(e.clientX, e.clientY);
    },
    [handleInteraction]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        handleInteraction(touch.clientX, touch.clientY);
      }
    },
    [handleInteraction]
  );

  const speedOptions = [0.25, 0.5, 1, 2, 5, 10];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="absolute inset-0"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      />

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
        <h1 className="text-xl md:text-3xl font-bold text-white/90 tracking-wide drop-shadow-lg">
          ☀️ Солнечная система
        </h1>
        <p className="text-xs md:text-sm text-white/50 mt-1">
          Нажмите на планету • Используйте жесты для вращения
        </p>
      </div>

      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={() => setShowControls(!showControls)}
          className="absolute top-20 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white"
        >
          {showControls ? '✕' : '⚙️'}
        </button>
      )}

      {/* Controls */}
      {(!isMobile || showControls) && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex flex-col md:flex-row items-center gap-2 md:gap-3 bg-black/70 backdrop-blur-md rounded-2xl px-4 md:px-5 py-3 border border-white/10 z-10 max-w-[90vw]">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white flex-shrink-0"
            title={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="2" width="4" height="12" rx="1" />
                <rect x="9" y="2" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2l10 6-10 6V2z" />
              </svg>
            )}
          </button>

          {/* Speed control */}
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs flex-shrink-0">Скорость:</span>
            <div className="flex gap-1 overflow-x-auto">
              {speedOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0 ${
                    speed === s
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Planet info panel */}
      {selectedPlanet && (
        <div className="absolute top-20 right-4 md:right-8 w-64 md:w-72 bg-black/80 backdrop-blur-lg rounded-2xl border border-white/15 p-4 md:p-5 text-white animate-fadeIn z-20 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div
                className="w-7 h-7 md:w-8 md:h-8 rounded-full shadow-lg flex-shrink-0"
                style={{
                  background: `radial-gradient(circle at 30% 30%, #fff, ${selectedPlanet.color})`,
                }}
              />
              <div>
                <h2 className="text-base md:text-lg font-bold">{selectedPlanet.nameRu}</h2>
                <p className="text-xs text-white/50">{selectedPlanet.name}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white flex-shrink-0"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 md:space-y-3">
            <InfoRow
              icon="📏"
              label="Диаметр"
              value={`${selectedPlanet.realDiameter.toLocaleString()} км`}
            />
            <InfoRow
              icon="🌍"
              label="Расстояние от Солнца"
              value={`${selectedPlanet.realDistance} млн км`}
            />
            <InfoRow
              icon="🔄"
              label="Орбитальный период"
              value={formatOrbitalPeriod(selectedPlanet.orbitalPeriod)}
            />
          </div>

          <div className="mt-3 md:mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-white/70 leading-relaxed">{selectedPlanet.description}</p>
          </div>
        </div>
      )}

      {/* Planet list sidebar - desktop only */}
      {!isMobile && (
        <div className="absolute top-20 left-4 md:left-8 flex flex-col gap-1 z-10">
          {planets.map((planet) => (
            <button
              key={planet.name}
              onClick={() => setSelectedPlanet(planet)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all ${
                selectedPlanet?.name === planet.name
                  ? 'bg-white/15 text-white'
                  : 'bg-transparent text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: planet.color }}
              />
              <span className="text-sm">{planet.nameRu}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm md:text-base flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-xs md:text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function formatOrbitalPeriod(days: number): string {
  if (days < 365) {
    return `${days} дней`;
  }
  const years = (days / 365.25).toFixed(1);
  return `${years} лет (${days.toLocaleString()} дней)`;
}

export default App;
