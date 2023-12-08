<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength, email } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import type { RequestTenant } from '@/types'

const emit = defineEmits(['submit'])

const formObject = reactive({
  name: '',
  email: ''
})

const rules = {
  name: { required, maxLength: maxLength(inputValidations.nameLength) },
  email: {
    required,
    email
  }
}

const v$: any = useVuelidate(rules, formObject)

const nameErrors = computed(() => {
  return v$.value.name.$errors.map((rule: any) => rule.$message)
})
const emailErrors = computed(() => {
  return v$.value.email.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: RequestTenant = {
    name: formObject.name,
    email: formObject.email
  }
  emit('submit', data)
}
function reset() {
  formObject.name = ''
  formObject.email = ''
  v$.value.$reset()
}

defineExpose({
  reset,
  touch
})
</script>
<template>
  <v-container class="pa-10 ma-0" :elevation="24">
    <v-row dense>
      <v-col cols="12">
        <v-text-field
          variant="outlined"
          v-model="formObject.name"
          :label="$t('misc.name')"
          clearable
          autofocus
          :error-messages="nameErrors"
          data-testid="tenant-name"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          variant="outlined"
          v-model="formObject.email"
          :label="$t('misc.email')"
          clearable
          :error-messages="emailErrors"
          data-testid="tenant-email"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
