import { statusOf, type Apartment } from '../../app/data/apartments'
import { site } from '../../app/data/site'
import { mailTime } from './mail'

// Izgled mejlova koje prodaja dobija sa sajta: upit sa forme i prijava na novosti.
// Svaki mejl ima HTML verziju (u stilu sajta: tamno zaglavlje, crveni akcenat) i običan tekst za programe koji
// ne prikazuju HTML. HTML je pisan tabelama i stilovima u samim oznakama, jer to jedino radi u Gmail-u, Outlook-u
// i Apple Mail-u. Sve što je upisao posetilac se „escape-uje“, da ne može da ubaci svoj HTML u mejl.

const C = {
  ink: '#14120f',
  paper: '#f6f2ec',
  red: '#d90900',
  logoRed: '#f80000',
  muted: '#7a6f62',
  line: '#e7e0d5',
  white: '#ffffff',
  whatsapp: '#1f9d55',
}
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const FLOOR: Record<Apartment['floor'], string> = { f1: 'I sprat', f2: 'II sprat', f3: 'III sprat', ph: 'povučeni sprat' }
const STATUS = { available: 'slobodan', reserved: 'rezervisan', sold: 'prodat' } as const

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const area = (n: number) => new Intl.NumberFormat('sr-Latn-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

/** Telefon posetioca: međunarodni oblik za poziv i WhatsApp, a srpski broj i u čitljivom obliku (064 287 5658). */
function phoneOf(raw: string) {
  let n = raw.replace(/[^\d+]/g, '')
  if (n.startsWith('00')) n = `+${n.slice(2)}`
  else if (n.startsWith('0')) n = `+381${n.slice(1)}`
  else if (/^6\d{7,8}$/.test(n)) n = `+381${n}` // srpski mobilni upisan bez nule
  else if (!n.startsWith('+')) n = `+${n}`
  const national = n.startsWith('+381') ? `0${n.slice(4)}` : ''
  const display = national
    ? national.replace(/^(\d{3})(\d{3})(\d+)$/, '$1 $2 $3')
    : n
  return { display, tel: `tel:${n}`, whatsapp: `https://wa.me/${n.slice(1)}` }
}

/** Jezik sajta sa kog je stigao upit (po adresi stranice): ruski posetilac verovatno ne zna srpski. */
function languageOf(page: string) {
  let path = ''
  try {
    path = new URL(page).pathname
  } catch {}
  if (path === '/en' || path.startsWith('/en/')) return 'engleski'
  if (path === '/ru' || path.startsWith('/ru/')) return 'ruski'
  return 'srpski'
}

// —— Delovi HTML-a ——

function layout(opts: { title: string; preheader: string; label: string; body: string; footer: string }) {
  return `<!doctype html>
<html lang="sr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.paper};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${C.white};border:1px solid ${C.line};border-radius:6px;overflow:hidden;font-family:${FONT};color:${C.ink};">
<tr><td style="background:${C.ink};padding:18px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:${FONT};font-size:18px;font-weight:700;letter-spacing:2px;color:${C.white};"><span style="color:${C.logoRed};">&#9650;</span>&nbsp;ACIKO <span style="font-size:11px;font-weight:400;letter-spacing:3px;color:#b8b0a5;">RESIDENCE</span></td>
<td align="right" style="font-family:${FONT};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b8b0a5;">${esc(opts.label)}</td>
</tr></table>
</td></tr>
${opts.body}
<tr><td style="padding:20px 28px 24px;border-top:1px solid ${C.line};font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted};">
${opts.footer}
</td></tr>
</table>
<p style="margin:16px 0 0;font-family:${FONT};font-size:11px;color:${C.muted};">Automatska poruka sa sajta <a href="${site.url}" style="color:${C.muted};">acikoresidence.rs</a> · ACIKO Residence, Kneza Miloša, Vrnjačka Banja</p>
</td></tr>
</table>
</body>
</html>`
}

const section = (inner: string, padding = '24px 28px 0') =>
  `<tr><td style="padding:${padding};font-family:${FONT};">${inner}</td></tr>`

const button = (href: string, label: string, bg: string) =>
  `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 20px;background:${bg};border-radius:4px;font-family:${FONT};font-size:14px;font-weight:700;letter-spacing:0.5px;color:${C.white};text-decoration:none;">${label}</a>`

const rows = (items: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};">${items
    .map(
      ([k, v]) =>
        `<tr><td width="38%" valign="top" style="padding:11px 12px 11px 0;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:13px;color:${C.muted};">${k}</td><td valign="top" style="padding:11px 0;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:15px;color:${C.ink};">${v}</td></tr>`,
    )
    .join('')}</table>`

const label = (text: string) =>
  `<p style="margin:0 0 10px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">${text}</p>`

// —— Upit sa forme ——

export interface InquiryMailData {
  unit: Apartment | undefined
  name: string
  phone: string
  email: string
  garage: boolean
  message: string
  source: string // 'contact' | 'apartment_page'
  page: string
}

export function inquiryEmail(d: InquiryMailData) {
  const phone = phoneOf(d.phone)
  const lang = languageOf(d.page)
  const when = mailTime()
  const from = d.source === 'apartment_page' ? 'stranica stana' : 'kontakt forma na početnoj'
  const unitUrl = d.unit ? `${site.url}/stanovi/stan-${d.unit.number}` : ''
  const unitTitle = d.unit ? `Stan ${d.unit.number}` : 'Opšti upit'
  const unitMeta = d.unit
    ? `${FLOOR[d.unit.floor]} · ${area(d.unit.area)} m² · ${d.unit.bedrooms === 1 ? '1 spavaća soba' : '2 spavaće sobe'} · terasa ${area(d.unit.terrace)} m²`
    : 'Stan nije izabran — pošaljite ponudu svih slobodnih stanova.'
  const status = d.unit ? statusOf(d.unit.number) : 'available'

  const subject =
    (d.unit ? `Upit za Stan ${d.unit.number} · ${FLOOR[d.unit.floor]} · ${area(d.unit.area)} m²` : 'Opšti upit') +
    (d.garage ? ' + garaža' : '') +
    ` — ${d.name}`

  const body = [
    section(`
<p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.red};">Novi upit sa sajta</p>
<h1 style="margin:0;font-family:${FONT};font-size:30px;line-height:1.15;font-weight:400;color:${C.ink};">${unitTitle}</h1>
<p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:${C.muted};">${esc(unitMeta)}</p>
${status !== 'available' ? `<p style="margin:12px 0 0;"><span style="display:inline-block;padding:4px 10px;border-radius:3px;background:#fdecea;font-size:12px;font-weight:700;color:${C.red};">Stan je ${STATUS[status]} — ponudite sličan slobodan stan</span></p>` : ''}
${d.garage ? `<p style="margin:12px 0 0;"><span style="display:inline-block;padding:4px 10px;border-radius:3px;background:${C.paper};font-size:12px;font-weight:700;color:${C.ink};">+ Interesuje se i za garažno mesto</span></p>` : ''}`),
    section(`
${label('Posetilac')}
<p style="margin:0;font-size:22px;line-height:1.3;color:${C.ink};">${esc(d.name)}</p>
<p style="margin:4px 0 16px;font-size:17px;"><a href="${esc(phone.tel)}" style="color:${C.ink};text-decoration:none;font-weight:700;">${esc(phone.display)}</a></p>
${button(phone.tel, 'Pozovite', C.red)}${button(phone.whatsapp, 'WhatsApp', C.whatsapp)}${d.email ? button(`mailto:${d.email}`, 'Odgovorite mejlom', C.ink) : ''}`),
    section(`
${label('Podaci')}
${rows([
  ['Ime i prezime', esc(d.name)],
  ['Telefon', `<a href="${esc(phone.tel)}" style="color:${C.ink};">${esc(phone.display)}</a>`],
  ...(d.email ? ([['E-pošta', `<a href="mailto:${esc(d.email)}" style="color:${C.ink};">${esc(d.email)}</a>`]] as [string, string][]) : []),
  ['Stan', d.unit ? `<a href="${unitUrl}" style="color:${C.ink};">${unitTitle}</a> · ${STATUS[status]}` : 'nije izabran'],
  ['Garažno mesto', d.garage ? 'da, interesuje se' : 'ne'],
  ['Jezik sajta', lang],
])}`),
    section(`
${label('Poruka')}
${
  d.message
    ? `<div style="padding:14px 16px;background:${C.paper};border-left:3px solid ${C.red};font-size:15px;line-height:1.6;color:${C.ink};">${esc(d.message).replace(/\r?\n/g, '<br>')}</div>`
    : `<p style="margin:0;font-size:14px;color:${C.muted};">Bez poruke.</p>`
}`, '24px 28px 28px'),
  ].join('\n')

  const footer = `Poslato ${esc(when)} · ${from}<br>Stranica: ${
    d.page ? `<a href="${esc(d.page)}" style="color:${C.muted};">${esc(d.page)}</a>` : '—'
  }${d.email ? '' : '<br>E-adresa nije ostavljena — javite se telefonom ili porukom.'}`

  const html = layout({
    title: subject,
    preheader: `${unitTitle}${d.unit ? ` · ${FLOOR[d.unit.floor]}` : ''} — ${d.name}, ${phone.display}`,
    label: 'Novi upit',
    body,
    footer,
  })

  const text = [
    `NOVI UPIT SA SAJTA — ${unitTitle.toUpperCase()}`,
    d.unit ? `${FLOOR[d.unit.floor]} · ${area(d.unit.area)} m² · ${STATUS[status]}` : unitMeta,
    ...(d.garage ? ['Interesuje se i za garažno mesto.'] : []),
    '',
    `Ime i prezime: ${d.name}`,
    `Telefon: ${phone.display}`,
    `WhatsApp: ${phone.whatsapp}`,
    ...(d.email ? [`E-pošta: ${d.email}`] : []),
    `Jezik sajta: ${lang}`,
    ...(unitUrl ? [`Stan na sajtu: ${unitUrl}`] : []),
    '',
    'Poruka:',
    d.message || '(bez poruke)',
    '',
    '—',
    `Poslato ${when} · ${from}`,
    `Stranica: ${d.page || '—'}`,
  ].join('\n')

  return { subject, html, text }
}

// —— Prijava na novosti ——

export function newsletterEmail(d: { email: string; page: string }) {
  const when = mailTime()
  const lang = languageOf(d.page)
  const subject = `Nova prijava na novosti — ${d.email}`

  const body = [
    section(`
<p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.red};">Novosti</p>
<h1 style="margin:0;font-family:${FONT};font-size:26px;line-height:1.2;font-weight:400;color:${C.ink};">Nova prijava na novosti</h1>
<p style="margin:12px 0 18px;font-size:18px;"><a href="mailto:${esc(d.email)}" style="color:${C.ink};font-weight:700;text-decoration:none;">${esc(d.email)}</a></p>
${button(`mailto:${d.email}`, 'Pošaljite mejl', C.ink)}`),
    section(
      `${rows([
        ['E-adresa', `<a href="mailto:${esc(d.email)}" style="color:${C.ink};">${esc(d.email)}</a>`],
        ['Jezik sajta', lang],
      ])}
<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:${C.muted};">Dodajte adresu na spisak za slanje novosti sa gradilišta, cena i slobodnih stanova.</p>`,
      '20px 28px 28px',
    ),
  ].join('\n')

  const html = layout({
    title: subject,
    preheader: `Prijavio se na novosti: ${d.email}`,
    label: 'Novosti',
    body,
    footer: `Poslato ${esc(when)}<br>Stranica: ${d.page ? `<a href="${esc(d.page)}" style="color:${C.muted};">${esc(d.page)}</a>` : '—'}`,
  })

  const text = [
    'NOVA PRIJAVA NA NOVOSTI',
    '',
    `E-adresa: ${d.email}`,
    `Jezik sajta: ${lang}`,
    '',
    'Dodajte adresu na spisak za slanje novosti.',
    '',
    '—',
    `Poslato ${when}`,
    `Stranica: ${d.page || '—'}`,
  ].join('\n')

  return { subject, html, text }
}
