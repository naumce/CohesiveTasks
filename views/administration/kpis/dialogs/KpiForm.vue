<script setup lang="ts">
import { ref, reactive, computed, onBeforeUpdate } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import type { RawKpi, ProjectKpiThreshold } from '@/types'
import KpiThresholdForm from './KpiThresholdForm.vue'

const props = defineProps({
  value: {
    type: Object as () => RawKpi,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['submit'])

const thresholds = ref<any[]>([])
onBeforeUpdate(() => {
  thresholds.value = []
})

const formObject = reactive({
  custom_id: props.value?.custom_id || '',
  name: props.value?.name || '',
  description: props.value?.description || '',
  thresholds: props.value?.thresholds || [],
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
  }
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

const onThresholdChange = (data: ProjectKpiThreshold, threshold: ProjectKpiThreshold) => {
  threshold.custom_id = data.custom_id
  threshold.name = data.name
  threshold.description = data.description
  threshold.color = data.color
  threshold.value = data.value
}
function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: RawKpi = {
    id: props.value.id || 0,
    custom_id: formObject.custom_id,
    name: formObject.name,
    description: formObject.description,
    thresholds: formObject.thresholds,
    mandatory: false
  }
  emit('submit', data)
}
function reset() {
  formObject.custom_id = ''
  formObject.name = ''
  formObject.description = ''
  formObject.loading = false
  v$.value.$reset()
}

const defaultThreshold: ProjectKpiThreshold = {
  id: 0,
  custom_id: '',
  name: '',
  description: '',
  value: 0,
  color: ''
}
function add() {
  formObject.thresholds.push(JSON.parse(JSON.stringify(defaultThreshold)))
}
defineExpose({
  reset,
  touch,
  add
})
</script>
<template>
  <v-container>
    <v-row dense>
      <v-col cols="12" sm="4">
        <v-text-field variant="outlined" v-model="formObject.custom_id" :label="$t('misc.id')" clearable autofocus
          :error-messages="idErrors" data-testid="id" />
      </v-col>
      <v-col cols="12" sm="8">
        <v-text-field variant="outlined" v-model="formObject.name" :label="$t('misc.name')" clearable
          :error-messages="nameErrors" data-testid="name" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-textarea variant="outlined" v-model="formObject.description" :label="$t('misc.description')" clearable
          :error-messages="descriptionErrors" data-testid="description" />
      </v-col>
    </v-row>
    <template v-if="!props.value?.id && formObject.thresholds.length">
      <v-card>
        <v-row class="flex justify-space-between">
          <v-card-title>{{ $t('administration.kpis.thresholds.title') }}</v-card-title>
        </v-row>
        <KpiThresholdForm v-for="(threshold, index) in formObject.thresholds" :key="threshold.id" :ref="(el) => {
          thresholds[index] = el
        }
          " :value="threshold" @change="onThresholdChange($event, threshold)" :index="index" @remove="() => formObject.thresholds.splice(index, 1)" />
      </v-card>
    </template>
  </v-container>
</template>
