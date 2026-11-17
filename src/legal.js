// Pages « Mentions légales » et « Vie privée », générées depuis site.config.js.
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const page = (c, title, body) => `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · ${esc(c.metier)} ${esc(c.nom)}</title><meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>body{margin:0;background:${c.couleurs.fond};color:${c.couleurs.encre};font:17px/1.6 system-ui,sans-serif}
main{max-width:720px;margin:0 auto;padding:64px 24px}h1{font-size:40px;line-height:1.1;margin:0 0 32px}h2{font-size:20px;margin:32px 0 8px}
a{color:${c.couleurs.accentTexte}}</style></head>
<body><main><p><a href="/">← Retour au site</a></p><h1>${esc(title)}</h1>${body}</main></body></html>`

export function legalPages(c) {
  const k = c.contact
  const id = `<p><strong>${esc(c.metier)} ${esc(c.nom)}</strong><br>${esc(k.adresse)}, ${esc(k.codePostal)} ${esc(k.ville)}, Belgique<br>
Numéro d'entreprise / TVA : ${esc(k.tva)}<br>Téléphone : ${esc(k.telephone)} · E-mail : <a href="mailto:${esc(k.email)}">${esc(k.email)}</a></p>`
  return {
    'mentions-legales.html': page(c, 'Mentions légales', `<h2>Éditeur du site</h2>${id}
<h2>Hébergement</h2><p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
<h2>Conception</h2><p>Site réalisé par Charabia.</p>
<h2>Propriété intellectuelle</h2><p>Les textes et photos de ce site appartiennent à ${esc(c.metier)} ${esc(c.nom)}. Toute reproduction sans accord est interdite.</p>`),
    'vie-privee.html': page(c, 'Vie privée', `<h2>Responsable du traitement</h2>${id}
<h2>Données collectées</h2><p>Quand vous remplissez le formulaire de devis, nous recevons votre nom, votre téléphone, votre commune, votre e-mail, votre message et vos éventuelles photos. Elles nous sont envoyées par e-mail et ne sont pas enregistrées sur le site.</p>
<h2>Utilisation</h2><p>Ces données servent uniquement à répondre à votre demande et à établir un devis. Elles ne sont ni vendues ni transmises à des tiers.</p>
<h2>Durée de conservation</h2><p>Trois ans après notre dernier contact, sauf si un contrat nous oblige à les garder plus longtemps.</p>
<h2>Cookies</h2><p>Ce site n'utilise aucun cookie de suivi ni de publicité. Les polices sont hébergées sur le site lui-même.</p>
<h2>Vos droits</h2><p>Vous pouvez demander à consulter, corriger ou supprimer vos données en écrivant à <a href="mailto:${esc(k.email)}">${esc(k.email)}</a>. Vous pouvez aussi introduire une plainte auprès de l'Autorité de protection des données (autoriteprotectiondonnees.be).</p>`),
  }
}
