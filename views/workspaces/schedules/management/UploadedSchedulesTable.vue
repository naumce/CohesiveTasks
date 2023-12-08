<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import {
  type CellComponent,
  type Options,
  type RowComponent,
  TabulatorFull as Tabulator
} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import { apiUrls } from '@/plugins/axios'
import type { HttpRequest, SelectedVersion, ViewProjectV2 } from '@/types'
import { useRoute } from 'vue-router'
import useApis from '@/composables/api'
import { isoToStandardString } from '@/utils/date'
import { useI18n } from 'vue-i18n'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import { togglePagination } from '@/utils/pagination'
import AssignToGroupModalV2 from '../management/dialogs/AssignToGroupModalV2.vue'
const props = defineProps({
  selected: {
    type: Array<SelectedVersion>,
    required: true,
    default: () => []
  },
  selectionVisible: {
    type: Boolean
  }
})

const emit = defineEmits(['change', 'delete'])
const disableRowSelectionChanged = ref(false)
watch(
  () => props.selected,
  (newValue) => {
    selectRows(newValue)
  },
  { deep: true }
)

function selectRows(selected: SelectedVersion[]) {
  const rows: RowComponent[] = tabulator.value.getRows()
  disableRowSelectionChanged.value = true
  rows.forEach((row) => {
    const rowData = row.getData()
    const isSelected = (arr: SelectedVersion[], id: number): boolean => {
      return arr.some((item) => item.id === id)
    }
    const action = isSelected(selected, rowData.id) ? row.select : row.deselect
    action()
    const children = row.getTreeChildren() || []
    children.forEach((child) => {
      const childData = child.getData()
      const childAction = isSelected(selected, childData.id) ? child.select : child.deselect
      childAction()
    })
  })
  disableRowSelectionChanged.value = false
}
const route = useRoute()
const workspaceId = route.params.workspaceId as string

const dialogs = reactive({
  delete: false,
  assignToGroup: false
})

const selectedRow = ref<SelectedVersion>()
const selectedScheduleId = ref<string>('')

const { sendRequest } = useApis()
const deleteVersion = () => {
  if (!selectedRow.value) return
  const versionId = selectedRow.value.id
  const deleteRequest: HttpRequest = {
    method: 'delete',
    url: apiUrls.scheduleVersion.replace(/%versionId/, `${versionId}`),
    onSuccess: {
      callback: () => {
        dialogs.delete = false
        selectedRow.value = undefined
        tabulator.value.setData()
        emit('delete')
      },
      message: t('workspaces.schedules.management.delete.success')
    }
  }

  sendRequest(deleteRequest)
}

const table = ref()
const tabulator = ref()
const ifLatest = ref(false)

const { tabulatorOptions, inputHeaderFilter, emptyHeaderFilter, contextActionsFormatter } =
  useTabulatorOptions()
const { t } = useI18n()

const actionsContextMenu = [
  {
    label: t('workspaces.schedules.management.assignToGroup'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as any
      ifLatest.value = data.label.includes('latest')
      selectedScheduleId.value = data.id.toString()
      dialogs.assignToGroup = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as SelectedVersion
      if (data.project_versions) return ''
      selectedRow.value = cell.getData() as SelectedVersion
      dialogs.delete = true
    },
    disabled: (cell: CellComponent) => {
      const data = cell.getData() as SelectedVersion
      return data.project_versions
    }
  }
]
const tableDefinition: Options = {
  columns: [
    {
      formatter: 'rowSelection',
      title: '',
      resizable: false,
      minWidth: 30,
      width: 30,
      visible: props.selectionVisible || false,
      cssClass: 'selection-column',
      headerSort: false,
      cellClick: (e, cell) => {
        cell.getRow().toggleSelect()
      }
    },
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
      formatter: (cell: CellComponent) => {
        const data = cell.getData() as SelectedVersion
        return data.label
      },
      cellClick: (e, cell) => {
        const data = cell.getData() as ViewProjectV2
        const row = cell.getRow()
        if (data.versions?.length) {
          row.treeToggle()
          return
        }
        row.toggleSelect()
      }
    },
    {
      field: 'created',
      title: t('misc.created'),
      headerSort: false,
      resizable: false,
      maxWidth: 100,
      hozAlign: 'left',
      headerHozAlign: 'left',
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (!value) return ''
        return `<small>${isoToStandardString(value)}</small>`
      }
    },
    {
      title: '',
      // @ts-ignore
      clickMenu: actionsContextMenu,
      headerSort: false,
      width: 60,
      formatter: (cell: any) => {
        return contextActionsFormatter(cell)
      }
    }
  ],
  // ajaxURL: apiUrls.schedulesVersions.replace(/%workspaceId/, workspaceId),
  ajaxURL: apiUrls.schedulesVersionsV2.replace(/%workspaceId/, workspaceId),
  ...tabulatorOptions,
  ajaxResponse: ajaxResponseV2,
  layout: 'fitColumns',
  dataTree: true,
  dataTreeChildField: 'project_versions',
  dataTreeElementColumn: 'name',
  dataTreeCollapseElement: '<span class="mdi mdi-chevron-up text-h5"></span>',
  dataTreeExpandElement: '<span class="mdi mdi-chevron-down text-h5"></span>',
  dataTreeChildIndent: 40
}

// function ajaxResponse(url: string, params: any, response: any) {
//   const totalElements = response.data?.total || 0
//   const addition = totalElements % params.per_page > 0 ? 1 : 0
//   const lastPage = Math.floor(totalElements / params.per_page) + addition
//   togglePagination(totalElements)
//   const retObj = {
//     contentType: 'application/json; charset=utf-8',
//     data: response.data.items.map((item: ViewProject) => ({
//       ...item,
//       label: `${item.name} (${t('misc.latest').toLowerCase()})`,
//       selected: props.selected?.some((item) => item.id === item.id),
//       created: item.project_versions[item.project_versions.length - 1].created,
//       activity_codes: item.project_versions?.length
//         ? item.project_versions
//             .sort((a, b) => b.version_id - a.version_id)[0]
//             .activity_codes.map((code) => ({
//               ...code,
//               selected: false,
//               quick_filters: false
//             }))
//         : [],
//       project_versions: item.project_versions.map((version) => ({
//         ...version,
//         activity_codes: version.activity_codes.map((code) => ({
//           ...code,
//           selected: false,
//           quick_filters: false
//         })),
//         name: item.name,
//         label: `${item.name} v${version.version_id}`,
//         selected: props.selected.some((item) => item.id === version.id)
//       }))
//     })),
//     last_page: lastPage
//   }
//   return retObj
// }
function ajaxResponseV2(url: string, params: any, response: any) {
  const totalElements = response.data?.total || 0
  const addition = totalElements % params.per_page > 0 ? 1 : 0
  const lastPage = Math.floor(totalElements / params.per_page) + addition
  console.log('response data in Schedules', response.data)
  togglePagination(totalElements)
  const retObj = {
    contentType: 'application/json; charset=utf-8',
    data: response.data.items.map((item: ViewProjectV2) => ({
      ...item,
      label: `${item.name} (${t('misc.latest').toLowerCase()})`,
      selected: props.selected?.some((item) => item.id === item.id),
      created: item.versions[item.versions.length - 1].created,
      activity_codes: item.versions?.length
        ? item.versions.sort((a: any, b: any) => b.id - a.id)[0]
        : // .activity_codes.map((code: any) => ({
          //   ...code,
          //   selected: false,
          //   quick_filters: false
          // }))
          [],
      project_versions: item.versions.map((version: any) => ({
        ...version,
        activity_codes: {
          selected: false,
          quick_filters: false
        },
        name: item.name,
        label: `${item.name} v${version.id}`,
        selected: props.selected.some((item) => item.id === version.id)
      }))
    })),
    last_page: lastPage
  }
  return retObj
}

const onRowSelected = (row: RowComponent) => {
  if (disableRowSelectionChanged.value) return
  const data = row.getData() as SelectedVersion
  const latestProject = data.project_versions?.length
    ? data.project_versions.sort((a, b) => b.version_id - a.version_id)[0]
    : null
  const selectedData = [
    ...props.selected,
    {
      id: data.id,
      name: data.name,
      label: data.label,
      latestProjectId: latestProject?.id || null,
      selected: true,
      order: data.order || null,
      activity_codes: data.activity_codes,
      created: data.created || '',
      ...(data.project_versions ? { project_versions: data.project_versions } : {})
    }
  ]
  emit('change', selectedData)
}

const onDataProcessed = () => {
  // select rows when data is processed due to paging etc
  selectRows(props.selected)
}
const onRowDeselected = (row: RowComponent) => {
  if (disableRowSelectionChanged.value) return
  const data = row.getData() as SelectedVersion
  const selectedData = props.selected.filter((version) => version.id !== data.id)
  emit('change', selectedData)
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
  tabulator.value.on('dataProcessed', onDataProcessed)
  tabulator.value.on('rowSelected', onRowSelected)
  tabulator.value.on('rowDeselected', onRowDeselected)
})
onUnmounted(() => {
  tabulator.value.off('dataProcessed', onDataProcessed)
  tabulator.value.off('rowSelected', onRowSelected)
  tabulator.value.off('rowDeselected', onRowDeselected)
  tabulator.value.destroy()
})

function refresh() {
  tabulator.value.setData()
}
defineExpose({
  refresh
})

// const assignToGroup = (selectedGroups: any) => {
//   const postSelectedGroups: HttpRequest = {
//     method: 'post',
//     url: !ifLatest.value
//       ? apiUrls.schedulesAssignedToGroups
//           .replace(/%workspaceId/, workspaceId)
//           .replace(/%selectedProject/, selectedScheduleId.value)
//       : apiUrls.latestSchedulesAssignedToGroups
//           .replace(/%workspaceId/, workspaceId)
//           .replace(/%selectedProject/, selectedScheduleId.value),
//     data: selectedGroups,
//     onSuccess: {
//       callback: () => {
//         // tabulator.value.setData()
//       },
//       message: t('workspaces.schedules.management.assignedToGroupSuccess')
//     },
//     finally: () => {
//       dialogs.assignToGroup = false
//     }
//   }
//   sendRequest(postSelectedGroups)
// }

const assignToGroupV2 = (selectedGroups: any) => {
  console.log('selectedGroup', selectedGroups)
  const postSelectedGroups: HttpRequest = {
    method: 'post',
    url: !ifLatest.value
      ? apiUrls.schedulesAssignedToGroups
          .replace(/%workspaceId/, workspaceId)
          .replace(/%selectedProject/, selectedScheduleId.value)
      : apiUrls.latestSchedulesAssignedToGroups
          .replace(/%workspaceId/, workspaceId)
          .replace(/%selectedProject/, selectedScheduleId.value),
    data: selectedGroups,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('workspaces.schedules.management.assignedToGroupSuccess')
    },
    finally: () => {
      dialogs.assignToGroup = false
    }
  }
  sendRequest(postSelectedGroups)
}
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
      :text="$t('workspaces.schedules.management.delete.text')"
      @submit="deleteVersion"
    >
      <strong class="mt-4">{{ selectedRow?.label || '' }}</strong>
    </DeleteDialog>
    <!-- <AssignToGroupModal
      v-if="dialogs.assignToGroup"
      :latest="ifLatest"
      :selectedScheduleId="selectedScheduleId"
      v-model="dialogs.assignToGroup"
      @submit="assignToGroup"
    /> -->
    <AssignToGroupModalV2
      v-if="dialogs.assignToGroup"
      :latest="ifLatest"
      :selectedScheduleId="selectedScheduleId"
      v-model="dialogs.assignToGroup"
      @submit="assignToGroupV2"
    />
  </v-container>
</template>
