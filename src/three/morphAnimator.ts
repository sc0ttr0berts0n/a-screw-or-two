import * as THREE from 'three'
import { createScrewGeometry, SHOWCASE_CONFIGS, type ScrewConfig } from './screwGeometry'

const HOLD_DURATION = 2.5 // seconds between swaps

export interface ScrewDisplayState {
  mesh: THREE.Mesh
  material: THREE.MeshStandardMaterial
  currentIndex: number
  elapsed: number
  configs: ScrewConfig[]
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

  const geometry = createScrewGeometry(configs[0])
  const mesh = new THREE.Mesh(geometry, material)

  const state: ScrewDisplayState = {
    mesh,
    material,
    currentIndex: 0,
    elapsed: 0,
    configs,
  }

  return { state, material }
}

export function updateScrewDisplay(state: ScrewDisplayState, deltaTime: number): void {
  state.elapsed += deltaTime

  if (state.elapsed >= HOLD_DURATION) {
    state.elapsed = 0

    // Advance to next config
    state.currentIndex = (state.currentIndex + 1) % state.configs.length
    const nextConfig = state.configs[state.currentIndex]

    // Dispose old geometry and create new one
    state.mesh.geometry.dispose()
    state.mesh.geometry = createScrewGeometry(nextConfig)
  }
}
