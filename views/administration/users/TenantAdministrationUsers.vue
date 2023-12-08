<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { TabulatorFull as Tabulator, type Options, type CellComponent } from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import ManageUsersDialog from './dialogs/ManageUsersDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import { apiUrls } from '@/plugins/axios'
import getColumnsDefinition from './columns-definition'
import useApis from '@/composables/api'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { HttpRequest, UserData, PortfolioUser, Role } from '@/types'
import {togglePagination} from "@/utils/pagination";

const route = useRoute()
const tenantId = `${route.params.tenantId}`

const { loading } = storeToRefs(useLoaderStore())

const { t } = useI18n()
const selectedUser = ref<PortfolioUser>()
const { sendRequest } = useApis()
const actionsContextMenu = [
  {
    label: t('misc.edit'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as PortfolioUser
      selectedUser.value = data
      dialogs.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as PortfolioUser
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
const roles: Role[] = []
const ajaxUrl = apiUrls.tenantUsers.replace(/%tenantId/, tenantId)

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
      data: response.data.items.map((item: PortfolioUser) => ({
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
  url: apiUrls.tenantRoles.replace(/%tenantId/, tenantId),
  onSuccess: {
    callback: (response) => {
      roles.push(...response.data.items)
    }
  }
}
sendRequest(getRoles)

onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})
onUnmounted(() => {
  tabulator.value.destroy()
})

function onUserAdd(data: UserData) {
  const addNewUser: HttpRequest = {
    method: 'post',
    url: `${ajaxUrl}?id=${tenantId}`,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.users.new.success')
    },
    finally: () => {
      dialogs.add = false
    }
  }
  sendRequest(addNewUser)
}

function onUserEdit(data: UserData) {
  if (!selectedUser.value) return
  const editUser: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}${selectedUser.value.user.id}/`,
    data: { role_id: data.role_id },
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.users.edit.success')
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
    url: `${ajaxUrl}${selectedUser.value.user.id}/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.users.delete.success')
    },
    finally: () => {
      dialogs.delete = false
    }
  }
  sendRequest(deleteRequest)
}
</script>
<template>
  <v-container fluid>
    <portal to="header-actions">
      <v-btn
          class="primary-action-btn"
          :disabled="loading"
          data-testid="add-new-user"
          @click="dialogs.add = true"
      >
        {{ $t('misc.add') }}
      </v-btn>
    </portal>
    <v-row dense>
      <v-col cols="12">
        <div ref="table" />
      </v-col>
    </v-row>
    <ManageUsersDialog
      v-if="dialogs.add"
      v-model="dialogs.add"
      :roles="roles"
      type="new"
      @submit="onUserAdd"
    />
    <ManageUsersDialog
      v-if="dialogs.edit"
      v-model="dialogs.edit"
      :roles="roles"
      :user="selectedUser"
      type="edit"
      @submit="onUserEdit"
    />
    <DeleteDialog v-if="dialogs.delete" v-model="dialogs.delete" :title="t('administration.users.delete.title')" :text="t('administration.users.delete.text')" @submit="onUserDelete">
      <strong class="mt-4">{{ selectedUser?.user?.email || '' }}</strong>
    </DeleteDialog>
  </v-container>
</template>
