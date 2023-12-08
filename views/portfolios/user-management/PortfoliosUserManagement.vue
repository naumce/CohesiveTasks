<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { TabulatorFull as Tabulator, type Options, type CellComponent } from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import getColumnsDefinition from './columns-definition'
import useApis from '@/composables/api'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import { apiUrls } from '@/plugins/axios'
import type { HttpRequest, UserManagement, Role, UserData } from '@/types'
import ManageDialog from './dialogs/ManageDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import {togglePagination} from "@/utils/pagination";

const route = useRoute()
const { loading } = storeToRefs(useLoaderStore())

const tenantId = `${route.params.tenantId}`
const portfolioId = `${route.params.portfolioId}`

const table = ref()
const tabulator = ref()

const selected = ref<UserData>()
const ajaxUrl = `${apiUrls.portfolioUsers.replace(/%portfolioId/, portfolioId)}/`
const { t } = useI18n()
const actionsContextMenu = [
  {
    label: t('misc.edit'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as UserManagement
      selected.value = { id: data.user.id, email: data.user.email, role_id: data.role.id }
      dialogs.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as UserManagement
      selected.value = { id: data.user.id, email: data.user.email, role_id: data.role.id }
      dialogs.delete = true
    }
  }
]
const { tabulatorOptions } = useTabulatorOptions()

const tableDefinition: Options = {
  columns: getColumnsDefinition(actionsContextMenu),
  ajaxURL: ajaxUrl,
  ...tabulatorOptions,
  ajaxResponse: (url: string, params: any, response: any) => {
    const totalElements = response.data?.total || 0
    const addition = totalElements % params.per_page > 0 ? 1 : 0
    const lastPage = Math.floor(totalElements / params.per_page) + addition
    togglePagination(totalElements);
    const retObj = {
      contentType: 'application/json; charset=utf-8',
      data: response.data.items.map((item: UserManagement) => ({
        ...item,
        user___email: item.user.email,
        user___name: item.user.name,
        role___name: item.role.name
      })),
      last_page: lastPage
    }
    return retObj
  }
}

onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})
onUnmounted(() => {
  tabulator.value.destroy()
})

const roles = ref<Role[]>([])
const { sendRequest } = useApis()
const getAllRoles: HttpRequest = {
  method: 'get',
  url: `${apiUrls.portfolioRoles.replace(/%tenantId/, tenantId)}?page=1&per_page=10000`,
  onSuccess: {
    callback: (response) => {
      roles.value.push(...response.data.items)
    }
  }
}
sendRequest(getAllRoles)

const dialogs = reactive({
  add: false,
  edit: false,
  delete: false
})

function addMember(data: UserData) {
  const inviteMember: HttpRequest = {
    method: 'post',
    url: `${apiUrls.portfolioUsers.replace(/%portfolioId/, portfolioId)}/?id=${portfolioId}`,
    data: data,
    onSuccess: {
      callback: () => {
        dialogs.add = false
        tabulator.value.setData()
      },
      message: t('portfolios.userManagement.add.success')
    }
  }
  sendRequest(inviteMember)
}

function editUser(data: UserData) {
  const { id, role_id } = data
  const editRole: HttpRequest = {
    method: 'patch',
    url: `${apiUrls.portfolioUsers.replace(
      /%portfolioId/,
      portfolioId
    )}/${id}/?id=${portfolioId}&user_id=${id}`,
    data: { role_id },
    onSuccess: {
      callback: () => {
        dialogs.edit = false
        selected.value = undefined
        tabulator.value.setData()
      },
      message: t('portfolios.userManagement.edit.success')
    }
  }
  sendRequest(editRole)
}

function removeUser() {
  if (!selected.value) return
  const remove: HttpRequest = {
    method: 'delete',
    url: `${apiUrls.portfolioUsers.replace(/%portfolioId/, portfolioId)}/${selected.value.id}/`,
    onSuccess: {
      callback: () => {
        dialogs.delete = false
        selected.value = undefined
        tabulator.value.setData()
      },
      message: t('portfolios.userManagement.delete.success')
    }
  }
  sendRequest(remove)
}
</script>
<template>
  <v-container fluid>
    <portal to="header-actions">
      <v-btn :disabled="loading" class="primary-action-btn" @click="dialogs.add = true">
        {{ $t('misc.add') }}
      </v-btn>
    </portal>
    <v-row dense>
      <v-col cols="12">
        <div ref="table" />
      </v-col>
    </v-row>
  </v-container>
  <ManageDialog
    v-if="dialogs.add"
    v-model="dialogs.add"
    type="add"
    :roles="roles"
    @submit="addMember"
  />
  <ManageDialog
    v-if="dialogs.edit"
    v-model="dialogs.edit"
    type="edit"
    :roles="roles"
    :user="selected"
    @submit="editUser"
  />
  <DeleteDialog
    v-if="dialogs.delete"
    v-model="dialogs.delete"
    :text="$t('portfolios.userManagement.delete.text')"
    :title="$t('portfolios.userManagement.delete.title')"
    @submit="removeUser"
  >
    <strong class="mt-4">{{ selected?.email || '' }}</strong>
  </DeleteDialog>
</template>
