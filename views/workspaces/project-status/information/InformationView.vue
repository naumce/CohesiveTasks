<script setup lang="ts">
import { ref } from 'vue'
import TabContent from './TabContent.vue'

const activeTab = ref(0)
</script>
<template>
  <v-container fluid>
    <v-tabs v-model="activeTab">
      <v-tab data-testid="goals-tab" class="text-none">
        {{ $t('projectStatus.information.currentGoal') }}
      </v-tab>
      <v-tab data-testid="status-tab" class="text-none">
        {{ $t('projectStatus.information.currentStatus') }}
      </v-tab>
    </v-tabs>
    <TabContent :key="activeTab" :type="activeTab ? 'informationStatus' : 'objectives'"/>
  </v-container>
</template>
<style scoped lang="scss">
@media (max-width: 500px) {
  .tab-buttons {
    position: static !important;
  }
}
</style>