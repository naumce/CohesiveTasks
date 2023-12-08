<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import type { UserData, Role } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => UserData,
    default: () => ({})
  },
  roles: {
    type: Array<Role>,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['submit'])

const formObject = reactive({
  email: props.value?.email || '',
  role_id: props.value?.role_id || props.roles[0].id,
  loading: false
})

const rolesItems = computed(() => {
  return props.roles.map((role) => ({ value: role.id, title: role.name }))
})

const rules = {
  email: { required, email },
  role_id: { required }
}
const v$: any = useVuelidate(rules, formObject)

const emailErrors = computed(() => {
  return v$.value.email.$errors.map((rule: any) => rule.$message)
})

const roleErrors = computed(() => {
  return v$.value.role_id.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: UserData = {
    ...(props.value?.id ? { id: props.value.id } : {}),
    email: formObject.email,
    role_id: formObject.role_id
  }
  emit('submit', data)
}
function reset() {
  formObject.email = ''
  formObject.role_id = props.roles[0].id
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
          v-model="formObject.email"
          :label="$t('portfolios.userManagement.fields.email')"
          :error-messages="emailErrors"
          :disabled="!!props.value?.email"
          :autofocus="!props.value?.email"
        />
      </v-col>
      <v-col cols="12">
        <v-select
            variant="outlined"
          v-model="formObject.role_id"
          :label="$t('portfolios.userManagement.fields.role')"
          :items="rolesItems"
          :error-messages="roleErrors"
          :autofocus="!!props.value?.email"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
