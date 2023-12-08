<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import type { ReasonType } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => ReasonType,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  custom_id: props.value?.custom_id || '',
  name: props.value?.name || '',
  description: props.value?.description || '',
  active: props.value?.active
})

const rules = {
  custom_id: {
    required,
    maxLength: maxLength(inputValidations.customIdLength)
  },
  name: { required, maxLength: maxLength(inputValidations.nameLength) },
  description: {
    maxLength: maxLength(inputValidations.longTextLength)
  }
}

const v$: any = useVuelidate(rules, formObject)

const idErrors = computed(() => {
  return v$.value.custom_id.$errors.map((rule: any) => rule.$message)
})
const nameErrors = computed(() => {
  return v$.value.name.$errors.map((rule: any) => rule.$message)
})
const descriptionErrors = computed(() => {
  return v$.value.description.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: any = {
    custom_id: formObject.custom_id,
    name: formObject.name,
    description: formObject.description,
    active: true
  }
  emit('submit', data)
}
function reset() {
  formObject.custom_id = ''
  formObject.name = ''
  formObject.description = ''
  v$.value.$reset()
}

defineExpose({
  reset,
  touch
})
</script>
<template>
  <v-container>
    <v-row dense>
      <v-col cols="8" sm="6">
        <v-text-field variant="outlined" v-model="formObject.custom_id" :label="$t('misc.id')" clearable autofocus
          :error-messages="idErrors" data-testid="reason-type-id" />
      </v-col>
      <v-col cols="8" sm="6">
        <v-text-field variant="outlined" v-model="formObject.name" :label="$t('misc.name')" clearable
          :error-messages="nameErrors" data-testid="reason-type-name" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="8" sm="12">
        <v-textarea variant="outlined" v-model="formObject.description" :label="$t('misc.description')" :rows="2"
          clearable :error-messages="descriptionErrors" data-testid="reason-type-description" />
      </v-col>
    </v-row>
  </v-container>
</template>
