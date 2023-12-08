<script setup lang="ts">
import { computed } from 'vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import RiskAndOpportunityPreview from '../RiskAndOpportunityPreview.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  project: {
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['update:modelValue'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const { loading } = storeToRefs(useLoaderStore())
</script>
<template>
  <v-dialog v-model="show" persistent width="700">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t('projectStatus.riskAndOpportunities.previewTitle') }}</span>
      </v-card-title>
      <v-card-text>
        <RiskAndOpportunityPreview :project="props.project" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="loading"
          class="primary-negative-btn"
          @click="emit('update:modelValue', false)"
          data-testid="close"
        >
          {{ $t('misc.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
