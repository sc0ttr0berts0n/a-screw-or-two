import * as THREE from 'three'
import {
  createScrewGeometry,
  getScrewVisualHeight,
  SHOWCASE_CONFIGS,
  type ScrewConfig,
} from './screwGeometry'

// Phase durations (seconds)
const DISPLAY_DURATION = 2.0
const SPINUP_DURATION = 1.6
const POOF_OUT_DURATION = 0.2
const POOF_IN_DURATION = 0.2

const BASE_SPIN_SPEED = 0.8
const MAX_SPIN_SPEED = 5.0

// Camera is at z=3.5. Apparent size ∝ height / distance.
const CAMERA_Z = 3.5
// Target apparent size calibrated from M3×8mm flat head looking good at z≈2.0 (dist 1.5)
const TARGET_APPARENT_SIZE = 0.42

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

export type AnimPhase = 'display' | 'spinup' | 'poofOut'

export interface ScrewDisplayState {
  mesh: THREE.Mesh
  material: THREE.MeshStandardMaterial
  pivot: THREE.Group
  currentIndex: number
  configs: ScrewConfig[]
  phase: AnimPhase
  phaseElapsed: number
  spinSpeed: number
  currentScale: number
  endZ: number
  needsSwap: boolean
  swapDone: boolean
}

/** Compute Z where screw reaches the target apparent size (end of display) */
function computeEndZ(config: ScrewConfig): number {
  const height = getScrewVisualHeight(config)
  const z = CAMERA_Z - height / TARGET_APPARENT_SIZE
  return Math.min(z, CAMERA_Z - 0.8)
}

export function setupScrewMesh(
  pivot: THREE.Group,
  configs: ScrewConfig[] = SHOWCASE_CONFIGS,
): {
  state: ScrewDisplayState
  material: THREE.MeshStandardMaterial
} {
  const material = new THREE.MeshStandardMaterial({
    color: 0xff2d7b,
    metalness: 0.2,
    roughness: 0.6,
    flatShading: false,
    side: THREE.DoubleSide,
  })

  const geometry = createScrewGeometry(configs[0])
  const mesh = new THREE.Mesh(geometry, material)
  const endZ = computeEndZ(configs[0])

  pivot.position.z = endZ
  pivot.position.y = (0.5 * endZ) / CAMERA_Z

  const state: ScrewDisplayState = {
    mesh,
    material,
    pivot,
    currentIndex: 0,
    configs,
    phase: 'display',
    phaseElapsed: 0,
    spinSpeed: BASE_SPIN_SPEED,
    currentScale: 1.0,
    endZ,
    needsSwap: false,
    swapDone: false,
  }

  return { state, material }
}

export function updateScrewDisplay(state: ScrewDisplayState, deltaTime: number): void {
  state.phaseElapsed += deltaTime

  switch (state.phase) {
    case 'display': {
      const scaleT = Math.min(1, state.phaseElapsed / POOF_IN_DURATION)
      if (scaleT < 1) {
        state.currentScale = easeOutBack(scaleT)
        state.mesh.scale.setScalar(Math.max(0.01, state.currentScale))
        state.spinSpeed = BASE_SPIN_SPEED + (MAX_SPIN_SPEED - BASE_SPIN_SPEED) * (1 - scaleT)
      } else {
        state.currentScale = 1.0
        state.mesh.scale.setScalar(1.0)
        state.spinSpeed = BASE_SPIN_SPEED
      }

      if (state.phaseElapsed >= DISPLAY_DURATION) {
        state.phase = 'spinup'
        state.phaseElapsed = 0
      }
      break
    }

    case 'spinup': {
      const t = Math.min(1, state.phaseElapsed / SPINUP_DURATION)
      state.spinSpeed = BASE_SPIN_SPEED + (MAX_SPIN_SPEED - BASE_SPIN_SPEED) * easeInQuad(t)

      if (state.phaseElapsed >= SPINUP_DURATION) {
        state.phase = 'poofOut'
        state.phaseElapsed = 0
      }
      break
    }

    case 'poofOut': {
      const t = Math.min(1, state.phaseElapsed / POOF_OUT_DURATION)
      state.currentScale = 1 - easeInBack(t)
      state.mesh.scale.setScalar(Math.max(0.01, state.currentScale))
      state.spinSpeed = MAX_SPIN_SPEED

      if (t >= 1 && !state.needsSwap) {
        state.needsSwap = true
      }

      if (state.swapDone) {
        state.phase = 'display'
        state.phaseElapsed = 0
        state.needsSwap = false
        state.swapDone = false
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

  state.endZ = computeEndZ(nextConfig)
  state.pivot.position.z = state.endZ
  state.pivot.position.y = (0.5 * state.endZ) / CAMERA_Z
  state.mesh.scale.setScalar(0.01)
  state.swapDone = true
}

export function getCurrentConfig(state: ScrewDisplayState): ScrewConfig {
  return state.configs[state.currentIndex]
}
