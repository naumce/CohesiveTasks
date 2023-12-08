<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { TabulatorFull as Tabulator, type Options, type CellComponent } from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import AddDialog from './dialogs/AddDialog.vue'
import EditDialog from './dialogs/EditDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import { apiUrls } from '@/plugins/axios'
import getColumnsDefinition from './columns-definition'
import useApis from '@/composables/api'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import type { HttpRequest, UserData, UserManagement } from '@/types'
import {togglePagination} from "@/utils/pagination";

const route = useRoute()
const workspaceId = `${route.params.workspaceId}`
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`

const { t } = useI18n()
const selectedUser = ref<UserManagement>()
const { sendRequest } = useApis()
const actionsContextMenu = [
  {
    label: t('misc.edit'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as UserManagement
      selectedUser.value = data
      dialogs.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as UserManagement
      selectedUser.value = data
      dialogs.delete = true
    }
  }
]
const dialogs = reactive({
  add: false,
  edit: false,
  delete: false
})
const table = ref()
const tabulator = ref()
var roles: any[] = []
const ajaxUrl = `${apiUrls.projectUsers.replace(/%workspaceId/, workspaceId)}`

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
      data: response.data.items.map((item: any) => ({
        ...item,
        user___name: item.user.name,
        user___email: item.user.email,
        role___name: item.role.name
      })),
      last_page: lastPage
    }
    return retObj
  }
}

const getRoles: HttpRequest = {
  method: 'get',
  url: `${apiUrls.userRoles.replace(/%tenantId/, tenantId).replace(/%projectCard/, projectId)}`,
  onSuccess: {
    callback: (response) => {
      roles = response.data.items
    }
  }
}
sendRequest(getRoles)
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})

function onUserAdd(data: UserData) {
  const addNewUser: HttpRequest = {
    method: 'post',
    url: `${apiUrls.projectUsers.replace(/%workspaceId/, workspaceId)}`,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('workspaces.settings.userManagement.addNewUserSuccess').replace(
        /%name/,
        data.email || ''
      )
    },
    finally: () => {
      AddNewUserDialogOpen()
    }
  }
  sendRequest(addNewUser)
}

function onUserEdit(data: UserData) {
  if (!selectedUser.value) return
  const editUser: HttpRequest = {
    method: 'patch',
    url: `${apiUrls.projectUsers.replace(/%workspaceId/, workspaceId)}/${
      selectedUser.value.user.id
    }/`,
    data: { role_id: data.role_id },
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('workspaces.settings.userManagement.editUserSuccess').replace(
        /%name/,
        data.email || ''
      )
    },
    finally: () => {
      dialogs.edit = false
    }
  }
  sendRequest(editUser)
}

function onUserDelete() {
  if (!selectedUser.value) return
  const deleteRequest: HttpRequest = {
    method: 'delete',
    url: `${apiUrls.projectUsers.replace(/%workspaceId/, workspaceId)}/${
      selectedUser.value.user.id
    }/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('workspaces.settings.userManagement.deleteSuccess').replace(
        /%user/,
        selectedUser.value.user.email
      )
    },
    finally: () => {
      dialogs.delete = false
    }
  }
  sendRequest(deleteRequest)
}

function AddNewUserDialogOpen() {
  dialogs.add = !dialogs.add
}
</script>
<template>
  <v-container fluid>
    <portal to="header-actions">
      <v-btn class="primary-action-btn" data-testid="add-new-user" @click="AddNewUserDialogOpen">
        {{ $t(`misc.add`) }}
      </v-btn>
    </portal>
    <v-row dense class="mt-0">
        <div ref="table" />
    </v-row>
    <AddDialog v-if="dialogs.add" :roles="roles" v-model="dialogs.add" @submit="onUserAdd" />
    <EditDialog
      v-if="dialogs.edit"
      v-model="dialogs.edit"
      :roles="roles"
      :user="selectedUser"
      @submit="onUserEdit"
    />
    <DeleteDialog
      v-if="dialogs.delete"
      v-model="dialogs.delete"
      :title="$t(`workspaces.settings.userManagement.deleteMember`)"
      :text="$t(`workspaces.settings.userManagement.deleteDialogText`)"
      @submit="onUserDelete"
    >
      <strong class="mt-4">{{ selectedUser?.user?.email || '' }}</strong>
    </DeleteDialog>
  </v-container>
</template>
