<script setup lang="ts">
import { ref, computed } from 'vue'
import PhaseForm from './PhaseForm.vue'
import GateForm from './GateForm.vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { ProjectPhaseGate } from '@/types'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import { reactive } from 'vue'
import { isoToUnix } from '@/utils/date'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  value: {
    type: Object as () => ProjectPhaseGate,
    required: true,
    default: () => ({})
  }
})

const dialogs = reactive({
  delete: false
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = ref()
const dataSubmit = ref()
const { loading } = storeToRefs(useLoaderStore())

const currentForm = computed(() => {
  if (props.value.type === 'gate') return GateForm
  return PhaseForm
})
function onSubmit(data: ProjectPhaseGate) {
  const start_date_unix = isoToUnix(props.value.start_date as string)
  const end_date_unix = isoToUnix(props.value.end_date as string)
  if (props.value.type === 'phase') {
    if ((start_date_unix === data.start_date) && (end_date_unix === data.end_date))
      emit('submit', data)
    else if (start_date_unix !== data.start_date || end_date_unix !== data.end_date) {
      dataSubmit.value = data
      dialogs.delete = true
    }
  }
  else emit('submit', data)
}

function onApprove() {
  emit('submit', dataSubmit.value)
  dialogs.delete = false
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
        <span class="text-h5">{{
          $t(`projectStatus.phaseGate.${props.value.type}.editTitle`)
        }}</span>
      </v-card-title>
      <v-card-text>
        <component ref="form" :is="currentForm" :value="props.value" @submit="onSubmit" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn :disabled="loading" class="primary-action-btn" data-testid="phases-save" @click="form.touch()">
          {{ $t('misc.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
    <DeleteDialog v-model="dialogs.delete" :text="$t(`projectStatus.phaseGate.phase.textConfirmation`)"
      @submit="onApprove" />
  </v-dialog></template>
