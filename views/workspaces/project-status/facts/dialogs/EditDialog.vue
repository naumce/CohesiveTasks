<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { VTextField } from 'vuetify/components/VTextField'
import { VAutocomplete } from 'vuetify/components/VAutocomplete'
import { useI18n } from 'vue-i18n'
import useVuelidate from '@vuelidate/core'
import { required, maxLength, minValue } from '@vuelidate/validators'
import { inputValidations } from '@/utils/validation'
import { getFactValue } from '@/utils/facts'
import type { ProjectFact, HttpRequest, UserManagement, ListItem } from '@/types'
import useApis from '@/composables/api'
import { apiUrls } from '@/plugins/axios'
import { useRoute } from 'vue-router'
import { isoToUnix } from '@/utils/date'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  fact: {
    type: Object as () => ProjectFact,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const { loading } = storeToRefs(useLoaderStore())

const inputComponent = computed(() => {
  if (props.fact.fact.type === 'USER') return VAutocomplete
  return VTextField
})
const { t } = useI18n()
const inputProps = computed(() => {
  if (props.fact.fact.type === 'USER')
    return { 'return-object': true, 'hide-no-data': true, hint: t('misc.startTyping') }
  return {}
})

interface TypeMap {
  [key: string]: string
}
const types: TypeMap = {
  FLOAT: t('misc.amount'),
  DATETIME: t('misc.date'),
  USER: t('misc.user')
}
const inputTypes: TypeMap = {
  FLOAT: 'number',
  DATETIME: 'date'
}
const type = (types[props.fact.fact.type] || t('misc.value')).toLowerCase()
const inputType = inputTypes[props.fact.fact.type] || 'text'
interface Values {
  inputValue: string | number | null | ListItem
  loading: boolean
}
const values = reactive<Values>({
  inputValue: getFactValue(props.fact, false) || null,
  loading: false
})

const rules = {
  inputValue: {
    required,
    ...(props.fact.fact.type === 'STRING'
      ? { maxLength: maxLength(inputValidations.nameLength) }
      : {}),
    ...(props.fact.fact.type === 'FLOAT'
      ? { minValue: minValue(inputValidations.minNumberVal) }
      : {})
  }
}
const v$: any = useVuelidate(rules, values)
const valueErrors = computed(() => {
  return v$.value.inputValue.$errors.map((rule: any) => rule.$message)
})

const route = useRoute()
const workspaceId = `${route.params.workspaceId}`
const users = ref(
  props.fact.user && props.fact.user.id && (props.fact.user.email || props.fact.user.name)
    ? [{ value: props.fact.user.id, title: props.fact.user.name,subtitle: props.fact.user.email }]
    : []
)
const { sendRequest } = useApis()
let debounce: number
function getUsers(value: string) {
  values.loading = true
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
            value: item.user.id,
            title: `${item.user.name}${item.role?.name ? ' (' + item.role.name + ')' : ''}`,
            subtitle: `${item.user.email}`
          }))
        }
      },
      finally: () => {
        values.loading = false
      }
    }

    sendRequest(getTenants)
  }, 500)
}
const search = ref()
watch(search, (newValue) => {
  newValue && newValue !== values.inputValue && getUsers(newValue)
})

const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`
const factId = `${props.fact.fact.id}`
function edit() {
  v$.value.$validate()
  if (v$.value.$error) return
  const url = `${apiUrls.fact
    .replace(/%tenantId/, tenantId)
    .replace(/%projectId/, projectId)
    .replace(/%factId/, factId)}`
  const data = {
    ...(props.fact.fact.type === 'STRING' ? { value: values.inputValue } : {}),
    ...(props.fact.fact.type === 'FLOAT' ? { number: values.inputValue } : {}),
    ...(props.fact.fact.type === 'DATETIME' ? { datetime: isoToUnix(`${values.inputValue}`) } : {}),
    ...(props.fact.fact.type === 'USER'
      ? {
          user_id:
            typeof values.inputValue === 'object' &&
            values.inputValue &&
            'value' in values.inputValue
              ? values.inputValue.value
              : values.inputValue
        }
      : {})
  }
  const editFact: HttpRequest = {
    method: 'post',
    url: url,
    data: data,
    onSuccess: {
      callback: (response) => {
        emit('submit', response.data)
      },
      message: t('projectStatus.facts.edit.success')
    },
    finally: () => {
      values.loading = false
    }
  }

  sendRequest(editFact)
}
function close() {
  emit('update:modelValue', false)
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent width="500">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{
          $t(`projectStatus.facts.editTitle`).replace(/%type/, type)
        }}</span>
      </v-card-title>
      <v-card-text>
        <component
            :is="inputComponent"
            variant="outlined"
            v-model="values.inputValue"
            v-model:search="search"
            :type="inputType"
            :error-messages="valueErrors"
            clearable
            autofocus
            :loading="values.loading"
            :items="users"
            v-bind="inputProps"
            data-testid="input-field"
            item-text="title"
            item-value="value"

        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn :disabled="loading" class="primary-action-btn" @click="edit" data-testid="save">
          {{ $t('misc.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
