<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'

import { administration_access, workspace_access, schedule_access, cost_module_access } from './constants'
import type { EventCharacterizationPostRole } from '@/types'

const props = defineProps({
  value: {
    type: Object,
    default: () => {
      return {}
    }
  },
  roles: {
    type: Array
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  id: props.value?.id || null,
  name: props.value.name || null,
  administrationAccess: administration_access.map((permission) => ({
    ...permission,
    selected: props.value?.permissions?.includes(permission.value) || false
  })),
  workspaceAccess: workspace_access.map((permission) => ({
    ...permission,
    selected: props.value?.permissions?.includes(permission.value) || false
  })),
  scheduleAccess: schedule_access.map((permission) => ({
    ...permission,
    selected: props.value?.permissions?.includes(permission.value) || false
  })),
  financialAccess: cost_module_access.map((permission) => ({
    ...permission,
    selected: props.value?.permissions?.includes(permission.value) || false
  }))
})

const rules = {
  name: { required }
}
const v$: any = useVuelidate(rules, formObject)

const nameErrors = computed(() => {
  return v$.value.name.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return

  const selectedAdministration = formObject.administrationAccess.reduce((acc: any[], item: any) => {
    if (!item.selected) return acc
    acc.push(item.value)
    return acc
  }, [])
  const selectedWorkspace = formObject.workspaceAccess.reduce((acc: any[], item: any) => {
    if (!item.selected) return acc
    acc.push(item.value)
    return acc
  }, [])
  const selectedSchedule = formObject.scheduleAccess.reduce((acc: any[], item: any) => {
    if (!item.selected) return acc
    acc.push(item.value)
    return acc
  }, [])
  const selectedFinancial = formObject.financialAccess.reduce((acc: any[], item: any) => {
    if (!item.selected) return acc
    acc.push(item.value)
    return acc
  }, [])

  const data: EventCharacterizationPostRole = {
    id: formObject.id,
    name: formObject.name,
    permissions: [...selectedAdministration, ...selectedWorkspace, ...selectedSchedule, ...selectedFinancial]
  }
  emit('submit', data)
}

// const isDisabled = computed(() => {
//   const projectView = formObject.workspaceAccess.find(
//     (permission) => permission.value === 'PROJECT_CARD_VIEW'
//   )
//   if (!projectView) {
//     console.warn('PROJECT_CARD_VIEW permission not found')
//     return false
//   }
//   return !projectView.selected
// })
const isDisabled = (permission: any) => {
  if (permission.value === 'PROJECT_CARD_VIEW' && !permission.selected) return false
  if (
    permission.value === 'PROJECT_CARD_VIEW' &&
    formObject.workspaceAccess.filter((p) => p.selected).length > 1
  )
    return true
  const projectView = formObject.workspaceAccess.find(
    (permission) => permission.value === 'PROJECT_CARD_VIEW'
  )
  if (!projectView) {
    console.warn('PROJECT_CARD_VIEW permission not found')
    return false
  }
  return !projectView.selected
}

function reset() {
  formObject.name = null
  v$.value.$reset()
}

const handleFinancialAccess = (arg: any) => {
  if (arg.value === 'PROJECT_FINANCE_EDIT' && arg.selected) {
    for (let item in formObject.financialAccess) {
      formObject.financialAccess[item].selected = true
    }
    return;
  }
  if (arg.value === 'PROJECT_FINANCE_VIEW' && !arg.selected) {
    for (let item in formObject.financialAccess) {
      formObject.financialAccess[item].selected = false
    }
    return;
  }
}

defineExpose({
  reset,
  touch
})
</script>
<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          variant="outlined"
          class="pr-4"
          v-model="formObject.name"
          :label="$t('workspaces.settings.rolesManagement.roleName')"
          :error-messages="nameErrors"
          data-testid="role-name"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <span class="text-h6">
          {{ $t('workspaces.settings.rolesManagement.selectPermissions') }}
        </span>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <span class="pb-3">{{ $t('workspaces.settings.rolesManagement.adminAccess') }}</span>
        <v-checkbox
          v-for="permission in formObject.administrationAccess"
          :key="permission.value"
          v-model="permission.selected"
          :label="permission.name"
          dense
          hide-details
        />
      </v-col>
      <v-col cols="3">
        <span class="pb-3">{{ $t('workspaces.settings.rolesManagement.workspaceAccess') }}</span>
        <v-checkbox
          v-for="permission in formObject.workspaceAccess"
          :key="permission.value"
          v-model="permission.selected"
          :label="permission.name"
          dense
          hide-details
          :disabled="isDisabled(permission)"
        />
      </v-col>
      <v-col cols="3">
        <span class="pb-3">{{ $t('workspaces.settings.rolesManagement.scheduleAccess') }}</span>
        <v-checkbox
          v-for="permission in formObject.scheduleAccess"
          :key="permission.value"
          v-model="permission.selected"
          :label="permission.name"
          dense
          hide-details
        />
      </v-col>
      <v-col cols="3">
        <span class="pb-3">{{ $t('workspaces.settings.rolesManagement.financialAccess') }}</span>
        <v-checkbox
          v-for="permission in formObject.financialAccess"
          :key="permission.value"
          v-model="permission.selected"
          :label="permission.name"
          dense
          hide-details
          @update:modelValue="handleFinancialAccess(permission)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
