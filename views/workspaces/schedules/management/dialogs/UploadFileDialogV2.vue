<script setup lang="ts">
import { computed } from 'vue'
import FileDropzone from '@/components/FileDropzone.vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  }
})
console.log('modelValue', props.modelValue)
const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const { loading } = storeToRefs(useLoaderStore())

function close() {
  emit('update:modelValue', false)
}
defineExpose({
  close
})

function onFileChange(formData: FormData) {
  emit('submit', formData)
}
</script>
<template>
  <v-dialog v-model="show" persistent width="500">
    <v-card>
      <v-card-title>
        <!-- {{ $t('misc.uploadFile') }} -->
        {{ ' Upload file Version 2' }}
      </v-card-title>
      <v-card-text>
        <FileDropzone @change="onFileChange" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
