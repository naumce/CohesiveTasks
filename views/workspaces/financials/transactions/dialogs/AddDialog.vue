<script setup lang="ts">
import { ref, computed } from 'vue'
import ItemForm from './ItemForm.vue'
import type { UserData } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  phases: {
    type: Array
  },
  reasons: {
    type: Array
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = ref()

function onSubmit(data: UserData) {
  emit('submit', data)
}

function close() {
  form.value.reset()
  emit('update:modelValue', false)
}
defineExpose({
  close
})
const filteredCategories = props.reasons?.filter((r: any) => !!r.active)
</script>
<template>
  <v-dialog v-model="show" persistent width="auto">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t(`workspaces.financials.transactions.addDialogTitle`) }}</span>
      </v-card-title>
      <v-card-text>
        <ItemForm
          ref="form"
          @submit="onSubmit"
          :phases="props.phases"
          :reasons="filteredCategories"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn class="primary-action-btn" data-testid="button-create" @click="form.touch()">
          {{ $t('misc.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
