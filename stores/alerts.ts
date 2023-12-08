import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Alert, IndexedAlert } from '@/types'

export const useAlertsStore = defineStore('alerts', () => {
  const alerts = ref<IndexedAlert[]>([])
  const defaultAlert: Alert = {
    type: 'success',
    message: '<< SUCCESS MESSAGE >>'
  }

  function showAlert(alert: Alert) {
    const indexedAlert = {
      id: alerts.value.length,
      ...JSON.parse(JSON.stringify(defaultAlert)),
      ...alert
    }
    alerts.value.unshift(indexedAlert)
    if (alert.type === 'error' || alert.type === 'success' || alert.type === 'info')
      setTimeout(() => {
        hideAlert(indexedAlert)
      }, 7000)
  }
  function hideAlert(alert: IndexedAlert) {
    const index = alerts.value.findIndex((e) => e.id === alert.id)
    if (index === -1) return
    alerts.value.splice(index, 1)
  }

  return { alerts, showAlert, hideAlert }
})
