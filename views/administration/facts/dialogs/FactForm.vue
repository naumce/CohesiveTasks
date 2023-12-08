<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import type { RawProjectFact } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => RawProjectFact,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  custom_id: props.value?.custom_id || '',
  name: props.value?.name || '',
  type: props.value?.type || 'STRING',
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
  const data: RawProjectFact = {
    id: props.value.id || 0,
    custom_id: formObject.custom_id,
    name: formObject.name,
    type: formObject.type,
    description: formObject.description
  }
  emit('submit', data)
}
function reset() {
  formObject.custom_id = ''
  formObject.name = ''
  formObject.type = 'STRING'
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
      <v-col cols="12">
        <v-text-field
          variant="outlined"
          v-model="formObject.custom_id"
          :label="$t('misc.id')"
          clearable
          autofocus
          :error-messages="idErrors"
          data-testid="fact-id"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          variant="outlined"
          v-model="formObject.name"
          :label="$t('misc.name')"
          clearable
          :error-messages="nameErrors"
          data-testid="fact-name"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-select
            variant="outlined"
          v-model="formObject.type"
          :label="$t('misc.type')"
          :disabled="!!props.value?.type"
          :items="[
            { title: $t('misc.user'), value: 'USER' },
            { title: $t('misc.text'), value: 'STRING' },
            { title: $t('misc.number'), value: 'FLOAT' },
            { title: $t('misc.date'), value: 'DATETIME' }
          ]"
          :error-messages="typeErrors"
          data-testid="fact-type"
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
          data-testid="fact-description"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
