<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import type { SchedulesGroup } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => SchedulesGroup,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  name: props.value?.name || '',
  loading: false
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
  const data: SchedulesGroup = {
    name: formObject.name,
    id: props.value.id || 0,
    custom_id: props.value.custom_id || ''
  }
  emit('submit', data)
}
function reset() {
  formObject.name = ''
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
      <v-col cols="12">
        <v-text-field
          variant="outlined"
          v-model="formObject.name"
          :label="$t('workspaces.schedules.groups.fields.name')"
          clearable
          autofocus
          :error-messages="nameErrors"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
