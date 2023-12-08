<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { type CellComponent, type Filter, type Options, TabulatorFull as Tabulator } from 'tabulator-tables'
import useApis from '@/composables/api'
import { apiUrls } from '@/plugins/axios'
import { useRoute } from 'vue-router'
import useTabulatorOptions from '@/composables/tabulator'
import { useI18n } from 'vue-i18n'
import SearchInput from '@/components/SearchInput.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import type { HttpRequest, User, UserValue } from '@/types'
import { useCustomizerStore } from '@/stores/customizer'
import {togglePagination} from "@/utils/pagination";

const {
  schedulesSelectedGroup
} = useCustomizerStore()

const props = defineProps({
  openAddUser: {
    type: Boolean,
    default: false
  }
})
props.openAddUser
const route = useRoute()
const workspaceId = route.params.workspaceId as string
const table = ref()
const tabulator = ref()

const { tabulatorOptions } = useTabulatorOptions()
const { t } = useI18n()
const selectedRow = ref<User>()
const dialogs = reactive({
  remove: false,
  addUser: false
})
const groupsUrl = `${apiUrls.scheduleGroups.replace(/%workspaceId/, workspaceId)}${schedulesSelectedGroup?.id}`
const tableDefinition: Options = {
  columns: [
    {
      field: 'user___name',
      title: t('misc.name'),
      width:'30%'
    },
    {
      field: 'user___email',
      title: t('misc.email'),
    },
    {
      title: '',
      resizable: false,
      minWidth: 40,
      width: 40,

      headerSort: false,
      formatter: (cell: CellComponent) => {
        const span = document.createElement('span')
        span.classList.add('mdi')
        span.classList.add('mdi-trash-can')
        span.style.display = 'none' // initially hide span
        span.style.fontSize = '20px'
        span.style.verticalAlign = 'middle'
        span.style.cursor = 'pointer'
        span.style.margin = 'auto';
        const row = cell.getRow()
        row.getElement().addEventListener('mouseenter', () => {
          span.style.display = 'inline'
        })
        row.getElement().addEventListener('mouseleave', () => {
          span.style.display = 'none'
        })
        return span
      },
      cellClick: (e, cell) => {
        const data = cell.getData() as User
        selectedRow.value = data
        dialogs.remove = true
      }
    }
  ],
  ajaxURL: `${groupsUrl}/users/`,
  ...tabulatorOptions,
  ajaxResponse: ajaxResponse,
  layout: 'fitColumns',
  height: '100%'
}

interface IUsers {
  user: User
}
function ajaxResponse(url: string, params: any, response: any) {
  const totalElements = response.data?.total || 0
  const addition = totalElements % params.per_page > 0 ? 1 : 0
  const lastPage = Math.floor(totalElements / params.per_page) + addition
  togglePagination(totalElements);
  const retObj = {
    contentType: 'application/json; charset=utf-8',
    data: response.data.items.map((item: IUsers) => ({
      ...item.user,
      user___email: item.user.email,
      user___name: item.user.name
    })),
    last_page: lastPage
  }
  return retObj
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})
onUnmounted(() => {
  tabulator.value.destroy()
})

function onSearchInput(event: InputEvent) {
  const value = (event.target as HTMLInputElement).value
  const currentFilters = tabulator.value
    .getFilters()
    .filter((filter: Filter) => filter.field !== 'user___email')
  const filters = [
    ...currentFilters,
    ...(value ? [{ field: 'user___email', type: 'like', value: encodeURIComponent(value) }] : [])
  ]
  tabulator.value.setFilter(filters)
}

const newMember = ref<UserValue>()
const loadingUsers = ref(false)
const avaliableUsers = ref<User[]>([])
const { sendRequest } = useApis()

const getAvaliableUsers = (value: string = '') => {
  loadingUsers.value = true
  const url = `${groupsUrl}/users_not_in_group/?page=1&per_page=10${value ? `&filter={"email__ilike":"%${value}%"}` : ''
    }`
  const getUsers: HttpRequest = {
    method: 'get',
    url: url,
    onSuccess: {
      callback: (response) => {
        avaliableUsers.value = response.data.items.map((item: User) => ({
          value: item.id,
          title: item.email
        }))
      }
    },
    finally: () => {
      loadingUsers.value = false
    }
  }

  sendRequest(getUsers)
}
getAvaliableUsers()

let debounce: number
const searchAvailableUsers = (value: string) => {
  loadingUsers.value = true
  window.clearTimeout(debounce)
  debounce = window.setTimeout(() => {
    getAvaliableUsers(value)
  }, 500)
}
const search = ref()
watch(search, (newValue) => {
  newValue && newValue !== newMember.value?.title && searchAvailableUsers(newValue)
})

const removeUser = () => {
  if (!selectedRow.value) return
  const removeRequest: HttpRequest = {
    method: 'delete',
    url: `${groupsUrl}/users/${selectedRow.value.id}/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
        getAvaliableUsers()
        availableUsersKey.value++
      },
      message: t('workspaces.schedules.groups.users.remove.success')
    },
    finally: () => {
      dialogs.remove = false
    }
  }

  sendRequest(removeRequest)
}
const availableUsersKey = ref(0)
const addMember = (user: UserValue) => {
  if (!user) return
  const addRequest: HttpRequest = {
    method: 'post',
    url: `${groupsUrl}/users/`,
    data: { user_id: user.value },
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
        getAvaliableUsers()
        newMember.value = undefined
        availableUsersKey.value++
      },
      message: t('workspaces.schedules.groups.users.add.success')
    },
    finally: () => {
      loadingUsers.value = false
    }
  }

  sendRequest(addRequest)
}
defineExpose({
  close
})
</script>
<template>
  <v-card-text>
    <v-container fluid>
      <v-row class="mb-n4 mt-4">
        <v-col cols="12">
          <SearchInput :label="$t('workspaces.schedules.groups.users.searchLabel')" @input="onSearchInput" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <div ref="table" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-divider />
        </v-col>
      </v-row>
    </v-container>
  </v-card-text>
  <DeleteDialog v-if="dialogs.remove" v-model="dialogs.remove" :text="$t('workspaces.schedules.groups.users.remove.text')"
    @submit="removeUser">
    <strong class="mt-4">{{ selectedRow?.email || '' }}</strong>
  </DeleteDialog>
  <v-dialog v-model="props.openAddUser" persistent width="500">
    <v-card>
      <v-row>
        <v-col cols="12">
          <v-autocomplete class="pa-4" variant="outlined" v-model="newMember" v-model:search="search" :loading="loadingUsers"
            :items="avaliableUsers" clearable return-object :label="$t('workspaces.schedules.groups.users.add.text')"
            :hint="$t('workspaces.schedules.groups.users.searchLabel')" hide-no-data :key="availableUsersKey"
            persistent-hint @update:model-value="addMember" />
        </v-col>
        <v-row style="display: flex; flex-direction: row; justify-content: end; margin-bottom: 10px; margin-right: 28px;">
          <v-btn class="primary-negative-btn" @click="() => $emit('close')">
          {{ $t('misc.close') }}
        </v-btn>
      </v-row>
      </v-row>
    </v-card>
  </v-dialog>
</template>
