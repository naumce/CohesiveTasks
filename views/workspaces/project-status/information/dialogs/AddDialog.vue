<script setup lang="ts">
import { ref, computed } from 'vue'
import ItemForm from './ItemForm.vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { ProjectInformation, ProjectInformationPost } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  value: {
    type: Object as () => ProjectInformation,
    default: () => ({})
  },
  type: {
    type: String,
    required: true,
    default: 'objectives'
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = ref()
const { loading } = storeToRefs(useLoaderStore())

function onSubmit(data: ProjectInformationPost) {
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
        <span class="text-h5">{{ $t(`projectStatus.information.${props.type}.addTitle`) }}</span>
      </v-card-title>
      <v-card-text>
        <ItemForm ref="form" @submit="onSubmit" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn
          :disabled="loading"
          class="primary-action-btn"
          data-testid="dialog-create"
          @click="form.touch()"
        >
          {{ $t('misc.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
