<script setup lang="ts">
// Početna (arhitektonski stil): fotografija zgrade preko celog ekrana sa naslovom i krupnim brojevima,
// pa o projektu, tri izdvojena stana, poziv ka svim stanovima sa fotografijom, tabela spratova, galerija,
// prijava na novosti (newsletter), lokacija i kontakt.
</script>

<template>
  <div class="home">
    <HeroSection />
    <AboutSection />
    <ApartmentsPreview />
    <OfferCta />
    <FloorsSection />
    <GallerySection />
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
