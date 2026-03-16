import * as THREE from 'three'

const PARTICLE_COUNT = 30
const PARTICLE_LIFETIME = 0.6 // seconds
const GRAVITY = -4.0

export interface ParticleBurst {
  points: THREE.Points
  velocities: Float32Array
  ages: Float32Array
  lifetime: number
  elapsed: number
  done: boolean
}

export function spawnBurstParticles(scene: THREE.Scene, origin: THREE.Vector3): ParticleBurst {
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const colors = new Float32Array(PARTICLE_COUNT * 3)
  const velocities = new Float32Array(PARTICLE_COUNT * 3)
  const ages = new Float32Array(PARTICLE_COUNT)

  // Colors: hot pink and yellow
  const pink = new THREE.Color(0xff2d7b)
  const yellow = new THREE.Color(0xffe135)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3

    // Start at origin
    positions[i3] = origin.x
    positions[i3 + 1] = origin.y
    positions[i3 + 2] = origin.z

    // Random outward velocity
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI - Math.PI / 2
    const speed = 2 + Math.random() * 4
    velocities[i3] = Math.cos(theta) * Math.cos(phi) * speed
    velocities[i3 + 1] = Math.sin(phi) * speed + 1.5 // slight upward bias
    velocities[i3 + 2] = Math.sin(theta) * Math.cos(phi) * speed

    // Alternate pink/yellow
    const c = Math.random() > 0.5 ? pink : yellow
    colors[i3] = c.r
    colors[i3 + 1] = c.g
    colors[i3 + 2] = c.b

    ages[i] = 0
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    sizeAttenuation: true,
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  return {
    points,
    velocities,
    ages,
    lifetime: PARTICLE_LIFETIME,
    elapsed: 0,
    done: false,
  }
}

export function updateParticleBurst(burst: ParticleBurst, delta: number): void {
  if (burst.done) return

  burst.elapsed += delta
  const progress = burst.elapsed / burst.lifetime

  if (progress >= 1) {
    burst.done = true
    burst.points.visible = false
    return
  }

  const posAttr = burst.points.geometry.getAttribute('position') as THREE.BufferAttribute
  const positions = posAttr.array as Float32Array

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3
    burst.ages[i] += delta

    // Update position with velocity + gravity
    positions[i3] += burst.velocities[i3] * delta
    positions[i3 + 1] += burst.velocities[i3 + 1] * delta
    positions[i3 + 2] += burst.velocities[i3 + 2] * delta

    // Apply gravity
    burst.velocities[i3 + 1] += GRAVITY * delta
  }

  posAttr.needsUpdate = true

  // Fade out
  const mat = burst.points.material as THREE.PointsMaterial
  mat.opacity = 1 - progress * progress
}

export function disposeParticleBurst(burst: ParticleBurst, scene: THREE.Scene): void {
  scene.remove(burst.points)
  burst.points.geometry.dispose()
  ;(burst.points.material as THREE.PointsMaterial).dispose()
}
