<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { type CellComponent, type Options, TabulatorFull as Tabulator } from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import { apiUrls } from '@/plugins/axios'
import type { HttpRequest, SchedulesGroup } from '@/types'
import { useRoute, useRouter } from 'vue-router'
import useApis from '@/composables/api'
import { useI18n } from 'vue-i18n'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import EditGroupDialog from './dialogs/EditGroupDialog.vue'
import ManageGroupUsers from './dialogs/ManageGroupUsers.vue'
import { useCustomizerStore } from '@/stores/customizer'

const { setScheduleGroup } = useCustomizerStore()

const emit = defineEmits(['change', 'delete'])

const route = useRoute()
const tenantId = route.params.tenantId as string
const workspaceId = route.params.workspaceId as string

const dialogs = reactive({
  edit: false,
  delete: false,
  users: false
})

const table = ref()
const tabulator = ref()

const { tabulatorOptions, inputHeaderFilter, emptyHeaderFilter, contextActionsFormatter } =
  useTabulatorOptions()
const { t } = useI18n()
const router = useRouter()

const selectedRow = ref<SchedulesGroup>()
const actionsContextMenu = [
  {
    label: t('workspaces.schedules.groups.manageGroup'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as SchedulesGroup
      setScheduleGroup(data)
      router.push({
        name: 'manage-group',
        params: { tenantId: tenantId, workspaceId: workspaceId }
      })
    }
  },
  {
    label: t('misc.rename'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as SchedulesGroup
      selectedRow.value = data
      dialogs.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as SchedulesGroup
      selectedRow.value = data
      dialogs.delete = true
    }
  }
]

const tableDefinition: Options = {
  columns: [
    {
      field: 'name',
      title: t('misc.name'),
      headerSort: false,
      headerHozAlign: 'left',
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like',
      cellClick: (e, cell: CellComponent) => {
        // deselect all rows
        cell.getTable().deselectRow()
        // select clicked row
        cell.getRow().select()
      }
    },
    {
      title: '',
      clickMenu: actionsContextMenu,

      headerSort: false,
      width: 60,
      formatter: contextActionsFormatter
    }
  ],
  ajaxURL: apiUrls.scheduleGroups.replace(/%workspaceId/, workspaceId),
  ...tabulatorOptions,
  layout: 'fitColumns'
}

const onRowSelectionChanged = (data: SchedulesGroup[]) => {
  console.log('group selected : ', data)
  if (!data.length) return
  emit('change', ...data)
}

onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
  tabulator.value.on('rowSelectionChanged', onRowSelectionChanged)
})
onUnmounted(() => {
  tabulator.value.off('rowSelectionChanged', onRowSelectionChanged)
  tabulator.value.destroy()
})

const { sendRequest } = useApis()
const deleteGroup = () => {
  if (!selectedRow.value) return
  const deleteReq: HttpRequest = {
    method: 'delete',
    url: `${apiUrls.scheduleGroups.replace(/%workspaceId/, workspaceId)}${selectedRow.value.id}/`,
    onSuccess: {
      callback: () => {
        refresh()
      },
      message: t('workspaces.schedules.groups.delete.success')
    },
    finally: () => {
      dialogs.delete = false
    }
  }
  sendRequest(deleteReq)
}

const editGroup = (group: SchedulesGroup) => {
  console.log('manage group selected', group)
  if (!selectedRow.value) return
  const editReq: HttpRequest = {
    method: 'patch',
    url: `${apiUrls.scheduleGroups.replace(/%workspaceId/, workspaceId)}${selectedRow.value.id}/`,
    data: group,
    onSuccess: {
      callback: () => {
        refresh()
      },
      message: t('workspaces.schedules.groups.edit.success')
    },
    finally: () => {
      dialogs.edit = false
    }
  }
  sendRequest(editReq)
}
function refresh() {
  tabulator.value.setData()
}
defineExpose({
  refresh
})
</script>
<template>
  <v-container fluid class="ma-0 pa-0">
    <v-row no-gutters>
      <v-col cols="12">
        <div ref="table" />
      </v-col>
    </v-row>

    <DeleteDialog
      v-if="dialogs.delete"
      v-model="dialogs.delete"
      :text="$t('workspaces.schedules.groups.delete.text')"
      @submit="deleteGroup"
    >
      <strong class="mt-4">{{ selectedRow?.name || '' }}</strong>
    </DeleteDialog>
    <EditGroupDialog
      v-if="dialogs.edit"
      v-model="dialogs.edit"
      :value="selectedRow"
      @submit="editGroup"
    />
    <ManageGroupUsers
      v-if="selectedRow?.id && dialogs.users"
      v-model="dialogs.users"
      :group-id="selectedRow?.id"
    />
  </v-container>
</template>
