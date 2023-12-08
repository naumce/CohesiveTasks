<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, maxLength } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import { useRoute } from 'vue-router'

import type {
  HttpRequest,
  UserManagement,
  MatrixParameter,
  EventCharacterizationPost
} from '@/types'

const props = defineProps({
  type: {
    type: String,
    required: true,
    default: 'risk'
  },
  project: {
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  },
  value: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['submit'])

const loadingUsers = ref(false)
const users = ref(
  props.value.owner && props.value.ownerId
    ? [{ value: props.value.ownerId, title: props.value.owner,subtitle: props.value.ownerEmail}]
    : []
)
const search = ref()
const severityItems = ref<any[]>([])
const probabilityItems = ref<any[]>([])
// const score =ref<any>({value:'0', color:'gray'})
const route = useRoute()
const workspaceId = `${route.params.workspaceId}`
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`
const matrixId = `${props.project[`${props.type}_matrix`].id}`
const apiScore = `${apiUrls.score.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId)}`
const { sendRequest } = useApis()
const getMatrix: HttpRequest = {
  method: 'get',
  url: `${apiUrls.matrix.replace(/%tenantId/, tenantId)}/${matrixId}/`,
  onSuccess: {
    callback: (response) => {
      severityItems.value.push(
        ...response.data.severities.map((item: MatrixParameter) => ({
          value: item.id,
          title: item.name
        }))
      )
      probabilityItems.value.push(
        ...response.data.probabilities.map((item: MatrixParameter) => ({
          value: item.id,
          title: item.name
        }))
      )
    }
  }
}
sendRequest(getMatrix)
function getScore() {
  const getScore: HttpRequest = {
    method: 'post',
    url: `${apiScore}`,
    data: {severity_id: formObject.severity, probability_id:formObject.probability, type: props.type === 'risk' ? 'RISK' : 'OPPORTUNITY'},
    onSuccess: {
      callback: (response) => {
        score.score = response.data.score
        score.color = response.data.color
      }
    }
  }
  sendRequest(getScore)
}
const score = reactive({
    score: 0,
    color: ''
})
onMounted(() => {
  formObject.severity && formObject.severity && getScore()
})
const formObject = reactive({
  id: props.value.id || null,
  custom_id: props.value.custom_id || '',
  status: props.value.status || null,
  owner: props.value.owner || null,
  description: props.value.description || '',
  severity: props.value.full_severity?.id || null,
  probability: props.value.full_probability?.id || null,
  comment: props.value.comment || '',
  shown_in_card: !!props.value.shown_in_card,
  loading: false
})

const rules = {
  custom_id: { required, maxLength: maxLength(inputValidations.customIdLength) },
  status: { required },
  owner: { required },
  description: { required, maxLength: maxLength(inputValidations.longTextLength) },
  severity: { required },
  probability: { required },
  comment: { required, maxLength: maxLength(inputValidations.longTextLength) }
}
const v$: any = useVuelidate(rules, formObject)

const idErrors = computed(() => {
  return v$.value.custom_id.$errors.map((rule: any) => rule.$message)
})

const statusErrors = computed(() => {
  return v$.value.status.$errors.map((rule: any) => rule.$message)
})

const ownerErrors = computed(() => {
  return v$.value.owner.$errors.map((rule: any) => rule.$message)
})

const descriptionErrors = computed(() => {
  return v$.value.description.$errors.map((rule: any) => rule.$message)
})

const severityErrors = computed(() => {
  return v$.value.severity.$errors.map((rule: any) => rule.$message)
})

const probabilityErrors = computed(() => {
  return v$.value.probability.$errors.map((rule: any) => rule.$message)
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
      url: `${apiUrls.projectUsers.replace(/%workspaceId/, workspaceId)}?page=1&per_page=10&sort=["user___name"]&filter={"user___name__ilike":"%${value}%"}`,
      onSuccess: {
        callback: (response) => {
          users.value = response.data.items.map((item: UserManagement) => ({
            value: item.user.id,
            title: `${item.user.name}${item.role.name ? ' (' + item.role.name + ')' : ''}`,
            subtitle: `${item.user.email}`
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
  newValue && newValue !== formObject.owner && getUsers(newValue)
})

watch(formObject, (newValue) => {
  newValue && formObject.severity && formObject.probability && getScore()
})

function touch() {
  v$.value.$validate()
  if (v$.value.$error) return
  const data: EventCharacterizationPost = {
    actions: 'actions',
    comment: formObject.comment,
    id: formObject.id,
    custom_id: formObject.custom_id,
    description: formObject.description,
    owner: formObject.owner.value || props.value.ownerId,
    probability: formObject.probability,
    severity: formObject.severity,
    shown_in_card: formObject.shown_in_card,
    status: formObject.status,
    type: props.type === 'risk' ? 'RISK' : 'OPPORTUNITY'
  }
  emit('submit', data)
}
function reset() {
  formObject.id = null
  formObject.custom_id = ''
  formObject.status = null
  formObject.owner = null
  formObject.description = ''
  formObject.severity = null
  formObject.probability = null
  formObject.comment = ''
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
      <v-col cols="12" sm="6" md="4">
        <v-text-field variant="outlined" v-model="formObject.custom_id"
          :label="$t('projectStatus.riskAndOpportunities.fields.custom_id')" :error-messages="idErrors" data-testid="id" />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-select variant="outlined" v-model="formObject.status" :label="$t('projectStatus.riskAndOpportunities.fields.status')" :items="[
          { title: $t('EventStatus.OPEN'), value: 'OPEN' },
          { title: $t('EventStatus.CLOSED'), value: 'CLOSED' }
        ]" :error-messages="statusErrors" data-testid="status" />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-autocomplete variant="outlined"  v-model="formObject.owner" v-model:search="search"  item-text="title" item-value="value" return-object :loading="loadingUsers"
          :items="users" clearable hide-no-data :label="$t('projectStatus.riskAndOpportunities.fields.ownerEmail')"
          :hint="$t('misc.startTyping')" :error-messages="ownerErrors" data-testid="owner" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="8">
        <v-textarea variant="outlined" v-model="formObject.description"
          :label="$t('projectStatus.riskAndOpportunities.fields.description')" :error-messages="descriptionErrors" data-testid="description" />
      </v-col>
      <v-col cols="4" sm="4">
        <v-row>
          <v-col cols="6" sm="6">
            <v-select variant="outlined" v-model="formObject.severity" :label="$t('projectStatus.riskAndOpportunities.fields.severity')"
              :items="severityItems?.map((t: any) => ({ title: t.title, value: t.value }))"
              :error-messages="severityErrors" data-testid="severity" />
          </v-col>
          <v-col cols="6" sm="6">
            <v-select variant="outlined" v-model="formObject.probability"
              :label="$t('projectStatus.riskAndOpportunities.fields.probability')"
              :items="probabilityItems?.map((t: any) => ({ title: t.title, value: t.value }))"
              :error-messages="probabilityErrors" data-testid="probability" />
          </v-col>
        </v-row>
        <v-row class="score">
          <v-text-field  :bg-color="`${score.color}`" label="Score" autofocus variant="solo" color="gray" v-model="score.score"
            :readonly="true" data-testid="score"></v-text-field>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="8">
        <v-textarea variant="outlined" v-model="formObject.comment"
          :label="$t('projectStatus.riskAndOpportunities.fields.comment')" :error-messages="commentErrors" data-testid="comment" />
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped lang="scss">
.score {
  width: 100%;
  margin-left: 1px;
}
</style>
