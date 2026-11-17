// Ray-point picking trong screen space + Spatial Grid.
// Chiếu mọi sao lên màn hình bằng ma trận View-Projection (một lần mỗi khi camera đổi),
// chia vào lưới ô vuông; mỗi lần hover chỉ quét 3x3 ô quanh con trỏ thay vì duyệt O(N).
// Tương đương việc bắn ray từ con trỏ và lấy sao gần ray nhất, nhưng không cần invert ma trận.

const CELL = 32

export class StarPicker {
  /** @param {Float32Array} positions xyz của từng sao */
  constructor(positions) {
    this.positions = positions
    this.n = positions.length / 3
    this.screen = new Float32Array(this.n * 3) // x, y, depth
    this.grid = new Map()
    this.dirty = true
  }

  /** Gọi mỗi khi camera/viewport đổi. */
  invalidate() {
    this.dirty = true
  }

  rebuild(camera) {
    const p = this.positions
    const s = this.screen
    this.grid.clear()
    for (let i = 0; i < this.n; i++) {
      const r = camera.worldToScreen(p[i * 3], p[i * 3 + 1], p[i * 3 + 2])
      if (!r) {
        s[i * 3 + 2] = -1
        continue
      }
      s[i * 3] = r.x
      s[i * 3 + 1] = r.y
      s[i * 3 + 2] = r.depth
      const key = Math.floor(r.x / CELL) * 4096 + Math.floor(r.y / CELL)
      const bucket = this.grid.get(key)
      if (bucket) bucket.push(i)
      else this.grid.set(key, [i])
    }
    this.dirty = false
  }

  /**
   * @returns {number} chỉ số sao gần con trỏ nhất trong bán kính `radius` (CSS px), hoặc -1.
   * Khi hai sao cùng gần, ưu tiên sao gần camera hơn.
   */
  pick(camera, px, py, radius = 14) {
    if (this.dirty) this.rebuild(camera)
    const cx = Math.floor(px / CELL)
    const cy = Math.floor(py / CELL)
    const reach = Math.ceil(radius / CELL)
    let best = -1
    let bestScore = Infinity
    for (let gx = cx - reach; gx <= cx + reach; gx++) {
      for (let gy = cy - reach; gy <= cy + reach; gy++) {
        const bucket = this.grid.get(gx * 4096 + gy)
        if (!bucket) continue
        for (const i of bucket) {
          const d = Math.hypot(this.screen[i * 3] - px, this.screen[i * 3 + 1] - py)
          if (d > radius) continue
          const score = d + this.screen[i * 3 + 2] * 2
          if (score < bestScore) {
            bestScore = score
            best = i
          }
        }
      }
    }
    return best
  }
}
