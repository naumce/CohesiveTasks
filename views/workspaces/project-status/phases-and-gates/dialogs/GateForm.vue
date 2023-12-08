<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength, minValue } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import type { ProjectPhaseGate } from '@/types'
import dayjs from 'dayjs'
import { isoToStandardString, isoToUnix } from '@/utils/date'

const props = defineProps({
  value: {
    type: Object as () => ProjectPhaseGate,
    default: () => ({
      id: 0,
      type: 'gate',
      status: 'CREATING',
      comment: '',
      lane: 0,
      name: '',
      start_date: null,
      end_date: null,
      cost_budget: null,
      cost_actual: null,
      hours_budget: null,
      hours_actual: null,
      remaining_hours: null,
      remaining_cost: null
    })
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  name: props.value.name,
  lane: props.value.lane,
  comment: props.value.comment,
  end_date: props.value.end_date
    ? isoToStandardString(props.value.end_date as string)
    : dayjs().format('YYYY-MM-DD'),
  status: props.value.status,
  loading: false
})

const rules = {
  name: { required, maxLength: maxLength(inputValidations.nameLength) },
  lane: { required, minValue: minValue(inputValidations.minNumberVal) },
  comment: {
    required,
    maxLength: maxLength(inputValidations.longTextLength)
  },
  end_date: {
    required
    // minDate: inputValidations.minDate(this.singlePhase.start_date)
  }
}
const v$: any = useVuelidate(rules, formObject)

const nameErrors = computed(() => {
  return v$.value.name.$errors.map((rule: any) => rule.$message)
})

const commentErrors = computed(() => {
  return v$.value.comment.$errors.map((rule: any) => rule.$message)
})

const endDateErrors = computed(() => {
  return v$.value.end_date.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: ProjectPhaseGate = {
    ...(props.value.id ? { id: props.value.id } : {}),
    name: formObject.name,
    lane: formObject.lane,
    comment: formObject.comment,
    end_date: isoToUnix(formObject.end_date as string),
    status: formObject.status,
    type: 'gate'
  }
  emit('submit', data)
}
function reset() {
  formObject.status = 'CREATING'
  formObject.comment = ''
  formObject.lane = 0
  formObject.name = ''
  formObject.end_date = dayjs().format('YYYY-MM-DD')
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
    <v-row>
      <v-col cols="12" sm="6" class="py-1">
        <v-text-field
          variant="outlined"
          v-model="formObject.name"
          :label="$t('projectStatus.phaseGate.fields.name')"
          :error-messages="nameErrors"
          data-testid="gate-name"
        />
      </v-col>
      <v-col cols="12" sm="6" v-if="formObject.status !== 'CREATING'" class="py-1">
        <v-select
          v-model="formObject.status"
          :label="$t('projectStatus.phaseGate.fields.status')"
          :items="[
            { title: $t('PhaseStatus.NOT_STARTED'), value: 'NOT_STARTED' },
            { title: $t('PhaseStatus.IN_PROGRESS'), value: 'IN_PROGRESS' },
            { title: $t('PhaseStatus.COMPLETED'), value: 'COMPLETED' }
          ]"
          data-testid="gate-status"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" sm="6" class="py-1">
        <v-text-field
          variant="outlined"
          v-model="formObject.end_date"
          type="date"
          :label="$t('misc.date')"
          :error-messages="endDateErrors"
          data-testid="gate-end-date"
        />
      </v-col>
      <v-col cols="12" class="py-1">
        <v-textarea
          variant="outlined"
          v-model="formObject.comment"
          :label="$t('projectStatus.phaseGate.fields.comment')"
          :error-messages="commentErrors"
          data-testid="gate-comment"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
