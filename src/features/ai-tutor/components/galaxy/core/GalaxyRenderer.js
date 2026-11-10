// Vẽ galaxy: nebula nền -> đường nối chòm sao (gl.LINES) -> sao (gl.POINTS).
// WebGL2; nếu không có thì fallback Canvas 2D (cùng layout/màu, glow đơn giản).
import { LINE_FS, LINE_VS, NEBULA_FS, NEBULA_VS, STAR_FS, STAR_VS } from "./shaders"

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s)
    gl.deleteShader(s)
    throw new Error(log || "shader compile failed")
  }
  return s
}

function createProgram(gl, vsSrc, fsSrc) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc)
  const p = gl.createProgram()
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.linkProgram(p)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p)
    gl.deleteProgram(p)
    throw new Error(log || "program link failed")
  }
  return p
}

export class GalaxyRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {ReturnType<import("./layoutGenerator").generateGalaxyLayout>} layout
   * @param {{ quality: "high"|"low", reducedMotion: boolean }} opts
   */
  constructor(canvas, layout, opts) {
    this.canvas = canvas
    this.layout = layout
    this.opts = opts
    this.hover = -1
    this.dpr = 1
    this.width = 1
    this.height = 1
    this.introStart = opts.reducedMotion ? -1e9 : performance.now()
    this.gl = null
    this.ctx2d = null
    this.res = { programs: [], buffers: [], vaos: [] }

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    })
    if (gl) {
      try {
        this.initGL(gl)
        this.gl = gl
      } catch (err) {
        console.warn("[Galaxy] WebGL2 init failed, using Canvas 2D fallback", err)
        this.freeGL(gl)
      }
    }
    if (!this.gl) this.ctx2d = canvas.getContext("2d")
  }

  get isWebGL() {
    return !!this.gl
  }

  buffer(gl, data, usage = gl.STATIC_DRAW, target = gl.ARRAY_BUFFER) {
    const b = gl.createBuffer()
    gl.bindBuffer(target, b)
    gl.bufferData(target, data, usage)
    this.res.buffers.push(b)
    return b
  }

  bindAttr(gl, program, name, buf, size) {
    const loc = gl.getAttribLocation(program, name)
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
  }

  initGL(gl) {
    const L = this.layout
    this.starProg = createProgram(gl, STAR_VS, STAR_FS)
    this.lineProg = createProgram(gl, LINE_VS, LINE_FS)
    this.nebProg = createProgram(gl, NEBULA_VS, NEBULA_FS)
    this.res.programs.push(this.starProg, this.lineProg, this.nebProg)

    const posBuf = this.buffer(gl, L.positions)
    const colBuf = this.buffer(gl, L.colors)
    const seedBuf = this.buffer(gl, L.seeds)

    this.starVao = gl.createVertexArray()
    this.res.vaos.push(this.starVao)
    gl.bindVertexArray(this.starVao)
    this.bindAttr(gl, this.starProg, "aPos", posBuf, 3)
    this.bindAttr(gl, this.starProg, "aColor", colBuf, 3)
    this.bindAttr(gl, this.starProg, "aSeed", seedBuf, 1)

    // Đường nối dùng lại VBO vị trí/màu của sao + index buffer (không nhân đôi dữ liệu đỉnh).
    this.lineVao = gl.createVertexArray()
    this.res.vaos.push(this.lineVao)
    gl.bindVertexArray(this.lineVao)
    this.bindAttr(gl, this.lineProg, "aPos", posBuf, 3)
    this.bindAttr(gl, this.lineProg, "aColor", colBuf, 3)
    this.buffer(gl, L.lineIndices, gl.STATIC_DRAW, gl.ELEMENT_ARRAY_BUFFER)
    this.lineCount = L.lineIndices.length
    gl.bindVertexArray(null)

    this.emptyVao = gl.createVertexArray()
    this.res.vaos.push(this.emptyVao)

    const u = (p, n) => gl.getUniformLocation(p, n)
    this.u = {
      sVP: u(this.starProg, "uVP"),
      sTime: u(this.starProg, "uTime"),
      sIntro: u(this.starProg, "uIntro"),
      sScale: u(this.starProg, "uScale"),
      sHover: u(this.starProg, "uHover"),
      sMotion: u(this.starProg, "uMotion"),
      lVP: u(this.lineProg, "uVP"),
      lIntro: u(this.lineProg, "uIntro"),
      lAlpha: u(this.lineProg, "uAlpha"),
      nTime: u(this.nebProg, "uTime"),
      nYaw: u(this.nebProg, "uYaw"),
      nAspect: u(this.nebProg, "uAspect"),
      nIntro: u(this.nebProg, "uIntro"),
      nOct: u(this.nebProg, "uOct"),
    }
  }

  freeGL(gl) {
    const { programs, buffers, vaos } = this.res
    programs.forEach((p) => gl.deleteProgram(p))
    buffers.forEach((b) => gl.deleteBuffer(b))
    vaos.forEach((v) => gl.deleteVertexArray(v))
    this.res = { programs: [], buffers: [], vaos: [] }
  }

  /** Cập nhật kích thước theo canvas; hạ DPR để giữ FPS trên màn hình Retina. */
  resize() {
    const rect = this.canvas.getBoundingClientRect()
    const cap = this.opts.quality === "low" ? 1 : 1.5
    this.dpr = Math.min(window.devicePixelRatio || 1, cap)
    this.width = Math.max(1, rect.width)
    this.height = Math.max(1, rect.height)
    this.canvas.width = Math.round(this.width * this.dpr)
    this.canvas.height = Math.round(this.height * this.dpr)
  }

  replayIntro() {
    if (!this.opts.reducedMotion) this.introStart = performance.now()
  }

  intro(now) {
    return Math.min(1, (now - this.introStart) / 2600)
  }

  render(camera, now) {
    const t = (now - this.introStart) / 1000
    const intro = this.intro(now)
    if (this.gl) this.drawGL(camera, t, intro)
    else this.draw2D(camera, t, intro)
  }

  drawGL(camera, t, intro) {
    const gl = this.gl
    const u = this.u
    const motion = this.opts.reducedMotion ? 0 : 1
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)

    gl.disable(gl.BLEND)
    gl.useProgram(this.nebProg)
    gl.uniform1f(u.nTime, motion ? t : 0)
    gl.uniform1f(u.nYaw, camera.yaw)
    gl.uniform1f(u.nAspect, this.width / this.height)
    gl.uniform1f(u.nIntro, intro)
    gl.uniform1i(u.nOct, this.opts.quality === "low" ? 3 : 5)
    gl.bindVertexArray(this.emptyVao)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE) // additive: sao chồng nhau sáng lên

    gl.useProgram(this.lineProg)
    gl.uniformMatrix4fv(u.lVP, false, camera.vp)
    gl.uniform1f(u.lIntro, intro)
    gl.uniform1f(u.lAlpha, 0.16)
    gl.bindVertexArray(this.lineVao)
    gl.drawElements(gl.LINES, this.lineCount, gl.UNSIGNED_INT, 0)

    gl.useProgram(this.starProg)
    gl.uniformMatrix4fv(u.sVP, false, camera.vp)
    gl.uniform1f(u.sTime, t)
    gl.uniform1f(u.sIntro, intro)
    gl.uniform1f(u.sScale, (this.dpr * Math.min(this.width, this.height)) / 520)
    gl.uniform1f(u.sHover, this.hover)
    gl.uniform1f(u.sMotion, motion)
    gl.bindVertexArray(this.starVao)
    gl.drawArrays(gl.POINTS, 0, this.layout.n)
    gl.bindVertexArray(null)
  }

  /** Fallback không có WebGL2: cùng layout & màu, glow đơn giản. */
  draw2D(camera, t, intro) {
    const g = this.ctx2d
    if (!g) return
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    const bg = g.createRadialGradient(this.width / 2, this.height / 2, 0, this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.7)
    bg.addColorStop(0, "#1b1d38")
    bg.addColorStop(1, "#090c18")
    g.fillStyle = bg
    g.fillRect(0, 0, this.width, this.height)
    g.globalCompositeOperation = "lighter"
    const { positions, colors, n } = this.layout
    for (let i = 0; i < n; i++) {
      const s = camera.worldToScreen(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      if (!s) continue
      const hot = i === this.hover
      const size = Math.max(1.5, ((hot ? 14 : 4) * Math.min(this.width, this.height)) / 520 / s.depth)
      const a = (hot ? 1 : 0.55 * (0.7 + 0.3 * Math.sin(t + i))) * intro
      g.fillStyle = `rgba(${(colors[i * 3] * 255) | 0},${(colors[i * 3 + 1] * 255) | 0},${(colors[i * 3 + 2] * 255) | 0},${a})`
      g.fillRect(s.x - size / 2, s.y - size / 2, size, size)
    }
    g.globalCompositeOperation = "source-over"
  }

  /** Giải phóng tài nguyên GPU. Gọi khi unmount. */
  dispose() {
    const gl = this.gl
    if (gl) {
      // Không loseContext(): React StrictMode mount lại cùng canvas sẽ nhận context đã mất.
      this.freeGL(gl)
      this.gl = null
    }
  }
}

/** Chọn mức chất lượng trước khung hình đầu tiên. */
export function detectQuality() {
  const small = Math.min(window.screen.width, window.screen.height) < 600
  if ((navigator.hardwareConcurrency ?? 8) <= 4 || (navigator.deviceMemory ?? 8) <= 4 || small) return "low"
  return "high"
}
