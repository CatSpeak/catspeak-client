// Orbit camera (yaw/pitch/dist quanh target) + quán tính (damping) + ma trận View/Projection.
// Ma trận column-major như WebGL.

const FOV = 0.75
const NEAR = 0.02
const FAR = 20
const MIN_DIST = 0.25
const MAX_DIST = 3.2
const MAX_PITCH = 1.5

function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2)
  const nf = 1 / (near - far)
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0])
}

function lookAt(ex, ey, ez, cx, cy, cz) {
  let zx = ex - cx
  let zy = ey - cy
  let zz = ez - cz
  let l = Math.hypot(zx, zy, zz) || 1
  zx /= l
  zy /= l
  zz /= l
  let xx = zz
  let xz = -zx
  l = Math.hypot(xx, xz) || 1
  xx /= l
  xz /= l
  const yx = zy * xz
  const yy = zz * xx - zx * xz
  const yz = -zy * xx
  return new Float32Array([
    xx, yx, zx, 0,
    0, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx * ex + xz * ez), -(yx * ex + yy * ey + yz * ez), -(zx * ex + zy * ey + zz * ez), 1,
  ])
}

function multiply(a, b) {
  const o = new Float32Array(16)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]
      o[c * 4 + r] = s
    }
  }
  return o
}

export class GalaxyCamera {
  constructor() {
    this.yaw = 0.6
    this.pitch = 1.0
    this.dist = 1.9
    this.target = [0, 0, 0]
    // Vận tốc quán tính
    this.vYaw = 0
    this.vPitch = 0
    this.vDist = 0
    this.vPan = [0, 0, 0]
    this.vp = new Float32Array(16)
    this.width = 1
    this.height = 1
    this.goal = null
  }

  setViewport(w, h) {
    this.width = Math.max(1, w)
    this.height = Math.max(1, h)
  }

  /** Khoảng cách mặc định: màn hình dọc cần lùi xa hơn. */
  baseDist() {
    const aspect = this.width / this.height
    return aspect < 1 ? (1.9 / Math.max(0.55, aspect)) * 0.82 : 1.9
  }

  orbit(dx, dy) {
    this.goal = null
    this.yaw -= dx * 0.005
    this.pitch = clamp(this.pitch + dy * 0.005, -MAX_PITCH, MAX_PITCH)
    this.vYaw = -dx * 0.005
    this.vPitch = dy * 0.005
  }

  /** Pan theo mặt phẳng màn hình. */
  pan(dx, dy) {
    this.goal = null
    const scale = (this.dist * Math.tan(FOV / 2) * 2) / this.height
    const rx = Math.cos(this.yaw)
    const rz = -Math.sin(this.yaw)
    // vector "up" màn hình chiếu lên mặt phẳng ngang + trục Y
    const sp = Math.sin(this.pitch)
    const cp = Math.cos(this.pitch)
    const ux = -sp * Math.sin(this.yaw)
    const uz = -sp * Math.cos(this.yaw)
    const mx = -dx * scale * rx + dy * scale * ux
    const my = dy * scale * cp
    const mz = -dx * scale * rz + dy * scale * uz
    this.target[0] += mx
    this.target[1] += my
    this.target[2] += mz
    this.vPan = [mx, my, mz]
    this.clampTarget()
  }

  zoom(factor) {
    this.goal = null
    const next = clamp(this.dist * factor, MIN_DIST, MAX_DIST)
    this.vDist = next - this.dist
    this.dist = next
  }

  /** Thả tay: giữ lại quán tính từ lần kéo cuối. */
  release() {}

  stopInertia() {
    this.vYaw = this.vPitch = this.vDist = 0
    this.vPan = [0, 0, 0]
  }

  flyTo(target, dist) {
    this.goal = { target, dist }
  }

  reset() {
    this.goal = { target: [0, 0, 0], dist: this.baseDist(), pitch: 1.0 }
  }

  clampTarget() {
    const r = Math.hypot(this.target[0], this.target[2])
    if (r > 1.2) {
      this.target[0] *= 1.2 / r
      this.target[2] *= 1.2 / r
    }
    this.target[1] = clamp(this.target[1], -0.6, 0.6)
  }

  /**
   * @param {number} dt giây
   * @param {boolean} dragging đang kéo -> không áp quán tính
   * @param {number} autoRotate rad/giây khi rảnh
   */
  update(dt, dragging, autoRotate = 0) {
    if (this.goal) {
      const k = Math.min(1, dt * 3.2)
      this.target = this.target.map((v, i) => v + (this.goal.target[i] - v) * k)
      this.dist += (this.goal.dist - this.dist) * k
      if (this.goal.pitch !== undefined) this.pitch += (this.goal.pitch - this.pitch) * k
      if (Math.abs(this.goal.dist - this.dist) < 1e-3) this.goal = null
    } else if (!dragging) {
      // Giảm chấn theo thời gian (độc lập FPS): thả chuột vẫn lướt nhẹ.
      const damp = Math.pow(0.92, dt * 60)
      const f = dt * 60
      this.yaw += this.vYaw * f
      this.pitch = clamp(this.pitch + this.vPitch * f, -MAX_PITCH, MAX_PITCH)
      this.dist = clamp(this.dist + this.vDist * f, MIN_DIST, MAX_DIST)
      this.target[0] += this.vPan[0] * f
      this.target[1] += this.vPan[1] * f
      this.target[2] += this.vPan[2] * f
      this.clampTarget()
      this.vYaw *= damp
      this.vPitch *= damp
      this.vDist *= damp
      this.vPan = this.vPan.map((v) => v * damp)
      if (Math.abs(this.vYaw) < 1e-5 && Math.abs(this.vPitch) < 1e-5) this.yaw += autoRotate * dt
    }
    this.updateMatrix()
  }

  updateMatrix() {
    const [tx, ty, tz] = this.target
    const ex = tx + this.dist * Math.cos(this.pitch) * Math.sin(this.yaw)
    const ey = ty + this.dist * Math.sin(this.pitch)
    const ez = tz + this.dist * Math.cos(this.pitch) * Math.cos(this.yaw)
    this.vp = multiply(perspective(FOV, this.width / this.height, NEAR, FAR), lookAt(ex, ey, ez, tx, ty, tz))
  }

  /** Tọa độ thế giới -> CSS px. null nếu nằm sau camera. */
  worldToScreen(x, y, z) {
    const m = this.vp
    const cw = m[3] * x + m[7] * y + m[11] * z + m[15]
    if (cw <= 0.01) return null
    const cx = (m[0] * x + m[4] * y + m[8] * z + m[12]) / cw
    const cy = (m[1] * x + m[5] * y + m[9] * z + m[13]) / cw
    return { x: (cx * 0.5 + 0.5) * this.width, y: (1 - (cy * 0.5 + 0.5)) * this.height, depth: cw }
  }
}

function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v))
}
