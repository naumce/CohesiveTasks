<script setup lang="ts">
import { ref, computed } from 'vue'
import PhaseForm from './PhaseForm.vue'
import GateForm from './GateForm.vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { ProjectPhaseGate } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  type: {
    type: String,
    required: true,
    default: 'phase'
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = ref()
const { loading } = storeToRefs(useLoaderStore())

const currentForm = computed(() => {
  if (props.type === 'gate') return GateForm
  return PhaseForm
})
function onSubmit(data: ProjectPhaseGate) {
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
  <v-dialog v-model="show" persistent width="700">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t(`projectStatus.phaseGate.${props.type}.addNew`) }}</span>
      </v-card-title>
      <v-card-text>
        <component ref="form" :is="currentForm" @submit="onSubmit" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn
          :disabled="loading"
          class="primary-action-btn"
          data-testid="phase-create"
          @click="form.touch()"
        >
          {{ $t('misc.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
