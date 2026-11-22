// „Ponuda“ vodi na stranicu sa svim stanovima na izabranom jeziku.
export function useOfferLink() {
  const localePath = useLocalePath()
  return computed(() => localePath('/stanovi'))
}
