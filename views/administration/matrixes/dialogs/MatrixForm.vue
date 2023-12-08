<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import type { RiskMatrixRaw } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => RiskMatrixRaw,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  custom_id: props.value?.custom_id || '',
  name: props.value?.name || '',
  type: props.value?.type || 'risk_matrix',
  description: props.value?.description || '',
  loading: false
})

const rules = {
  custom_id: {
    required,
    maxLength: maxLength(inputValidations.customIdLength)
  },
  name: { required, maxLength: maxLength(inputValidations.nameLength) },
  type: {
    required
  },
  description: {
    required,
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
const typeErrors = computed(() => {
  return v$.value.type.$errors.map((rule: any) => rule.$message)
})
const descriptionErrors = computed(() => {
  return v$.value.description.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: RiskMatrixRaw = {
    id: props.value.id || 0,
    custom_id: formObject.custom_id,
    name: formObject.name,
    type: formObject.type,
    description: formObject.description,
    probabilities: [],
    severities: [],
    thresholds: []
  }
  emit('submit', data)
}
function reset() {
  formObject.custom_id = ''
  formObject.name = ''
  formObject.type = 'risk_matrix'
  formObject.description = ''
  formObject.loading = false
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
      <v-col cols="12" sm="4">
        <v-text-field
          variant="outlined"
          v-model="formObject.custom_id"
          :label="$t('misc.id')"
          clearable
          autofocus
          :error-messages="idErrors"
          data-testid="id"
        />
      </v-col>
      <v-col cols="12" sm="8">
        <v-text-field
          variant="outlined"
          v-model="formObject.name"
          :label="$t('misc.name')"
          clearable
          :error-messages="nameErrors"
          data-testid="name"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-select
            variant="outlined"
          v-model="formObject.type"
          :label="$t('misc.type')"
          :items="[
            { title: $t('administration.matrixes.type.risk_matrix'), value: 'risk_matrix' },
            {
              title: $t('administration.matrixes.type.opportunity_matrix'),
              value: 'opportunity_matrix'
            }
          ]"
          :error-messages="typeErrors"
          data-testid="type"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-textarea
          variant="outlined"
          v-model="formObject.description"
          :label="$t('misc.description')"
          clearable
          :error-messages="descriptionErrors"
          data-testid="description"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
