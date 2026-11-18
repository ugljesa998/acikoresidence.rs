// Stavke glavnog menija — koriste ih header, mobilni meni i footer.
// `to` je pun put, da linkovi rade sa svake stranice (sidro na početnoj ili posebna stranica).
// Redosled prati početnu: o projektu, spratovi, pa stranica sa svim stanovima.
// Kad se vrate lokacija, galerija i kontakt, dodaju se ovde.
export function useNavigation() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const home = computed(() => localePath('/'))

  return computed(() => [
    { key: 'about', to: `${home.value}#o-projektu`, label: t('about.eyebrow') },
    { key: 'floors', to: `${home.value}#spratovi`, label: t('nav.floors') },
    { key: 'apartments', to: localePath('/stanovi'), label: t('nav.apartments') },
  ])
}
