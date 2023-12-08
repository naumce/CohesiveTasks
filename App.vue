<script setup lang="ts">
import Alert from '@/components/alert/AlertMain.vue';
import { useCustomizerStore } from '@/stores/customizer'
const customizerStore = useCustomizerStore()
</script>

<template>
  <v-app :theme="customizerStore.theme" :class="[customizerStore.theme]">
    <v-main>
      <v-container fluid class="h-100">
        <v-responsive class="d-flex h-100">
          <router-view />
        </v-responsive>
        <Alert />
      </v-container>
    </v-main>
  </v-app>
</template>