export const computeRms = (samples) => {
  if (!samples || samples.length === 0) return 0
  let sum = 0
  for (let index = 0; index < samples.length; index += 1) {
    sum += samples[index] * samples[index]
  }
  return Math.sqrt(sum / samples.length)
}

export const bytesToUnitSamples = (bytes) => {
  const samples = new Float32Array(bytes.length)
  for (let index = 0; index < bytes.length; index += 1) {
    samples[index] = (bytes[index] - 128) / 128
  }
  return samples
}

export const computeLevel = (samples) => Math.min(1, Math.max(0, computeRms(samples)))
