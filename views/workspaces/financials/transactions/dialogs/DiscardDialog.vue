<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  transaction: {
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

function close() {
  emit('update:modelValue', false)
}
function onSubmit(data: any) {
  emit('submit', data)
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent width="450">
    <v-card>
      <v-card-title class="bg-error">
        <span class="text-h5">{{
          $t(`workspaces.financials.transactions.discardDialogTitle`)
        }}</span>
      </v-card-title>
      <v-card-text>
        <span>{{ $t(`workspaces.financials.transactions.discardTransaction`) }}</span>
        <span class="text-blue">{{ props.transaction.custom_id }}</span>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn class="primary-action-btn" @click="onSubmit" data-testid="confirm">
          {{ $t('misc.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
