<script setup lang="ts">
defineProps<{ name: 'phone' | 'chat' | 'arrow' }>()
</script>

<template>
  <svg
    class="ui-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      v-if="name === 'phone'"
      d="M5.2 3.5h3.3l1.8 4.6-2.3 1.4a11.5 11.5 0 0 0 6.5 6.5l1.4-2.3 4.6 1.8v3.3a1.7 1.7 0 0 1-1.8 1.7A16.6 16.6 0 0 1 3.5 5.3a1.7 1.7 0 0 1 1.7-1.8z"
    />
    <path
      v-else-if="name === 'chat'"
      d="M20.5 11.6a8.4 8.4 0 0 1-12.2 7.5L3.5 20.5l1.4-4.6a8.4 8.4 0 1 1 15.6-4.3z"
    />
    <path v-else d="M4 12h16M14 6l6 6-6 6" />
  </svg>
</template>

<style scoped>
.ui-icon {
  display: block;
  width: 1em;
  height: 1em;
  flex: none;
}
</style>
