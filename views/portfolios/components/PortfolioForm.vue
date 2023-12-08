<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import type { Portfolio, PortfolioData } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => Portfolio,
    default: () => ({})
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  name: props.value?.name || ''
})

const rules = {
  name: { required, maxLength: maxLength(inputValidations.nameLength) }
}

const v$: any = useVuelidate(rules, formObject)

const nameErrors = computed(() => {
  return v$.value.name.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: PortfolioData = {
    name: formObject.name
  }
  emit('submit', data)
}
function reset() {
  formObject.name = ''
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
      <v-col cols="12">
        <v-text-field
          variant="outlined"
          v-model="formObject.name"
          :label="$t('misc.name')"
          clearable
          autofocus
          :error-messages="nameErrors"
          data-testid="portfolio-name"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
