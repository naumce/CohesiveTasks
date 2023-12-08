<script setup lang="ts">
import {onMounted, onUnmounted, reactive, ref} from 'vue'
import {
  type CellComponent,
  type ColumnDefinition,
  type Options,
  type RowComponent,
  TabulatorFull as Tabulator
} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import AddDialog from './dialogs/AddDialog.vue'
import EditDialog from './dialogs/EditDialog.vue'
import DiscardDialog from './dialogs/DiscardDialog.vue'
import UpdateStatusDialog from './dialogs/UpdateStatusDialog.vue'
import UploadFileDialog from './dialogs/UploadFileDialog.vue'
import {apiUrls} from '@/plugins/axios'
import useApis from '@/composables/api'
import {useI18n} from 'vue-i18n'
import {useRoute} from 'vue-router'
import {useAlertsStore} from '@/stores/alerts'
import type {HttpRequest, Transactions} from '@/types'
import {TransactionFinancialTypeObject, TransactionsStatusObject} from './constants'
import {togglePagination} from "@/utils/pagination";
import {formatNumber} from "@/utils/number";
import { useCustomizerStore } from '@/stores/customizer'
const { canModify } = useCustomizerStore()
const modifyEnabled = canModify([
  'TENANT_ADMIN', 
  'PROJECT_ADMINISTRATION',
  'PROJECT_FINANCE_EDIT'
])

const { t } = useI18n()
const {
  inputHeaderFilter,
  emptyHeaderFilter,
  dateHeaderFilter,
  numberHeaderFilter,
  enumHeaderFilter
} = useTabulatorOptions()
var selectedIDs:any = reactive([])
var filter = ''
const phases = ref([])
const reasons = ref()
const route = useRoute()
// const workspaceId = `${route.params.workspaceId}`
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`

const { sendRequest } = useApis()
const getReasons: HttpRequest = {
  method: 'get',
  url: `${apiUrls.reasons.replace(/%tenantId/, tenantId)}`,
  onSuccess: {
    callback: (response) => {
      reasons.value = response.data.items
      tabulator.value.updateColumnDefinition('transaction_category___name', {
        headerFilterParams: {
          values: reasons.value?.map((item: any) => item.name),
          disableCase: true,
          disableReplace: true
        }
      })
    }
  }
}


const statuses = [
  { name: 'Pending', id: 'PENDING' },
  { name: 'Approved', id: 'APPROVED' },
  { name: 'Rejected', id: 'REJECTED' },
  { name: 'Discarded', id: 'DISCARDED' }
]
const columns: Array<ColumnDefinition> = [
  {
    title: '',
    formatter: 'rowSelection',
    titleFormatter: 'rowSelection',
    hozAlign: 'center',
    headerHozAlign:'center',
    cssClass:'rowSelection',
    headerSort: false,
    cellClick: function (e, cell) {
      cell.getRow().toggleSelect()
    },
    visible: modifyEnabled ? true : false
  },
  {
    field: 'custom_id',
    title: t('workspaces.financials.transactions.fields.transactionId'),
    minWidth: 180,
    hozAlign: 'center',
    sorter: 'string',
    // @ts-ignore
    headerPopup: inputHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: 'like',
    visible: true,
    formatter: (cell: CellComponent) => {
      const value = cell.getValue()
      const data = cell.getData() as Transactions
      if (value && data.is_outside_phase)
        return (
            value +
            "<span title='The transaction is outside of phase dates' class='mdi mdi-information-outline'></span>"
        )
      else if (value && !data.is_outside_phase) return value
    }
  },
  {
    field: 'phase___name',
    title: t('workspaces.financials.transactions.fields.phase'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 180,
    // @ts-ignore
    headerPopup: enumHeaderFilter,
    // @ts-ignore
    headerFilterParams: { values: phases.value?.map((item) => item.name) },
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: 'in',
    visible: true
  },
  {
    field: 'financial_type',
    title: t('workspaces.financials.transactions.fields.financialType'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 180,
    // @ts-ignore
    headerPopup: enumHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    formatter: (cell: CellComponent) => {
      const data = cell.getData() as Transactions
      return TransactionFinancialTypeObject[data.financial_type]?.text
    },
    headerFilterFunc: 'in',
    headerFilter: emptyHeaderFilter,
    headerFilterParams: { values: ['Revenue', 'Actual cost', 'Change order', 'Original budget'] },
    visible: true
  },
  {
    field: 'transaction_category___name',
    title: t('workspaces.financials.transactions.fields.category'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 180,
    // @ts-ignore
    headerPopup: enumHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: 'in',
    headerFilterParams: { values: reasons?.value?.map((r: any) => console.log(r)) },
    formatter: (cell: CellComponent) => {
      return cell.getValue()
    },
    visible: true
  },
  {
    field: 'status',
    title: t('workspaces.financials.transactions.fields.status'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 140,
    // @ts-ignore
    headerPopup: enumHeaderFilter,
    headerFilterFunc: 'in',
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilterParams: { values: statuses.map((s: any) => s.name) },
    headerFilter: emptyHeaderFilter,
    formatter: (cell: CellComponent) => {
      const value = cell.getValue()
      const span = document.createElement('span')
      const data = cell.getData() as Transactions
      const status = TransactionsStatusObject[data.status]?.text.toUpperCase()
      span.style.color =
          status === 'REJECTED'
              ? 'red'
              : status === 'PENDING'
                  ? 'orange'
                  : status === 'APPROVED'
                      ? 'green'
                      : status === 'DISCARDED'
                          ? 'gray'
                          : ''
      span.innerText = value && TransactionsStatusObject[data.status]?.text
      return span
    },
    visible: true
  },
  {
    field: 'effective_date',
    title: t('workspaces.financials.transactions.fields.effectiveDate'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 180,
    // @ts-ignore
    headerPopup: dateHeaderFilter,
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: '>',
    headerFilterFuncParams: 'useGtLt',
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    visible: true
  },
  {
    field: 'value',
    title: t('workspaces.financials.transactions.fields.amount'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 140,
    // @ts-ignore
    headerPopup: numberHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: '>',
    headerFilterFuncParams: 'useGtLt',
    formatter: (cell: CellComponent) => {
      const isNegative = formatNumber(cell.getValue()).includes('-');
      return cell.getValue() !== null
          ? `<div class="${isNegative ? 'text-red' : ''}">${formatNumber(cell.getValue())}</div>`
          : ''
    },
    visible: true
  },
  {
    field: 'description',
    title: t('workspaces.financials.transactions.fields.description'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 200,
    // @ts-ignore
    headerPopup: inputHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: 'like',
    formatter: (cell: CellComponent) => {
      return cell.getValue()
    },
    visible: true
  },
  {
    field: 'assigned_by_user___name',
    title: t('workspaces.financials.transactions.fields.assignedBy'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 250,
    // @ts-ignore
    headerPopup: inputHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: 'like',
    formatter: (cell: CellComponent) => {
      return cell.getValue()
    },
    visible: false
  },
  {
    field: 'assigned_date',
    title: t('workspaces.financials.transactions.fields.assignedDate'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 180,
    // @ts-ignore
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerPopup: dateHeaderFilter,
    headerFilter: emptyHeaderFilter,
    visible: false,
    headerFilterFunc: '>',
    headerFilterFuncParams: 'useGtLt'
  },
  {
    field: 'updated_by___name',
    title: t('workspaces.financials.transactions.fields.updatedBy'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 250,
    // @ts-ignore
    headerPopup: inputHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: 'like',
    formatter: (cell: CellComponent) => {
      return cell.getValue()
    },
    visible: false
  },
  {
    field: 'updated_at',
    title: t('workspaces.financials.transactions.fields.updatedAt'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 180,
    // @ts-ignore
    headerPopup: dateHeaderFilter,
    headerFilter: emptyHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    visible: false,
    headerFilterFunc: '>',
    headerFilterFuncParams: 'useGtLt'
  },
  {
    field: 'comment',
    title: t('workspaces.financials.transactions.fields.statusComment'),
    hozAlign: 'center',
    sorter: 'string',
    minWidth: 150,
    visible: false
  },
  {
    formatter: (cell: CellComponent) => {
      const span = document.createElement('span')
      span.classList.add('mdi')
      span.classList.add('mdi-pencil')
      span.title = t('misc.edit')
      span.style.display = 'none' // initially hide span
      span.style.verticalAlign = 'middle'
      span.style.fontSize = '20px'
      span.style.cursor = 'pointer'
      const row = cell.getRow()
      row.getElement().addEventListener('mouseenter', () => {
        span.style.display = 'inline'
      })
      row.getElement().addEventListener('mouseleave', () => {
        span.style.display = 'none'
      })
      return span
    },
    title: '',
    resizable: false,
    minWidth: 30,
    width: 50,
    hozAlign: 'center',
    headerSort: false,
    frozen: true,
    visible: modifyEnabled ? true : false,
    cellClick: (e, cell) => {
      const data = cell.getData()
      selectedTransaction.value = data
      dialogs.edit = true
    }
  }
]

const { showAlert } = useAlertsStore()
const selectedTransaction = ref()
const selectedData = ref([])
const dialogs = reactive({
  add: false,
  edit: false,
  delete: false,
  update: false,
  uploadFile: false
})
const status = ref()
const table = ref()
const tabulator = ref()
const url = `${apiUrls.phaseGates.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId)}/`
const getPhases: HttpRequest = {
  method: 'get',
  url: url,
  onSuccess: {
    callback: (response) => {
      phases.value = response.data.items.filter((p: any) => p.type === 'phase')
      tabulator.value.updateColumnDefinition('phase___name', {
        headerFilterParams: {
          values: phases.value?.map((item: any) => item.name),
          disableCase: true
        }
      }).then(()=>{
        onDataProcessed();
      })
    }
  }
}


const ajaxUrl = `${apiUrls.transactions
    .replace(/%tenantId/, tenantId)
    .replace(/%projectId/, projectId)}`

const coloums = ref(columns)
const showSelectColoums = ref(false)
var totalElements = 0
var errorMsg = ''
const { tabulatorOptions } = useTabulatorOptions()
const tableDefinition: Options = {
  columns: columns,
  ajaxURL: ajaxUrl,
  ...tabulatorOptions,
  paginationSize: 99999,
  sortMode: 'remote',
  filterMode: 'remote',
  ajaxResponse: (url: string, params: any, response: any) => {
    totalElements = response.data?.total || 0
    const addition = totalElements % params.per_page > 0 ? 1 : 0
    const lastPage = Math.floor(totalElements / params.per_page) + addition
    togglePagination('none')
    const retObj = {
      contentType: 'application/json; charset=utf-8',
      data: response.data.items.map((item: any) => ({
        ...item,
        custom_id: item.custom_id,
        phase___name: item.phase.name,
        transaction_category___name: item.transaction_category.name,
        assigned_by_user___name: item.assigned_by_user.name,
        description: item.description,
        updated_by___name: item.updated_by.name
      })),
      last_page: lastPage
    }
    return retObj

  }
}
const disableRowSelectionChanged = ref(false)

const onDataProcessed = () => {
  const rows: RowComponent[] = tabulator.value.getRows()
  disableRowSelectionChanged.value = true
  rows.forEach((row) => {
    const rowData = row.getData()
    const isSelected = (arr: number[], id: number): boolean => {
      return arr.some((itemId) => itemId === id)
    }
    const action = isSelected(selectedIDs, rowData.id) ? row.select : row.deselect
    action();
  })
  disableRowSelectionChanged.value = false

}

onMounted(() => {
  sendRequest(getReasons)
  sendRequest(getPhases)
  tabulator.value = new Tabulator(table.value, tableDefinition)
  tabulator.value.on('dataProcessed', onDataProcessed)
  tabulator.value.on('rowSelected', onRowSelected)
  tabulator.value.on('rowDeselected', onRowDeselected)
})

onUnmounted(() => {
  tabulator.value.off('dataProcessed', onDataProcessed)
  tabulator.value.off('rowSelected', onRowSelected)
  tabulator.value.off('rowDeselected', onRowDeselected)
})

const toggleShowSelectColoums = () => (showSelectColoums.value = !showSelectColoums.value)

const setColumns = () => {
  const activeColumns = coloums.value.filter((item) => item.visible)
  tabulator.value.setColumns(activeColumns)
  toggleShowSelectColoums()
  tabulator.value.setData()
}

function onTransactionAdd(data: any) {
  AddNewTransactionDialogOpen()
  const addNewTransaction: HttpRequest = {
    method: 'post',
    url: `${apiUrls.transactions.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId)}`,
    data: data,
    onSuccess: {
      callback: (response) => {
        tabulator.value.setData()
      },
      message: t('workspaces.financials.transactions.addNewTransactionSuccess').replace(
          /%custom_id/,
          data.custom_id
      )
    },
    finally: () => {
      dialogs.add = false
    }
  }
  sendRequest(addNewTransaction)
}

function onTransactionEdit(data: any, saveandclose: boolean) {
  const editTransaction: HttpRequest = {
    method: 'patch',
    url: `${apiUrls.transactions.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId)}${
        selectedTransaction.value.id
    }/`,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('workspaces.financials.transactions.editTransactionSuccess').replace(
          /%custom_id/,
          data.custom_id
      )
    },
    finally: () => {
      dialogs.edit = saveandclose
    }
  }
  sendRequest(editTransaction)
}

function onTransactionDiscard() {
  const discardRequest: HttpRequest = {
    method: 'delete',
    url: `${apiUrls.transactions.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId)}${
        selectedTransaction.value.id
    }/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('workspaces.financials.transactions.deleteTransactionSuccess').replace(
          /%custom_id/,
          selectedTransaction.value.custom_id
      )
    },
    finally: () => {
      dialogs.delete = false
    }
  }
  sendRequest(discardRequest)
}

const onRowSelected = () => {
  selectedData.value = tabulator.value.getSelectedData()
  selectedIDs =  [...tabulator.value.getSelectedData().map((r: any) => r.id),...selectedIDs];
}

const onRowDeselected = () => {
  selectedData.value = tabulator.value.getSelectedData()
  selectedIDs =  tabulator.value.getSelectedData().map((r: any) => r.id);
}

function AddNewTransactionDialogOpen() {
  dialogs.add = !dialogs.add
}

function exportCsv() {
  if (selectedData.value.length) filter = `&filter={"id__in":[${selectedIDs}]}`
  else if (totalElements)
    filter = `&filter={"id__in":[${tabulator.value.getData()?.map((item: any) => item.id)}]}`
  else filter = ''
  const getCsvFile: HttpRequest = {
    method: 'get',
    url: ajaxUrl + `csv/?${filter}`,
    onSuccess: {
      callback: (response) => {
        var downloadLink = document.createElement('a')
        var blob = new Blob(['\ufeff', response.data])
        var url = URL.createObjectURL(blob)
        downloadLink.href = url
        downloadLink.download = 'data.csv'
        document.body.appendChild(downloadLink)
        downloadLink.click()
      }
    }
  }
  sendRequest(getCsvFile)
}

function openImportCsv() {
  dialogs.uploadFile = true
}

function changeStatusOpenDialog(event: any) {
  dialogs.update = true
}

function onUpdateMultipleStatuses() {
  if (selectedData.value.length && totalElements !== selectedData.value.length)
    filter = `&filter={"id__in":[${selectedIDs}]}`
  else if (totalElements === selectedData.value.length)
    filter = `&filter={"id__in":[${selectedIDs}]}`
  else filter = ''

  const changeMultipleTransactions: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}batch_update/?${filter}`,
    data: { status: status.value },
    onSuccess: {
      callback: (response) => {
        tabulator.value.setData()
        dialogs.update = false
        status.value = null
        selectedData.value = []
        selectedIDs = []
      },
      message: t('workspaces.financials.transactions.updateSuccess').replace(
          /%selected_transactions/,
          selectedData.value.length.toString()
      )
    }
  }
  sendRequest(changeMultipleTransactions)
}

function closeUpdateMultiple() {
  status.value = null
  dialogs.update = false
}

const onFileUpload = (formData: FormData) => {
  const uploadFile: HttpRequest = {
    method: 'post',
    url: ajaxUrl + `import/`,
    data: formData,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
        dialogs.uploadFile = false
      },
      message: t('workspaces.financials.transactions.importSuccess')
    },
    onError: {
      callback: (error: any) => {
        showAlert({ type: 'error', message: error?.response?.data?.message })
      }
    }
  }
  sendRequest(uploadFile)
}
</script>
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <div class="mt-n16 mb-5">
          <v-btn v-if="modifyEnabled" class="secondary-action-btn" @click="openImportCsv">
            {{ $t('misc.import') }}
          </v-btn>
          <v-btn class="secondary-action-btn ml-4" @click="exportCsv">
            {{ $t('misc.export') }}
          </v-btn>
        </div>
      </v-col>
      <v-card width="100%" fluid>
        <v-row class="justify-end pa-6 mb-n7">

          <span class="flex">
            <v-select
                class="selectStatus"
                @update:model-value="changeStatusOpenDialog"
                variant="outlined"
                density="compact"
                v-if="!!selectedData.length"
                v-model="status"
                :label="$t('workspaces.financials.transactions.changeStatusTo')"
                :items="statuses?.map((t: any) => ({ title: t.name, value: t.id }))"
                data-testid="status"
            >
            </v-select>
            <v-menu v-model="showSelectColoums" :close-on-content-click="false" location="end">
              <template v-slot:activator="{ props }">
                <v-btn class="secondary-action-btn" v-bind="props" data-testid="select-columns">
                  {{ $t('workspaces.financials.transactions.selectColumns') }}
                </v-btn>
              </template>
              <v-card max-width="510">
                <v-container fluid>
                  <v-list>
                    <v-row no-gutters>
                      <template v-for="(column, index) in coloums">
                        <v-col cols="12" sm="6" :key="index" v-if="column.title">
                          <v-list-item>
                            <v-switch
                                v-model="column.visible"
                                color="secondary"
                                :label="column.title"
                                hide-details
                            />
                          </v-list-item>
                        </v-col>
                      </template>
                    </v-row>
                  </v-list>
                </v-container>
                <v-card-actions>
                  <v-spacer />
                  <v-btn class="primary-negative-btn" @click="showSelectColoums = false">
                    {{ $t('misc.cancel') }}
                  </v-btn>
                  <v-btn class="primary-action-btn" @click="setColumns" data-testid="confirm">
                    {{ $t('misc.confirm') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </span>
          <v-btn
              class="primary-action-btn ml-4"
              v-if="modifyEnabled"
              @click="AddNewTransactionDialogOpen"
              data-testid="add-new-transaction"
          >
            {{ $t('misc.add') }}
          </v-btn>
        </v-row>
        <div ref="table" class="mt-5" />
      </v-card>
    </v-row>
    <AddDialog
        v-if="dialogs.add"
        :phases="phases"
        :reasons="reasons"
        v-model="dialogs.add"
        @submit="onTransactionAdd"
    />
    <EditDialog
        v-if="dialogs.edit"
        v-model="dialogs.edit"
        :phases="phases"
        :reasons="reasons"
        :transaction="selectedTransaction"
        @submit="onTransactionEdit"
    />
    <DiscardDialog
        v-if="dialogs.delete"
        v-model="dialogs.delete"
        :transaction="selectedTransaction"
        @submit="onTransactionDiscard"
    />
    <UpdateStatusDialog
        v-if="dialogs.update"
        v-model="dialogs.update"
        :selectedData="selectedData"
        :title="$t('workspaces.financials.transactions.changeStatus')"
        @close="closeUpdateMultiple"
        @submit="onUpdateMultipleStatuses"
    />
    <UploadFileDialog
        v-if="dialogs.uploadFile"
        v-model="dialogs.uploadFile"
        @submit="onFileUpload"
    />
  </v-container>
</template>
<style  lang="scss">
.flex {
  display: flex;
}

.selectStatus {
  margin-right: 15px;
  width: 200px;
  height: 30px;
}
.rowSelection {
  .tabulator-col-content {
    display: flex!important;
    justify-content: center!important;
    width: 100%!important;
  }
}
</style>
