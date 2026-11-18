// Kuda vodi „Ponuda“ u traci na telefonu (MobileActionBar):
// na stranici stana na upit baš za taj stan (#upit), svuda drugde na kontakt formu na dnu početne.
export function useOfferLink() {
  const route = useRoute()
  const localePath = useLocalePath()
  return computed(() => (route.params.slug ? `${route.path}#upit` : `${localePath('/')}#kontakt`))
}
