import * as THREE from 'three'
import { createScrewGeometry, type ScrewHeadType } from './screwGeometry'

const HEAD_TYPES: ScrewHeadType[] = ['pan', 'hex', 'flat', 'socketCap']
const MORPH_DURATION = 0.6 // seconds for transition
const HOLD_DURATION = 1.8 // seconds between transitions

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export interface MorphState {
  mesh: THREE.Mesh
  currentIndex: number
  nextIndex: number
  morphProgress: number
  isTransitioning: boolean
  elapsed: number
}

export function setupMorphTargets(): {
  geometry: THREE.BufferGeometry
  state: MorphState
  material: THREE.MeshStandardMaterial
} {
  // Build base geometry (pan head)
  const baseGeometry = createScrewGeometry('pan')
  const basePositions = baseGeometry.getAttribute('position').array as Float32Array

  // Build morph targets from other head types
  const morphAttributes: THREE.Float32BufferAttribute[] = []

  for (let i = 1; i < HEAD_TYPES.length; i++) {
    const morphGeometry = createScrewGeometry(HEAD_TYPES[i])
    const morphPositions = morphGeometry.getAttribute('position').array as Float32Array

    // Ensure same vertex count - use base count and copy what we can
    const targetPositions = new Float32Array(basePositions.length)
    const copyLen = Math.min(basePositions.length, morphPositions.length)
    targetPositions.set(morphPositions.subarray(0, copyLen))
    // If morph has fewer vertices, remaining are filled with 0 (close to center)
    // Copy base positions for any extra vertices to avoid artifacts
    if (copyLen < basePositions.length) {
      for (let j = copyLen; j < basePositions.length; j++) {
        targetPositions[j] = basePositions[j]!
      }
    }

    morphAttributes.push(new THREE.Float32BufferAttribute(targetPositions, 3))
    morphGeometry.dispose()
  }

  baseGeometry.morphAttributes.position = morphAttributes

  const material = new THREE.MeshStandardMaterial({
    color: 0xb8b8b8,
    metalness: 0.85,
    roughness: 0.25,
    flatShading: false,
  })

  const mesh = new THREE.Mesh(baseGeometry, material)
  mesh.morphTargetInfluences = new Array(HEAD_TYPES.length - 1).fill(0)

  const state: MorphState = {
    mesh,
    currentIndex: 0,
    nextIndex: 1,
    morphProgress: 0,
    isTransitioning: false,
    elapsed: 0,
  }

  return { geometry: baseGeometry, state, material }
}

export function updateMorph(state: MorphState, deltaTime: number): void {
  state.elapsed += deltaTime

  if (!state.isTransitioning) {
    if (state.elapsed >= HOLD_DURATION) {
      state.isTransitioning = true
      state.elapsed = 0
      state.morphProgress = 0
      state.nextIndex = (state.currentIndex + 1) % HEAD_TYPES.length
    }
    return
  }

  state.morphProgress = Math.min(1, state.elapsed / MORPH_DURATION)
  const easedProgress = easeInOutCubic(state.morphProgress)

  // Reset all influences
  const influences = state.mesh.morphTargetInfluences!
  for (let i = 0; i < influences.length; i++) {
    influences[i] = 0
  }

  // The morph targets are indexed 0 = hex(1), 1 = flat(2), 2 = socketCap(3)
  // Base geometry is pan(0)

  if (state.currentIndex === 0) {
    // Morphing FROM base (pan) TO another type
    if (state.nextIndex > 0) {
      influences[state.nextIndex - 1] = easedProgress
    }
  } else if (state.nextIndex === 0) {
    // Morphing FROM some type BACK TO base (pan)
    influences[state.currentIndex - 1] = 1 - easedProgress
  } else {
    // Morphing between two non-base types
    influences[state.currentIndex - 1] = 1 - easedProgress
    influences[state.nextIndex - 1] = easedProgress
  }

  if (state.morphProgress >= 1) {
    state.isTransitioning = false
    state.elapsed = 0
    state.currentIndex = state.nextIndex
  }
}
