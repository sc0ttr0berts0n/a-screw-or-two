import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
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
import { OutlineShader } from '@/three/outlineShader'
import { SHOWCASE_CONFIGS, getScrewVisualHeight, type ScrewConfig } from '@/three/screwGeometry'

export function useScrewScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  let renderer: THREE.WebGLRenderer | null = null
  let composer: EffectComposer | null = null
  let outlinePass: ShaderPass | null = null
  let depthTarget: THREE.WebGLRenderTarget | null = null
  let normalTarget: THREE.WebGLRenderTarget | null = null
  let depthMaterial: THREE.MeshDepthMaterial | null = null
  let normalMaterial: THREE.MeshNormalMaterial | null = null
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let displayState: ScrewDisplayState | null = null
  let pivot: THREE.Group | null = null
  let shadowPlane: THREE.Mesh | null = null
  let animationId: number = 0
  let clock: THREE.Clock | null = null
  let activeBursts: ParticleBurst[] = []

  const TILT_ANGLE = Math.PI / 6
  const SHADOW_GAP = 0.15

  const currentConfig = ref<ScrewConfig>(SHOWCASE_CONFIGS[0])

  function updateShadowPlane(config: ScrewConfig, pivotZ: number) {
    if (!shadowPlane) return
    const height = getScrewVisualHeight(config)
    const backExtent = (height / 2) * Math.sin(TILT_ANGLE)
    shadowPlane.position.z = pivotZ - backExtent - SHADOW_GAP
  }

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
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const pixelRatio = renderer.getPixelRatio()
    const w = canvas.clientWidth * pixelRatio
    const h = canvas.clientHeight * pixelRatio

    // Depth + Normal render targets for outline edge detection
    depthTarget = new THREE.WebGLRenderTarget(w, h)
    normalTarget = new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    })
    depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      side: THREE.DoubleSide,
    })
    normalMaterial = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })

    // EffectComposer with default render targets
    composer = new EffectComposer(renderer)

    const renderPass = new RenderPass(scene, camera)
    renderPass.clearAlpha = 0
    composer.addPass(renderPass)

    outlinePass = new ShaderPass(OutlineShader)
    outlinePass.uniforms.screenSize.value.set(w, h, 1 / w, 1 / h)
    composer.addPass(outlinePass)

    const outputPass = new OutputPass()
    composer.addPass(outputPass)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6)
    keyLight.position.set(0.8, 1.2, 3.5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    keyLight.shadow.camera.near = 0.1
    keyLight.shadow.camera.far = 20
    keyLight.shadow.camera.left = -4
    keyLight.shadow.camera.right = 4
    keyLight.shadow.camera.top = 4
    keyLight.shadow.camera.bottom = -4
    keyLight.shadow.bias = -0.002
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x00d4aa, 0.6)
    fillLight.position.set(-2, 1, -3)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5)
    rimLight.position.set(0, -2, -4)
    scene.add(rimLight)

    // Shadow plane
    shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.25 }),
    )
    shadowPlane.receiveShadow = true
    scene.add(shadowPlane)

    // Pivot
    pivot = new THREE.Group()
    scene.add(pivot)

    // Screw
    const { state } = setupScrewMesh(pivot)
    displayState = state
    displayState.mesh.castShadow = true
    displayState.mesh.rotation.z = -TILT_ANGLE
    pivot.add(displayState.mesh)

    updateShadowPlane(currentConfig.value, displayState.endZ)

    clock = new THREE.Clock()
    animate()
  }

  function animate() {
    animationId = requestAnimationFrame(animate)

    if (!renderer || !scene || !camera || !displayState || !clock || !pivot || !composer || !outlinePass || !depthTarget || !normalTarget || !depthMaterial || !normalMaterial) return

    const delta = clock.getDelta()

    pivot.rotation.y += delta * displayState.spinSpeed
    updateScrewDisplay(displayState, delta)

    if (displayState.needsSwap && scene) {
      const worldPos = new THREE.Vector3()
      displayState.mesh.getWorldPosition(worldPos)
      const burst = spawnBurstParticles(scene, worldPos)
      activeBursts.push(burst)

      performSwap(displayState)
      currentConfig.value = getCurrentConfig(displayState)
      updateShadowPlane(currentConfig.value, displayState.endZ)
    }

    for (let i = activeBursts.length - 1; i >= 0; i--) {
      updateParticleBurst(activeBursts[i], delta)
      if (activeBursts[i].done) {
        disposeParticleBurst(activeBursts[i], scene)
        activeBursts.splice(i, 1)
      }
    }

    // Hide non-screw objects for outline passes
    if (shadowPlane) shadowPlane.visible = false
    for (const burst of activeBursts) burst.points.visible = false

    // Render depth pass
    scene.overrideMaterial = depthMaterial
    renderer.setRenderTarget(depthTarget)
    renderer.clear()
    renderer.render(scene, camera)

    // Render normal pass
    scene.overrideMaterial = normalMaterial
    renderer.setRenderTarget(normalTarget)
    renderer.clear()
    renderer.render(scene, camera)

    scene.overrideMaterial = null
    renderer.setRenderTarget(null)

    // Restore visibility
    if (shadowPlane) shadowPlane.visible = true
    for (const burst of activeBursts) burst.points.visible = true

    // Feed buffers to outline shader
    outlinePass.uniforms.tDepth.value = depthTarget.texture
    outlinePass.uniforms.tNormal.value = normalTarget.texture

    // Render color pass via composer
    composer.render()
  }

  function handleResize() {
    const canvas = canvasRef.value
    if (!canvas || !renderer || !camera || !composer || !outlinePass || !depthTarget || !normalTarget) return

    const parent = canvas.parentElement
    if (!parent) return

    const width = parent.clientWidth
    const height = parent.clientHeight

    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    const pixelRatio = renderer.getPixelRatio()
    const w = width * pixelRatio
    const h = height * pixelRatio
    composer.setSize(width, height)
    depthTarget.setSize(w, h)
    normalTarget.setSize(w, h)
    outlinePass.uniforms.screenSize.value.set(w, h, 1 / w, 1 / h)
  }

  onMounted(() => {
    init()
    window.addEventListener('resize', handleResize)
    setTimeout(handleResize, 0)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    cancelAnimationFrame(animationId)
    if (renderer) renderer.dispose()
    if (composer) composer.dispose()
    if (depthTarget) depthTarget.dispose()
    if (normalTarget) normalTarget.dispose()
    if (scene) {
      for (const burst of activeBursts) {
        disposeParticleBurst(burst, scene)
      }
    }
    activeBursts = []
  })

  return { currentConfig }
}
