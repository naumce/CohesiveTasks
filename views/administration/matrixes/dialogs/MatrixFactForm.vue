<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength, minValue, maxValue } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import type { MatrixParameter } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => MatrixParameter,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  custom_id: props.value?.custom_id || '',
  name: props.value?.name || '',
  score: props.value?.score || 1,
  loading: false
})

const rules = {
  custom_id: {
    required,
    maxLength: maxLength(inputValidations.customIdLength)
  },
  name: { required, maxLength: maxLength(inputValidations.nameLength) },
  score: {
    required,
    minValue: minValue(1),
    maxValue: maxValue(inputValidations.maxScoreVal)
  }
}

const v$: any = useVuelidate(rules, formObject)

const idErrors = computed(() => {
  return v$.value.custom_id.$errors.map((rule: any) => rule.$message)
})
const nameErrors = computed(() => {
  return v$.value.name.$errors.map((rule: any) => rule.$message)
})
const scoreErrors = computed(() => {
  return v$.value.score.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: MatrixParameter = {
    id: props.value.id || 0,
    custom_id: formObject.custom_id,
    name: formObject.name,
    description: props.value.description || '',
    score: formObject.score,
    matrix_id: props.value.matrix_id || 0
  }
  emit('submit', data)
}
function reset() {
  formObject.custom_id = ''
  formObject.name = ''
  formObject.score = 1
  formObject.loading = false
  v$.value.$reset()
}

defineExpose({
  reset,
  touch
})
</script>
<template>
  <v-container class="pa-0 ma-0">
    <v-row dense>
      <v-col cols="12" sm="3">
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
      <v-col cols="12" sm="6">
        <v-text-field
          variant="outlined"
          v-model="formObject.name"
          :label="$t('misc.name')"
          clearable
          :error-messages="nameErrors"
          data-testid="name"
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field
          variant="outlined"
          v-model="formObject.score"
          :label="$t('misc.score')"
          clearable
          type="number"
          :error-messages="scoreErrors"
          data-testid="score"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
