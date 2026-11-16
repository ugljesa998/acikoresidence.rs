// Stavke glavnog menija — koriste ih header, mobilni meni (i kasnije footer).
// `id` je sidro sekcije na stranici; redosled prati ono što kupac prvo traži.
export function useNavigation() {
  const { t } = useI18n()

  return computed(() => [
    { id: 'stanovi', label: t('nav.apartments') },
    { id: 'lokacija', label: t('nav.location') },
    { id: 'gradnja', label: t('nav.construction') },
    { id: 'galerija', label: t('nav.gallery') },
  ])
}
