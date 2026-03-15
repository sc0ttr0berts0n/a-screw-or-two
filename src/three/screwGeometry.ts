import * as THREE from 'three'
import type { ScrewSize, HeadType } from '@/types/product'

export type ScrewHeadType = HeadType

export interface ScrewConfig {
  size: ScrewSize
  lengthMm: number
  headType: HeadType
}

// Physical dimensions per metric size (in scene units, not real mm)
// Proportions based on ISO metric screw standards, scaled for display
interface SizeDimensions {
  shaftRadius: number
  headRadius: number
  headHeight: number
  threadPitch: number
  threadDepth: number
}

const SIZE_DIMENSIONS: Record<ScrewSize, SizeDimensions> = {
  M1:     { shaftRadius: 0.04, headRadius: 0.09, headHeight: 0.06, threadPitch: 0.025, threadDepth: 0.010 },
  'M1.6': { shaftRadius: 0.05, headRadius: 0.11, headHeight: 0.07, threadPitch: 0.030, threadDepth: 0.012 },
  M2:     { shaftRadius: 0.06, headRadius: 0.13, headHeight: 0.08, threadPitch: 0.035, threadDepth: 0.015 },
  'M2.5': { shaftRadius: 0.075, headRadius: 0.16, headHeight: 0.09, threadPitch: 0.040, threadDepth: 0.018 },
  M3:     { shaftRadius: 0.09, headRadius: 0.19, headHeight: 0.10, threadPitch: 0.045, threadDepth: 0.020 },
  M4:     { shaftRadius: 0.12, headRadius: 0.24, headHeight: 0.13, threadPitch: 0.060, threadDepth: 0.025 },
  M5:     { shaftRadius: 0.15, headRadius: 0.29, headHeight: 0.15, threadPitch: 0.070, threadDepth: 0.030 },
  M6:     { shaftRadius: 0.18, headRadius: 0.34, headHeight: 0.18, threadPitch: 0.085, threadDepth: 0.035 },
  M8:     { shaftRadius: 0.24, headRadius: 0.43, headHeight: 0.22, threadPitch: 0.110, threadDepth: 0.045 },
  M10:    { shaftRadius: 0.30, headRadius: 0.52, headHeight: 0.26, threadPitch: 0.130, threadDepth: 0.055 },
}

// Normalize shaft length so screws fit nicely in the viewport (~1.0–1.6 units)
// Real lengths range from 2mm (M1) to 60mm (M10)
const LENGTH_SCALE = 0.035 // 1mm real → 0.035 scene units
const MIN_SHAFT_LENGTH = 0.5
const MAX_SHAFT_LENGTH = 1.8

function computeShaftLength(lengthMm: number): number {
  return Math.max(MIN_SHAFT_LENGTH, Math.min(MAX_SHAFT_LENGTH, lengthMm * LENGTH_SCALE))
}

interface ScrewParams {
  shaftRadius: number
  shaftLength: number
  threadDepth: number
  threadPitch: number
  headType: HeadType
  headRadius: number
  headHeight: number
  segments: number
}

function configToParams(config: ScrewConfig): ScrewParams {
  const dims = SIZE_DIMENSIONS[config.size]
  return {
    shaftRadius: dims.shaftRadius,
    shaftLength: computeShaftLength(config.lengthMm),
    threadDepth: dims.threadDepth,
    threadPitch: dims.threadPitch,
    headType: config.headType,
    headRadius: dims.headRadius,
    headHeight: dims.headHeight,
    segments: 48,
  }
}

function createShaftVertices(
  params: ScrewParams,
  radialSegments: number,
  heightSegments: number,
): { positions: number[]; normals: number[]; uvs: number[]; indices: number[] } {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const { shaftRadius, shaftLength, threadDepth, threadPitch } = params

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments
    const posY = v * shaftLength - shaftLength / 2

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments
      const angle = u * Math.PI * 2

      // Helical thread profile
      const threadAngle = (posY / threadPitch) * Math.PI * 2 + angle
      const threadOffset = Math.max(0, Math.cos(threadAngle)) * threadDepth

      // Machine screw: uniform threads, slight chamfer only at very bottom
      const chamferZone = 0.03
      const chamferFactor = v < chamferZone ? v / chamferZone : 1
      const actualThread = threadOffset * chamferFactor

      const r = shaftRadius + actualThread
      const px = Math.cos(angle) * r
      const pz = Math.sin(angle) * r

      positions.push(px, posY, pz)

      const nx = Math.cos(angle)
      const nz = Math.sin(angle)
      normals.push(nx, 0, nz)

      uvs.push(u, v)
    }
  }

  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = y * (radialSegments + 1) + x
      const b = a + radialSegments + 1
      const c = a + 1
      const d = b + 1
      indices.push(a, b, c)
      indices.push(c, b, d)
    }
  }

  return { positions, normals, uvs, indices }
}

function createHeadVertices(
  params: ScrewParams,
  radialSegments: number,
  headSegments: number,
  baseY: number,
): { positions: number[]; normals: number[] } {
  const positions: number[] = []
  const normals: number[] = []
  const { headType, headRadius, headHeight, shaftRadius } = params

  for (let y = 0; y <= headSegments; y++) {
    const v = y / headSegments
    const posY = baseY + v * headHeight

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments
      const angle = u * Math.PI * 2

      let r: number
      let ny = 0

      switch (headType) {
        case 'hex': {
          const hexAngle = ((angle % (Math.PI / 3)) - Math.PI / 6)
          const hexR = headRadius / Math.cos(hexAngle)
          r = Math.min(hexR, headRadius * 1.15)
          if (v > 0.8) {
            const t = (v - 0.8) / 0.2
            r *= 1 - t * 0.1
            ny = t * 0.5
          }
          break
        }
        case 'flat': {
          const coneT = v
          r = shaftRadius + (headRadius - shaftRadius) * (1 - coneT)
          ny = 0.5
          break
        }
        case 'socketCap': {
          r = headRadius * 0.85
          if (v > 0.9) {
            ny = 1
          }
          break
        }
        case 'pan':
        default: {
          const dome = Math.sin(v * Math.PI * 0.5)
          r = shaftRadius + (headRadius - shaftRadius) * (1 - v * 0.3)
          ny = dome * 0.3
          break
        }
      }

      const px = Math.cos(angle) * r
      const pz = Math.sin(angle) * r

      positions.push(px, posY, pz)

      const nx = Math.cos(angle) * (1 - ny)
      const nz = Math.sin(angle) * (1 - ny)
      normals.push(nx, ny, nz)
    }
  }

  return { positions, normals }
}

export function createScrewGeometry(config: ScrewConfig): THREE.BufferGeometry {
  const params = configToParams(config)
  const radialSegments = params.segments
  const shaftHeightSegments = 96
  const headSegments = 8

  // Create shaft
  const shaft = createShaftVertices(params, radialSegments, shaftHeightSegments)

  // Create head on top of shaft
  const headBaseY = params.shaftLength / 2
  const head = createHeadVertices(params, radialSegments, headSegments, headBaseY)

  // Combine
  const allPositions = [...shaft.positions, ...head.positions]
  const allNormals = [...shaft.normals, ...head.normals]

  const headUvs: number[] = []
  for (let y = 0; y <= headSegments; y++) {
    for (let x = 0; x <= radialSegments; x++) {
      headUvs.push(x / radialSegments, 1 + y / headSegments)
    }
  }
  const allUvs = [...shaft.uvs, ...headUvs]

  const shaftVertexCount = (shaftHeightSegments + 1) * (radialSegments + 1)
  const headIndices: number[] = []
  for (let y = 0; y < headSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = shaftVertexCount + y * (radialSegments + 1) + x
      const b = a + radialSegments + 1
      const c = a + 1
      const d = b + 1
      headIndices.push(a, b, c)
      headIndices.push(c, b, d)
    }
  }

  // Connect shaft top to head bottom
  const connectIndices: number[] = []
  const shaftTopRow = shaftHeightSegments * (radialSegments + 1)
  const headBottomRow = shaftVertexCount
  for (let x = 0; x < radialSegments; x++) {
    const a = shaftTopRow + x
    const b = headBottomRow + x
    const c = a + 1
    const d = b + 1
    connectIndices.push(a, b, c)
    connectIndices.push(c, b, d)
  }

  const allIndices = [...shaft.indices, ...connectIndices, ...headIndices]

  // Head top cap
  const headCapStart = allPositions.length / 3
  const headTopRow = shaftVertexCount + headSegments * (radialSegments + 1)
  const headTopY = headBaseY + params.headHeight

  allPositions.push(0, headTopY, 0)
  allNormals.push(0, 1, 0)
  allUvs.push(0.5, 2)
  const capCenter = headCapStart

  for (let x = 0; x < radialSegments; x++) {
    allIndices.push(capCenter, headTopRow + x, headTopRow + x + 1)
  }

  // Flat chamfered tip (machine screw style)
  const currentVertCount = allPositions.length / 3
  const chamferRadius = params.shaftRadius * 0.7
  const chamferY = -params.shaftLength / 2 - params.shaftRadius * 0.3

  for (let x = 0; x <= radialSegments; x++) {
    const u = x / radialSegments
    const angle = u * Math.PI * 2
    allPositions.push(Math.cos(angle) * chamferRadius, chamferY, Math.sin(angle) * chamferRadius)
    allNormals.push(Math.cos(angle) * 0.5, -0.866, Math.sin(angle) * 0.5)
    allUvs.push(u, -0.05)
  }

  const chamferStart = currentVertCount
  for (let x = 0; x < radialSegments; x++) {
    const a = x
    const b = chamferStart + x
    const c = x + 1
    const d = chamferStart + x + 1
    allIndices.push(a, b, c)
    allIndices.push(c, b, d)
  }

  // Flat bottom cap
  const capCenterIdx = allPositions.length / 3
  allPositions.push(0, chamferY, 0)
  allNormals.push(0, -1, 0)
  allUvs.push(0.5, -0.1)

  for (let x = 0; x < radialSegments; x++) {
    allIndices.push(capCenterIdx, chamferStart + x + 1, chamferStart + x)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(allPositions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(allNormals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(allUvs, 2))
  geometry.setIndex(allIndices)
  geometry.computeVertexNormals()

  return geometry
}

/** Total visual height of a screw in scene units (shaft + head + chamfer tip) */
export function getScrewVisualHeight(config: ScrewConfig): number {
  const dims = SIZE_DIMENSIONS[config.size]
  const shaftLength = computeShaftLength(config.lengthMm)
  const chamferDrop = dims.shaftRadius * 0.3
  return shaftLength + dims.headHeight + chamferDrop
}

/** Max visual height across all showcase configs — used as the reference for scale=1 */
export function getMaxShowcaseHeight(): number {
  return Math.max(...SHOWCASE_CONFIGS.map(getScrewVisualHeight))
}

// Showcase configs that cycle through the product range
export const SHOWCASE_CONFIGS: ScrewConfig[] = [
  { size: 'M2', lengthMm: 6, headType: 'pan' },
  { size: 'M3', lengthMm: 10, headType: 'hex' },
  { size: 'M4', lengthMm: 16, headType: 'flat' },
  { size: 'M5', lengthMm: 20, headType: 'socketCap' },
  { size: 'M6', lengthMm: 25, headType: 'pan' },
  { size: 'M8', lengthMm: 30, headType: 'hex' },
  { size: 'M10', lengthMm: 40, headType: 'socketCap' },
  { size: 'M3', lengthMm: 8, headType: 'flat' },
]
