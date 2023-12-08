<script setup lang="ts">
import { ref, computed } from 'vue'
import ReasonTypesForm from './ReasonTypesForm.vue'
import type { ReasonType } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  value: {
    type: Object as () => ReasonType,
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

function onSubmit(data: ReasonType) {
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
          {{ $t(`administration.reasonTypes.${props.type}.title`) }}
        </span>
      </v-card-title>
      <v-card-text>
        <ReasonTypesForm ref="form" :value="props.value" @submit="onSubmit" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn class="primary-negative-btn" @click="close" data-testid="cancel">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn class="primary-action-btn" @click="form.touch()" data-testid="submit">
          {{ $t('misc.submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
