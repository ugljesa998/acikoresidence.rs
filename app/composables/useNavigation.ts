// Stavke glavnog menija — koriste ih header, mobilni meni i footer.
// `to` je pun put, da linkovi rade sa svake stranice (sidro na početnoj ili posebna stranica).
// Footer dodaje i telefon i adresu, pa „Kontakt“ u meniju vodi na formu.
// Redosled prati početnu: o projektu, spratovi, galerija, lokacija, stranica sa svim stanovima, pa kontakt.
export function useNavigation() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const home = computed(() => localePath('/'))

  return computed(() => [
    { key: 'about', to: `${home.value}#o-projektu`, label: t('about.eyebrow') },
    { key: 'floors', to: `${home.value}#spratovi`, label: t('nav.floors') },
    { key: 'gallery', to: `${home.value}#galerija`, label: t('nav.gallery') },
    { key: 'location', to: `${home.value}#lokacija`, label: t('nav.location') },
    { key: 'apartments', to: localePath('/stanovi'), label: t('nav.apartments') },
    { key: 'contact', to: `${home.value}#kontakt`, label: t('nav.contact') },
  ])
}
