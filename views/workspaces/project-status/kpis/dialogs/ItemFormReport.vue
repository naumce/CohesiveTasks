<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import { useRoute } from 'vue-router'
import { isoToUnix, isoToStandardString } from '@/utils/date'
import type { HttpRequest, UserManagement, ProjectKpiThreshold, ProjectKpiValue } from '@/types'

const props = defineProps({
  value: {
    type: Object as () => ProjectKpiValue,
    default: null
  },
  thresholds: {
    type: Array as () => ProjectKpiThreshold[]
  }
})

const emit = defineEmits(['submit'])
const loadingUsers = ref(false)
const users = ref(
  props.value?.responsible_action_user?.name && props.value?.responsible_action_user?.id
    ? [
        {
          value: props.value.responsible_action_user.id,
          title: props.value.responsible_action_user.name
        }
      ]
    : []
)
const search = ref()
const thresholdItems = JSON.parse(JSON.stringify(props.thresholds))
  .sort((a: ProjectKpiThreshold, b: ProjectKpiThreshold) => {
    return a.value - b.value
  })
  .map((t: any) => ({ title: t.value, value: t.id }))
const route = useRoute()
const workspaceId = `${route.params.workspaceId}`

const { sendRequest } = useApis()

const formObject = reactive({
  id: props.value?.id || null,
  date: props.value?.date ? isoToStandardString(props.value.date) : '',
  responsible_action_user_id: users.value[0],
  comment: props.value?.comment || '',
  threshold_id: props.value?.threshold?.id || null
})

const rules = {
  date: { required },
  responsible_action_user_id: { required },
  comment: { required, maxLength: maxLength(inputValidations.longTextLength) },
  threshold_id: { required }
}
const v$: any = useVuelidate(rules, formObject)

const dateErrors = computed(() => {
  return v$.value.date.$errors.map((rule: any) => rule.$message)
})

const valueErrors = computed(() => {
  return v$.value.threshold_id.$errors.map((rule: any) => rule.$message)
})

const ownerErrors = computed(() => {
  return v$.value.responsible_action_user_id.$errors.map((rule: any) => rule.$message)
})

const commentErrors = computed(() => {
  return v$.value.comment.$errors.map((rule: any) => rule.$message)
})

let debounce: number
function getUsers(value: string) {
  loadingUsers.value = true
  window.clearTimeout(debounce)
  debounce = window.setTimeout(() => {
    const getTenants: HttpRequest = {
      method: 'get',
      url: `${apiUrls.projectUsers.replace(
        /%workspaceId/,
        workspaceId
      )}?page=1&per_page=10&sort=["user___name"]&filter={"user___name__ilike":"%${value}%"}`,
      onSuccess: {
        callback: (response) => {
          users.value = response.data.items.map((item: UserManagement) => ({
            value: item.user?.id,
            title: `${item.user.name}${item.role.name ? ' (' + item.role.name + ')' : ''}`,
            subtitle: item.user?.email || ''
          }))
        }
      },
      finally: () => {
        loadingUsers.value = false
      }
    }

    sendRequest(getTenants)
  }, 500)
}
watch(search, (newValue) => {
  newValue && newValue !== formObject.responsible_action_user_id && getUsers(newValue)
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: any = {
    ...(formObject.id ? { id: formObject.id } : {}),
    comment: formObject.comment,
    responsible_action_user_id: formObject.responsible_action_user_id?.value || props.value?.responsible_action_user?.id,
    timestamp: isoToUnix(formObject.date),
    threshold_id: formObject.threshold_id
  }
  emit('submit', data)
}
function reset() {
  formObject.date = ''
  formObject.responsible_action_user_id = { value: 0, title: '' }
  formObject.comment = ''
  formObject.threshold_id = 0
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
      <v-col cols="4">
        <v-text-field
          variant="outlined"
          type="date"
          v-model="formObject.date"
          :label="$t('projectStatus.kpi.fields.report_date')"
          autofocus
          :error-messages="dateErrors"
          data-testid="report-date"
        />
      </v-col>
      <v-col cols="4">
        <v-select
          v-model="formObject.threshold_id"
          :label="$t('projectStatus.kpi.fields.report_value')"
          :items="thresholdItems"
          :error-messages="valueErrors"
          data-testid="report-value"
          variant="outlined"
        />
      </v-col>
      <v-col cols="8">
        <v-autocomplete
          variant="outlined"
          v-model="formObject.responsible_action_user_id"
          v-model:search="search"
          return-object
          :loading="loadingUsers"
          :items="users"
          item-text="title"
          item-value="value"
          clearable
          :label="$t('projectStatus.kpi.fields.reponsible_action')"
          :hint="$t('misc.startTyping')"
          hide-no-data
          :error-messages="ownerErrors"
          data-testid="responsible-for-action"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-textarea
          variant="outlined"
          v-model="formObject.comment"
          :label="$t('projectStatus.kpi.fields.report_comment')"
          :error-messages="commentErrors"
          data-testid="comment"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
