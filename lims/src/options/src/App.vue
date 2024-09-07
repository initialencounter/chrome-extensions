<script setup lang="ts">
import SettingsForm from './components/SettingsForm.vue'
import Schema from './components/Schema.vue';
const isChromeExt = window.location.protocol !== 'chrome-extension:'
</script>

<template>
  <main>
    <SettingsForm v-if="isChromeExt"> </SettingsForm>
    <Schema v-if="!isChromeExt"> </Schema>
  </main>
</template>

<style scoped>

</style>
