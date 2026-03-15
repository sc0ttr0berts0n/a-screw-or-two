import * as THREE from 'three'
import {
  createScrewGeometry,
  getScrewVisualHeight,
  getMaxShowcaseHeight,
  SHOWCASE_CONFIGS,
  type ScrewConfig,
} from './screwGeometry'

// Phase durations (seconds)
const DISPLAY_DURATION = 2.0
const SPINUP_DURATION = 0.8
const POOF_OUT_DURATION = 0.2
const POOF_IN_DURATION = 0.3

const BASE_SPIN_SPEED = 0.8
const MAX_SPIN_SPEED = 5.0

// Scale: smallest screw starts at ~0.5, largest at ~1.0
const MIN_START_SCALE = 0.5

function easeInQuad(t: number): number {
  return t * t
}

function easeInBack(t: number): number {
  const c1 = 1.70158
  return (c1 + 1) * t * t * t - c1 * t * t
}

function easeOutBack(t: number): number {
  const c1 = 1.70158
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export type AnimPhase = 'display' | 'spinup' | 'poofOut' | 'poofIn'

export interface ScrewDisplayState {
  mesh: THREE.Mesh
  material: THREE.MeshStandardMaterial
  currentIndex: number
  configs: ScrewConfig[]
  phase: AnimPhase
  phaseElapsed: number
  spinSpeed: number
  currentScale: number
  baseScale: number
  targetScale: number
  maxHeight: number
  needsSwap: boolean // signals scene to spawn particles + do geometry swap
  swapDone: boolean  // scene confirms swap happened
}

function computeBaseScale(config: ScrewConfig, maxHeight: number): number {
  const height = getScrewVisualHeight(config)
  const ratio = height / maxHeight // 0..1
  // Map: smallest → MIN_START_SCALE, largest → 1.0
  return MIN_START_SCALE + ratio * (1 - MIN_START_SCALE)
}

export function setupScrewMesh(configs: ScrewConfig[] = SHOWCASE_CONFIGS): {
  state: ScrewDisplayState
  material: THREE.MeshStandardMaterial
} {
  const material = new THREE.MeshStandardMaterial({
    color: 0xff2d7b,
    metalness: 0.45,
    roughness: 0.4,
    flatShading: false,
    side: THREE.DoubleSide,
  })

  const maxHeight = getMaxShowcaseHeight()
  const geometry = createScrewGeometry(configs[0])
  const mesh = new THREE.Mesh(geometry, material)
  const baseScale = computeBaseScale(configs[0], maxHeight)

  mesh.scale.setScalar(baseScale)

  const state: ScrewDisplayState = {
    mesh,
    material,
    currentIndex: 0,
    configs,
    phase: 'display',
    phaseElapsed: 0,
    spinSpeed: BASE_SPIN_SPEED,
    currentScale: baseScale,
    baseScale,
    targetScale: 1.0,
    maxHeight,
    needsSwap: false,
    swapDone: false,
  }

  return { state, material }
}

export function updateScrewDisplay(state: ScrewDisplayState, deltaTime: number): void {
  state.phaseElapsed += deltaTime

  switch (state.phase) {
    case 'display': {
      // Slowly scale up from baseScale toward targetScale
      const t = Math.min(1, state.phaseElapsed / DISPLAY_DURATION)
      state.currentScale = state.baseScale + (state.targetScale - state.baseScale) * t
      state.mesh.scale.setScalar(state.currentScale)
      state.spinSpeed = BASE_SPIN_SPEED

      if (state.phaseElapsed >= DISPLAY_DURATION) {
        state.phase = 'spinup'
        state.phaseElapsed = 0
      }
      break
    }

    case 'spinup': {
      // Accelerate rotation
      const t = Math.min(1, state.phaseElapsed / SPINUP_DURATION)
      state.spinSpeed = BASE_SPIN_SPEED + (MAX_SPIN_SPEED - BASE_SPIN_SPEED) * easeInQuad(t)

      if (state.phaseElapsed >= SPINUP_DURATION) {
        state.phase = 'poofOut'
        state.phaseElapsed = 0
      }
      break
    }

    case 'poofOut': {
      // Scale down to 0
      const t = Math.min(1, state.phaseElapsed / POOF_OUT_DURATION)
      state.currentScale = state.targetScale * (1 - easeInBack(t))
      state.mesh.scale.setScalar(Math.max(0.01, state.currentScale))
      state.spinSpeed = MAX_SPIN_SPEED

      if (t >= 1 && !state.needsSwap) {
        // Signal the scene to spawn particles and swap geometry
        state.needsSwap = true
      }

      // Wait for scene to confirm swap
      if (state.swapDone) {
        state.phase = 'poofIn'
        state.phaseElapsed = 0
        state.needsSwap = false
        state.swapDone = false
      }
      break
    }

    case 'poofIn': {
      // Scale up from 0 with bounce
      const t = Math.min(1, state.phaseElapsed / POOF_IN_DURATION)
      state.currentScale = state.baseScale * easeOutBack(t)
      state.mesh.scale.setScalar(Math.max(0.01, state.currentScale))
      state.spinSpeed = BASE_SPIN_SPEED + (MAX_SPIN_SPEED - BASE_SPIN_SPEED) * (1 - t)

      if (t >= 1) {
        state.phase = 'display'
        state.phaseElapsed = 0
        state.currentScale = state.baseScale
        state.spinSpeed = BASE_SPIN_SPEED
      }
      break
    }
  }
}

/** Called by the scene after particles are spawned — performs the geometry swap */
export function performSwap(state: ScrewDisplayState): void {
  state.currentIndex = (state.currentIndex + 1) % state.configs.length
  const nextConfig = state.configs[state.currentIndex]

  state.mesh.geometry.dispose()
  state.mesh.geometry = createScrewGeometry(nextConfig)

  state.baseScale = computeBaseScale(nextConfig, state.maxHeight)
  state.mesh.scale.setScalar(0.01)
  state.swapDone = true
}

export function getCurrentConfig(state: ScrewDisplayState): ScrewConfig {
  return state.configs[state.currentIndex]
}
