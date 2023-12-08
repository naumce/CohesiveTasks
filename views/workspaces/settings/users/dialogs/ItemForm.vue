<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import type { UserData, UserManagement } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => UserManagement,
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
  id: props.value?.user?.id || null,
  email: props.value?.user?.email || null,
  role_id: props.value?.role?.id || null
})

const rules = {
  email: { required, email },
  role_id: { required }
}
const v$: any = useVuelidate(rules, formObject)

const emailErrors = computed(() => {
  return v$.value.email.$errors.map((rule: any) => rule.$message)
})

const rolesErrors = computed(() => {
  return v$.value.role_id.$errors.map((rule: any) => rule.$message)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return

  const data: UserData = {
    id: formObject.id,
    email: formObject.email,
    role_id: formObject.role_id
  }
  emit('submit', data)
}
function reset() {
  formObject.email = null
  formObject.role_id = null
  v$.value.$reset()
}

defineExpose({
  reset,
  touch
})
</script>
<template>
  <v-container>
    <v-col>
      <v-text-field
        variant="outlined"
        class="pr-4"
        :disabled="!!props.value?.user?.email"
        v-model="formObject.email"
        :label="$t('workspaces.settings.userManagement.email')"
        :error-messages="emailErrors"
        :autofocus="!props.value?.user?.email"
        data-testid="user-email"
      />
      <v-select
        variant="outlined"
        class="pr-4"
        v-model="formObject.role_id"
        :label="$t('workspaces.settings.userManagement.selectRole')"
        :items="props.roles?.map((t: any) => ({ title: t.name, value: t.id }))"
        :error-messages="rolesErrors"
        :autofocus="!!props.value?.user?.email"
        data-testid="select-role"
      >
      </v-select>
    </v-col>
  </v-container>
</template>
