<script setup lang="ts">
import { reactive, computed } from 'vue'
import dayjs from 'dayjs'
import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import { isoToUnix } from '@/utils/date'
import type { ProjectInformation, ProjectInformationPost } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => ProjectInformation,
    default: () => ({})
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  date: props.value.date || dayjs().format('YYYY-MM-DD'),
  description: props.value.description || '',
  loading: false
})

const rules = {
  date: { required },
  description: { required, maxLength: maxLength(inputValidations.longTextLength) }
}
const v$: any = useVuelidate(rules, formObject)

const dateErrors = computed(() => {
  return v$.value.date.$errors.map((rule: any) => rule.$message)
})

const descriptionErrors = computed(() => {
  return v$.value.description.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: ProjectInformationPost = {
    date: isoToUnix(formObject.date),
    description: formObject.description
  }
  emit('submit', data)
}
function reset() {
  formObject.date = dayjs().format('YYYY-MM-DD')
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
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          variant="outlined"
          v-model="formObject.date"
          :label="$t('projectStatus.information.fields.date')"
          type="date"
          :error-messages="dateErrors"
          autofocus
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-textarea
          variant="outlined"
          v-model="formObject.description"
          :label="$t('projectStatus.information.fields.description')"
          :error-messages="descriptionErrors"
          data-testid="dialog-description"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
