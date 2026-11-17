import { readFileSync } from 'node:fs'
import { renderMap } from './map.js'

// Génère le HTML de la page à partir de site.config.js (au moment du build).
// Le HTML final est statique : Google lit tout le contenu sans JavaScript.

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const placeholder = (label, extra = '') =>
  `<div class="ph ${extra}" role="img" aria-label="${esc(label)}"><span class="ph-label">${esc(label)}</span></div>`

const img = (src, alt, extra = '') =>
  src ? `<img class="${extra}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">` : placeholder(alt, extra)

// Logo du client (SVG en une couleur, fill="currentColor") : il prend la couleur du texte autour.
const svgFile = (path) => (path ? readFileSync(new URL('../public' + path, import.meta.url), 'utf8').replace('<svg ', '<svg aria-hidden="true" focusable="false" ') : '')

// Effet « lettres qui s'échangent » (menu) : chaque lettre a une copie cachée juste en dessous
const swap = (label) =>
  `<span class="swap" aria-hidden="true">${[...label]
    .map((ch) => {
      const t = ch === ' ' ? '&nbsp;' : esc(ch)
      return `<span class="swap-l"><span class="swap-in"><span>${t}</span><span>${t}</span></span></span>`
    })
    .join('')}</span>`

export function renderHead(c) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: `${c.metier} ${c.nom}`,
    description: c.seo.description,
    url: c.seo.url,
    telephone: c.contact.telephoneLien,
    email: c.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.contact.adresse,
      postalCode: c.contact.codePostal,
      addressLocality: c.contact.ville,
      addressCountry: 'BE',
    },
    areaServed: c.zoneSeo || c.communes,
    makesOffer: c.prestations.map((p) => ({ '@type': 'Offer', name: p.titre })),
  }
  return `
<title>${esc(c.seo.title)}</title>
<meta name="description" content="${esc(c.seo.description)}">
${c.maquette ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${esc(c.seo.url)}">`}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(c.seo.title)}">
<meta property="og:description" content="${esc(c.seo.description)}">
<meta property="og:url" content="${esc(c.seo.url)}">
${c.logo?.symbole ? `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svgFile(c.logo.symbole).replace('currentColor', c.couleurs.accent))}">` : '<link rel="icon" href="/favicon.svg" type="image/svg+xml">'}
<meta name="theme-color" content="${esc(c.couleurs.sombre || c.couleurs.encre)}">
<style>:root{${Object.entries({
  fond: c.couleurs.fond, encre: c.couleurs.encre, accent: c.couleurs.accent, 'accent-texte': c.couleurs.accentTexte,
  'accent-clair': c.couleurs.accentClair || '#F08A5D', muted: c.couleurs.texteDoux || '#55584F', 'muted-fort': c.couleurs.texteMoyen || '#3A3D36',
  line: c.couleurs.trait || '#B9B4A8', panel: c.couleurs.panneau || '#E6E1D6', ph: c.couleurs.photoVide || '#E3DED3', 'sur-sombre': c.couleurs.surSombre || '#C9C5BB',
  sombre: c.couleurs.sombre || c.couleurs.encre, clair: c.couleurs.clair || c.couleurs.fond,
  champ: c.couleurs.champ || '#2A2C28', 'sur-accent': c.couleurs.surAccent || c.couleurs.encre,
}).map(([k, v]) => `--${k}:${v}`).join(';')}}</style>
${c.couleurs.accueil ? `<style>.hero, .top:not(.is-solid) {${Object.entries({
  fond: c.couleurs.accueil.fond, encre: c.couleurs.accueil.encre, 'accent-texte': c.couleurs.accueil.accentTexte,
  muted: c.couleurs.accueil.texteDoux, 'muted-fort': c.couleurs.accueil.texteMoyen, line: c.couleurs.accueil.trait,
  accent: c.couleurs.accueil.accent, 'sur-accent': c.couleurs.accueil.surAccent,
}).filter(([, v]) => v).map(([k, v]) => `--${k}:${v}`).join(';')}} .hero { background: var(--fond); color: var(--encre); } .hero .accent { color: ${c.couleurs.accueil.accentTitre || 'var(--accent-texte)'}; }</style>` : ''}
<script type="application/ld+json">${JSON.stringify(ld)}</script>`
}

export function renderBody(c) {
  const k = c.contact
  const nomMaj = esc(c.nom.toUpperCase())
  const [avantApres, ...autres] = c.realisations
  const marqueeItems = c.prestations.map((p) => p.titre.split(' ')[0])
  const marquee = [...marqueeItems, ...marqueeItems].map((m) => `<span>${esc(m)}</span><span class="mq-sep" aria-hidden="true">/</span>`).join('')

  return `
<div class="intro" aria-hidden="true">
  <div class="intro-name"><span>${c.logo ? `<span class="intro-logo">${svgFile(c.logo.complet)}</span>` : nomMaj}</span></div>
  <div class="intro-tape"><div class="intro-tape-fill"></div></div>
  <div class="intro-mm"><span class="intro-count">0</span> mm</div>
</div>

<div class="cursor" aria-hidden="true"><div class="cursor-dot"></div><div class="cursor-ring"><span class="cursor-label"></span></div></div>

${c.maquette ? `<div class="mock-tag">${esc(c.maquette)}</div>` : ''}
<a class="skip" href="#contenu">Aller au contenu</a>

<header class="top">
  <div class="wrap top-in">
    <a href="#" class="logo" aria-label="${esc(c.metier)} ${esc(c.nom)}, retour en haut">
      ${c.logo ? `<span class="logo-svg">${svgFile(c.logo.complet)}</span>` : `<span class="logo-name">${nomMaj}</span><span class="logo-sub">${esc(c.metier)} · ${esc(k.ville)}</span>`}
    </a>
    <nav class="nav" aria-label="Navigation principale">
      ${[['#travaux', 'Travaux & prix'], ['#chantiers', 'Chantiers'], ['#zone', 'Zone'], ['#devis', 'Devis']]
        .map(([href, label]) => `<a href="${href}" class="nav-link" aria-label="${esc(label)}">${swap(label)}</a>`)
        .join('')}
      ${c.menuTelephone === false ? '' : `<a href="tel:${esc(k.telephoneLien)}" class="nav-tel magnetic">${esc(k.telephone)}</a>`}
    </nav>
  </div>
</header>

<main id="contenu">

<section class="hero${c.couleurs.scene === 'nu' ? ' hero-nu' : ''}" aria-label="Présentation">
  <div class="hero-sticky">
    <canvas class="stair" aria-hidden="true"></canvas>
    <div class="hero-shade" aria-hidden="true"></div>
    <div class="wrap hero-in">
      <div class="hero-text">
        <p class="eyebrow hero-eyebrow">${esc(c.accroche)}</p>
        <h1 class="hero-title">${c.titre
          .map((l, i) => `<span class="line"><span class="${i === c.titre.length - 1 ? 'accent' : ''}">${esc(l)}</span></span>`)
          .join(' ')}</h1>
        <p class="hero-intro">${esc(c.intro)}</p>
        <div class="hero-ctas">
          <a href="#devis" class="btn btn-accent magnetic" data-cursor="Devis">Demander un devis gratuit</a>
          <a href="tel:${esc(k.telephoneLien)}" class="btn btn-line magnetic">Appeler l'atelier</a>
        </div>
      </div>
      <ol class="phases" aria-label="Notre façon de travailler">
        ${c.etapes3d.map((e, i) => `<li class="phase${i === 0 ? ' is-on' : ''}"><span class="phase-n">0${i + 1}</span><span class="phase-t">${esc(e)}</span></li>`).join('')}
        <li class="phase-bar" aria-hidden="true"><span class="phase-bar-fill"></span></li>
      </ol>
      <div class="scroll-hint" aria-hidden="true"><span>Faites défiler</span><span class="scroll-hint-line"></span></div>
    </div>
  </div>
</section>

${c.bandeau === false ? '' : `<div class="band" aria-hidden="true"><div class="mq">${marquee}${marquee}</div></div>`}

<div class="promises">
  <ul class="wrap promises-in">
    ${c.promesses.map((p) => `<li class="reveal"><span class="arrow" aria-hidden="true">→</span>${esc(p)}</li>`).join('')}
  </ul>
</div>

<section id="travaux" class="wrap section">
  <div class="section-head">
    <h2 class="h2 split">Travaux &amp; prix</h2>
    <p class="section-note reveal">${esc(c.mentionPrix)}</p>
  </div>
  <div class="services">
    ${c.prestations
      .map(
        (p, i) => `
    <a href="#devis" class="service" data-type="${esc(c.typesTravaux[i] || '')}" data-cursor="Devis">
      <span class="service-n">0${i + 1}</span>
      <span class="service-main"><span class="service-title">${esc(p.titre)}</span><span class="service-detail">${esc(p.detail)}</span></span>
      <span class="service-price">${p.prix ? `<span class="service-from">à partir de</span><span class="service-amount">${esc(p.prix)}<small>${esc(p.unite || '')}</small></span>` : `<span class="service-from">prix</span><span class="service-amount">Sur devis</span>`}</span>
    </a>`
      )
      .join('')}
  </div>
</section>

<section class="plan" aria-labelledby="plan-titre">
  <div class="wrap plan-in">
    <div class="plan-text">
      <p class="eyebrow eyebrow-light">Du plan à la pose</p>
      <h2 id="plan-titre" class="h2 split">Chaque pièce est dessinée pour votre maison.</h2>
      <ol class="plan-steps">
        ${(c.etapesPlan || []).map(([t, d], i) => `<li class="plan-step"><span class="plan-n">0${i + 1}</span><span><strong>${esc(t)}</strong> ${esc(d)}</span></li>`).join('')}
      </ol>
    </div>
    <div class="plan-drawing">
      <svg viewBox="0 0 640 520" role="img" aria-label="Plan technique d'un escalier, vue de côté, avec ses cotes">
        <g class="draw draw-main" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M60 460 H120 V420 H180 V380 H240 V340 H300 V300 H360 V260 H420 V220 H480 V180 H540 V140 H600"/>
          <path d="M60 470 L600 150"/>
          <path d="M120 420 V470 M180 380 V470 M240 340 V470 M300 300 V470 M360 260 V470 M420 220 V470 M480 180 V470 M540 140 V470" stroke-width="0.75" opacity="0.45"/>
          <path d="M40 470 H620" stroke-width="1"/>
        </g>
        <g class="draw draw-dim" fill="none" stroke="var(--accent)" stroke-width="1.25">
          <path d="M60 500 H600 M60 492 V508 M600 492 V508"/>
          <path d="M625 460 V140 M617 460 H633 M617 140 H633"/>
          <path d="M120 400 H180 M120 394 V406 M180 394 V406"/>
          <path d="M100 420 V460 M94 420 H106 M94 460 H106"/>
        </g>
        <g class="plan-labels" fill="var(--accent)" font-family="IBM Plex Mono, monospace" font-size="13">
          <text x="330" y="495" text-anchor="middle">3 240 mm</text>
          <text x="612" y="300" text-anchor="end">2 720 mm</text>
          <text x="150" y="393" text-anchor="middle">270</text>
          <text x="96" y="444" text-anchor="end">180</text>
          <text x="74" y="130" fill="currentColor" opacity="0.55">ESC-01 · CHÊNE MASSIF · 9 MARCHES</text>
        </g>
      </svg>
    </div>
  </div>
</section>

<section id="chantiers" class="wrap section">
  <div class="section-head">
    <h2 class="h2 split">Derniers chantiers</h2>
    <p class="section-note reveal">Faites glisser pour comparer avant et après.</p>
  </div>
  ${
    avantApres
      ? `<figure class="ba reveal">
    <div class="ba-stage" data-cursor="Glisser">
      <div class="ba-layer ba-after">${img(avantApres.apres, 'Photo après travaux', 'ba-img ph-after')}<span class="ba-tag ba-tag-after">Après</span></div>
      <div class="ba-layer ba-before">${img(avantApres.avant, 'Photo avant travaux', 'ba-img ph-before')}<span class="ba-tag">Avant</span></div>
      <div class="ba-handle" aria-hidden="true"><span></span></div>
      <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Comparer avant et après">
    </div>
    <figcaption class="cap"><span>${esc(avantApres.titre)}</span>${avantApres.lieu ? `<span class="cap-place">${esc(avantApres.lieu)}</span>` : ''}</figcaption>
  </figure>`
      : ''
  }
  <div class="works">
    ${autres
      .map(
        (r) => `<figure class="work reveal${r.grand ? ' work-tall' : ''}"><div class="work-media">${img(r.image, 'Photo : ' + r.titre, 'work-img')}</div><figcaption class="cap"><span>${esc(r.titre)}</span>${r.lieu ? `<span class="cap-place">${esc(r.lieu)}</span>` : ''}</figcaption></figure>`
      )
      .join('')}
  </div>
</section>

<section id="zone" class="zone">
  <div class="wrap zone-in">
    <div class="zone-text">
      <h2 class="h2 split">Où on intervient</h2>
      <p class="reveal">${esc(c.rayon)}${c.zoneNote === undefined ? " Votre commune n'est pas dans la liste ? Appelez, on trouve souvent une solution." : c.zoneNote ? ' ' + esc(c.zoneNote) : ''}</p>
    </div>
    ${c.carte ? renderMap(c.carte) : `    <div class="radar" aria-hidden="true">
      <span class="ring r1"></span><span class="ring r2"></span><span class="ring r3"></span><span class="sweep"></span>
      <span class="radar-center">Atelier<br>${esc(k.ville)}</span>
    </div>`}
    <ul class="towns">${c.communes.map((t) => `<li class="town">${esc(t)}</li>`).join('')}</ul>
  </div>
</section>

<section id="devis" class="quote" aria-labelledby="devis-titre">
  <div class="wrap quote-in">
    <div class="quote-text">
      <p class="eyebrow eyebrow-light">Devis gratuit</p>
      <h2 id="devis-titre" class="h2 split">Parlez-nous de votre projet</h2>
      <p class="quote-note reveal">${esc(c.reponse.delai)} Vous préférez parler ? <a href="tel:${esc(k.telephoneLien)}">${esc(k.telephone)}</a>${k.horaires && k.horaires.length ? ' · ' + esc(k.horaires[0]) : ''}.</p>
    </div>
    <form class="form" novalidate>
      <fieldset class="chips">
        <legend>Type de travaux</legend>
        <div class="chips-row">
          ${c.typesTravaux.map((t, i) => `<label class="chip"><input type="radio" name="type" value="${esc(t)}"${i === 0 ? ' checked' : ''}><span>${esc(t)}</span></label>`).join('')}
        </div>
      </fieldset>
      <div class="grid2">
        <label class="field"><span>Nom <em>*</em></span><input name="nom" type="text" autocomplete="name" required></label>
        <label class="field"><span>Téléphone <em>*</em></span><input name="telephone" type="tel" autocomplete="tel" required></label>
        <label class="field"><span>Commune du chantier</span><input name="commune" type="text" autocomplete="address-level2"></label>
        <label class="field"><span>E-mail</span><input name="email" type="email" autocomplete="email"></label>
      </div>
      <label class="field"><span>Votre projet en quelques mots <em>*</em></span><textarea name="message" rows="4" required placeholder="Ex. : remplacer 4 châssis côté rue, maison des années 60"></textarea></label>
      <fieldset class="chips">
        <legend>Quand ?</legend>
        <div class="chips-row">
          ${c.delais.map((d, i) => `<label class="chip"><input type="radio" name="delai" value="${esc(d)}"${i === 0 ? ' checked' : ''}><span>${esc(d)}</span></label>`).join('')}
        </div>
      </fieldset>
      <label class="field drop" data-cursor="Photos">
        <input name="photos" type="file" accept="image/*" multiple>
        <span class="drop-in"><strong>Ajouter des photos</strong> (facultatif, 4 maximum)</span>
        <span class="drop-list" aria-live="polite"></span>
      </label>
      <label class="hp" aria-hidden="true">Ne pas remplir<input name="site" type="text" tabindex="-1" autocomplete="off"></label>
      <div class="form-foot">
        <button type="submit" class="btn btn-accent magnetic">Envoyer ma demande</button>
        <span class="form-legal">Vos données servent uniquement à vous répondre.</span>
      </div>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
    <div class="sent" hidden>
      <p class="eyebrow eyebrow-light sent-type"></p>
      <p class="sent-title">${esc(c.reponse.merci)}</p>
      <p class="sent-text">Si vous avez laissé votre e-mail, une copie de votre demande vient de vous être envoyée.</p>
      <button type="button" class="btn btn-ghost sent-again">Faire une autre demande</button>
    </div>
  </div>
</section>

</main>

<footer class="foot">
  <div class="wrap foot-in">
    <div><strong>${esc(c.metier)} ${esc(c.nom)}</strong><br>${esc(k.adresse)}, ${esc(k.codePostal)} ${esc(k.ville)}<br><span class="mono">TVA ${esc(k.tva)}</span></div>
    ${k.horaires && k.horaires.length ? `<div><strong>Atelier</strong><br>${k.horaires.map(esc).join('<br>')}</div>` : ''}
    <div>${[`<a href="tel:${esc(k.telephoneLien)}">${esc(k.telephone)}</a>`, k.email && `<a href="mailto:${esc(k.email)}">${esc(k.email)}</a>`, k.whatsapp && `<a href="https://wa.me/${esc(k.whatsapp)}">WhatsApp</a>`, k.instagram && `<a href="${esc(k.instagram)}">Instagram</a>`].filter(Boolean).join('<br>')}</div>
    <div><a href="/mentions-legales">Mentions légales</a><br><a href="/vie-privee">Vie privée</a><br><span class="credit">Site réalisé par Charabia</span></div>
  </div>
  ${c.motGeant === false ? '' : `<div class="foot-word" aria-hidden="true">${nomMaj}</div>`}
</footer>
`
}
