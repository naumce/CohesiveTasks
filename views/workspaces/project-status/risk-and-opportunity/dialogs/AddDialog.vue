<script setup lang="ts">
import { ref, computed } from 'vue'
import ItemForm from './ItemForm.vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { EventCharacterizationPost } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  type: {
    type: String,
    required: true,
    default: 'risk'
  },
  project: {
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = ref()
const { loading } = storeToRefs(useLoaderStore())

function onSubmit(data: EventCharacterizationPost) {
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
  <v-dialog v-model="show" persistent width="1024">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{
          $t(`projectStatus.riskAndOpportunities.${props.type}.addNew`)
        }}</span>
      </v-card-title>
      <v-card-text>
        <ItemForm ref="form" :type="props.type" :project="props.project" @submit="onSubmit" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn :disabled="loading" class="primary-action-btn" @click="form.touch()" data-testid="create">
          {{ $t('misc.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
