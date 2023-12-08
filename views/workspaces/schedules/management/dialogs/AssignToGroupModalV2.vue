<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { type Options, type RowComponent, TabulatorFull as Tabulator } from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import { apiUrls } from '@/plugins/axios'
import type { SelectedVersion, ViewProject } from '@/types'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  selected: {
    type: Array<SelectedVersion>,
    default: () => [],
    required: false
  },
  selectedScheduleId: {
    type: String,
    required: true
  },
  latest: {
    type: Boolean
  }
})
const selectedProject = computed(() => {
  return props.selectedScheduleId
})
const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const { loading } = storeToRefs(useLoaderStore())

const onSubmit = () => {
  emit('submit', updatedSelectedGroups.value)
}

function close() {
  emit('update:modelValue', false)
}
defineExpose({
  close
})
const updatedSelectedGroups = ref() as any
const disableRowSelectionChanged = ref(true)
function selectRows() {
  const rows: RowComponent[] = tabulator.value.getRows()
  rows.forEach((row) => {
    const rowData = row.getData()
    const action = rowData.project_present ? row.select : row.deselect
    action()
  })
  disableRowSelectionChanged.value = false
}
const route = useRoute()
const workspaceId = route.params.workspaceId as string
const table = ref()
const tabulator = ref()

const { tabulatorOptions, inputHeaderFilter, emptyHeaderFilter } = useTabulatorOptions()
const { t } = useI18n()
const tableDefinition: Options = {
  columns: [
    {
      formatter: 'rowSelection',
      title: '',
      resizable: false,
      minWidth: 30,
      width: 30,

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
      cellClick: (e, cell) => {
        const data = cell.getData() as ViewProject
        const row = cell.getRow()
        if (data.project_versions?.length) {
          row.treeToggle()
          return
        }
        row.toggleSelect()
      }
    }
  ],
  ajaxURL: !props.latest
    ? apiUrls.schedulesAssignedToGroups
        .replace(/%workspaceId/, workspaceId)
        .replace(/%selectedProject/, selectedProject.value)
    : apiUrls.latestSchedulesAssignedToGroups
        .replace(/%workspaceId/, workspaceId)
        .replace(/%selectedProject/, selectedProject.value),
  ...tabulatorOptions,
  ajaxResponse: ajaxResponse,
  layout: 'fitColumns'
}
function ajaxResponse(url: string, params: any, response: any) {
  const totalElements = response.data?.total || 0
  const addition = totalElements % params.per_page > 0 ? 1 : 0
  const lastPage = Math.floor(totalElements / params.per_page) + addition
  updatedSelectedGroups.value = response.data.items
  setTimeout(() => {
    selectRows()
  }, 50)
  const retObj = {
    contentType: 'application/json; charset=utf-8',
    data: response.data.items.map((item: ViewProject) => ({
      ...item,
      name: item.name
    })),
    last_page: lastPage
  }
  return retObj
}

const onRowSelected = (row: RowComponent) => {
  if (disableRowSelectionChanged.value) return
  const data = row.getData() as SelectedVersion
  updatedSelectedGroups.value = updatedSelectedGroups.value.map((version: any) => {
    if (version.id === data.id) return { ...version, project_present: true }
    else return { ...version }
  })
}

const onRowDeselected = (row: RowComponent) => {
  if (disableRowSelectionChanged.value) return
  const data = row.getData() as SelectedVersion
  updatedSelectedGroups.value = updatedSelectedGroups.value.map((version: any) => {
    if (version.id === data.id) return { ...version, project_present: false }
    else return { ...version }
  })
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
  tabulator.value.on('rowSelected', onRowSelected)
  tabulator.value.on('rowDeselected', onRowDeselected)
})
onUnmounted(() => {
  tabulator.value.off('rowSelected', onRowSelected)
  tabulator.value.off('rowDeselected', onRowDeselected)
  tabulator.value.destroy()
})
</script>
<template>
  <v-dialog v-model="show" persistent min-width="600" max-width="1000">
    <v-card>
      <v-card-title>
        <span class="text-h5">
          {{ $t('workspaces.schedules.groups.navigationTitle') }}
        </span>
      </v-card-title>
      <v-card-subtitle>
        {{ 'Assign to a group dialog V2' }}
      </v-card-subtitle>
      <v-col cols="12">
        <v-row no-gutters>
          <v-col cols="12">
            <div ref="table" />
          </v-col>
        </v-row>
      </v-col>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn :disabled="loading" class="primary-action-btn" @click="onSubmit">
          {{ $t('misc.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
