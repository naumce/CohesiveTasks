<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'

const props = defineProps({
    value: {
        type: Object,
        default: () => {
            return {}
        }
    },
    phases: {
        type: Array,
        default: () => {
            return []
        }
    },
    statuses: {
        type: Array,
        default: () => {
            return [{ name: 'Pending', id: 'PENDING' }, { name: 'Approved', id: 'APPROVED' }, { name: 'Rejected', id: 'REJECTED' }, { name: 'Discarded', id: 'DISCARDED' }]
        }
    },
    financialTypes: {
        type: Array,
        default: () => {
            return [{ name: 'Original Budget', id: "ORIGINAL_BUDGET" }, { name: 'Change Order', id: 'CHANGE_ORDER' }, { name: 'Revenue', id: "REVENUE" }, { name: 'Actual Cost', id: 'ACTUAL_COST' }]
        }
    },
    reasons: {
        type: Array,
        default: () => {
            return []
        }
    }
})
const emit = defineEmits(['submit'])
var phase_id = null
props?.value?.phase___name && props.phases.filter((phase: any) => { if (phase.name === props.value.phase___name) phase_id = phase.id })
const formObject = reactive({
    id: props.value?.id || null,
    transaction_category_id: props.value?.transaction_category?.id || null,
    custom_id: props.value?.custom_id || null,
    status: props.value?.status || "PENDING",
    phase_id: phase_id,
    comment: props.value?.comment || null,
    description: props.value?.description || null,
    financial_type: props.value?.financial_type || null,
    effective_date: props.value?.effective_date || null,
    value: props.value?.value || null
})

watch(formObject, (newValue) => {
    if (formObject.phase_id) {
        props.phases.filter((phase: any) => {
            if (phase.id === formObject.phase_id) {
                var input = document.getElementById("effectiveDate");
                input?.setAttribute("min", phase.start_date.substring(0, 10));
                input?.setAttribute("max", phase.end_date.substring(0, 10));
            }
        })
    }
})

const rules = {
    transaction_category_id: { required },
    custom_id: { required },
    phase_id: { required },
    description: { required },
    value: { required },
    effective_date: { required },
    status: { required },
    financial_type: { required }
}
const v$: any = useVuelidate(rules, formObject)

const reasonErrors = computed(() => {
    return v$.value.transaction_category_id.$errors.map((rule: any) => rule.$message)
})

const customIdErrors = computed(() => {
    return v$.value.custom_id.$errors.map((rule: any) => rule.$message)
})

const descErrors = computed(() => {
    return v$.value.description.$errors.map((rule: any) => rule.$message)
})

const statusErrors = computed(() => {
    return v$.value.status.$errors.map((rule: any) => rule.$message)
})

const phaseErrors = computed(() => {
    return v$.value.phase_id.$errors.map((rule: any) => rule.$message)
})

const amountErrors = computed(() => {
    return v$.value.value.$errors.map((rule: any) => rule.$message)
})

const effectiveDateErrors = computed(() => {
    return v$.value.effective_date.$errors.map((rule: any) => rule.$message)
})

const financialTypeErrors = computed(() => {
    return v$.value.financial_type.$errors.map((rule: any) => rule.$message)
})

function touch() {
    v$.value.$validate()
    if (v$.value.$error) return
    const data: any = {
        id: formObject.id,
        transaction_category_id: formObject.transaction_category_id,
        phase_id: formObject.phase_id,
        status: formObject.status,
        custom_id: formObject.custom_id,
        comment: formObject.comment || '',
        description: formObject.description,
        financial_type: formObject.financial_type,
        effective_date: formObject.effective_date,
        value: formObject.value
    }
    emit('submit', data)
}
function reset() {
    formObject.transaction_category_id = null
    formObject.custom_id = null
    formObject.phase_id = null
    formObject.status = null
    formObject.description = null
    formObject.financial_type = null
    formObject.comment = null
    formObject.effective_date = null
    formObject.value = null
    v$.value.$reset()
}

const financialTypes = computed(()=>{
  return props.financialTypes?.map((t: any) => ({ title: t.name, value: t.id }))
      .filter((t:any)=> t.value !== 'ORIGINAL_BUDGET')
      .sort((a:any,b:any) => a.title.localeCompare(b.title));
})
defineExpose({
    reset,
    touch
})
</script>
<template>
    <v-container>
        <v-col cols="12" class="ml-2 item-form">
            <v-row class="d-flex " cols="4">
                <v-text-field variant="outlined" class="pr-4" v-model="formObject.custom_id"
                    :label="$t('workspaces.financials.transactions.transactionId')" :error-messages="customIdErrors"
                    data-testid="transaction-id" />
                <v-select variant="outlined" class="pr-4" v-model="formObject.phase_id"
                    :label="$t('workspaces.financials.transactions.phase')"
                    :items="props.phases?.map((t: any) => ({ title: t.name, value: t.id }))" :error-messages="phaseErrors"
                    data-testid="phase">
                </v-select>
                <v-select variant="outlined" class="pr-4" v-model="formObject.financial_type"
                    :label="$t('workspaces.financials.transactions.financialType')"
                    :items="financialTypes"
                    :error-messages="financialTypeErrors" data-testid="financial-type">
                </v-select>
                <v-select variant="outlined" class="pr-4" v-model="formObject.transaction_category_id"
                    :label="$t('workspaces.financials.transactions.category')"
                    :items="props.reasons?.map((t: any) => ({ title: t.name, value: t.id }))" :error-messages="reasonErrors"
                    data-testid="financial-reason">
                </v-select>
            </v-row>
            <v-row>
                <v-textarea variant="outlined" auto-grow class="pr-4 mt-3 mb-3" rows="2" row-height="15"
                    v-model="formObject.description" :error-messages="descErrors"
                    :label="$t('workspaces.financials.transactions.description')"
                    data-testid="description"></v-textarea>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-row>
                        <v-text-field variant="outlined" class="pr-4 ml-[2]" type="number" v-model="formObject.value"
                            :label="$t('workspaces.financials.transactions.amount')" :error-messages="amountErrors"
                            data-testid="amount" />
                        <v-text-field variant="outlined" class="pr-4" :disabled="!formObject.phase_id" type="date" id="effectiveDate"
                            v-model="formObject.effective_date"
                            :label="$t('workspaces.financials.transactions.effectiveDate')" :error-messages="effectiveDateErrors"
                            data-testid="effective-date" />
                    </v-row>
                </v-col>
                <v-col cols="6" class="mt-n2 ml-n1">
                    <v-select variant="outlined" v-model="formObject.status"
                        :label="$t('workspaces.financials.transactions.status')"
                        :items="props.statuses?.map((t: any) => ({ title: t.name, value: t.id }))"
                        :error-messages="statusErrors" data-testid="status">
                    </v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-textarea variant="outlined" auto-grow class="pr-4" rows="2" row-height="15" v-model="formObject.comment"
                    :label="$t('workspaces.financials.transactions.fields.statusComment')"
                    data-testid="status-comment"></v-textarea>
            </v-row>
        </v-col>
</v-container></template>
<style>
.item-form {
  min-width: 1000px!important;
}
</style>