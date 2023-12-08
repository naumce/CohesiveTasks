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
      type: 'phase',
      status: 'CREATING',
      comment: '',
      lane: 1,
      name: '',
      custom_id: '',
      start_date: '',
      end_date: '',
      cost_budget: 0,
      cost_actual: 0,
      hours_budget: 0,
      hours_actual: 0,
      remaining_hours: 0,
      remaining_cost: 0
    })
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  name: props.value.name,
  custom_id: props.value.custom_id,
  lane: props.value.lane,
  comment: props.value.comment,
  start_date: props.value.start_date
    ? isoToStandardString(props.value.start_date as string)
    : dayjs().format('YYYY-MM-DD'),
  end_date: props.value.end_date ? isoToStandardString(props.value.end_date as string) : '',
  cost_budget: props.value.cost_budget,
  hours_budget: props.value.hours_budget,
  cost_actual: props.value.cost_actual,
  hours_actual: props.value.hours_actual,
  remaining_cost: props.value.remaining_cost,
  remaining_hours: props.value.remaining_hours,
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
  start_date: { required },
  custom_id: { required },
  end_date: {
    required
    // minDate: inputValidations.minDate(this.singlePhase.start_date)
  },
  // cost_budget: {
  //   required,
  //   minValue: minValue(inputValidations.minNumberVal)
  // },
  // hours_budget: {
  //   required,
  //   minValue: minValue(inputValidations.minNumberVal)
  // },
  // cost_actual: {
  //   required,
  //   minValue: minValue(inputValidations.minNumberVal)
  // },
  // hours_actual: {
  //   required,
  //   minValue: minValue(inputValidations.minNumberVal)
  // },
  // remaining_cost: {
  //   required,
  //   minValue: minValue(inputValidations.minNumberVal)
  // },
  // remaining_hours: {
  //   required,
  //   minValue: minValue(inputValidations.minNumberVal)
  // }
}
const v$: any = useVuelidate(rules, formObject)

const nameErrors = computed(() => {
  return v$.value.name.$errors.map((rule: any) => rule.$message)
})

const laneErrors = computed(() => {
  return v$.value.lane.$errors.map((rule: any) => rule.$message)
})

const commentErrors = computed(() => {
  return v$.value.comment.$errors.map((rule: any) => rule.$message)
})

const startDateErrors = computed(() => {
  return v$.value.start_date.$errors.map((rule: any) => rule.$message)
})

const endDateErrors = computed(() => {
  return v$.value.end_date.$errors.map((rule: any) => rule.$message)
})

// const costBudgetErrors = computed(() => {
//   return v$.value.cost_budget.$errors.map((rule: any) => rule.$message)
// })
//
// const hoursBudgetErrors = computed(() => {
//   return v$.value.hours_budget.$errors.map((rule: any) => rule.$message)
// })
//
// const costActualErrors = computed(() => {
//   return v$.value.cost_actual.$errors.map((rule: any) => rule.$message)
// })
//
// const hoursActualErrors = computed(() => {
//   return v$.value.hours_actual.$errors.map((rule: any) => rule.$message)
// })
// const remainingCostErrors = computed(() => {
//   return v$.value.remaining_cost.$errors.map((rule: any) => rule.$message)
// })
// const remainingHoursErrors = computed(() => {
//   return v$.value.remaining_hours.$errors.map((rule: any) => rule.$message)
// })
const customIdErrors = computed(() => {
  return v$.value.custom_id.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: ProjectPhaseGate = {
    ...(props.value.id ? { id: props.value.id } : {}),
    name: formObject.name,
    lane: formObject.lane,
    custom_id: formObject.custom_id,
    comment: formObject.comment,
    start_date: isoToUnix(formObject.start_date as string),
    end_date: isoToUnix(formObject.end_date as string),
    // cost_budget: formObject.cost_budget,
    // hours_budget: formObject.hours_budget,
    // cost_actual: formObject.cost_actual,
    // hours_actual: formObject.hours_actual,
    // remaining_cost: formObject.remaining_cost,
    // remaining_hours: formObject.remaining_hours,
    status: formObject.status,
    type: props.value.type
  }
  emit('submit', data)
}
function reset() {
  formObject.status = 'CREATING'
  formObject.comment = ''
  formObject.lane = 1
  formObject.custom_id = ''
  formObject.name = ''
  formObject.start_date = dayjs().format('YYYY-MM-DD')
  formObject.end_date = ''
  formObject.cost_budget = 0
  formObject.cost_actual = 0
  formObject.hours_budget = 0
  formObject.hours_actual = 0
  formObject.remaining_hours = 0
  formObject.remaining_cost = 0
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
      <v-col cols="6" sm="2" class="py-1">
        <v-text-field
          variant="outlined"
          v-model="formObject.lane"
          type="number"
          :label="$t('projectStatus.phaseGate.fields.lane')"
          :error-messages="laneErrors"
          data-testid="phase-row"
        />
      </v-col>
      <v-col cols="12" sm="4" class="py-1">
        <v-text-field
          variant="outlined"
          v-model="formObject.custom_id"
          type="text"
          :label="$t('projectStatus.phaseGate.fields.custom_id')"
          :error-messages="customIdErrors"
          data-testid="phase-custom-id"
        />
      </v-col>
      <v-col cols="6" sm="6" class="py-1">
        <v-text-field
          variant="outlined"
          v-model="formObject.name"
          :label="$t('projectStatus.phaseGate.fields.name')"
          :error-messages="nameErrors"
          data-testid="phase-name"
        />
      </v-col>
      <v-col cols="12" v-if="formObject.status !== 'CREATING'" class="py-1">
        <v-select
          v-model="formObject.status"
          :label="$t('projectStatus.phaseGate.fields.status')"
          :items="[
            { title: $t('PhaseStatus.NOT_STARTED'), value: 'NOT_STARTED' },
            { title: $t('PhaseStatus.IN_PROGRESS'), value: 'IN_PROGRESS' },
            { title: $t('PhaseStatus.COMPLETED'), value: 'COMPLETED' }
          ]"
          data-testid="phase-status"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" sm="6" class="py-1">
        <v-text-field
          variant="outlined"
          v-model="formObject.start_date"
          type="date"
          :label="$t('projectStatus.phaseGate.fields.start_date')"
          :error-messages="startDateErrors"
          data-testid="phase-start-date"
        />
      </v-col>
      <v-col cols="12" sm="6" class="py-1">
        <v-text-field
          variant="outlined"
          v-model="formObject.end_date"
          type="date"
          :label="$t('projectStatus.phaseGate.fields.end_date')"
          :error-messages="endDateErrors"
          data-testid="phase-end-date"
        />
      </v-col>
<!--      <v-col cols="12" sm="6" class="py-1">-->
<!--        <v-text-field-->
<!--          variant="outlined"-->
<!--          v-model="formObject.cost_budget"-->
<!--          type="number"-->
<!--          :label="$t('projectStatus.phaseGate.fields.cost_budget')"-->
<!--          :error-messages="costBudgetErrors"-->
<!--          data-testid="phase-cost-budget"-->
<!--        />-->
<!--      </v-col>-->
<!--      <v-col cols="12" sm="6" class="py-1">-->
<!--        <v-text-field-->
<!--          variant="outlined"-->
<!--          v-model="formObject.hours_budget"-->
<!--          type="number"-->
<!--          :label="$t('projectStatus.phaseGate.fields.hours_budget')"-->
<!--          :error-messages="hoursBudgetErrors"-->
<!--          data-testid="phase-hours-budget"-->
<!--        />-->
<!--      </v-col>-->
<!--      <v-col cols="12" sm="6" class="py-1">-->
<!--        <v-text-field-->
<!--          variant="outlined"-->
<!--          v-model="formObject.cost_actual"-->
<!--          type="number"-->
<!--          :label="$t('projectStatus.phaseGate.fields.cost_actual')"-->
<!--          :error-messages="costActualErrors"-->
<!--          data-testid="phase-cost-actual"-->
<!--        />-->
<!--      </v-col>-->
<!--      <v-col cols="12" sm="6" class="py-1">-->
<!--        <v-text-field-->
<!--          variant="outlined"-->
<!--          v-model="formObject.hours_actual"-->
<!--          type="number"-->
<!--          :label="$t('projectStatus.phaseGate.fields.hours_actual')"-->
<!--          :error-messages="hoursActualErrors"-->
<!--          data-testid="phase-hours-actual"-->
<!--        />-->
<!--      </v-col>-->
<!--      <v-col cols="12" sm="6" class="py-1">-->
<!--        <v-text-field-->
<!--          variant="outlined"-->
<!--          v-model="formObject.remaining_cost"-->
<!--          type="number"-->
<!--          :label="$t('projectStatus.phaseGate.fields.remaining_cost')"-->
<!--          :error-messages="remainingCostErrors"-->
<!--          data-testid="phase-cost-remaining"-->
<!--        />-->
<!--      </v-col>-->
<!--      <v-col cols="12" sm="6" class="py-1">-->
<!--        <v-text-field-->
<!--          variant="outlined"-->
<!--          v-model="formObject.remaining_hours"-->
<!--          type="number"-->
<!--          :label="$t('projectStatus.phaseGate.fields.remaining_hours')"-->
<!--          :error-messages="remainingHoursErrors"-->
<!--          data-testid="phase-remaining-hours"-->
<!--        />-->
<!--      </v-col>-->
      <v-col cols="12" class="py-1">
        <v-textarea
          variant="outlined"
          v-model="formObject.comment"
          :label="$t('projectStatus.phaseGate.fields.comment')"
          :error-messages="commentErrors"
          data-testid="phase-comment"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
