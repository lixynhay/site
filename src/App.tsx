import { useState, useEffect, useRef, useCallback } from 'react';

interface PlanetData {
  name: string;
  nameRu: string;
  radius: number; // visual radius in px
  distance: number; // distance from sun in px (scaled)
  realDiameter: number; // km
  realDistance: number; // million km
  orbitalPeriod: number; // Earth days
  color: string;
  speed: number; // angular speed factor
}

const planets: PlanetData[] = [
  {
    name: 'Mercury',
    nameRu: 'Меркурий',
    radius: 4,
    distance: 70,
    realDiameter: 4879,
    realDistance: 57.9,
    orbitalPeriod: 88,
    color: '#b5b5b5',
    speed: 4.15,
  },
  {
    name: 'Venus',
    nameRu: 'Венера',
    radius: 7,
    distance: 100,
    realDiameter: 12104,
    realDistance: 108.2,
    orbitalPeriod: 225,
    color: '#e8cda0',
    speed: 1.62,
  },
  {
    name: 'Earth',
    nameRu: 'Земля',
    radius: 8,
    distance: 140,
    realDiameter: 12756,
    realDistance: 149.6,
    orbitalPeriod: 365,
    color: '#4da6ff',
    speed: 1.0,
  },
  {
    name: 'Mars',
    nameRu: 'Марс',
    radius: 6,
    distance: 180,
    realDiameter: 6792,
    realDistance: 227.9,
    orbitalPeriod: 687,
    color: '#e85d3a',
    speed: 0.53,
  },
  {
    name: 'Jupiter',
    nameRu: 'Юпитер',
    radius: 18,
    distance: 240,
    realDiameter: 142984,
    realDistance: 778.5,
    orbitalPeriod: 4333,
    color: '#e8a952',
    speed: 0.084,
  },
  {
    name: 'Saturn',
    nameRu: 'Сатурн',
    radius: 15,
    distance: 310,
    realDiameter: 120536,
    realDistance: 1434,
    orbitalPeriod: 10759,
    color: '#f0d68a',
    speed: 0.034,
  },
  {
    name: 'Uranus',
    nameRu: 'Уран',
    radius: 11,
    distance: 370,
    realDiameter: 51118,
    realDistance: 2871,
    orbitalPeriod: 30687,
    color: '#7de8e8',
    speed: 0.012,
  },
  {
    name: 'Neptune',
    nameRu: 'Нептун',
    radius: 10,
    distance: 420,
    realDiameter: 49528,
    realDistance: 4495,
    orbitalPeriod: 60190,
    color: '#4166f5',
    speed: 0.006,
  },
];

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const anglesRef = useRef<number[]>(planets.map(() => Math.random() * Math.PI * 2));
  const lastTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const getCenter = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { cx: 0, cy: 0 };
    return { cx: canvas.width / 2, cy: canvas.height / 2 };
  }, []);

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cx, cy } = getCenter();

    // Calculate delta time
    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // Update angles
    if (isPlayingRef.current) {
      planets.forEach((planet, i) => {
        anglesRef.current[i] += planet.speed * speedRef.current * dt * 0.5;
      });
    }

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    const starSeed = 42;
    for (let i = 0; i < 200; i++) {
      const sx = ((starSeed * (i + 1) * 7919) % canvas.width);
      const sy = ((starSeed * (i + 1) * 6271) % canvas.height);
      const brightness = 0.3 + ((i * 31) % 70) / 100;
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.5 + (i % 3) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw orbits
    planets.forEach((planet) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, planet.distance, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Sun
    const sunGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
    sunGradient.addColorStop(0, '#fff7e0');
    sunGradient.addColorStop(0.3, '#ffdd44');
    sunGradient.addColorStop(0.7, '#ff8800');
    sunGradient.addColorStop(1, '#ff440088');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, Math.PI * 2);
    ctx.fill();

    // Sun glow
    const glowGradient = ctx.createRadialGradient(cx, cy, 30, cx, cy, 60);
    glowGradient.addColorStop(0, 'rgba(255, 200, 50, 0.3)');
    glowGradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fill();

    // Draw planets
    planets.forEach((planet, i) => {
      const angle = anglesRef.current[i];
      const px = cx + Math.cos(angle) * planet.distance;
      const py = cy + Math.sin(angle) * planet.distance;

      // Planet glow
      const planetGlow = ctx.createRadialGradient(px, py, 0, px, py, planet.radius * 2);
      planetGlow.addColorStop(0, planet.color + '44');
      planetGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = planetGlow;
      ctx.beginPath();
      ctx.arc(px, py, planet.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Planet body
      const planetGradient = ctx.createRadialGradient(
        px - planet.radius * 0.3,
        py - planet.radius * 0.3,
        0,
        px,
        py,
        planet.radius
      );
      planetGradient.addColorStop(0, '#ffffff');
      planetGradient.addColorStop(0.3, planet.color);
      planetGradient.addColorStop(1, shadeColor(planet.color, -40));
      ctx.fillStyle = planetGradient;
      ctx.beginPath();
      ctx.arc(px, py, planet.radius, 0, Math.PI * 2);
      ctx.fill();

      // Saturn's ring
      if (planet.name === 'Saturn') {
        ctx.strokeStyle = '#f0d68a88';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(px, py, planet.radius * 2, planet.radius * 0.5, 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Highlight on hover
      if (hoveredPlanet === planet.name) {
        ctx.strokeStyle = '#ffffff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, planet.radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Selected indicator
      if (selectedPlanet?.name === planet.name) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(px, py, planet.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Planet name label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(planet.nameRu, px, py + planet.radius + 14);
    });

    animationRef.current = requestAnimationFrame(draw);
  }, [getCenter, hoveredPlanet, selectedPlanet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { cx, cy } = getCenter();

    for (let i = planets.length - 1; i >= 0; i--) {
      const planet = planets[i];
      const angle = anglesRef.current[i];
      const px = cx + Math.cos(angle) * planet.distance;
      const py = cy + Math.sin(angle) * planet.distance;
      const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);

      if (dist <= planet.radius + 10) {
        setSelectedPlanet(planet);
        return;
      }
    }
    setSelectedPlanet(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { cx, cy } = getCenter();

    let found = false;
    for (let i = planets.length - 1; i >= 0; i--) {
      const planet = planets[i];
      const angle = anglesRef.current[i];
      const px = cx + Math.cos(angle) * planet.distance;
      const py = cy + Math.sin(angle) * planet.distance;
      const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);

      if (dist <= planet.radius + 10) {
        setHoveredPlanet(planet.name);
        canvas.style.cursor = 'pointer';
        found = true;
        break;
      }
    }
    if (!found) {
      setHoveredPlanet(null);
      canvas.style.cursor = 'default';
    }
  };

  const speedOptions = [0.25, 0.5, 1, 2, 5, 10];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a1a]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
      />

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h1 className="text-2xl md:text-3xl font-bold text-white/90 tracking-wide">
          ☀️ Солнечная система
        </h1>
        <p className="text-sm text-white/50 mt-1">Нажмите на планету для получения информации</p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
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
          <span className="text-white/60 text-xs">Скорость:</span>
          <div className="flex gap-1">
            {speedOptions.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
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

      {/* Planet info panel */}
      {selectedPlanet && (
        <div className="absolute top-20 right-4 md:right-8 w-72 bg-black/70 backdrop-blur-lg rounded-2xl border border-white/15 p-5 text-white animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full shadow-lg"
                style={{
                  background: `radial-gradient(circle at 30% 30%, #fff, ${selectedPlanet.color})`,
                }}
              />
              <div>
                <h2 className="text-lg font-bold">{selectedPlanet.nameRu}</h2>
                <p className="text-xs text-white/50">{selectedPlanet.name}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
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
            <InfoRow
              icon="⚡"
              label="Относительная скорость"
              value={`${selectedPlanet.speed.toFixed(3)}x`}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-white/40">
              {getFunFact(selectedPlanet.name)}
            </p>
          </div>
        </div>
      )}

      {/* Planet list sidebar */}
      <div className="absolute top-20 left-4 md:left-8 flex flex-col gap-1">
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
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-sm font-medium">{value}</p>
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

function getFunFact(name: string): string {
  const facts: Record<string, string> = {
    Mercury: 'Меркурий — самая маленькая планета и ближайшая к Солнцу. Температура на его поверхности колеблется от -180°C до +430°C.',
    Venus: 'Венера — самая горячая планета из-за парникового эффекта. Она вращается в обратном направлении.',
    Earth: 'Земля — единственная известная планета с жизнью. 71% поверхности покрыт водой.',
    Mars: 'Марс называют «Красной планетой». На нём находится самая высокая гора в Солнечной системе — Олимп (21.9 км).',
    Jupiter: 'Юпитер — самая большая планета. Его Большое Красное Пятно — это шторм, бушующий уже более 350 лет.',
    Saturn: 'Сатурн знаменит своими кольцами, состоящими из льда и камней. Его плотность меньше воды.',
    Uranus: 'Уран вращается «лёжа на боку» — ось его вращения наклонена на 98°. Это самая холодная планета.',
    Neptune: 'Нептун — самая далёкая планета. Ветры на нём достигают 2100 км/ч — самые быстрые в Солнечной системе.',
  };
  return facts[name] || '';
}

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

export default App;
