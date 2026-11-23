import nodemailer, { type Transporter } from 'nodemailer'
import { site } from '../../app/data/site'

// Slanje mejla prodaji (upiti sa forme, prijave na novosti) preko SMTP-a.
// Podešava se promenljivama okruženja — lokalno u .env (vidi .env.example), u produkciji u panelu hostinga:
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE   server (Google Workspace: smtp-relay.gmail.com, 587, false = STARTTLS)
//   SMTP_USER, SMTP_PASS                prijava; prazno = bez prijave (Google „SMTP relay“ sa dozvoljenom IP adresom servera)
//   SMTP_FROM                           od koga stiže mejl (adresa na domenu, npr. info@aciko.rs)
//   CONTACT_EMAIL                       kome stižu upiti i prijave (prodaja)
// Čitaju se pri svakom slanju, pa promena u panelu hostinga važi posle restarta, bez novog build-a.

const env = (key: string) => process.env[key]?.trim() ?? ''

/** Da li je slanje mejla podešeno (dovoljni su server i adresa prodaje). */
export const mailConfigured = () => Boolean(env('SMTP_HOST') && env('CONTACT_EMAIL'))

let transporter: Transporter | undefined

function transport() {
  if (transporter) return transporter
  const secure = env('SMTP_SECURE') === 'true' // true = port 465 (TLS od starta); false = 587 sa STARTTLS
  const user = env('SMTP_USER')
  const pass = env('SMTP_PASS')
  transporter = nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT') || (secure ? 465 : 587)),
    secure,
    requireTLS: !secure, // bez šifrovanja se ne šalje (Google relay to i traži)
    // Ime u EHLO pozdravu: domen pošiljaoca (aciko.rs), jer po njemu Google SMTP relay prepoznaje Workspace nalog
    // kad nema prijave (SMTP_USER/SMTP_PASS); sa „localhost“ ili drugim domenom odbija mejl (550 5.7.1).
    name: (env('SMTP_FROM') || env('CONTACT_EMAIL')).split('@')[1] || new URL(site.url).hostname,
    auth: user && pass ? { user, pass } : undefined,
  })
  return transporter
}

/** Pošalje mejl prodaji. `replyTo`: na „Odgovori“ u mejlu odgovor ide posetiocu (ako je ostavio e-adresu). */
export async function sendMail(mail: { subject: string; text: string; replyTo?: string }) {
  const from = env('SMTP_FROM') || env('CONTACT_EMAIL')
  await transport().sendMail({
    from: { name: site.name, address: from },
    to: env('CONTACT_EMAIL'),
    subject: mail.subject.replace(/[\r\n]+/g, ' '),
    text: mail.text,
    replyTo: mail.replyTo || undefined,
  })
}

/** Proveri vezu sa SMTP serverom (bez slanja mejla). */
export const verifyMail = () => transport().verify()

/** Vreme za mejl: „23. 11. 2026. 14:05“, po beogradskom vremenu. */
export const mailTime = (date = new Date()) =>
  new Intl.DateTimeFormat('sr-Latn-RS', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Belgrade' }).format(date)
