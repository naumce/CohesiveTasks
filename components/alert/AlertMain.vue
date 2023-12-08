<script setup lang="ts">
import { useAlertsStore } from '@/stores/alerts'
const { alerts, hideAlert } = useAlertsStore()
</script>

<template>
  <div v-if="alerts?.length" class="alerts-container">
    <v-alert
      v-for="toast in alerts"
      :key="toast.id"
      :color="toast.type"
      :icon="`$${toast.type}`"
      :text="toast.message"
      closable
      @close="hideAlert(toast)"
    />
  </div>
</template>
<style scoped lang="scss">
.alerts-container {
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 10px;
}
</style>
