<script setup lang="ts">
import { ref, computed } from 'vue'
import useVuelidate from "@vuelidate/core";
import { required  } from '@vuelidate/validators'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  reasons: {
    type: Array
  }
})
const selectedCategory = ref('')

const v$: any = useVuelidate({
  selectedCategory : { required }
}, {selectedCategory})

const msgError = computed(() => {
  return v$.value.selectedCategory.$errors.map((rule: any) => rule.$message)
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function onSubmit() {
  v$.value.$validate()
  if (v$.value.$error) return
  emit('submit', selectedCategory)
}

function close() {
  emit('update:modelValue', false)
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent width="768">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t(`workspaces.financials.remaining.selectCategory`) }}</span>
      </v-card-title>
      <v-card-text>
        <v-select
          variant="outlined"
          class="pr-4"
          v-model="selectedCategory"
          :label="$t('workspaces.financials.transactions.category')"
          :items="props.reasons?.map((t: any) => ({ title: t.name, value: t.id }))"
          data-testid="select-category"
          :error-messages="msgError"
        >
        </v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="primary-negative-btn" @click="close">
          {{ $t('misc.close') }}
        </v-btn>
        <v-btn class="primary-action-btn" data-testid="button-invite" @click="onSubmit">
          {{ $t('misc.add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
