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
    float noise1 = snoise(vPosition * 2.0 + uTime * 0.3);
    float noise2 = snoise(vPosition * 4.0 - uTime * 0.5);
    float noise3 = snoise(vPosition * 8.0 + uTime * 0.7);
    
    float corona = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
    corona = corona * 0.5 + 0.5;
    
    // Fresnel effect for edge glow
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    
    vec3 color1 = vec3(1.0, 0.6, 0.1);
    vec3 color2 = vec3(1.0, 0.3, 0.0);
    vec3 color3 = vec3(1.0, 0.9, 0.3);
    
    vec3 finalColor = mix(color1, color2, corona);
    finalColor = mix(finalColor, color3, fresnel * 0.5);
    
    float alpha = (corona * 0.6 + fresnel * 0.4) * 0.7;
    
    gl_FragColor = vec4(finalColor, alpha);
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
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
    
    vec3 color = uColor * (fresnel * uIntensity);
    float alpha = fresnel * uIntensity * 0.8;
    
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
