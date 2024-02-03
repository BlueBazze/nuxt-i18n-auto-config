<script lang="ts" setup></script>

<template>
  <div>
    <i18n-n
      tag="span"
      :value="1234"
      :format="{ key: 'currency', currency: 'EUR' }"
    />
    <br />
    <i18n-n
      tag="span"
      :value="1234"
      :format="{ key: 'currency', currency: 'DKK' }"
    />
  </div>
</template>
