<template>
  <div class="app-container">
    Nuxt module playground!
    <br />
    {{ $t("welcome") }}
    <br />
    {{ messages }}
    <br />
    <br />
    <CurrencyDisplay />
  </div>
</template>

<script setup>
const { messages } = useI18n();
</script>

<style>
.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}
</style>
