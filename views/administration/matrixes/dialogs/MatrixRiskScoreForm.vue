<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, requiredIf, minValue, maxValue } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import type { MatrixRiskScore } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => MatrixRiskScore,
    default: () => ({})
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  high: Object.prototype.hasOwnProperty.call(props.value, 'high') ? props.value.high : 1,
  color: props.value.color === '#ffffff' ? '#808080' : props.value?.color || '#808080',
  loading: false
})

const rules = {
  high: {
    required: requiredIf(() => {
      if (!Object.keys(props.value)?.length) return true
      return !!props.value.high
    }),
    minValue: minValue(1),
    maxValue: maxValue(inputValidations.maxScoreVal)
  },
  color: {
    required
  }
}

const v$: any = useVuelidate(rules, formObject)

const highErrors = computed(() => {
  return v$.value.high.$errors.map((rule: any) => rule.$message)
})
const colorErrors = computed(() => {
  return v$.value.color.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: MatrixRiskScore = {
    id: props.value.id || 0,
    high: formObject.high,
    color: formObject.color
  }
  emit('submit', data)
}
function reset() {
  formObject.high = 1
  formObject.color = '#808080'
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
      <v-col cols="12" sm="9">
        <v-text-field
          variant="outlined"
          v-model="formObject.high"
          :label="$t('misc.high')"
          autofocus
          type="number"
          :disabled="Object.prototype.hasOwnProperty.call(props.value, 'high') && !props.value.high"
          :error-messages="highErrors"
          data-testid="high"
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field
          variant="outlined"
          v-model="formObject.color"
          :label="$t('misc.color')"
          type="color"
          :error-messages="colorErrors"
          data-testid="color"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
