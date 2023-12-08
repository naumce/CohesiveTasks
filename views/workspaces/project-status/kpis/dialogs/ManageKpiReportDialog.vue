<script setup lang="ts">
import { ref, computed } from 'vue'
import ItemFormReport from './ItemFormReport.vue'
import { storeToRefs } from 'pinia'
import { useLoaderStore } from '@/stores/loader'
import type { ProjectKpiThreshold, ProjectKpiValue } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  type: {
    type: String,
    default: 'new'
  },
  value: {
    type: Object as () => ProjectKpiValue
  },
  thresholds: {
    type: Array as () => ProjectKpiThreshold[]
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = ref()
const { loading } = storeToRefs(useLoaderStore())

function onSubmit(data: any) {
  emit('submit', data)
}

function close() {
  form.value.reset()
  emit('update:modelValue', false)
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent width="768">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t(`projectStatus.kpi.report.${props.type}.title`) }}</span>
      </v-card-title>
      <v-card-text>
        <ItemFormReport
          ref="form"
          :value="props.value"
          :thresholds="props.thresholds"
          @submit="onSubmit"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close" data-testid="cancel">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn :disabled="loading" class="primary-action-btn" @click="form.touch()" data-testid="submit">
          {{ $t('misc.submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
