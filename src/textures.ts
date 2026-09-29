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

  const ocean: [number, number, number] = [20, 60, 150];
  const deepOcean: [number, number, number] = [10, 30, 100];
  const shallowOcean: [number, number, number] = [40, 100, 180];
  const land: [number, number, number] = [40, 110, 40];
  const forest: [number, number, number] = [30, 90, 30];
  const desert: [number, number, number] = [190, 170, 110];
  const mountain: [number, number, number] = [110, 95, 75];
  const snow: [number, number, number] = [245, 248, 255];
  const ice: [number, number, number] = [225, 238, 252];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 10;
      const ny = y / size * 10;
      const lat = (y / size - 0.5) * Math.PI;

      const continent = fbm(nx + 3.7, ny + 2.1, 7);
      const detail = fbm(nx * 5, ny * 5, 5);
      const micro = fbm(nx * 15, ny * 15, 3);
      const elevation = continent * 0.6 + detail * 0.3 + micro * 0.1;

      let color: [number, number, number];
      const absLat = Math.abs(lat);

      if (absLat > 1.25) {
        color = ice;
      } else if (elevation < 0.38) {
        color = lerpColor(deepOcean, ocean, elevation / 0.38);
      } else if (elevation < 0.42) {
        color = lerpColor(ocean, shallowOcean, (elevation - 0.38) / 0.04);
      } else if (elevation < 0.48) {
        color = land;
        if (absLat < 0.4 && detail > 0.5) {
          color = lerpColor(land, desert, (detail - 0.5) * 2.5);
        } else if (absLat > 0.3 && absLat < 0.8) {
          color = lerpColor(land, forest, (detail - 0.3) * 1.5);
        }
      } else if (elevation < 0.6) {
        color = lerpColor(forest, mountain, (elevation - 0.48) / 0.12);
      } else {
        color = lerpColor(mountain, snow, Math.min(1, (elevation - 0.6) / 0.12));
      }

      // Clouds with more detail
      const cloud = fbm(nx * 2.5 + 10, ny * 2.5 + 10, 5);
      if (cloud > 0.52) {
        const cloudIntensity = (cloud - 0.52) * 2.5;
        color = lerpColor(color, [255, 255, 255], Math.min(0.8, cloudIntensity));
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
    [220, 185, 140],
    [245, 210, 160],
    [190, 140, 90],
    [225, 190, 140],
    [170, 120, 80],
    [210, 170, 120],
    [235, 200, 150],
    [180, 130, 85],
    [200, 160, 110],
    [240, 205, 155],
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 14;
      const ny = y / size;
      
      // More complex band structure
      const bandNoise = fbm(nx * 0.5, ny * 25, 4) * 0.08;
      const bandPosition = (ny + bandNoise) * bands.length * 2.5;
      const bandIndex = Math.floor(bandPosition) % bands.length;
      const nextBand = (bandIndex + 1) % bands.length;
      const bandT = bandPosition % 1;
      
      // Smooth band transition
      const smoothT = bandT * bandT * (3 - 2 * bandT);
      const turbulence = fbm(nx + ny * 3, ny * 25, 5) * 0.2;
      const bandColor = lerpColor(bands[bandIndex], bands[nextBand], smoothT + turbulence);

      // Great Red Spot - more realistic
      const spotX = 0.62;
      const spotY = 0.55;
      const dx = (x / size - spotX) * 2.5;
      const dy = (y / size - spotY) * 5;
      const spotDist = Math.sqrt(dx * dx + dy * dy);
      let color = bandColor;

      if (spotDist < 0.18) {
        const spotIntensity = 1 - spotDist / 0.18;
        const swirl = fbm(nx * 4 + spotDist * 15, ny * 4, 4);
        const swirlAngle = Math.atan2(dy, dx) + swirl * 2;
        const spotColor: [number, number, number] = [
          190 + swirl * 50 + Math.sin(swirlAngle) * 20,
          70 + swirl * 30,
          40 + swirl * 20,
        ];
        color = lerpColor(color, spotColor, spotIntensity * spotIntensity * 0.85);
      }

      // Add storm details
      const stormDetail = fbm(nx * 3, ny * 40, 3) * 0.15;
      const r = Math.min(255, Math.max(0, color[0] + stormDetail * 40));
      const g = Math.min(255, Math.max(0, color[1] + stormDetail * 30));
      const b = Math.min(255, Math.max(0, color[2] + stormDetail * 20));

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
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, 128);

  for (let x = 0; x < size; x++) {
    const t = x / size;
    
    // Multiple noise layers for realistic ring structure
    const n1 = fbm(t * 40, 0, 5);
    const n2 = fbm(t * 80 + 100, 0, 4);
    const n3 = fbm(t * 120 + 200, 0, 3);
    
    // Ring structure with multiple bands
    let alpha = 0.0;
    let brightness = 0.0;
    
    // A Ring (outer)
    if (t > 0.65 && t < 0.85) {
      const ringPos = (t - 0.65) / 0.2;
      alpha = 0.7 + n1 * 0.2;
      brightness = 0.7 + n1 * 0.3;
      // Encke Gap
      if (t > 0.78 && t < 0.79) alpha *= 0.1;
    }
    
    // B Ring (brightest)
    if (t > 0.45 && t < 0.65) {
      const ringPos = (t - 0.45) / 0.2;
      alpha = 0.9 + n2 * 0.1;
      brightness = 0.85 + n2 * 0.15;
    }
    
    // Cassini Division (gap)
    if (t > 0.42 && t < 0.45) {
      alpha = 0.05 + n3 * 0.05;
      brightness = 0.3;
    }
    
    // C Ring (inner, faint)
    if (t > 0.25 && t < 0.42) {
      const ringPos = (t - 0.25) / 0.17;
      alpha = 0.3 + n3 * 0.2;
      brightness = 0.5 + n3 * 0.2;
    }
    
    // D Ring (innermost, very faint)
    if (t > 0.15 && t < 0.25) {
      alpha = 0.1 + n1 * 0.1;
      brightness = 0.3 + n1 * 0.1;
    }
    
    // Fade at edges
    if (t < 0.15) alpha *= t / 0.15;
    if (t > 0.85) alpha *= (1 - t) / 0.15;
    
    // Color variation
    const colorVar = n2 * 0.1;
    const r = (220 + colorVar * 30) * brightness;
    const g = (200 + colorVar * 20) * brightness;
    const b = (160 + colorVar * 10) * brightness;

    for (let y = 0; y < 128; y++) {
      const idx = (y * size + x) * 4;
      imageData.data[idx] = Math.min(255, r);
      imageData.data[idx + 1] = Math.min(255, g);
      imageData.data[idx + 2] = Math.min(255, b);
      imageData.data[idx + 3] = Math.min(255, alpha * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 8;
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

export function generatePlutoTexture(): THREE.CanvasTexture {
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
      const n = fbm(nx, ny, 5);
      const detail = fbm(nx * 3, ny * 3, 3);

      // Pluto's heart-shaped feature (Tombaugh Regio)
      const heartX = 0.5;
      const heartY = 0.5;
      const dx = (x / size - heartX) * 2;
      const dy = (y / size - heartY) * 2;
      const heartDist = Math.sqrt(dx * dx + dy * dy);
      
      let r = 180 + n * 40 + detail * 20;
      let g = 160 + n * 35 + detail * 15;
      let b = 140 + n * 30 + detail * 10;

      // Bright heart region
      if (heartDist < 0.3) {
        const heartIntensity = 1 - heartDist / 0.3;
        r += heartIntensity * 40;
        g += heartIntensity * 35;
        b += heartIntensity * 30;
      }

      // Darker regions
      if (n < 0.4) {
        r *= 0.7;
        g *= 0.65;
        b *= 0.6;
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

// Generate bump map for surface details
export function generateBumpMap(size: number, scale: number, octaves: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * scale;
      const ny = y / size * scale;
      const n = fbm(nx, ny, octaves);
      const value = Math.floor(n * 255);

      const idx = (y * size + x) * 4;
      imageData.data[idx] = value;
      imageData.data[idx + 1] = value;
      imageData.data[idx + 2] = value;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

// Generate colored nebula texture
export function generateColoredNebulaTexture(
  color1: [number, number, number],
  color2: [number, number, number],
  color3: [number, number, number]
): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * 5;
      const ny = y / size * 5;
      
      // Multiple noise layers for complex structure
      const n1 = fbm(nx, ny, 6);
      const n2 = fbm(nx * 2 + 50, ny * 2 + 50, 5);
      const n3 = fbm(nx * 0.5 + 100, ny * 0.5 + 100, 4);
      const n4 = fbm(nx * 3 + 150, ny * 3 + 150, 3);

      // Distance from center for falloff
      const cx = x / size - 0.5;
      const cy = y / size - 0.5;
      const dist = Math.sqrt(cx * cx + cy * cy);
      const falloff = Math.max(0, 1 - dist * 1.8);
      const softFalloff = falloff * falloff;

      // Mix colors based on noise
      const t1 = n1;
      const t2 = n2;
      const t3 = n3;
      
      const r = (color1[0] * t1 + color2[0] * t2 + color3[0] * t3) / (t1 + t2 + t3 + 0.001);
      const g = (color1[1] * t1 + color2[1] * t2 + color3[1] * t3) / (t1 + t2 + t3 + 0.001);
      const b = (color1[2] * t1 + color2[2] * t2 + color3[2] * t3) / (t1 + t2 + t3 + 0.001);

      // Add detail with n4
      const detail = n4 * 0.3;
      
      const finalR = Math.min(255, r * softFalloff + detail * 50);
      const finalG = Math.min(255, g * softFalloff + detail * 50);
      const finalB = Math.min(255, b * softFalloff + detail * 50);
      
      // Alpha based on density
      const density = (n1 + n2 + n3) / 3;
      const alpha = density * softFalloff * 255;

      const idx = (y * size + x) * 4;
      imageData.data[idx] = finalR;
      imageData.data[idx + 1] = finalG;
      imageData.data[idx + 2] = finalB;
      imageData.data[idx + 3] = Math.min(255, alpha);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

// Generate galaxy texture
export function generateGalaxyTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size - 0.5;
      const ny = y / size - 0.5;
      
      // Spiral arm pattern
      const dist = Math.sqrt(nx * nx + ny * ny);
      const angle = Math.atan2(ny, nx);
      
      // Spiral arms
      const spiral = Math.sin(angle * 3 + dist * 15) * 0.5 + 0.5;
      const armStrength = Math.exp(-dist * 4) * spiral;
      
      // Core brightness
      const core = Math.exp(-dist * 8);
      
      // Noise for detail
      const noise = fbm(nx * 10, ny * 10, 4);
      
      // Combine
      const brightness = (armStrength + core * 2 + noise * 0.2) * Math.exp(-dist * 3);
      
      // Color gradient (blue outer, yellow core)
      const colorMix = Math.exp(-dist * 5);
      const r = Math.min(255, brightness * (200 + colorMix * 55));
      const g = Math.min(255, brightness * (180 + colorMix * 75));
      const b = Math.min(255, brightness * (255 - colorMix * 100));
      
      const alpha = Math.min(255, brightness * 255);

      const idx = (y * size + x) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}
