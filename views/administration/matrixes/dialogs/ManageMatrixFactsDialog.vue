<script setup lang="ts">
import { ref, computed } from 'vue'
import MatrixFactForm from './MatrixFactForm.vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { MatrixParameter } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  value: {
    type: Object as () => MatrixParameter,
    default: () => {
      return {}
    }
  },
  type: {
    type: String,
    default: 'new'
  },
  factType: {
    type: String,
    default: 'severities'
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = ref()
const { loading } = storeToRefs(useLoaderStore())

function onSubmit(data: MatrixParameter) {
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
  <v-dialog v-model="show" persistent width="600">
    <v-card>
      <v-card-title>
        <span class="text-h5">
          {{ $t(`administration.matrixes.${props.factType}.${props.type}.title`) }}
        </span>
      </v-card-title>
      <v-card-text>
        <MatrixFactForm ref="form" :value="props.value" @submit="onSubmit" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
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
