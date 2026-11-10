// Sinh tọa độ 3D cố định cho từng ngôi sao.
// Mọi giá trị "ngẫu nhiên" đều lấy từ hash(word.id) -> F5 lại vị trí không đổi.
// Công thức cụm elip + nhánh xoắn ốc tham khảo src/galaxy/layout.ts của Word Atlas.

/** FNV-1a 32-bit. */
export function hashSeed(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Mulberry32 PRNG. */
export function createRand(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hexToRgb = (hex) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)

/**
 * @param {Array<{id: string, clusterId: string}>} words
 * @param {Array<{id: string, label: string, color: string}>} clusters
 */
export function generateGalaxyLayout(words, clusters) {
  const n = words.length
  const positions = new Float32Array(n * 3)
  const colors = new Float32Array(n * 3)
  const seeds = new Float32Array(n)
  const clusterIndex = new Map(clusters.map((c, i) => [c.id, i]))
  const members = clusters.map(() => [])

  // Tâm cụm: mỗi cụm một nhánh xoắn ốc quanh lõi.
  const centers = clusters.map((_, k) => {
    const r = createRand(hashSeed(`cluster-${k}`))
    const arm = (k / clusters.length) * Math.PI * 2
    const radius = 0.5 + (k % 3) * 0.14 + r() * 0.06
    const angle = arm + radius * 2.2
    return [Math.cos(angle) * radius, (r() - 0.5) * 0.28, Math.sin(angle) * radius]
  })

  words.forEach((w, i) => {
    const k = clusterIndex.get(w.clusterId) ?? 0
    const r = createRand(hashSeed(w.id))
    const gauss = () => (r() + r() + r() - 1.5) / 1.5
    // Elip dẹt xoay theo nhánh để các cụm không đè lên nhau.
    const tilt = (k / clusters.length) * Math.PI * 2
    const ex = gauss() * 0.2
    const ez = gauss() * 0.11
    const [cx, cy, cz] = centers[k]
    positions[i * 3] = cx + ex * Math.cos(tilt) - ez * Math.sin(tilt)
    positions[i * 3 + 1] = cy + gauss() * 0.07
    positions[i * 3 + 2] = cz + ex * Math.sin(tilt) + ez * Math.cos(tilt)
    colors.set(hexToRgb(clusters[k].color), i * 3)
    seeds[i] = r()
    members[k].push(i)
  })

  return {
    n,
    positions,
    colors,
    seeds,
    ids: words.map((w) => w.id),
    centers,
    members,
    lineIndices: buildConstellationLines(positions, members),
  }
}

/**
 * Đường nối chòm sao: mỗi cụm lấy tối đa `hubs` sao, nối chuỗi theo góc quanh tâm
 * (vòng hở) + vài cạnh nan hoa về sao gần tâm nhất -> trông như chòm sao, không dày đặc.
 */
function buildConstellationLines(positions, members, hubs = 28) {
  const out = []
  members.forEach((list) => {
    if (list.length < 3) return
    const step = Math.max(1, Math.floor(list.length / hubs))
    const picked = []
    for (let i = 0; i < list.length && picked.length < hubs; i += step) picked.push(list[i])
    let cx = 0
    let cz = 0
    picked.forEach((i) => {
      cx += positions[i * 3]
      cz += positions[i * 3 + 2]
    })
    cx /= picked.length
    cz /= picked.length
    const ang = (i) => Math.atan2(positions[i * 3 + 2] - cz, positions[i * 3] - cx)
    picked.sort((a, b) => ang(a) - ang(b))
    for (let i = 0; i + 1 < picked.length; i++) out.push(picked[i], picked[i + 1])
    let core = picked[0]
    let best = Infinity
    picked.forEach((i) => {
      const d = Math.hypot(positions[i * 3] - cx, positions[i * 3 + 2] - cz)
      if (d < best) {
        best = d
        core = i
      }
    })
    for (let i = 0; i < picked.length; i += 4) if (picked[i] !== core) out.push(core, picked[i])
  })
  return new Uint32Array(out)
}
