<script setup lang="ts">
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import type { PortfolioUser, UserData, Role } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => PortfolioUser,
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
  id: props.value?.user_id || null,
  email: props.value?.user?.email || null,
  role_id: props.value?.role_id || null
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
    ...(formObject.id ? { id: formObject.id } : {}),
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
        :autofocus="!props.value?.user?.email"
        :label="$t('misc.email')"
        :error-messages="emailErrors"
        data-testid="user-email"
      />
      <v-select
        class="pr-4"
        variant="outlined"
        v-model="formObject.role_id"
        :label="$t('misc.role')"
        :items="props.roles?.map((t: any) => ({ title: t.name, value: t.id }))"
        :autofocus="!!props.value?.user?.email"
        :error-messages="rolesErrors"
        data-testid="select-role"
      >
      </v-select>
    </v-col>
  </v-container>
</template>
