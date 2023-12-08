<script setup lang="ts">
import { ref, computed } from 'vue'
import MatrixRiskScoreForm from './MatrixRiskScoreForm.vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { MatrixRiskScore } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  value: {
    type: Object as () => MatrixRiskScore,
    default: () => {
      return {}
    }
  },
  type: {
    type: String,
    default: 'new'
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = ref()
const { loading } = storeToRefs(useLoaderStore())

function onSubmit(data: MatrixRiskScore) {
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
  <v-dialog v-model="show" persistent width="400">
    <v-card>
      <v-card-title>
        <span class="text-h5">
          {{ $t(`administration.matrixes.risk.${props.type}.title`) }}
        </span>
      </v-card-title>
      <v-card-text>
        <MatrixRiskScoreForm ref="form" :value="props.value" @submit="onSubmit" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close" data-testid="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn :disabled="loading" class="primary-action-btn" @click="form.touch()" data-testid="submit">
          {{ $t('misc.submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
