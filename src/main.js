import './fonts.css'
import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import config from '@config'

gsap.registerPlugin(ScrollTrigger)
document.documentElement.classList.add('js')

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches
const loadedAt = Date.now()

// ── Défilement fluide ────────────────────────────────
let lenis = null
if (!reduced) {
  lenis = new Lenis({ duration: 0.9, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  lenis.stop()
}
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')
    const el = id.length > 1 && $(id)
    if (!el && id !== '#') return
    e.preventDefault()
    if (lenis) lenis.scrollTo(el || 0, { offset: el ? -70 : 0, duration: 1.6 })
    else (el || document.body).scrollIntoView({ behavior: 'smooth' })
  })
)

// ── Découpe des titres en mots ───────────────────────
$$('.split').forEach((h) => {
  const words = h.textContent.trim().split(/\s+/)
  h.setAttribute('aria-label', h.textContent.trim())
  h.innerHTML = words.map((w) => `<span class="line" style="display:inline-block" aria-hidden="true"><span>${w}</span></span>`).join(' ')
})

// ── Scène 3D (chargée à part) ────────────────────────
let stair = null
const canvas = $('.stair')
const stairReady = import('./stair3d.js')
  .then(({ initStair }) => {
    try {
      // l'accueil peut avoir ses propres couleurs (ex. accueil clair sur un site sombre)
      stair = initStair(canvas, { ...config.couleurs, ...(config.couleurs.accueil || {}) }, { reduced })
    } catch (err) {
      canvas.remove()
    }
  })
  .catch(() => canvas.remove())

// ── Intro : le mètre ruban ───────────────────────────
let introDone
const introFinished = new Promise((r) => (introDone = r))
setTimeout(() => introDone(), 8000)

function heroIn(delay = 0) {
  const tl = gsap.timeline({ delay })
  tl.from('.top-in', { yPercent: -120, opacity: 0, duration: 0.9, ease: 'power3.out' })
    .from('.hero-title .line > span', { yPercent: 108, duration: 1.1, stagger: 0.09, ease: 'power4.out' }, 0)
    .from('.hero-eyebrow', { opacity: 0, y: 14, duration: 0.7 }, 0.15)
    .from(['.hero-intro', '.hero-ctas'], { opacity: 0, y: 24, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 0.4)
    .from(['.phases', '.scroll-hint'], { opacity: 0, duration: 0.8 }, 0.7)
    .from(canvas, { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0)
  return tl
}

if (reduced) {
  document.body.classList.remove('is-loading')
} else {
  const counter = { v: 0 }
  const intro = gsap.timeline({
    onComplete: () => {
      document.body.classList.remove('is-loading')
      $('.intro')?.remove()
      lenis && lenis.start()
    },
  })
  intro
    .fromTo('.intro-name > span', { y: 0, yPercent: 105 }, { yPercent: 0, duration: 0.8, ease: 'power4.out' })
    .to('.intro-tape-fill', { scaleX: 1, duration: 1.15, ease: 'power3.inOut' }, 0.2)
    .to(counter, { v: 3240, duration: 1.15, ease: 'power3.inOut', onUpdate: () => ($('.intro-count').textContent = Math.round(counter.v).toLocaleString('fr-BE')) }, 0.2)
    .to(['.intro-tape', '.intro-mm'], { opacity: 0, duration: 0.3 }, 1.5)
    .add(() => stairReady.then(() => stair && stair.setProgress(0)), 1.5)
    .to('.intro', { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, 1.9)
    .add(heroIn(), 2.15)
    .add(() => introDone(), 1.8)
}

// ── Hero : l'escalier se monte tout seul à l'ouverture (accroche) ──
const phases = $$('.phase')
const showProgress = (p) => {
  stair && stair.setProgress(p)
  gsap.set('.phase-bar-fill', { scaleX: p })
  const idx = Math.min(phases.length - 1, Math.floor(p * phases.length * 0.999))
  phases.forEach((ph, i) => ph.classList.toggle('is-on', i === idx))
}
// L'escalier se monte à l'arrivée, puis reste monté. Au défilement, il tourne doucement sur lui-même.
let played = false
const st = { p: 0 }
const assemble = (delay = 0) =>
  stairReady.then(() => gsap.to(st, { p: 1, duration: 3.6, delay, ease: 'sine.out', overwrite: true, onUpdate: () => showProgress(st.p) }))
function playStair() {
  if (played) return
  played = true
  assemble(0.8) // petite pause : on voit d'abord les marches en l'air et le plan
}
if (!reduced) {
  const phoneView = matchMedia('(max-width: 860px)').matches
  ScrollTrigger.create({
    trigger: phoneView ? '.stair' : '.hero',
    start: phoneView ? 'top bottom' : 'top top',
    end: 'bottom top',
    onUpdate: (self) => stair && stair.setSpin(self.progress * -0.9), // environ 50° sur toute la traversée
  })
}
if (reduced) {
  stairReady.then(() => showProgress(1))
} else {
  // se lance dès que l'intro est finie et que l'escalier est bien visible à l'écran
  introFinished.then(() => {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); playStair() }
    }, { threshold: 0.3 })
    io.observe(canvas)
  })
}
if (!reduced) {
  gsap.to('.scroll-hint', { opacity: 0, scrollTrigger: { trigger: '.hero', start: 'top top', end: '30% top', scrub: true } })
}

// ── En-tête : se cache en descendant, revient en remontant ──
let lastY = 0
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => {
    const y = self.scroll()
    const top = $('.top')
    // menu sans bandeau : il change seulement de couleur (texte/logo) quand il quitte l'accueil
    const limit = config.menuBandeau === false ? $('.hero').offsetHeight - top.offsetHeight / 2 : 40
    top.classList.toggle('is-solid', y > limit)
    top.classList.toggle('no-band', config.menuBandeau === false)
    top.classList.toggle('is-hidden', y > 400 && y > lastY)
    lastY = y
  },
})

// ── Bandeau : défile plus vite et change de sens selon le scroll ──
if (!reduced && $('.mq')) {
  const mq = $('.mq')
  let x = 0
  let dir = -1
  let boost = 0
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      dir = self.direction === 1 ? -1 : 1
      boost = Math.min(Math.abs(self.getVelocity()) / 220, 14)
    },
  })
  gsap.ticker.add(() => {
    const half = mq.scrollWidth / 2
    x += dir * (0.9 + boost)
    boost *= 0.92
    if (x <= -half) x += half
    if (x > 0) x -= half
    mq.style.transform = `translate3d(${x}px,0,0)`
  })
}

// ── Apparitions ──────────────────────────────────────
if (!reduced) {
  $$('.split').forEach((h) =>
    gsap.from($$('.line > span', h), {
      yPercent: 100, duration: 0.7, stagger: 0.04, ease: 'power2.out',
      scrollTrigger: { trigger: h, start: 'top 88%' },
    })
  )
  ScrollTrigger.batch('.reveal', {
    start: 'top 90%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out' }),
  })
  gsap.from('.service', {
    y: 16, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out',
    scrollTrigger: { trigger: '.services', start: 'top 82%' },
  })
  gsap.from('.town', {
    y: 16, opacity: 0, duration: 0.6, stagger: 0.04, ease: 'power2.out',
    scrollTrigger: { trigger: '.towns', start: 'top 88%' },
  })
  if ($('.radar')) gsap.from('.radar', { scale: 0.6, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.radar', start: 'top 85%' } })
  if ($('.foot-word')) gsap.from('.foot-word', { yPercent: 70, duration: 1.4, ease: 'power4.out', scrollTrigger: { trigger: '.foot', start: 'top 85%' } })

} else {
  $$('.reveal').forEach((el) => (el.style.opacity = 1))
}

// ── Carte : flux animés de l'atelier vers les destinations ──
const map = $('.map svg')
if (map) {
  const dests = $$('.dest', map)
  dests.forEach((g) => {
    const p = $('.flow', g)
    const len = p.getTotalLength()
    g._len = len
    p.style.strokeDasharray = `${len} ${len}`
    p.style.strokeDashoffset = len
  })
  if (reduced) {
    dests.forEach((g) => ($('.flow', g).style.strokeDashoffset = 0))
  } else {
    gsap.from('.map-land', { opacity: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: map, start: 'top 85%' } })
    gsap.from(['.dest-pt', '.dest-label'], { opacity: 0, duration: 0.5, stagger: 0.04, scrollTrigger: { trigger: map, start: 'top 80%' } })
    const fire = (g) => {
      const path = $('.flow', g)
      const dot = $('.flow-dot', g)
      const len = g._len
      g.classList.add('is-on')
      const move = function () {
        const t = this.progress()
        const pt = path.getPointAtLength(len * t)
        const h = Math.sin(Math.PI * t) // hauteur : 0 au sol, 1 au sommet
        dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y)
        dot.setAttribute('r', (4 + h * 4).toFixed(2)) // plus gros en haut = plus proche
      }
      gsap.timeline({ onComplete: () => g.classList.remove('is-on') })
        .set(path, { opacity: 1 })
        .set(path, { strokeDashoffset: len })
        .to(path, { strokeDashoffset: 0, duration: 1.3, ease: 'power1.inOut' }, 0)
        .fromTo(dot, { opacity: 1 }, { duration: 1.3, ease: 'power1.inOut', onUpdate: move }, 0)
        .to(dot, { opacity: 0, duration: 0.2 }, 1.3)
        .fromTo($('.dest-ping', g), { attr: { r: 4 }, opacity: 0.9 }, { attr: { r: 22 }, opacity: 0, duration: 1, ease: 'power2.out' }, 1.25)
        .to(path, { strokeDashoffset: -len, duration: 0.9, ease: 'power2.in' }, 1.8)
    }
    let timer = null
    let last = -1
    const loop = () => {
      // un ou deux départs à la fois, jamais deux fois la même destination de suite
      const n = Math.random() < 0.35 ? 2 : 1
      for (let k = 0; k < n; k++) {
        let i
        do i = Math.floor(Math.random() * dests.length)
        while (i === last && dests.length > 1)
        last = i
        if (!dests[i].classList.contains('is-on')) fire(dests[i])
      }
      timer = setTimeout(loop, 700 + Math.random() * 900)
    }
    ScrollTrigger.create({
      trigger: map, start: 'top 90%', end: 'bottom 10%',
      onToggle: (self) => { clearTimeout(timer); if (self.isActive) loop() },
    })
  }
}

// ── Plan technique qui se dessine ────────────────────
const paths = $$('.plan-drawing .draw path')
paths.forEach((p) => {
  const len = p.getTotalLength()
  p.style.strokeDasharray = len
  p.style.strokeDashoffset = reduced ? 0 : len
})
if (!reduced) {
  const planTl = gsap.timeline({ scrollTrigger: { trigger: '.plan', start: 'top 70%', end: 'bottom 75%', scrub: 0.6 } })
  planTl
    .to('.draw-main path', { strokeDashoffset: 0, stagger: 0.15, duration: 1, ease: 'none' })
    .to('.draw-dim path', { strokeDashoffset: 0, stagger: 0.1, duration: 0.6, ease: 'none' }, 0.7)
    .from('.plan-labels text', { opacity: 0, stagger: 0.08, duration: 0.3 }, 1.1)
  const steps = $$('.plan-step')
  ScrollTrigger.create({
    trigger: '.plan', start: 'top 60%', end: 'bottom 60%',
    onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle('is-on', self.progress >= i / steps.length)),
  })
}

// ── Avant / après ────────────────────────────────────
const ba = $('.ba-stage')
if (ba) {
  const range = $('.ba-range', ba)
  const set = (v) => {
    $('.ba-before', ba).style.clipPath = `inset(0 ${100 - v}% 0 0)`
    $('.ba-handle', ba).style.left = v + '%'
  }
  range.addEventListener('input', () => set(+range.value))
  if (!reduced) {
    const o = { v: 82 }
    set(o.v)
    gsap.to(o, { v: 50, duration: 1.6, ease: 'power2.out', onUpdate: () => { set(o.v); range.value = o.v }, scrollTrigger: { trigger: ba, start: 'top 70%' } })
  }
}

// ── Curseur personnalisé ─────────────────────────────
if (finePointer && !reduced && config.curseur !== false) {
  document.documentElement.classList.add('has-cursor')
  const cur = $('.cursor')
  const dot = $('.cursor-dot')
  const ring = $('.cursor-ring')
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 })
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08 })
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' })
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' })
  window.addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY) }, { passive: true })
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], a, button, label.chip, .drop')
    cur.classList.toggle('is-link', !!t)
    cur.classList.toggle('is-dark', !!e.target.closest('.plan, .quote'))
  })
  document.addEventListener('pointerleave', () => gsap.to(cur, { opacity: 0, duration: 0.2 }))
  document.addEventListener('pointerenter', () => gsap.to(cur, { opacity: 1, duration: 0.2 }))
}

// ── Menu : lettres qui s'échangent dans un ordre aléatoire ──
if (!reduced) {
  $$('.nav-link').forEach((link) => {
    const letters = $$('.swap-in', link)
    const run = (to) => {
      const order = letters.map((_, i) => i).sort(() => Math.random() - 0.5)
      order.forEach((idx, k) =>
        gsap.to(letters[idx], { yPercent: to, duration: 0.6, delay: k * 0.025, ease: 'back.out(1.7)', overwrite: true })
      )
    }
    link.addEventListener('pointerenter', () => run(-50))
    link.addEventListener('pointerleave', () => run(0))
    link.addEventListener('focus', () => run(-50))
    link.addEventListener('blur', () => run(0))
  })
}

// ── Une prestation cliquée présélectionne le type de travaux ──
$$('.service').forEach((s) =>
  s.addEventListener('click', () => {
    const r = $(`.form input[name=type][value="${CSS.escape(s.dataset.type)}"]`)
    if (r) r.checked = true
  })
)

// ── Formulaire de devis ──────────────────────────────
const form = $('.form')
const status = $('.form-status')
const fileInput = $('input[name=photos]', form)
const drop = $('.drop', form)
const MAX_PHOTOS = 4

fileInput.addEventListener('change', () => {
  const files = [...fileInput.files].slice(0, MAX_PHOTOS)
  $('.drop-list', form).textContent = files.length ? files.map((f) => f.name).join(' · ') : ''
})
;['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.add('is-over')))
;['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('is-over')))

function shrink(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const im = new Image()
    im.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(im.width, im.height))
      const c = document.createElement('canvas')
      c.width = Math.round(im.width * scale)
      c.height = Math.round(im.height * scale)
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve({ name: file.name.replace(/\.[^.]+$/, '') + '.jpg', data: c.toDataURL('image/jpeg', 0.78).split(',')[1] })
    }
    im.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    im.src = url
  })
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  status.textContent = ''
  let firstBad = null
  $$('[required]', form).forEach((f) => {
    const bad = !f.value.trim()
    f.closest('.field').classList.toggle('is-error', bad)
    f.setAttribute('aria-invalid', bad ? 'true' : 'false')
    if (bad && !firstBad) firstBad = f
  })
  const email = $('input[name=email]', form)
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    email.closest('.field').classList.add('is-error')
    firstBad = firstBad || email
  }
  if (firstBad) {
    status.textContent = 'Il manque une information : vérifiez les champs en orange.'
    firstBad.focus()
    return
  }
  form.classList.add('is-sending')
  status.textContent = 'Envoi en cours…'
  const fd = new FormData(form)
  const photos = (await Promise.all([...fileInput.files].slice(0, MAX_PHOTOS).map(shrink))).filter(Boolean)
  const body = {
    type: fd.get('type'), delai: fd.get('delai'), nom: fd.get('nom'), telephone: fd.get('telephone'),
    commune: fd.get('commune'), email: fd.get('email'), message: fd.get('message'), site: fd.get('site'),
    t: Date.now() - loadedAt, photos,
  }
  try {
    const res = await fetch('/api/devis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const out = await res.json().catch(() => ({}))
    if (!res.ok || !out.ok) throw new Error(out.error || 'erreur')
    $('.sent-type').textContent = `Demande reçue · ${body.type}`
    form.hidden = true
    const sent = $('.sent')
    sent.hidden = false
    if (!reduced) gsap.from(sent, { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' })
    form.reset()
    $('.drop-list', form).textContent = ''
  } catch (err) {
    const k = config.contact
    status.innerHTML = `L'envoi n'a pas fonctionné. Appelez-nous au <a href="tel:${k.telephoneLien}">${k.telephone}</a>` + (k.email ? ` ou écrivez à <a href="mailto:${k.email}">${k.email}</a>.` : '.')
  } finally {
    form.classList.remove('is-sending')
  }
})
$('.sent-again').addEventListener('click', () => {
  $('.sent').hidden = true
  form.hidden = false
  status.textContent = ''
})

window.addEventListener('load', () => ScrollTrigger.refresh())
