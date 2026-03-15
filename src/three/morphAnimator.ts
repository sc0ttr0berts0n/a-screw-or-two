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
const SPINUP_DURATION = 1.6
const POOF_OUT_DURATION = 0.2
const POOF_IN_DURATION = 0.3

const BASE_SPIN_SPEED = 0.8
const MAX_SPIN_SPEED = 5.0

// Z-depth: screw starts far back and moves toward the camera over the display phase
// Camera is at z=3.5. Distance from camera = 3.5 - Z. Apparent size ∝ height / distance.
// We want all screws to reach roughly the same apparent size at the end of display.
const CAMERA_Z = 3.5
const Z_BACK_BASE = -0.5   // furthest back baseline (smallest screws start here)
// Target apparent size calibrated from M3×8mm flat head looking good at z≈2.0 (dist 1.5)
// height 0.627 / distance 1.5 ≈ 0.42
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

export type AnimPhase = 'display' | 'spinup' | 'poofOut' | 'poofIn'

export interface ScrewDisplayState {
  mesh: THREE.Mesh
  material: THREE.MeshStandardMaterial
  pivot: THREE.Group    // pivot moves in Z; mesh stays at origin inside it
  currentIndex: number
  configs: ScrewConfig[]
  phase: AnimPhase
  phaseElapsed: number
  spinSpeed: number
  currentScale: number
  startZ: number       // Z position at start of display (further back for smaller screws)
  endZ: number         // Z position at end of display (varies per screw to normalize apparent size)
  maxHeight: number
  needsSwap: boolean
  swapDone: boolean
}

/** Compute Z where screw reaches the target apparent size (end of display) */
function computeEndZ(config: ScrewConfig): number {
  const height = getScrewVisualHeight(config)
  // apparentSize = height / (CAMERA_Z - z)  =>  z = CAMERA_Z - height / TARGET_APPARENT_SIZE
  const z = CAMERA_Z - height / TARGET_APPARENT_SIZE
  // Clamp so we don't get too close to the camera
  return Math.min(z, CAMERA_Z - 0.8)
}

/** Smaller screws start further back for more dramatic Z travel */
function computeStartZ(config: ScrewConfig, maxHeight: number): number {
  const height = getScrewVisualHeight(config)
  const ratio = height / maxHeight // 0..1 (1 = largest)
  const endZ = computeEndZ(config)
  // Start further back; smallest screws get the biggest travel range
  const travel = 1.5 + (1 - ratio) * 1.5 // 1.5..3.0 units of travel
  return endZ - travel
}

export function setupScrewMesh(pivot: THREE.Group, configs: ScrewConfig[] = SHOWCASE_CONFIGS): {
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
  const startZ = computeStartZ(configs[0], maxHeight)
  const endZ = computeEndZ(configs[0])

  // Z-depth lives on the pivot, not the mesh — keeps mesh centered for rotation
  pivot.position.z = startZ
  pivot.position.y = 0.5 * startZ / CAMERA_Z

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
    startZ,
    endZ,
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
      // Move pivot forward in Z from startZ toward endZ (per-screw target)
      const t = Math.min(1, state.phaseElapsed / DISPLAY_DURATION)
      const z = state.startZ + (state.endZ - state.startZ) * t
      state.pivot.position.z = z
      // Compensate Y so screw stays on camera center line (cam at y=0.5, z=CAMERA_Z)
      state.pivot.position.y = 0.5 * z / CAMERA_Z
      state.spinSpeed = BASE_SPIN_SPEED

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
      // Scale down to 0 for the poof
      const t = Math.min(1, state.phaseElapsed / POOF_OUT_DURATION)
      state.currentScale = 1 - easeInBack(t)
      state.mesh.scale.setScalar(Math.max(0.01, state.currentScale))
      state.spinSpeed = MAX_SPIN_SPEED

      if (t >= 1 && !state.needsSwap) {
        state.needsSwap = true
      }

      if (state.swapDone) {
        state.phase = 'poofIn'
        state.phaseElapsed = 0
        state.needsSwap = false
        state.swapDone = false
      }
      break
    }

    case 'poofIn': {
      // Scale up from 0 with bounce, at the new startZ
      const t = Math.min(1, state.phaseElapsed / POOF_IN_DURATION)
      state.currentScale = easeOutBack(t)
      state.mesh.scale.setScalar(Math.max(0.01, state.currentScale))
      state.spinSpeed = BASE_SPIN_SPEED + (MAX_SPIN_SPEED - BASE_SPIN_SPEED) * (1 - t)

      if (t >= 1) {
        state.phase = 'display'
        state.phaseElapsed = 0
        state.currentScale = 1.0
        state.mesh.scale.setScalar(1.0)
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

  // Reset to new start/end Z for next screw — on pivot, not mesh
  state.startZ = computeStartZ(nextConfig, state.maxHeight)
  state.endZ = computeEndZ(nextConfig)
  state.pivot.position.z = state.startZ
  state.pivot.position.y = 0.5 * state.startZ / CAMERA_Z
  state.mesh.scale.setScalar(0.01)
  state.swapDone = true
}

export function getCurrentConfig(state: ScrewDisplayState): ScrewConfig {
  return state.configs[state.currentIndex]
}
