// GLSL cho Galaxy. Shader sao/nebula được rút gọn từ src/galaxy/engine.ts của Word Atlas.

export const STAR_VS = `#version 300 es
in vec3 aPos; in vec3 aColor; in float aSeed;
uniform mat4 uVP; uniform float uTime, uIntro, uScale, uHover, uMotion;
out vec3 vColor; out float vAlpha; out float vHot;
void main(){
  float t = clamp((uIntro - aSeed * 0.4) / 0.6, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - t, 3.0);
  // Sao xoắn vào từ vòng ngoài khi mở ngân hà.
  float ang = atan(aPos.z, aPos.x) + (1.0 - e) * 3.4;
  float rad = length(aPos.xz) * mix(2.4, 1.0, e);
  vec3 p = vec3(cos(ang) * rad, aPos.y * e, sin(ang) * rad);
  vec4 clip = uVP * vec4(p, 1.0);
  gl_Position = clip;
  float tw = mix(1.0, 0.7 + 0.3 * sin(uTime * (1.0 + aSeed * 2.5) + aSeed * 50.0), uMotion);
  float size = 4.2 + aSeed * 2.0;
  float alpha = 0.85;
  vec3 col = mix(aColor, vec3(0.85, 0.88, 1.0), 0.25);
  vHot = 0.0;
  if (abs(float(gl_VertexID) - uHover) < 0.5) { size = 20.0; alpha = 1.0; col = vec3(1.0); vHot = 1.0; }
  gl_PointSize = max(1.5, size * uScale / clip.w);
  vColor = col;
  vAlpha = alpha * e * mix(tw, 1.0, vHot);
}`

export const STAR_FS = `#version 300 es
precision mediump float;
in vec3 vColor; in float vAlpha; in float vHot;
out vec4 o;
void main(){
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d = dot(c, c);
  if (d > 1.0) discard;
  // Lõi sáng + hào quang mềm (smoothstep/exp), mạnh hơn khi hover.
  float core = exp(-d * mix(9.0, 30.0, vHot));
  float halo = exp(-d * 2.6) * mix(0.3, 0.6, vHot);
  float a = (core + halo) * vAlpha;
  o = vec4(vColor * a, a);
}`

export const LINE_VS = `#version 300 es
in vec3 aPos; in vec3 aColor;
uniform mat4 uVP; uniform float uIntro;
out vec3 vColor;
void main(){
  float e = 1.0 - pow(1.0 - clamp(uIntro, 0.0, 1.0), 3.0);
  float ang = atan(aPos.z, aPos.x) + (1.0 - e) * 3.4;
  float rad = length(aPos.xz) * mix(2.4, 1.0, e);
  gl_Position = uVP * vec4(cos(ang) * rad, aPos.y * e, sin(ang) * rad, 1.0);
  vColor = aColor * e;
}`

export const LINE_FS = `#version 300 es
precision mediump float;
in vec3 vColor; uniform float uAlpha; out vec4 o;
void main(){ o = vec4(vColor * uAlpha, uAlpha); }`

export const NEBULA_VS = `#version 300 es
const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
out vec2 vUv;
void main(){ vUv = P[gl_VertexID] * 0.5 + 0.5; gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }`

export const NEBULA_FS = `#version 300 es
precision mediump float;
in vec2 vUv; out vec4 o;
uniform float uTime, uYaw, uAspect, uIntro;
uniform int uOct;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ if (i >= uOct) break; s += a * n(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
void main(){
  vec2 uv = vUv; uv.x *= uAspect;
  vec2 q = uv * 2.2 + vec2(uYaw * 0.35, 0.0) + uTime * 0.008;
  float f = fbm(q + fbm(q * 1.7 + uTime * 0.01));
  vec3 col = vec3(0.035, 0.047, 0.098)
    + vec3(0.23, 0.16, 0.42) * smoothstep(0.45, 0.95, f) * 0.55
    + vec3(0.08, 0.27, 0.36) * smoothstep(0.55, 1.0, fbm(q * 0.8 - 3.0)) * 0.45;
  float vig = smoothstep(1.25, 0.25, length((vUv - 0.5) * vec2(uAspect, 1.0)));
  o = vec4(col * mix(0.55, 1.0, vig) * (0.35 + 0.65 * uIntro), 1.0);
}`
