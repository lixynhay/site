// Custom GLSL Shaders for solar system effects

export const sunCoronaVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    
    // Pulsating corona
    float pulse = sin(uTime * 2.0) * 0.05 + sin(uTime * 3.7) * 0.03;
    vec3 newPos = position * (1.0 + pulse);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

export const sunCoronaFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    // Multi-layered corona with solar flares
    float noise1 = snoise(vPosition * 2.0 + uTime * 0.2);
    float noise2 = snoise(vPosition * 4.0 - uTime * 0.4);
    float noise3 = snoise(vPosition * 8.0 + uTime * 0.6);
    float noise4 = snoise(vPosition * 16.0 - uTime * 0.8);
    
    // Solar flare effect
    float flare = pow(max(0.0, noise4), 3.0) * 2.0;
    
    float corona = noise1 * 0.4 + noise2 * 0.3 + noise3 * 0.2 + flare * 0.1;
    corona = corona * 0.5 + 0.5;
    
    // Enhanced Fresnel effect
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
    
    // More realistic color gradient
    vec3 innerColor = vec3(1.0, 0.95, 0.6);   // Bright yellow-white
    vec3 midColor = vec3(1.0, 0.6, 0.1);      // Orange
    vec3 outerColor = vec3(1.0, 0.2, 0.0);    // Deep red
    vec3 flareColor = vec3(1.0, 0.8, 0.3);    // Bright flare
    
    vec3 finalColor = mix(innerColor, midColor, corona);
    finalColor = mix(finalColor, outerColor, fresnel * 0.7);
    finalColor = mix(finalColor, flareColor, flare * 0.5);
    
    // Intensity based on distance from center
    float intensity = (corona * 0.7 + fresnel * 0.3 + flare * 0.4) * 0.8;
    
    gl_FragColor = vec4(finalColor * intensity, intensity);
  }
`;

export const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform vec3 uColor;
  uniform vec3 uCameraPosition;
  uniform float uIntensity;
  
  void main() {
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    
    // Fresnel - how much we're looking at the edge
    float NdotV = dot(vNormal, viewDir);
    
    // Only show atmosphere at the edges (limb)
    float rim = 1.0 - max(0.0, NdotV);
    
    // Very smooth falloff - no hard edges
    rim = pow(rim, 4.0);
    
    // Soft intensity curve
    float intensity = rim * uIntensity * 0.4;
    
    // Gentle color with low alpha
    vec3 color = uColor * intensity;
    float alpha = clamp(intensity * 0.5, 0.0, 0.35);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const sunSurfaceVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float uTime;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    
    // Slight surface displacement
    float displacement = sin(position.x * 10.0 + uTime) * 
                         sin(position.y * 10.0 + uTime * 1.3) * 
                         sin(position.z * 10.0 + uTime * 0.7) * 0.02;
    
    vec3 newPos = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

export const sunSurfaceFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float uTime;
  uniform sampler2D uTexture;

  void main() {
    // Animated UV for flowing surface
    vec2 uv = vUv;
    uv.x += uTime * 0.01;
    uv.y += sin(uv.x * 5.0 + uTime) * 0.02;
    
    vec4 texColor = texture2D(uTexture, uv);
    
    // Add some variation
    float pulse = sin(uTime * 1.5) * 0.1 + 0.9;
    
    vec3 color = texColor.rgb * pulse;
    color += vec3(0.1, 0.05, 0.0) * sin(uTime * 2.0 + vPosition.x * 5.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Trail/particle shader
export const trailVertexShader = `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;
  
  void main() {
    vAlpha = aAlpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const trailFragmentShader = `
  varying float vAlpha;
  uniform vec3 uColor;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float alpha = (1.0 - dist * 2.0) * vAlpha;
    gl_FragColor = vec4(uColor, alpha * 0.6);
  }
`;

// Aurora shader for Earth
export const auroraVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const auroraFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uCameraPosition;
  
  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    // Only show at poles (high latitude)
    float latitude = abs(vPosition.y) / 1.1; // Normalized
    float poleMask = smoothstep(0.7, 0.95, latitude);
    
    if (poleMask < 0.01) discard;
    
    // Animated aurora curtains
    float noise1 = snoise(vec3(vPosition.xz * 3.0, uTime * 0.3));
    float noise2 = snoise(vec3(vPosition.xz * 5.0, uTime * 0.5));
    float noise3 = snoise(vec3(vPosition.xz * 8.0, uTime * 0.7));
    
    float aurora = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
    aurora = pow(max(0.0, aurora), 2.0) * 2.0;
    
    // Green-blue color gradient
    vec3 greenAurora = vec3(0.2, 1.0, 0.4);
    vec3 blueAurora = vec3(0.3, 0.5, 1.0);
    vec3 purpleAurora = vec3(0.6, 0.3, 0.8);
    
    vec3 color = mix(greenAurora, blueAurora, noise1 * 0.5 + 0.5);
    color = mix(color, purpleAurora, noise2 * 0.3);
    
    float alpha = aurora * poleMask * 0.6;
    
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

// Mars dust storm shader
export const marsDustVertexShader = `
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;
  
  void main() {
    vPosition = position;
    vUv = uv;
    
    // Animate dust particles
    float displacement = sin(position.x * 5.0 + uTime * 2.0) * 
                         cos(position.z * 5.0 + uTime * 1.5) * 0.02;
    
    vec3 newPos = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

export const marsDustFragmentShader = `
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;
  
  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    // Animated dust storm
    float dust1 = snoise(vec3(vPosition.xz * 4.0, uTime * 0.8));
    float dust2 = snoise(vec3(vPosition.xz * 8.0, uTime * 1.2));
    float dust3 = snoise(vec3(vPosition.xz * 12.0, uTime * 1.5));
    
    float dust = dust1 * 0.5 + dust2 * 0.3 + dust3 * 0.2;
    dust = pow(max(0.0, dust), 1.5) * 1.5;
    
    // Orange-brown dust color
    vec3 dustColor = vec3(0.8, 0.5, 0.3);
    
    float alpha = dust * 0.4;
    
    gl_FragColor = vec4(dustColor * alpha, alpha);
  }
`;

// CME (Coronal Mass Ejection) shader
export const cmeVertexShader = `
  attribute float aSize;
  attribute float aLife;
  varying float vLife;
  
  void main() {
    vLife = aLife;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (200.0 / -mvPosition.z) * (1.0 - aLife * 0.5);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const cmeFragmentShader = `
  varying float vLife;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float alpha = (1.0 - dist * 2.0) * (1.0 - vLife);
    
    // Hot plasma colors
    vec3 color = mix(vec3(1.0, 0.8, 0.3), vec3(1.0, 0.3, 0.1), vLife);
    
    gl_FragColor = vec4(color, alpha * 0.8);
  }
`;
