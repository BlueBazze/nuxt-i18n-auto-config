<template>
  <div class="app-container">
    Nuxt module playground!
    <br />
    {{ $t("welcome") }}
    <br />
    {{ messages }}
    {{ locale }}
    <br />
    <br />
    <CurrencyDisplay />
  </div>
</template>

<script setup>
const { messages,locale } = useI18n();
</script>

<style>
.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}
</style>
