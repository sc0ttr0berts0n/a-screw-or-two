import * as THREE from 'three'

export type ScrewHeadType = 'pan' | 'hex' | 'flat' | 'socketCap'

interface ScrewParams {
  shaftRadius: number
  shaftLength: number
  threadDepth: number
  threadPitch: number
  headType: ScrewHeadType
  headRadius: number
  headHeight: number
  segments: number
  threadTurns: number
}

const DEFAULT_PARAMS: ScrewParams = {
  shaftRadius: 0.15,
  shaftLength: 1.4,
  threadDepth: 0.04,
  threadPitch: 0.12,
  headType: 'pan',
  headRadius: 0.35,
  headHeight: 0.2,
  segments: 32,
  threadTurns: 10,
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

  const { shaftRadius, shaftLength, threadDepth, threadPitch, threadTurns } = params

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments
    const posY = v * shaftLength - shaftLength / 2

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments
      const angle = u * Math.PI * 2

      // Add thread profile - sinusoidal approximation of helical thread
      const threadAngle = (posY / threadPitch) * Math.PI * 2 + angle
      const threadOffset = Math.max(0, Math.cos(threadAngle)) * threadDepth

      // Taper threads near tip
      const tipFactor = Math.min(1, (1 - v) * 5)
      const actualThread = threadOffset * tipFactor

      const r = shaftRadius + actualThread
      const px = Math.cos(angle) * r
      const pz = Math.sin(angle) * r

      positions.push(px, posY, pz)

      // Normal
      const nx = Math.cos(angle)
      const nz = Math.sin(angle)
      normals.push(nx, 0, nz)

      uvs.push(u, v)
    }
  }

  // Indices
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
          // Hexagonal cross-section
          const hexAngle = ((angle % (Math.PI / 3)) - Math.PI / 6)
          const hexR = headRadius / Math.cos(hexAngle)
          r = Math.min(hexR, headRadius * 1.15)
          // Slight dome on top
          if (v > 0.8) {
            const t = (v - 0.8) / 0.2
            r *= 1 - t * 0.1
            ny = t * 0.5
          }
          break
        }
        case 'flat': {
          // Countersunk / flat - cone shape
          const coneT = v
          r = shaftRadius + (headRadius - shaftRadius) * (1 - coneT)
          ny = 0.5
          break
        }
        case 'socketCap': {
          // Cylindrical with flat top
          r = headRadius * 0.85
          if (v > 0.9) {
            ny = 1
          }
          break
        }
        case 'pan':
        default: {
          // Rounded dome
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

export function createScrewGeometry(headType: ScrewHeadType = 'pan'): THREE.BufferGeometry {
  const params = { ...DEFAULT_PARAMS, headType }
  const radialSegments = params.segments
  const shaftHeightSegments = 64
  const headSegments = 8

  // Create shaft
  const shaft = createShaftVertices(params, radialSegments, shaftHeightSegments)

  // Create head on top of shaft
  const headBaseY = params.shaftLength / 2
  const head = createHeadVertices(params, radialSegments, headSegments, headBaseY)

  // Combine positions and normals
  const allPositions = [...shaft.positions, ...head.positions]
  const allNormals = [...shaft.normals, ...head.normals]

  // Generate UVs for head
  const headUvs: number[] = []
  for (let y = 0; y <= headSegments; y++) {
    for (let x = 0; x <= radialSegments; x++) {
      headUvs.push(x / radialSegments, 1 + y / headSegments)
    }
  }
  const allUvs = [...shaft.uvs, ...headUvs]

  // Generate indices for head (offset by shaft vertex count)
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

  // Create tip (cone at bottom)
  const tipPositions: number[] = []
  const tipNormals: number[] = []
  const tipUvs: number[] = []
  const tipIndices: number[] = []
  const currentVertCount = allPositions.length / 3

  // Tip point
  tipPositions.push(0, -params.shaftLength / 2 - params.shaftRadius * 1.5, 0)
  tipNormals.push(0, -1, 0)
  tipUvs.push(0.5, -0.1)

  // Connect to shaft bottom ring
  for (let x = 0; x < radialSegments; x++) {
    const a = x // shaft bottom vertex
    const b = (x + 1) % radialSegments
    tipIndices.push(currentVertCount, a, b)
  }

  allPositions.push(...tipPositions)
  allNormals.push(...tipNormals)
  allUvs.push(...tipUvs)
  allIndices.push(...tipIndices)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(allPositions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(allNormals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(allUvs, 2))
  geometry.setIndex(allIndices)
  geometry.computeVertexNormals()

  return geometry
}

export function createAllScrewGeometries(): Map<ScrewHeadType, THREE.BufferGeometry> {
  const types: ScrewHeadType[] = ['pan', 'hex', 'flat', 'socketCap']
  const geometries = new Map<ScrewHeadType, THREE.BufferGeometry>()
  for (const type of types) {
    geometries.set(type, createScrewGeometry(type))
  }
  return geometries
}
