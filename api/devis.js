// Fonction serveur Vercel : reçoit une demande de devis et l'envoie par e-mail.
// Variables d'environnement à définir dans Vercel (Settings → Environment Variables) :
//   SMTP_HOST   ex. smtp.hostinger.com
//   SMTP_PORT   ex. 465
//   SMTP_USER   l'adresse qui envoie, ex. formulaire@charabia.be
//   SMTP_PASS   son mot de passe
//   MAIL_TO     (facultatif) destinataire ; sinon contact.email de site.config.js
import nodemailer from 'nodemailer'
import config from '../site.config.js'

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const clean = (s, max) => String(s ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Méthode non autorisée' })

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}

  // Anti-spam : champ piège rempli, ou formulaire envoyé en moins de 3 secondes
  if (b.site || (typeof b.t === 'number' && b.t < 3000)) return res.status(200).json({ ok: true })

  const d = {
    type: clean(b.type, 40),
    delai: clean(b.delai, 40),
    nom: clean(b.nom, 120),
    telephone: clean(b.telephone, 40),
    commune: clean(b.commune, 80),
    email: clean(b.email, 160),
    message: String(b.message ?? '').trim().slice(0, 4000),
  }
  if (!d.nom || !d.telephone || !d.message) return res.status(400).json({ ok: false, error: 'Champs obligatoires manquants' })
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) d.email = ''

  const photos = (Array.isArray(b.photos) ? b.photos : []).slice(0, 4).filter((p) => p && typeof p.data === 'string' && p.data.length < 1_500_000)

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return res.status(500).json({ ok: false, error: 'Envoi de mail non configuré' })

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: Number(SMTP_PORT || 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  const nomSite = `${config.metier} ${config.nom}`
  const rows = [
    ['Type de travaux', d.type],
    ['Délai', d.delai],
    ['Nom', d.nom],
    ['Téléphone', d.telephone],
    ['Commune', d.commune],
    ['E-mail', d.email],
  ]
  const html = `
<div style="font-family:Arial,sans-serif;font-size:15px;color:#1D1F1C">
  <h2 style="margin:0 0 16px">Nouvelle demande de devis · ${esc(d.type)}</h2>
  <table cellpadding="6" style="border-collapse:collapse">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#55584F">${k}</td><td><strong>${esc(v)}</strong></td></tr>`)
    .join('')}</table>
  <p style="margin:18px 0 6px;color:#55584F">Projet :</p>
  <p style="margin:0;white-space:pre-wrap">${esc(d.message)}</p>
  ${photos.length ? `<p style="color:#55584F">${photos.length} photo(s) en pièce jointe.</p>` : ''}
  <p style="margin-top:24px"><a href="tel:${esc(d.telephone.replace(/[^\d+]/g, ''))}">Rappeler ${esc(d.nom)}</a></p>
</div>`

  try {
    await transport.sendMail({
      from: `"${nomSite} · site web" <${SMTP_USER}>`,
      to: MAIL_TO || config.contact.email,
      replyTo: d.email || undefined,
      subject: `Devis ${d.type} · ${d.nom}${d.commune ? ' · ' + d.commune : ''}`,
      html,
      attachments: photos.map((p, i) => ({ filename: clean(p.name, 80) || `photo-${i + 1}.jpg`, content: Buffer.from(p.data, 'base64'), contentType: 'image/jpeg' })),
    })

    if (d.email) {
      await transport
        .sendMail({
          from: `"${nomSite}" <${SMTP_USER}>`,
          to: d.email,
          replyTo: config.contact.email,
          subject: `Votre demande de devis · ${nomSite}`,
          html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1D1F1C">
<p>Bonjour ${esc(d.nom)},</p>
<p>Merci pour votre demande (${esc(d.type)}). Nous vous rappelons sous 48 h ouvrables au ${esc(d.telephone)}.</p>
<p style="color:#55584F;white-space:pre-wrap">Votre message :\n${esc(d.message)}</p>
<p>${esc(nomSite)}<br>${esc(config.contact.telephone)}</p></div>`,
        })
        .catch(() => {})
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Envoi impossible', err.message)
    return res.status(502).json({ ok: false, error: "L'e-mail n'a pas pu partir" })
  }
}
