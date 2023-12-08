<script setup lang="ts">
import {onMounted, onUnmounted, reactive, ref} from 'vue'
import {type CellComponent, type MenuObject, type Options, TabulatorFull as Tabulator} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import {useLoaderStore} from '@/stores/loader'
import {storeToRefs} from 'pinia'
import {apiUrls} from '@/plugins/axios'
import type {HttpRequest, ProjectKpiThreshold, RawKpi} from '@/types'
import {useRoute} from 'vue-router'
import useApis from '@/composables/api'
import {useI18n} from 'vue-i18n'
import {thousandSeparatedFormat} from '@/utils/number'
import ManageKpiDialog from './dialogs/ManageKpiDialog.vue'
import ManageThresholdDialog from './dialogs/ManageThresholdDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import {togglePagination} from "@/utils/pagination";

const { loading } = storeToRefs(useLoaderStore())

const route = useRoute()
const tenantId = route.params.tenantId as string

const dialogs = reactive({
  new: false,
  edit: false,
  delete: false,
  addThreshold: false,
  editThreshold: false,
  deleteThreshold: false
})

const table = ref()
const tabulator = ref()

const { tabulatorOptions, inputHeaderFilter, emptyHeaderFilter, contextActionsFormatter } =
  useTabulatorOptions()
const { t } = useI18n()

const selectedRow = ref<RawKpi>()
const selectedThreshold = ref<ProjectKpiThreshold>()

const kpiActionsMenu: MenuObject<CellComponent>[] = [
  {
    label: t('administration.kpis.thresholds.new.label'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as RawKpi
      selectedRow.value = data
      dialogs.addThreshold = true
    }
  },
  {
    label: t('misc.edit'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as RawKpi
      selectedRow.value = data
      dialogs.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as RawKpi
      selectedRow.value = data
      dialogs.delete = true
    }
  }
]
const thresholdsActionsMenu: MenuObject<CellComponent>[] = [
  {
    label: t('misc.edit'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as ProjectKpiThreshold
      selectedThreshold.value = data
      const row = cell.getRow()
      const parent = row.getTreeParent()
      if (parent) {
        selectedRow.value = parent.getData() as RawKpi
      }
      dialogs.editThreshold = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as ProjectKpiThreshold
      selectedThreshold.value = data
      const row = cell.getRow()
      const parent = row.getTreeParent()
      if (parent) {
        selectedRow.value = parent.getData() as RawKpi
      }
      dialogs.deleteThreshold = true
    }
  }
]
interface IKpi extends RawKpi {
  isKpi: boolean
}
const actionsContextMenu = (e: Event, cell: CellComponent) => {
  const data = cell.getData() as IKpi
  const menu: MenuObject<CellComponent>[] = []

  if (data.isKpi) {
    menu.push(...kpiActionsMenu)
    return menu
  }
  menu.push(...thresholdsActionsMenu)
  return menu
}

const apiUrl = apiUrls.tenantKpis.replace(/%tenantId/, tenantId)
const tableDefinition: Options = {
  columns: [
    {
      field: 'custom_id',
      title: t('misc.id'),
      width: "10%",
      headerHozAlign: 'left',
      cellClick: (e, cell) => {
        const row = cell.getRow()
        row.treeToggle()
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
      headerFilterFunc: 'like',
      cellClick: (e, cell) => {
        const row = cell.getRow()
        row.treeToggle()
      }
    },
    {
      field: 'description',
      title: t('misc.description'),
      headerHozAlign: 'left',
      cellClick: (e, cell) => {
        const row = cell.getRow()
        row.treeToggle()
      }
    },
    {
      field: 'value',
      title: t('administration.kpis.fields.levels'),
      headerSort: false,

      formatter: (cell: CellComponent) => {
        const data = cell.getData() as RawKpi
        if (data.thresholds) return `${data.thresholds.length || ''}`
        const value = cell.getValue()
        if (!value) return ''
        const thresholdData = cell.getData() as ProjectKpiThreshold
        const span = document.createElement('span')
        span.innerHTML = `${thousandSeparatedFormat(value)}`
        span.className = 'score-status-chip'
        span.style.backgroundColor = thresholdData.color
        span.style.color = '#fff'
        return span
      },
      cellClick: (e, cell) => {
        const row = cell.getRow()
        row.treeToggle()
      }
    },
    {
      title: '',
      // @ts-ignore
      clickMenu: actionsContextMenu,

      headerSort: false,
      width: 60,
      formatter: contextActionsFormatter
    }
  ],
  ajaxURL: apiUrl,
  ...tabulatorOptions,
  ajaxResponse: ajaxResponse,
  layout: 'fitColumns',
  dataTree: true,
  dataTreeChildField: 'thresholds',
  dataTreeElementColumn: 'custom_id',
  dataTreeCollapseElement: '<span class="mdi mdi-chevron-up text-h5"></span>',
  dataTreeExpandElement: '<span class="mdi mdi-chevron-down text-h5"></span>',
  dataTreeChildIndent: 40
}

onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})
onUnmounted(() => {
  tabulator.value.destroy()
})

function ajaxResponse(url: string, params: any, response: any) {
  const totalElements = response.data?.total || 0
  const addition = totalElements % params.per_page > 0 ? 1 : 0
  const lastPage = Math.floor(totalElements / params.per_page) + addition
  togglePagination(totalElements);
  const retObj = {
    contentType: 'application/json; charset=utf-8',
    data: response.data.items.map((item: RawKpi) => {
      const { thresholds, ...rest } = item
      return {
        ...rest,
        ...(thresholds?.length ? { thresholds: thresholds } : {}),
        isKpi: true
      }
    }),
    last_page: lastPage
  }
  return retObj
}

const { sendRequest } = useApis()
const newKpi = (data: RawKpi) => {
  const postReq: HttpRequest = {
    method: 'post',
    url: apiUrl,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.kpis.new.success')
    },
    finally: () => {
      dialogs.new = false
    }
  }
  sendRequest(postReq)
}
const editKpi = (kpi: RawKpi) => {
  if (!selectedRow.value) return
  const editReq: HttpRequest = {
    method: 'patch',
    url: `${apiUrl}${selectedRow.value.id}/`,
    data: kpi,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.kpis.edit.success')
    },
    finally: () => {
      dialogs.edit = false
    }
  }
  sendRequest(editReq)
}
const deleteKpi = () => {
  if (!selectedRow.value) return
  const deleteReq: HttpRequest = {
    method: 'delete',
    url: `${apiUrl}${selectedRow.value.id}/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.kpis.delete.success')
    },
    finally: () => {
      dialogs.delete = false
    }
  }
  sendRequest(deleteReq)
}

const newThreshold = (data: ProjectKpiThreshold) => {
  if (!selectedRow.value) return
  const postReq: HttpRequest = {
    method: 'post',
    url: `${apiUrl}${selectedRow.value.id}/threshold/`,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.kpis.thresholds.new.success')
    },
    finally: () => {
      dialogs.addThreshold = false
    }
  }
  sendRequest(postReq)
}
const editThreshold = (data: ProjectKpiThreshold) => {
  if (!selectedRow.value || !selectedThreshold.value) return
  const editReq: HttpRequest = {
    method: 'patch',
    url: `${apiUrl}${selectedRow.value.id}/threshold/${selectedThreshold.value.id}/`,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.kpis.thresholds.edit.success')
    },
    finally: () => {
      dialogs.editThreshold = false
    }
  }
  sendRequest(editReq)
}
const deleteThreshold = () => {
  if (!selectedRow.value || !selectedThreshold.value) return
  const deleteReq: HttpRequest = {
    method: 'delete',
    url: `${apiUrl}${selectedRow.value.id}/threshold/${selectedThreshold.value.id}/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.kpis.thresholds.delete.success')
    },
    finally: () => {
      dialogs.deleteThreshold = false
    }
  }
  sendRequest(deleteReq)
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
      <v-btn
          color="primary"
          :disabled="loading"
          class="primary-action-btn"
          @click="dialogs.new = true"
          data-testid="add"
      >
        {{ $t('misc.add') }}
      </v-btn>
    </portal>
    <v-row dense>
      <v-col cols="12">
        <div ref="table" />
      </v-col>
    </v-row>

    <DeleteDialog
      v-if="dialogs.delete"
      v-model="dialogs.delete"
      :text="$t('administration.kpis.delete.text')"
      :title="$t('administration.kpis.delete.title')"
      @submit="deleteKpi"
    >
      <strong class="mt-4">{{ selectedRow?.name || '' }}</strong>
    </DeleteDialog>
    <ManageKpiDialog v-if="dialogs.new" v-model="dialogs.new" @submit="newKpi" />
    <ManageKpiDialog
      v-if="dialogs.edit"
      v-model="dialogs.edit"
      type="edit"
      :value="selectedRow"
      @submit="editKpi"
    />
    <ManageThresholdDialog
      v-if="dialogs.addThreshold"
      v-model="dialogs.addThreshold"
      @submit="newThreshold"
    />
    <ManageThresholdDialog
      v-if="dialogs.editThreshold"
      v-model="dialogs.editThreshold"
      type="edit"
      :value="selectedThreshold"
      @submit="editThreshold"
    />
    <DeleteDialog
      v-if="dialogs.deleteThreshold"
      v-model="dialogs.deleteThreshold"
      :text="$t('administration.kpis.thresholds.delete.text')"
      @submit="deleteThreshold"
    >
      <strong class="mt-4">{{ selectedThreshold?.name || '' }}</strong>
    </DeleteDialog>
  </v-container>
</template>
