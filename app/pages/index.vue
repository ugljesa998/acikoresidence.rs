<script setup lang="ts">
// Početna (arhitektonski stil): fotografija zgrade preko celog ekrana sa naslovom i krupnim brojevima,
// pa o projektu, tri izdvojena stana, poziv ka svim stanovima sa fotografijom, tabela spratova, prijava na
// novosti (newsletter), lokacija i kontakt.
// Galerija je skinuta sa početne; njena komponenta je i dalje u app/components, za kada se vrati u novom stilu.
</script>

<template>
  <div class="home">
    <HeroSection />
    <AboutSection />
    <ApartmentsPreview />
    <OfferCta />
    <FloorsSection />
    <NewsletterSection />
    <LocationMapSection />
    <ContactSection />
  </div>
</template>

<style scoped>
.home {
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
}
</style>
