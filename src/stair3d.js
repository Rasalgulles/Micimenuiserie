// Scène 3D : un escalier en chêne à marches suspendues.
// progress 0 → 1 : 0 = plan technique + pièces en vol, 0.5 = assemblage, 1 = escalier posé.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const STEPS = 12
const RISE = 0.19
const GOING = 0.29
const DEPTH = 0.95
const THICK = 0.065

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const span = (p, a, b) => clamp01((p - a) / (b - a))

function rng(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

function woodTexture(base) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 1024
  const g = c.getContext('2d')
  const col = new THREE.Color(base)
  g.fillStyle = `#${col.getHexString()}`
  g.fillRect(0, 0, c.width, c.height)
  const r = rng(7)
  const phases = Array.from({ length: 6 }, () => r() * Math.PI * 2)
  for (let x = 0; x < c.width; x++) {
    let v = 0
    for (let k = 0; k < phases.length; k++) v += Math.sin(x * (0.02 + k * 0.037) + phases[k]) / (k + 1)
    v += (r() - 0.5) * 0.9
    const dark = v > 0
    g.fillStyle = dark ? `rgba(70,38,14,${Math.min(0.28, Math.abs(v) * 0.16)})` : `rgba(255,236,205,${Math.min(0.18, Math.abs(v) * 0.1)})`
    // fibres légèrement ondulées sur la longueur
    g.beginPath()
    for (let y = 0; y <= c.height; y += 32) {
      const dx = Math.sin(y * 0.006 + phases[x % 6]) * 2.2
      if (y === 0) g.moveTo(x + dx, y)
      else g.lineTo(x + dx, y)
    }
    g.lineWidth = 1.2
    g.strokeStyle = g.fillStyle
    g.stroke()
  }
  // pores
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(60,30,10,${r() * 0.18})`
    g.fillRect(r() * c.width, r() * c.height, 1, 2 + r() * 6)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  return tex
}

export function initStair(canvas, colors, { reduced = false } = {}) {
  const isSmall = () => window.innerWidth < 860
  // scene « nu » : pas de mur ni de sol, fond transparent (la page est visible derrière)
  const nu = colors.scene === 'nu'
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: nu, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall() ? 1.5 : 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  if (nu) renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  const bg = new THREE.Color(colors.fond)
  scene.background = nu ? null : bg
  scene.fog = new THREE.Fog(bg, 9, 17)

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.55

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)

  // Lumières
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x8a7f70, 0.55))
  const key = new THREE.DirectionalLight(0xffe2c0, 2.4)
  key.position.set(-3.5, 6.5, 5.5)
  // ombres douces : en mode « nu », seules les ombres sont dessinées (sol et mur invisibles)
  const softShadows = nu && colors.ombres
  key.castShadow = !nu || softShadows
  key.shadow.mapSize.set(isSmall() ? 1024 : 2048, isSmall() ? 1024 : 2048)
  key.shadow.camera.left = -4
  key.shadow.camera.right = 4
  key.shadow.camera.top = 4
  key.shadow.camera.bottom = -2
  key.shadow.camera.near = 1
  key.shadow.camera.far = 20
  key.shadow.bias = -0.0004
  key.shadow.radius = 4
  scene.add(key)
  const rim = new THREE.DirectionalLight(nu ? new THREE.Color(colors.accent) : 0xd9e4ff, nu ? 1.1 : 0.5)
  rim.position.set(5, 3, nu ? -3 : 2)
  scene.add(rim)

  // pivot : fait tourner tout l'escalier sur lui-même (au défilement)
  const pivot = new THREE.Group()
  scene.add(pivot)
  const world = new THREE.Group()
  pivot.add(world)
  let spin = 0
  let spinShown = 0
  const total = (STEPS - 1) * GOING
  world.position.set(-total / 2, 0, 0)

  // Mur et sol
  const wallMat = new THREE.MeshStandardMaterial({ color: colors.mur ? new THREE.Color(colors.mur) : new THREE.Color(colors.fond).offsetHSL(0, -0.02, -0.05), roughness: 0.95 })
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), wallMat)
  wall.position.set(total / 2, 5, 0)
  wall.receiveShadow = true
  if (softShadows) wall.material = new THREE.ShadowMaterial({ opacity: 0.13 })
  if (!nu || softShadows) world.add(wall)
  const floorMat = new THREE.MeshStandardMaterial({ color: colors.sol ? new THREE.Color(colors.sol) : new THREE.Color(colors.fond).offsetHSL(0, -0.03, -0.1), roughness: 0.9 })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(total / 2, 0, 8)
  floor.receiveShadow = true
  if (softShadows) floor.material = new THREE.ShadowMaterial({ opacity: 0.1 })
  if (!nu || softShadows) world.add(floor)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(30, 0.09, 0.02), new THREE.MeshStandardMaterial({ color: new THREE.Color(colors.fond).offsetHSL(0, -0.02, -0.22), roughness: 0.8 }))
  plinth.position.set(total / 2, 0.045, 0.01)
  plinth.receiveShadow = true
  if (!nu) world.add(plinth)

  // Marches
  const woodMap = woodTexture(colors.bois)
  const geo = new RoundedBoxGeometry(GOING + 0.03, THICK, DEPTH, 3, 0.012)
  const lineMat = new THREE.LineBasicMaterial({ color: colors.ligne3d || colors.accent, transparent: true, opacity: 0 })
  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(GOING + 0.03, THICK, DEPTH))
  const r = rng(42)
  const treads = []
  for (let i = 0; i < STEPS; i++) {
    const map = woodMap.clone()
    map.needsUpdate = true
    map.offset.set(r(), r())
    map.rotation = Math.PI / 2
    const mat = new THREE.MeshStandardMaterial({ map, roughness: 0.58, metalness: 0, color: 0xffffff })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    const home = new THREE.Vector3(i * GOING, RISE * (i + 1) - THICK / 2, DEPTH / 2 + 0.002)
    const away = new THREE.Vector3(home.x + 0.6 + (r() - 0.3) * 2.6, home.y + 1.1 + r() * 1.8, home.z + 0.5 + r() * 1.4)
    const spin = new THREE.Euler((r() - 0.5) * 2.6, (r() - 0.5) * 3.2, (r() - 0.5) * 2.2)
    const wire = new THREE.LineSegments(edges, lineMat.clone())
    wire.position.copy(home)
    world.add(mesh, wire)
    treads.push({ mesh, wire, home, away, spin, bob: r() * Math.PI * 2 })
  }

  // Cotes du plan (hauteur et longueur totales)
  const dimMat = new THREE.LineBasicMaterial({ color: colors.ligne3d || colors.accent, transparent: true, opacity: 0 })
  const dimPts = []
  const top = RISE * STEPS
  const x0 = -GOING / 2
  const x1 = total + GOING / 2
  const zd = DEPTH + 0.25
  dimPts.push(x0, 0.02, zd, x1, 0.02, zd, x0, 0.02, zd - 0.08, x0, 0.02, zd + 0.08, x1, 0.02, zd - 0.08, x1, 0.02, zd + 0.08)
  dimPts.push(x1 + 0.3, 0, 0.05, x1 + 0.3, top, 0.05, x1 + 0.22, 0, 0.05, x1 + 0.38, 0, 0.05, x1 + 0.22, top, 0.05, x1 + 0.38, top, 0.05)
  const dimGeo = new THREE.BufferGeometry()
  dimGeo.setAttribute('position', new THREE.Float32BufferAttribute(dimPts, 3))
  const dims = new THREE.LineSegments(dimGeo, dimMat)
  world.add(dims)

  // Main courante en acier, fixée au mur
  const railLen = Math.hypot(total, RISE * (STEPS - 1))
  const rail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, railLen, 16),
    new THREE.MeshStandardMaterial({ color: colors.metal || colors.encre, roughness: 0.35, metalness: 0.7 })
  )
  const railPivot = new THREE.Group()
  railPivot.position.set(0, RISE + 0.92, 0.09)
  railPivot.rotation.z = Math.atan2(RISE * (STEPS - 1), total) - Math.PI / 2
  rail.position.y = railLen / 2
  rail.castShadow = true
  railPivot.add(rail)
  world.add(railPivot)
  const brackets = []
  const brMat = new THREE.MeshStandardMaterial({ color: colors.metal || colors.encre, roughness: 0.4, metalness: 0.6 })
  ;[0.12, 0.5, 0.88].forEach((f) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 8), brMat)
    b.rotation.x = Math.PI / 2
    b.position.set(total * f, RISE + 0.92 + RISE * (STEPS - 1) * f, 0.045)
    b.castShadow = true
    world.add(b)
    brackets.push(b)
  })

  // État
  let progress = 0
  let shown = 0
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
  let running = false
  let visible = true
  let raf = 0
  const timer = new THREE.Timer()
  let drawStart = -1

  const target = new THREE.Vector3(0.15, 1.25, 0.4)
  function placeCamera(p, t) {
    const orbit = THREE.MathUtils.lerp(0.62, 0.38, easeInOut(p))
    const dist = THREE.MathUtils.lerp(isSmall() ? 9.8 : 9.6, isSmall() ? 8.8 : 8.4, easeInOut(p))
    const yaw = orbit + mouse.x * 0.08
    camera.position.set(Math.sin(yaw) * dist, 2.3 + mouse.y * 0.35 + Math.sin(t * 0.25) * 0.04, Math.cos(yaw) * dist)
    camera.lookAt(target)
  }

  function update(t) {
    shown += (progress - shown) * (reduced ? 1 : 0.16)
    mouse.x += (mouse.tx - mouse.x) * 0.05
    mouse.y += (mouse.ty - mouse.y) * 0.05
    const p = shown
    if (drawStart < 0 && t > 0) drawStart = t
    const lines = Math.max(span(p, 0, 0.2), reduced ? 1 : span(t - drawStart, 0.3, 2.6))
    const fade = 1 - span(p, 0.72, 0.95)
    treads.forEach((s, i) => {
      const f = easeOut(span(p, 0.18 + i * 0.03, 0.42 + i * 0.03))
      const floatAmt = (1 - f) * 0.12
      s.mesh.position.lerpVectors(s.away, s.home, f)
      s.mesh.position.y += Math.sin(t * 0.9 + s.bob) * floatAmt
      s.mesh.rotation.set(s.spin.x * (1 - f) + Math.sin(t * 0.5 + s.bob) * floatAmt, s.spin.y * (1 - f), s.spin.z * (1 - f))
      const draw = clamp01(lines * STEPS * 0.5 - i * 0.4)
      s.wire.material.opacity = draw * fade * 0.95
    })
    dimMat.opacity = lines * fade
    railPivot.scale.y = easeOut(span(p, 0.74, 0.96)) || 0.0001
    brackets.forEach((b, i) => b.scale.setScalar(easeOut(span(p, 0.74 + i * 0.06, 0.82 + i * 0.06)) || 0.0001))
    key.intensity = 2.1 + span(p, 0.6, 1) * 0.6
    key.color.setHSL(0.08, 0.6 + span(p, 0.6, 1) * 0.3, 0.86)
    spinShown += (spin - spinShown) * (reduced ? 1 : 0.08)
    pivot.rotation.y = spinShown
    placeCamera(p, t)
  }

  function frame() {
    raf = requestAnimationFrame(frame)
    timer.update()
    update(timer.getElapsed())
    renderer.render(scene, camera)
  }

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // le canvas n'occupe que la zone libre (moitié droite, ou bloc sous le texte sur téléphone) : on centre la scène
    camera.clearViewOffset()
    camera.fov = w / h > 1.05 ? 32 : w / h > 0.7 ? 38 : 44
    camera.updateProjectionMatrix()
    if (!running) { update(timer.getElapsed()); renderer.render(scene, camera) }
  }

  function start() {
    if (running || reduced || !visible) return
    running = true
    frame()
  }
  function stop() {
    running = false
    cancelAnimationFrame(raf)
  }

  const onMove = (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('resize', resize)
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting
    visible && !document.hidden ? start() : stop()
  })
  io.observe(canvas)
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))

  if (reduced) progress = shown = 1
  resize()
  start()

  return {
    // rotation de l'escalier sur lui-même, en radians
    setSpin(v) {
      spin = v
    },
    setProgress(p) {
      progress = clamp01(p)
      if (reduced) { update(0); renderer.render(scene, camera) }
    },
  }
}
