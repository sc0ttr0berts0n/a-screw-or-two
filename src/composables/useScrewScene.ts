import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import * as THREE from 'three'
import {
  setupScrewMesh,
  updateScrewDisplay,
  performSwap,
  getCurrentConfig,
  type ScrewDisplayState,
} from '@/three/morphAnimator'
import {
  spawnBurstParticles,
  updateParticleBurst,
  disposeParticleBurst,
  type ParticleBurst,
} from '@/three/particles'
import { SHOWCASE_CONFIGS, type ScrewConfig } from '@/three/screwGeometry'

export function useScrewScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let displayState: ScrewDisplayState | null = null
  let pivot: THREE.Group | null = null
  let animationId: number = 0
  let clock: THREE.Clock | null = null
  let activeBursts: ParticleBurst[] = []

  const currentConfig = ref<ScrewConfig>(SHOWCASE_CONFIGS[0])

  function init() {
    const canvas = canvasRef.value
    if (!canvas) return

    scene = new THREE.Scene()

    const aspect = canvas.clientWidth / canvas.clientHeight
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100)
    camera.position.set(0, 0.5, 3.5)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    // Enable shadow maps
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Lights — 90's retro palette
    const ambientLight = new THREE.AmbientLight(0xffe135, 0.9)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xff88aa, 1.6)
    keyLight.position.set(3, 4, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 20
    keyLight.shadow.camera.left = -3
    keyLight.shadow.camera.right = 3
    keyLight.shadow.camera.top = 3
    keyLight.shadow.camera.bottom = -3
    keyLight.shadow.bias = -0.001
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x00d4aa, 0.6)
    fillLight.position.set(-2, 1, -3)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5)
    rimLight.position.set(0, -2, -4)
    scene.add(rimLight)

    // Shadow-receiving plane behind the screw (facing camera)
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.25 }),
    )
    shadowPlane.position.z = -2.0
    shadowPlane.receiveShadow = true
    scene.add(shadowPlane)

    // Pivot group rotates on Y axis — also holds Z-depth position
    pivot = new THREE.Group()
    scene.add(pivot)

    // Screw mesh — pivot is passed in so Z-depth animates on the pivot, not the mesh
    const { state } = setupScrewMesh(pivot)
    displayState = state
    displayState.mesh.castShadow = true

    // Tilt mesh to backslash angle — mesh stays at origin inside pivot
    displayState.mesh.rotation.z = -Math.PI / 6
    pivot.add(displayState.mesh)

    clock = new THREE.Clock()
    animate()
  }

  function animate() {
    animationId = requestAnimationFrame(animate)

    if (!renderer || !scene || !camera || !displayState || !clock || !pivot) return

    const delta = clock.getDelta()

    // Rotate pivot at current spin speed
    pivot.rotation.y += delta * displayState.spinSpeed

    // Update display phases
    updateScrewDisplay(displayState, delta)

    // Check if we need to spawn particles and swap
    if (displayState.needsSwap && scene) {
      // Spawn particle burst at the screw's world position
      const worldPos = new THREE.Vector3()
      displayState.mesh.getWorldPosition(worldPos)
      const burst = spawnBurstParticles(scene, worldPos)
      activeBursts.push(burst)

      // Perform the geometry swap
      performSwap(displayState)

      // Update reactive config
      currentConfig.value = getCurrentConfig(displayState)
    }

    // Update active particle bursts
    for (let i = activeBursts.length - 1; i >= 0; i--) {
      updateParticleBurst(activeBursts[i], delta)
      if (activeBursts[i].done) {
        disposeParticleBurst(activeBursts[i], scene)
        activeBursts.splice(i, 1)
      }
    }

    renderer.render(scene, camera)
  }

  function handleResize() {
    const canvas = canvasRef.value
    if (!canvas || !renderer || !camera) return

    const parent = canvas.parentElement
    if (!parent) return

    const width = parent.clientWidth
    const height = parent.clientHeight

    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  onMounted(() => {
    init()
    window.addEventListener('resize', handleResize)
    setTimeout(handleResize, 0)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    cancelAnimationFrame(animationId)
    if (renderer) {
      renderer.dispose()
    }
    // Clean up any remaining bursts
    if (scene) {
      for (const burst of activeBursts) {
        disposeParticleBurst(burst, scene)
      }
    }
    activeBursts = []
  })

  return { currentConfig }
}
