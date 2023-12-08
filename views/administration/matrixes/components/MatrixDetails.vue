<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { RiskMatrixRaw } from '@/types'
import TabMatrixThresholds from './TabMatrixThresholds.vue'
import TabMatrixPreview from './TabMatrixPreview.vue'

const props = defineProps({
  matrix: {
    type: Object as () => RiskMatrixRaw,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['change'])

const { loading } = storeToRefs(useLoaderStore())
const activeTab = ref(0)

const previewDisabled = computed(() => {
  if (loading.value) return true
  return (
    !props.matrix?.severities?.length &&
    !props.matrix?.probabilities?.length &&
    !props.matrix?.thresholds?.length
  )
})
</script>
<template>
  <v-container fluid class="ma-0 pa-0">
    <v-tabs v-model="activeTab">
      <v-tab value="thresholds" :disabled="loading" class="text-none">
        {{ $t('misc.thresholds', 2) }}
      </v-tab>
      <v-tab value="preview" :disabled="previewDisabled" class="text-none">
        {{ $t('misc.preview', 2) }}
      </v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
      <v-window-item value="thresholds">
        <TabMatrixThresholds :matrix="props.matrix" @change="emit('change')" />
      </v-window-item>
      <v-window-item value="preview">
        <TabMatrixPreview :matrix="props.matrix" />
      </v-window-item>
    </v-window>
  </v-container>
</template>
