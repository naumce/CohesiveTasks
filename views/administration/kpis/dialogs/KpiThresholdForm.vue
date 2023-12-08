<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength, minValue } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import type { ProjectKpiThreshold } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => ProjectKpiThreshold,
    default: () => {
      return {}
    }
  }
})
const emit = defineEmits(['submit', 'change', 'remove'])

const formObject = reactive({
  custom_id: props.value?.custom_id || '',
  name: props.value?.name || '',
  description: props.value?.description || '',
  value: props.value?.value || 1,
  color: props.value?.color || '#ff6f6f',
  loading: false
})

const rules = {
  custom_id: {
    required,
    maxLength: maxLength(inputValidations.customIdLength)
  },
  name: { required, maxLength: maxLength(inputValidations.nameLength) },
  description: {
    required,
    maxLength: maxLength(inputValidations.longTextLength)
  },
  value: { required, minValue: minValue(1) }
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
const valueErrors = computed(() => {
  return v$.value.value.$errors.map((rule: any) => rule.$message)
})

const onChange = () => {
  emit('change', formObject)
}
function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: ProjectKpiThreshold = {
    id: props.value.id || 0,
    custom_id: formObject.custom_id,
    name: formObject.name,
    description: formObject.description,
    value: formObject.value,
    color: formObject.color
  }
  emit('submit', data)
}
function reset() {
  formObject.custom_id = ''
  formObject.name = ''
  formObject.description = ''
  formObject.value = 1
  formObject.color = '#ff6f6f'
  formObject.loading = false
  v$.value.$reset()
}

defineExpose({
  reset,
  touch
})
</script>
<template>
  <v-container fluid>
    <v-col cols="12" sm="12" class="flex justify-end mt-n2 mb-5 ml-5">
      <v-row class="flex justify-end">
        <v-btn icon="mdi-minus-circle-outline" :title="$t('misc.remove')" :onclick="() => emit('remove')"
          variant="flat"></v-btn>
      </v-row>

    </v-col>
    <v-row dense>
      <v-col cols="12" sm="4">
        <v-text-field variant="outlined" v-model="formObject.custom_id" :label="$t('misc.id')" clearable
          :error-messages="idErrors" @update:model-value="onChange" data-testid="threshhold-id" />
      </v-col>
      <v-col cols="12" sm="8">
        <v-text-field variant="outlined" v-model="formObject.name" :label="$t('misc.name')" clearable
          :error-messages="nameErrors" @update:model-value="onChange" data-testid="threshhold-name" />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" sm="4">
        <v-text-field variant="outlined" v-model="formObject.color" :label="$t('misc.color')" type="color"
          @update:model-value="onChange" />
      </v-col>
      <v-col cols="12" sm="8">
        <v-text-field variant="outlined" v-model="formObject.value" :label="$t('misc.value')" type="number"
          :error-messages="valueErrors" @update:model-value="onChange" data-testid="threshhold-value" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-textarea variant="outlined" v-model="formObject.description" :label="$t('misc.description')" clearable
          :error-messages="descriptionErrors" @update:model-value="onChange" data-testid="threshhold-description" />
      </v-col>
    </v-row>
    <v-divider />
  </v-container>
</template>
