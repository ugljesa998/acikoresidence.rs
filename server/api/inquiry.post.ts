// Prijem upita sa forme. Proverava podatke i prosleđuje ih na adresu iz NUXT_INQUIRY_WEBHOOK
// (npr. Make/Zapier/n8n webhook koji šalje mejl prodaji ili upisuje u tabelu).
// Bez podešene adrese: u razvoju se upit samo ispiše u terminalu, a u produkciji forma javlja grešku
// i upućuje posetioca na telefon — da se nijedan upit ne izgubi neprimetno.
// Uz upit ide i `subject` sa brojem stana (npr. „Upit za Stan 15 · Povučeni sprat · 59,23 m²“), da prodaja
// odmah vidi na koji stan se odnosi (i „+ garažno mesto“ ako je to označeno), i `source`: sa koje forme je stigao (kontakt na početnoj ili stranica stana).
import { apartments } from '../../app/data/apartments'

const FLOOR = { f1: 'I sprat', f2: 'II sprat', f3: 'III sprat', ph: 'Povučeni sprat' } as const
const SOURCES = ['contact', 'apartment_page'] as const

const area = (n: number) => new Intl.NumberFormat('sr-Latn-RS', { minimumFractionDigits: 2 }).format(n)

interface InquiryBody {
  name?: string
  phone?: string
  email?: string
  apartment?: number | null
  garage?: boolean
  message?: string
  source?: string
  website?: string // zamka za botove: ljudi ovo polje ne vide
}

const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max)

export default defineEventHandler(async (event) => {
  const body = await readBody<InquiryBody>(event)

  if (body?.website) return { ok: true } // bot: pravimo se da je prošlo

  const unit = apartments.find((a) => a.number === body?.apartment)
  const garage = body?.garage === true

  const inquiry = {
    subject:
      (unit
        ? `Upit za Stan ${unit.number} · ${FLOOR[unit.floor]} · ${area(unit.area)} m²`
        : 'Opšti upit (stan nije izabran)') + (garage ? ' + garažno mesto' : ''),
    name: clean(body?.name, 120),
    phone: clean(body?.phone, 40),
    email: clean(body?.email, 160),
    apartment: unit?.number ?? null,
    garage, // zanima ga i garažno mesto
    message: clean(body?.message, 2000),
    source: SOURCES.find((s) => s === body?.source) ?? 'contact',
    sentAt: new Date().toISOString(),
    page: getRequestHeader(event, 'referer') ?? '',
  }

  if (!inquiry.name || inquiry.phone.replace(/\D/g, '').length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid inquiry' })
  }

  const { inquiryWebhook } = useRuntimeConfig(event)

  if (!inquiryWebhook) {
    if (import.meta.dev) {
      console.info('[upit] (NUXT_INQUIRY_WEBHOOK nije podešen, upit se samo ispisuje)', inquiry)
      return { ok: true }
    }
    throw createError({ statusCode: 503, statusMessage: 'Inquiry delivery is not configured' })
  }

  await $fetch(inquiryWebhook, { method: 'POST', body: inquiry })
  return { ok: true }
})
