import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import * as THREE from 'three'
import { setupMorphTargets, updateMorph, type MorphState } from '@/three/morphAnimator'

export function useScrewScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let morphState: MorphState | null = null
  let animationId: number = 0
  let clock: THREE.Clock | null = null

  function init() {
    const canvas = canvasRef.value
    if (!canvas) return

    // Scene
    scene = new THREE.Scene()

    // Camera
    const aspect = canvas.clientWidth / canvas.clientHeight
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100)
    camera.position.set(0, 0.5, 3.5)
    camera.lookAt(0, 0, 0)

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404060, 0.8)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5)
    keyLight.position.set(3, 4, 5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4)
    fillLight.position.set(-2, 1, -3)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
    rimLight.position.set(0, -2, -4)
    scene.add(rimLight)

    // Screw mesh with morph targets
    const { state, material } = setupMorphTargets()
    morphState = state

    // Tilt 30 degrees
    morphState.mesh.rotation.x = Math.PI / 6
    scene.add(morphState.mesh)

    // Clock for delta time
    clock = new THREE.Clock()

    // Start animation
    animate()
  }

  function animate() {
    animationId = requestAnimationFrame(animate)

    if (!renderer || !scene || !camera || !morphState || !clock) return

    const delta = clock.getDelta()

    // Rotate continuously
    morphState.mesh.rotation.y += delta * 0.8

    // Update morph transitions
    updateMorph(morphState, delta)

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
    // Initial size
    setTimeout(handleResize, 0)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    cancelAnimationFrame(animationId)
    if (renderer) {
      renderer.dispose()
    }
  })
}
