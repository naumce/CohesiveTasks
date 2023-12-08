<script setup lang="ts">
import {onMounted, onUnmounted, reactive, ref} from 'vue'
import {type CellComponent, type Options, type RowComponent, TabulatorFull as Tabulator} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import {useLoaderStore} from '@/stores/loader'
import {storeToRefs} from 'pinia'
import {apiUrls} from '@/plugins/axios'
import type {HttpRequest, RiskMatrixRaw} from '@/types'
import {useRoute} from 'vue-router'
import useApis from '@/composables/api'
import {useI18n} from 'vue-i18n'
import MatrixDetails from './components/MatrixDetails.vue'
import ManageMatrixDialog from './dialogs/ManageMatrixDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import {togglePagination} from "@/utils/pagination";

const { loading } = storeToRefs(useLoaderStore())

const route = useRoute()
const tenantId = route.params.tenantId as string

const dialogs = reactive({
  new: false,
  edit: false,
  delete: false
})

const table = ref()
const tabulator = ref()

const { tabulatorOptions, inputHeaderFilter, emptyHeaderFilter, contextActionsFormatter } =
  useTabulatorOptions()
const { t, te } = useI18n()

const selectedRow = ref<RiskMatrixRaw>()
const actionsContextMenu = [
  {
    label: t('misc.edit'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as RiskMatrixRaw
      selectedRow.value = data
      dialogs.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as RiskMatrixRaw
      selectedRow.value = data
      dialogs.delete = true
    }
  }
]

const apiUrl = apiUrls.matrix.replace(/%tenantId/, tenantId)
const tableDefinition: Options = {
  columns: [
    {
      field: 'custom_id',
      title: t('misc.id'),
      headerHozAlign: 'left'
    },
    {
      field: 'type',
      title: t('misc.type'),
      headerHozAlign: 'left',
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (!value) return ''
        if (!te(`administration.matrixes.type.${value}`)) return value
        return t(`administration.matrixes.type.${value}`)
      }
    },
    {
      field: 'name',
      title: t('misc.name'),
      headerHozAlign: 'left',
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
    },
    {
      field: 'description',
      title: t('misc.description'),
      headerHozAlign: 'left'
    },
    {
      field: 'size',
      title: t('misc.size'),

      headerSort: false
    },
    {
      title: '',
      clickMenu: actionsContextMenu,

      headerSort: false,
      width: 60,
      formatter: contextActionsFormatter
    }
  ],
  ajaxURL: apiUrl,
  ...tabulatorOptions,
  layout: 'fitColumns',
  ajaxResponse: (url: string, params: any, response: any) => {
    const totalElements = response.data?.total || 0
    const addition = totalElements % params.per_page > 0 ? 1 : 0
    const lastPage = Math.floor(totalElements / params.per_page) + addition
    togglePagination(totalElements);
    const retObj = {
      contentType: 'application/json; charset=utf-8',
      data: response.data.items.map((item: RiskMatrixRaw) => ({
        ...item,
        size: `${item.probabilities.length} * ${item.severities.length}`
      })),
      last_page: lastPage
    }
    return retObj
  }
}

const onRowClick = (e: Event, row: RowComponent) => {
  selectedRow.value = row.getData() as RiskMatrixRaw
  row.getTable().deselectRow()
  row.select()
}

const onDataProcessed = () => {
  if (!selectedRow.value) return
  const allRows = tabulator.value.getRows()
  const selectedOnPage = allRows.find(
    (row: RowComponent) => selectedRow.value?.id === row.getData().id
  )
  if (!selectedOnPage) return
  selectedOnPage.select()
}

onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
  tabulator.value.on('rowClick', onRowClick)
  tabulator.value.on('dataProcessed', onDataProcessed)
})
onUnmounted(() => {
  tabulator.value.off('rowClick', onRowClick)
  tabulator.value.off('dataProcessed', onDataProcessed)
  tabulator.value.destroy()
})

const { sendRequest } = useApis()
const newMatrix = (data: RiskMatrixRaw) => {
  const postReq: HttpRequest = {
    method: 'post',
    url: apiUrl,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.matrixes.new.success')
    },
    finally: () => {
      dialogs.new = false
    }
  }
  sendRequest(postReq)
}
const editMatrix = (fact: RiskMatrixRaw) => {
  if (!selectedRow.value) return
  const editReq: HttpRequest = {
    method: 'patch',
    url: `${apiUrl}/${selectedRow.value.id}/`,
    data: fact,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.matrixes.edit.success')
    },
    finally: () => {
      dialogs.edit = false
    }
  }
  sendRequest(editReq)
}
const deleteMatrix = () => {
  if (!selectedRow.value) return
  const deleteReq: HttpRequest = {
    method: 'delete',
    url: `${apiUrl}/${selectedRow.value.id}/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.matrixes.delete.success')
    },
    finally: () => {
      dialogs.delete = false
    }
  }
  sendRequest(deleteReq)
}

const onDetailsChange = () => {
  tabulator.value.setData()
}
function refresh() {
  tabulator.value.setData()
}
defineExpose({
  refresh
})
</script>
<template>
  <v-container fluid>
    <portal to="header-actions">
      <v-btn :disabled="loading" class="primary-action-btn" @click="dialogs.new = true" data-testid="add">
        {{ $t('misc.add') }}
      </v-btn>
    </portal>
    <v-row dense>
      <v-col cols="12">
        <div ref="table" />
      </v-col>
      <v-col cols="12" v-if="selectedRow">
        <MatrixDetails :matrix="selectedRow" :key="selectedRow?.id" @change="onDetailsChange" />
      </v-col>
    </v-row>

    <ManageMatrixDialog v-if="dialogs.new" v-model="dialogs.new" @submit="newMatrix" />
    <ManageMatrixDialog
      v-if="dialogs.edit"
      v-model="dialogs.edit"
      type="edit"
      :value="selectedRow"
      @submit="editMatrix"
    />
    <DeleteDialog
      v-if="dialogs.delete"
      v-model="dialogs.delete"
      :text="$t('administration.matrixes.delete.text')"
      :title="$t('administration.matrixes.delete.title')"
      @submit="deleteMatrix"
    >
      <strong class="mt-4">{{ selectedRow?.name || '' }}</strong>
    </DeleteDialog>
  </v-container>
</template>
