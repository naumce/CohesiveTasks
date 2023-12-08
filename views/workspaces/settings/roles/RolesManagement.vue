<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  TabulatorFull as Tabulator,
  type Options,
  type CellComponent,
  type ColumnDefinition
} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import AddDialog from './dialogs/AddDialog.vue'
import EditDialog from './dialogs/EditDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
// import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import type { HttpRequest, EventCharacterizationPostRole } from '@/types'
import { allPermissionsObject } from '@/constants/permissions'

const route = useRoute()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`
const { tabulatorOptions, contextActionsFormatter, inputHeaderFilter, emptyHeaderFilter } =
  useTabulatorOptions()

const { t } = useI18n()
const selectedRole = ref()
const { sendRequest } = useApis()
const actionsContextMenu = [
  {
    label: t('misc.edit'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData()
      selectedRole.value = data
      dialogs.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData()
      selectedRole.value = data
      console.log('TEST: ', selectedRole.value)
      dialogs.delete = true
    }
  }
]

const columns: Array<ColumnDefinition> = [
  {
    field: 'name',
    title: t('misc.name'),
    hozAlign: 'left',
    headerHozAlign: 'left',
    // @ts-ignore
    headerPopup: inputHeaderFilter,
    headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: 'like'
  },
  {
    field: 'permissions',
    title: t('workspaces.settings.rolesManagement.permissions'),
    hozAlign: 'left',
    headerHozAlign: 'left',
    headerSort: false,
    sorter: 'string',
    sorterParams: {
      locale: true
    },
    formatter: (cell: CellComponent) => {
      const value = cell.getValue()
      const values = value.map((item: any) => allPermissionsObject[item]?.text).filter(Boolean)
      const container = document.createElement('div')
      container.style.fontSize = '12px'
      container.style.lineHeight = '3'
      container.style.float = 'left'
      container.style.whiteSpace = 'normal'
      container.style.width = '70%'
      container.style.verticalAlign = 'middle'

      values.forEach((v: string) => {
        const span = document.createElement('span')
        span.style.margin = '5px'
        span.style.paddingLeft = '5px'
        span.style.paddingRight = '5px'
        span.style.color = 'blue'
        span.style.border = '1px solid blue'
        span.style.borderRadius = '10px'
        span.style.display = 'inline-block'
        span.innerHTML += v
        container.appendChild(span)
      })

      return container
    }
  },
  {
    title: '',
    clickMenu: actionsContextMenu,
    hozAlign: 'left',
    headerSort: false,
    width: 60,
    formatter: contextActionsFormatter
  }
]
const dialogs = reactive({
  add: false,
  edit: false,
  delete: false
})
const table = ref()
const tabulator = ref()
const roles: any[] = []
const ajaxUrl = `${apiUrls.userRoles
  .replace(/%tenantId/, tenantId)
  .replace(/%projectCard/, projectId)}`

const tableDefinition: Options = {
  columns: columns,
  ajaxURL: ajaxUrl,
  ...tabulatorOptions
}

onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})

function onRoleAdd(data: EventCharacterizationPostRole) {
  const addNewUser: HttpRequest = {
    method: 'post',
    url: `${apiUrls.userRoles.replace(/%tenantId/, tenantId).replace(/%projectCard/, projectId)}`,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('workspaces.settings.rolesManagement.addNewRoleSuccess').replace(
        /%name/,
        data.name
      )
    },
    finally: () => {
      AddNewRoleDialogOpen()
    }
  }
  sendRequest(addNewUser)
}

function onRoleEdit(data: EventCharacterizationPostRole) {
  const editUser: HttpRequest = {
    method: 'patch',
    url: `${apiUrls.userRoles
      .replace(/%tenantId/, tenantId)
      .replace(/%projectCard/, projectId)}role/${selectedRole.value.id}/`,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('workspaces.settings.rolesManagement.editRoleSuccess').replace(/%name/, data.name)
    },
    finally: () => {
      dialogs.edit = false
    }
  }
  sendRequest(editUser)
}

function onRoleDelete() {
  const deleteRequest: HttpRequest = {
    method: 'delete',
    url: `${apiUrls.userRoles
      .replace(/%tenantId/, tenantId)
      .replace(/%projectCard/, projectId)}role/${selectedRole.value.id}/`,
    data: { role_id: selectedRole.value.id, tenant_fkey: parseInt(tenantId) },
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('workspaces.settings.rolesManagement.deleteSuccess').replace(
        /%role/,
        selectedRole.value.name
      )
    },
    finally: () => {
      dialogs.delete = false
    }
  }
  sendRequest(deleteRequest)
}

function AddNewRoleDialogOpen() {
  dialogs.add = !dialogs.add
}
</script>
<template>
  <v-container fluid>
    <portal to="header-actions">
      <v-btn
          class="primary-action-btn"
          data-testid="create-new-role"
          @click="AddNewRoleDialogOpen"
      >
        {{ $t('misc.add') }}
      </v-btn>
    </portal>
    <v-row no-gutters>
      <v-col cols="12">
        <div ref="table" />
      </v-col>
    </v-row>
    <AddDialog v-if="dialogs.add" :roles="roles" v-model="dialogs.add" @submit="onRoleAdd" />
    <EditDialog
      v-if="dialogs.edit"
      v-model="dialogs.edit"
      :roles="roles"
      :role="selectedRole"
      @submit="onRoleEdit"
    />
    <DeleteDialog
      v-if="dialogs.delete"
      v-model="dialogs.delete"
      :title="$t(`workspaces.settings.rolesManagement.delete`)"
      :text="$t(`workspaces.settings.rolesManagement.deleteDialogText`)"
      @submit="onRoleDelete"
    >
      <strong class="mt-4">{{ selectedRole?.name || '' }}</strong>
    </DeleteDialog>
  </v-container>
</template>
