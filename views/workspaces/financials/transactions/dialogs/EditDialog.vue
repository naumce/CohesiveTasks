<script setup lang="ts">
import { ref, computed } from 'vue'
import ItemForm from './ItemForm.vue'
import StatusHistory from './StatusHistory.vue'

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
  },
  phases: {
    type: Array
  },
  reasons: {
    type: Array
  }
})
const activeTab = ref(0)
const saveandclose = ref(false)
const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = ref()

function onSubmit(data: any) {
  emit('submit', data, saveandclose.value)
}

function close() {
  form.value.reset()
  emit('update:modelValue', false)
}
defineExpose({
  close
})
function saveAndClose(form: any, saveand: boolean) {
  saveandclose.value = saveand
  form.touch()
}
const filteredCategories = props.reasons?.filter((r: any) => !!r.active)
!props?.transaction?.transaction_category?.active &&
  filteredCategories?.push(props?.transaction?.transaction_category)
</script>
<template>
  <v-dialog v-model="show" persistent width="auto" >
    <v-card>
      <v-card-text class="dialog-content">
      <v-tabs v-model="activeTab" class="ml-9">
        <v-tab value="details">{{
          $t(`workspaces.financials.transactions.transactionDetails`)
        }}</v-tab>
        <v-tab value="history">{{ $t(`workspaces.financials.transactions.statusHistory`) }}</v-tab>
      </v-tabs>
      <v-window v-model="activeTab">
        <v-window-item value="details">
          <v-card-text class="mt-10 item-form">
            <ItemForm
              ref="form"
              :phases="props.phases"
              :reasons="filteredCategories"
              :value="props.transaction"
              @submit="onSubmit"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="primary-negative-btn" @click="close" data-testid="button-close">
              {{ $t('misc.close') }}
            </v-btn>
            <v-btn
              class="primary-action-btn"
              data-testid="button-save"
              @click="saveAndClose(form, true)"
            >
              {{ $t('misc.save') }}
            </v-btn>
            <v-btn
              class="primary-action-btn"
              data-testid="button-save-and-close"
              @click="saveAndClose(form, false)"
            >
              {{ $t('misc.saveandclose') }}
            </v-btn>
          </v-card-actions>
        </v-window-item>
        <v-window-item value="history">
          <v-card >
            <StatusHistory :transaction="props.transaction" @close="close"></StatusHistory>
          </v-card>
        </v-window-item>
      </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<style>
.dialog-content {
 height: 60%;
}
</style>