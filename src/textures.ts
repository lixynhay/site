import * as THREE from 'three';

// Simplex-like noise
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const n00 = hash(ix, iy);
  const n10 = hash(ix + 1, iy);
  const n01 = hash(ix, iy + 1);
  const n11 = hash(ix + 1, iy + 1);
  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;
  return nx0 * (1 - sy) + nx1 * sy;
}

function fbm(x: number, y: number, octaves: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
  ];
}

export function generateSunTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 8;
      const ny = y / size * 8;
      const n = fbm(nx, ny, 6);
      const n2 = fbm(nx * 2 + 100, ny * 2 + 100, 4);
      const intensity = 0.5 + n * 0.5 + n2 * 0.3;

      const r = Math.min(255, 255 * intensity);
      const g = Math.min(255, (180 + n * 75) * intensity);
      const b = Math.min(255, (50 + n2 * 50) * intensity * 0.5);

      const idx = (y * size + x) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function generateMercuryTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 10;
      const ny = y / size * 10;
      const n = fbm(nx, ny, 5);
      const craters = fbm(nx * 3, ny * 3, 3);
      const base = 0.4 + n * 0.3;
      const craterEffect = craters > 0.6 ? (craters - 0.6) * 2 : 0;
      const intensity = base - craterEffect * 0.3;

      const r = intensity * 180;
      const g = intensity * 170;
      const b = intensity * 160;

      const idx = (y * size + x) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

export function generateVenusTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 6;
      const ny = y / size * 6;
      const n = fbm(nx, ny, 5);
      const clouds = fbm(nx * 2 + 50, ny * 2, 4);
      const intensity = 0.6 + n * 0.2 + clouds * 0.2;

      const r = intensity * 235;
      const g = intensity * 195;
      const b = intensity * 140;

      const idx = (y * size + x) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

export function generateEarthTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  const ocean: [number, number, number] = [30, 80, 180];
  const deepOcean: [number, number, number] = [15, 40, 120];
  const land: [number, number, number] = [50, 130, 50];
  const desert: [number, number, number] = [180, 160, 100];
  const mountain: [number, number, number] = [120, 100, 80];
  const snow: [number, number, number] = [240, 245, 255];
  const ice: [number, number, number] = [220, 235, 250];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 8;
      const ny = y / size * 8;
      const lat = (y / size - 0.5) * Math.PI;

      const continent = fbm(nx + 3.7, ny + 2.1, 6);
      const detail = fbm(nx * 4, ny * 4, 4);
      const elevation = continent * 0.7 + detail * 0.3;

      let color: [number, number, number];
      const absLat = Math.abs(lat);

      if (absLat > 1.3) {
        color = ice;
      } else if (elevation < 0.42) {
        color = lerpColor(deepOcean, ocean, elevation / 0.42);
      } else if (elevation < 0.48) {
        color = land;
        if (absLat < 0.5 && detail > 0.5) {
          color = lerpColor(land, desert, (detail - 0.5) * 2);
        }
      } else if (elevation < 0.6) {
        color = lerpColor(land, mountain, (elevation - 0.48) / 0.12);
      } else {
        color = lerpColor(mountain, snow, Math.min(1, (elevation - 0.6) / 0.15));
      }

      // Clouds
      const cloud = fbm(nx * 2 + 10, ny * 2 + 10, 4);
      if (cloud > 0.55) {
        const cloudIntensity = (cloud - 0.55) * 3;
        color = lerpColor(color, [255, 255, 255], Math.min(0.7, cloudIntensity));
      }

      const idx = (y * size + x) * 4;
      imageData.data[idx] = color[0];
      imageData.data[idx + 1] = color[1];
      imageData.data[idx + 2] = color[2];
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

export function generateMarsTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 8;
      const ny = y / size * 8;
      const lat = Math.abs(y / size - 0.5) * 2;
      const n = fbm(nx, ny, 5);
      const detail = fbm(nx * 3, ny * 3, 3);

      let r = 180 + n * 50 + detail * 20;
      let g = 80 + n * 30 + detail * 10;
      let b = 40 + n * 20;

      // Dark regions
      if (n < 0.35) {
        r *= 0.7;
        g *= 0.6;
        b *= 0.5;
      }

      // Polar ice caps
      if (lat > 0.85) {
        const iceIntensity = (lat - 0.85) / 0.15;
        r = r + (230 - r) * iceIntensity;
        g = g + (225 - g) * iceIntensity;
        b = b + (220 - b) * iceIntensity;
      }

      const idx = (y * size + x) * 4;
      imageData.data[idx] = Math.min(255, r);
      imageData.data[idx + 1] = Math.min(255, g);
      imageData.data[idx + 2] = Math.min(255, b);
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

export function generateJupiterTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  const bands: [number, number, number][] = [
    [210, 170, 120],
    [240, 200, 150],
    [180, 130, 80],
    [220, 180, 130],
    [160, 110, 70],
    [200, 160, 110],
    [230, 190, 140],
    [170, 120, 75],
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 12;
      const ny = y / size;
      const bandIndex = Math.floor(ny * bands.length * 2) % bands.length;
      const nextBand = (bandIndex + 1) % bands.length;
      const bandT = (ny * bands.length * 2) % 1;

      const turbulence = fbm(nx + ny * 2, ny * 20, 4) * 0.15;
      const bandColor = lerpColor(bands[bandIndex], bands[nextBand], bandT + turbulence);

      // Great Red Spot
      const spotX = 0.65;
      const spotY = 0.58;
      const dx = (x / size - spotX) * 2;
      const dy = (y / size - spotY) * 4;
      const spotDist = Math.sqrt(dx * dx + dy * dy);
      let color = bandColor;

      if (spotDist < 0.15) {
        const spotIntensity = 1 - spotDist / 0.15;
        const swirl = fbm(nx * 3 + spotDist * 10, ny * 3, 3);
        const spotColor: [number, number, number] = [
          200 + swirl * 40,
          80 + swirl * 30,
          50 + swirl * 20,
        ];
        color = lerpColor(color, spotColor, spotIntensity * 0.8);
      }

      const detail = fbm(nx * 2, ny * 30, 3) * 0.1;
      const r = Math.min(255, color[0] + detail * 30);
      const g = Math.min(255, color[1] + detail * 20);
      const b = Math.min(255, color[2] + detail * 10);

      const idx = (y * size + x) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

export function generateSaturnTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  const bands: [number, number, number][] = [
    [230, 210, 170],
    [210, 190, 150],
    [240, 220, 180],
    [200, 180, 140],
    [225, 205, 165],
    [215, 195, 155],
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 10;
      const ny = y / size;
      const bandIndex = Math.floor(ny * bands.length * 3) % bands.length;
      const nextBand = (bandIndex + 1) % bands.length;
      const bandT = (ny * bands.length * 3) % 1;

      const turbulence = fbm(nx, ny * 15, 3) * 0.1;
      const color = lerpColor(bands[bandIndex], bands[nextBand], bandT + turbulence);

      const detail = fbm(nx * 2, ny * 20, 3) * 0.05;
      const r = Math.min(255, color[0] + detail * 20);
      const g = Math.min(255, color[1] + detail * 15);
      const b = Math.min(255, color[2] + detail * 10);

      const idx = (y * size + x) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

export function generateSaturnRingTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, 64);

  for (let x = 0; x < size; x++) {
    const t = x / size;
    const n = fbm(t * 30, 0, 4);

    // Ring gaps
    let alpha = 0.8;
    if (t > 0.45 && t < 0.52) alpha *= 0.2; // Cassini Division
    if (t > 0.7 && t < 0.73) alpha *= 0.3;
    if (t < 0.1 || t > 0.95) alpha *= 0.3;

    const brightness = 0.6 + n * 0.4;
    const r = 210 * brightness;
    const g = 190 * brightness;
    const b = 150 * brightness;

    for (let y = 0; y < 64; y++) {
      const idx = (y * size + x) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = alpha * 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

export function generateUranusTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 6;
      const ny = y / size;
      const n = fbm(nx, ny * 10, 3);
      const band = Math.sin(ny * Math.PI * 8) * 0.05;

      const r = 150 + n * 30 + band * 20;
      const g = 220 + n * 20 + band * 15;
      const b = 230 + n * 15 + band * 10;

      const idx = (y * size + x) * 4;
      imageData.data[idx] = Math.min(255, r);
      imageData.data[idx + 1] = Math.min(255, g);
      imageData.data[idx + 2] = Math.min(255, b);
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

export function generateNeptuneTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 6;
      const ny = y / size;
      const n = fbm(nx, ny * 10, 4);
      const storms = fbm(nx * 3 + 20, ny * 5, 3);

      let r = 50 + n * 30;
      let g = 80 + n * 40;
      let b = 200 + n * 40;

      // Dark spots
      if (storms > 0.65) {
        const spotIntensity = (storms - 0.65) * 3;
        r -= spotIntensity * 30;
        g -= spotIntensity * 20;
        b -= spotIntensity * 10;
      }

      const idx = (y * size + x) * 4;
      imageData.data[idx] = Math.max(0, Math.min(255, r));
      imageData.data[idx + 1] = Math.max(0, Math.min(255, g));
      imageData.data[idx + 2] = Math.max(0, Math.min(255, b));
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

export function generateNebulaTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 4;
      const ny = y / size * 4;
      const n1 = fbm(nx, ny, 5);
      const n2 = fbm(nx * 2 + 100, ny * 2 + 100, 4);
      const n3 = fbm(nx * 0.5 + 200, ny * 0.5 + 200, 3);

      const cx = x / size - 0.5;
      const cy = y / size - 0.5;
      const dist = Math.sqrt(cx * cx + cy * cy);
      const falloff = Math.max(0, 1 - dist * 2);

      const r = (n1 * 80 + n3 * 40) * falloff;
      const g = (n2 * 30 + n1 * 20) * falloff;
      const b = (n1 * 120 + n2 * 60 + n3 * 30) * falloff;
      const a = (n1 * 0.3 + n2 * 0.2) * falloff * 255;

      const idx = (y * size + x) * 4;
      imageData.data[idx] = Math.min(255, r);
      imageData.data[idx + 1] = Math.min(255, g);
      imageData.data[idx + 2] = Math.min(255, b);
      imageData.data[idx + 3] = Math.min(255, a);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}
