// Carte de la Belgique (contour simplifié) avec les flux depuis l'atelier.
// Coordonnées en [longitude, latitude] ; projection simple, suffisante à cette échelle.

const BELGIQUE = [
  [2.54, 51.09], [2.92, 51.23], [3.37, 51.37], [3.53, 51.29], [3.89, 51.21], [4.06, 51.25], [4.24, 51.37],
  [4.4, 51.36], [4.55, 51.44], [4.78, 51.43], [4.92, 51.4], [5.1, 51.43], [5.24, 51.31], [5.5, 51.3],
  [5.66, 51.2], [5.84, 51.16], [5.76, 51.02], [5.76, 50.95], [5.65, 50.82], [5.7, 50.76], [6.02, 50.75],
  [6.27, 50.62], [6.17, 50.52], [6.4, 50.33], [6.27, 50.27], [6.13, 50.13], [6.03, 50.17], [5.88, 50.08],
  [5.75, 49.92], [5.75, 49.79], [5.9, 49.66], [5.82, 49.55], [5.47, 49.5], [5.3, 49.63], [5.0, 49.79],
  [4.85, 49.79], [4.87, 49.95], [4.79, 50.02], [4.87, 50.15], [4.68, 49.99], [4.5, 49.95], [4.15, 49.97],
  [4.21, 50.27], [4.03, 50.36], [3.7, 50.32], [3.61, 50.49], [3.29, 50.53], [3.25, 50.69], [3.1, 50.78],
  [2.85, 50.72], [2.61, 50.82], [2.54, 51.09],
]

const W = 640
const LON0 = 2.42
const LAT0 = 51.56
const K = 248
const COS = Math.cos((50.5 * Math.PI) / 180)
const proj = ([lon, lat]) => [((lon - LON0) * COS * K).toFixed(1), ((LAT0 - lat) * K).toFixed(1)]
const H = Math.round((LAT0 - 49.42) * K)

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export function renderMap(carte) {
  // contour lissé (Catmull-Rom → Bézier) pour éviter l'effet « polygone »
  const pts = BELGIQUE.slice(0, -1).map((p) => proj(p).map(Number))
  const n = pts.length
  const t = 0.18
  let outline = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t]
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t]
    outline += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`
  }
  outline += ' Z'
  const [ox, oy] = proj(carte.origine.coord).map(Number)
  const dests = carte.destinations.map((d, i) => {
    const [x, y] = proj(d.coord).map(Number)
    // arc en hauteur : le flux décolle, monte puis redescend (effet 3D)
    const len = Math.hypot(x - ox, y - oy) || 1
    const lift = 18 + len * 0.42
    // léger décalage latéral pour les trajets nord-sud, sinon l'arc paraît droit vu du dessus
    const cx = ((ox + x) / 2 + Math.abs(y - oy) * 0.18 * (x < ox ? -1 : 1)).toFixed(1)
    const cy = ((oy + y) / 2 - lift).toFixed(1)
    const side = d.label || (x < W - 120 ? 'droite' : 'gauche')
    const lx = side === 'droite' ? x + 10 : side === 'gauche' ? x - 10 : x
    const ly = side === 'haut' ? y - 12 : side === 'bas' ? y + 20 : y + 4
    const anchor = side === 'droite' ? 'start' : side === 'gauche' ? 'end' : 'middle'
    return `
    <g class="dest" data-i="${i}">
      <path class="flow" d="M${ox} ${oy} Q${cx} ${cy} ${x} ${y}"/>
      <circle class="flow-dot" r="4.5" cx="${ox}" cy="${oy}"/>
      <circle class="dest-ping" cx="${x}" cy="${y}" r="6"/>
      <circle class="dest-pt" cx="${x}" cy="${y}" r="4"/>
      <text class="dest-label" x="${lx}" y="${ly}" text-anchor="${anchor}">${esc(d.nom)}</text>
    </g>`
  })
  return `
  <figure class="map">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Carte de la Belgique : depuis ${esc(carte.origine.nom)}, nous intervenons à ${esc(carte.destinations.map((d) => d.nom).join(', '))}.">
      <path class="map-land" d="${outline}"/>
      ${dests.join('')}
      <circle class="origin-ping" cx="${ox}" cy="${oy}" r="9"/>
      <circle class="origin-pt" cx="${ox}" cy="${oy}" r="7"/>
      <text class="origin-label" x="${ox}" y="${oy + 30}" text-anchor="middle">${esc(carte.origine.nom)}</text>
    </svg>
  </figure>`
}
