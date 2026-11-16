import { contact } from '~/data/contact'

export type Messenger = 'viber' | 'whatsapp' | 'telegram'

// Koji messenger nudimo prvi, po jeziku: u Srbiji Viber, Rusima Telegram, ostalima WhatsApp.
const PREFERRED: Record<string, Messenger[]> = {
  sr: ['viber', 'whatsapp', 'telegram'],
  ru: ['telegram', 'whatsapp', 'viber'],
  en: ['whatsapp', 'viber', 'telegram'],
}

const LABEL: Record<Messenger, string> = {
  viber: 'Viber',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
}

const digits = (n: string) => n.replace(/\D/g, '')

function messengerHref(type: Messenger): string {
  if (type === 'viber' && contact.viber) return `viber://chat?number=%2B${digits(contact.viber)}`
  if (type === 'whatsapp' && contact.whatsapp) return `https://wa.me/${digits(contact.whatsapp)}`
  if (type === 'telegram' && contact.telegram) return `https://t.me/${contact.telegram.replace(/^@/, '')}`
  return ''
}

export function useContact() {
  const { locale } = useI18n()

  // Samo u lokalnom razvoju: lažni broj dok pravi ne bude upisan u data/project.ts.
  const isPreview = import.meta.dev && !contact.phone

  const phoneHref = contact.phone ? `tel:${contact.phone}` : isPreview ? '#' : ''
  const phoneDisplay = contact.phoneDisplay || contact.phone || (isPreview ? '06X XXX XXXX' : '')

  const messenger = computed(() => {
    const order = PREFERRED[locale.value] ?? PREFERRED.sr!
    for (const type of order) {
      const href = messengerHref(type)
      if (href) return { type, href, label: LABEL[type], external: href.startsWith('http') }
    }
    if (isPreview) {
      const type = order[0]!
      return { type, href: '#', label: LABEL[type], external: false }
    }
    return null
  })

  return { phoneHref, phoneDisplay, messenger, email: contact.email, isPreview }
}
