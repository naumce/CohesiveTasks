<script setup lang="ts">
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { HttpRequest } from '@/types'
import HistoricRemainingCost from './HistoricRemainingCost.vue'
import {
  TabulatorFull as Tabulator,
  type ColumnDefinition,
  type CellComponent,
  type RowComponent,
  type ColumnComponent
} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import AddCategory from './dialogs/AddCategory.vue'
import UploadFileDialog from './dialogs/UploadFileDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import NoPhasesWarningDialog from './dialogs/NoPhasesWarningDialog.vue'
import { useAlertsStore } from '@/stores/alerts'
import { togglePagination } from "@/utils/pagination";
import { useRouter } from "vue-router";
import {formatNumber} from "@/utils/number";
import { useCustomizerStore } from '@/stores/customizer'
const router = useRouter()
const { canModify } = useCustomizerStore()
const modifyEnabled = canModify([
  'TENANT_ADMIN', 
  'PROJECT_ADMINISTRATION',
  'PROJECT_FINANCE_EDIT'
])

const { showAlert } = useAlertsStore()
const { t } = useI18n()

const quaters = {
  Q1: [1, 2, 3],
  Q2: [4, 5, 6],
  Q3: [7, 8, 9],
  Q4: [10, 11, 12]
} as any

const dialogs = reactive({
  categories: false,
  delete: false,
  uploadFile: false,
  phasesWarning: false,
  categoryRequired: false,
  differenceWarning: false,
  data: {} as any
})

const handleClear = () => {
  const tableData = tabulator.value.getData()[0]
  const { categories, id, ...rest } = tableData
  const newCat = categories.map((item: any) => {
    if (item.isCategory) {
      const { costType, isCategory, isEditable, id, ...rest } = item
      Object.keys(rest).forEach((restItem) => (item[restItem] = 0))
    }
    return item
  })
  tabulator.value.updateData([{ ...tableData, categories: newCat }])
  setDifferenceRow()
}

const RestoreCurrent = async () => {
  const tableData = tabulator.value.getData()
  let { costType, ...currentRow } = tableData[1]
  const newData: any = tableData[0]
  await tabulator.value.updateOrAddData([
    {
      costType: newData.costType,
      ...currentRow,
      id: 1,
      categories: [
        ...currentRow.categories.map(({ transaction_category, ...item }: any) => ({
          ...item,
          isEditable: true,
          id: transaction_category.id
        })),
        { costType: 'add_btn' }
      ]
    }
  ])
  setDifferenceRow()
}

const SaveAsDraft = () => {
  const newData = tabulator.value.getData()[0]
  const setAsDraft: HttpRequest = {
    method: 'post',
    url: routeName.value === 'original' ? ajaxUrlDraftBudget.value : ajaxUrlDraftRemainingCost.value,
    data: newData && createBody(newData),
    onSuccess: {
      callback: async (response) => {
        if (response.status === 201) {
          showAlert({
            type: 'success',
            message: routeName.value === 'original' ? t('workspaces.financials.original.successSaveAsDraft') : t('workspaces.financials.remaining.successSaveAsDraft')
          })
        }
      }
    }
  }
  sendRequest(setAsDraft)
}

const createBody = (newData: any) => {
  var body = {
    total_remaining: `${newData?.total_remaining}`,
    categories: newData?.categories
      .map((item: any) => {
        if (item.costType === 'add_btn') return
        const dataSet = {
          category_id: item.id,
          costs: [] as any,
          total_remaining: `${item.total_remaining}`
        }
        if (representDataBy.value === 'QUATERLY') {
          const monthlyCost = createMonthlyCost()
          dynamicColoumnName.value.forEach((q: any) => {
            const coloumnQuater = q.split('-')
            const month = quaters[coloumnQuater[1]]
            const monthLength = month.filter(
              (mItem: any) => !!monthlyCost.find((mcItem) => mcItem.month === mItem)
            )
            const quaterValue = item[q]
            monthLength.forEach((mItem: any) => {
              const monthlyItem = monthlyCost.find((item) => item.month === mItem && parseInt(coloumnQuater[0]) === item.year)
              if (monthlyItem) {
                dataSet.costs.push({
                  ...monthlyItem,
                  value: `${(quaterValue / monthLength?.length).toFixed(2)}`
                })
              }
            })
          })
        } else if (representDataBy.value === 'YEARLY') {
          const monthlyCost = createMonthlyCost()
          dynamicColoumnName.value.forEach((col) => {
            const totalMonths = monthlyCost.filter((mItem) => mItem.year === parseInt(col))
            const value = item[col]
            totalMonths.forEach((mItem) =>
              dataSet.costs.push({
                ...mItem,
                value: `${value / totalMonths?.length}`
              })
            )
          })
        } else {
          dynamicColoumnName.value.forEach((col: any) => {
            const colName = col.split('-')
            dataSet.costs.push({
              value: `${item[col]}`,
              month: parseInt(colName[1]),
              year: parseInt(colName[0])
            })
          })
        }
        return dataSet
      })
      .filter((item: any) => !!item)
  } as any
  return body
}

const SaveAsCurrent = () => {
  const newData = tabulator.value.getData()[0]
  if (newData.difference !== 0) {
    showAlert({
      type: 'error',
      message: routeName.value === 'original' ? t('workspaces.financials.original.totalBudgetValidation') : t('workspaces.financials.remaining.totalRemainingValidation')
    })
    return
  }
  // if (newData.total_remaining === 0) {
  //   showAlert({
  //     type: 'error',
  //     message: t('workspaces.financials.remaining.emptyField')
  //   })
  //   return
  // }
  const setAsCurrentCategories: HttpRequest = {
    method: 'post',
    url: routeName.value === 'original' ? ajaxUrlBudget.value : ajaxUrlCurrentRemainingCost.value,
    data: newData && createBody(newData),
    onSuccess: {
      callback: async (response) => {
        if (response.status === 201) {
          showAlert({
            type: 'success',
            message: routeName.value === 'original' ? t('workspaces.financials.original.successSaveAsCurrent') : t('workspaces.financials.remaining.successSaveAsCurrent')
          })
          await tabulator.value.destroy()
          draft.value = null
          setTabulator()
          selectedCategories.value = []
          historyRemaingCostRef.value.setTabulator()
        }
      }
    }
  }
  sendRequest(setAsCurrentCategories)
}

const distributeData = async () => {
  const selectedRows = tabulator.value.getSelectedRows()
  if (selectedRows?.length > 0) {
    // row.update
    await selectedRows.forEach(async (item: RowComponent) => {
      const rowData = item.getData()
      if (rowData.total_remaining > 0 ) {
        const perColoumnCost = rowData.total_remaining / dynamicColoumnName.value?.length
        dynamicColoumnName.value.forEach((item) => (rowData[item] = perColoumnCost))
        await item.update(rowData)
        await unCheckRow(item)
      }
    })
    updateParentRows(selectedRows[0])
  }
  setDifferenceRow()
}

const openDeleteModal = (arg: any) => {
  (dialogs.delete = !dialogs.delete), (dialogs.data = arg)
}

const getDeleteProps = computed(() => {
  // handleClear
  if (dialogs.data === 'clear') {
    return {
      title: t('workspaces.financials.remaining.actions.clear'),
      text: routeName.value === 'original' ? t('workspaces.financials.original.clearQuestion') : t('workspaces.financials.remaining.clearQuestion'),
      on: {
        submit: () => {
          handleClear()
          openDeleteModal(null)
        }
      }
    }
  } else if (dialogs.data === 'restore') {
    return {
      title: t('workspaces.financials.remaining.actions.restoreCurrent'),
      text: routeName.value === 'original' ? t('workspaces.financials.original.restoreQuestion') : t('workspaces.financials.remaining.restoreQuestion'),
      bgClass: 'bg-primary',
      on: {
        submit: () => {
          RestoreCurrent()
          openDeleteModal(null)
        }
      }
    }
  } else if (dialogs.data === 'current') {
    return {
      title: t('workspaces.financials.remaining.actions.saveAsCurrent'),
      text: routeName.value === 'original' ? t('workspaces.financials.original.saveAsCurrentQuestion') : t('workspaces.financials.remaining.saveAsCurrentQuestion'),
      bgClass: 'bg-primary',
      on: {
        submit: () => {
          SaveAsCurrent()
          openDeleteModal(null)
        }
      }
    }
  } else if (dialogs.data === 'draft') {
    return {
      title: t('workspaces.financials.remaining.actions.saveAsDraft'),
      text: routeName.value === 'original' ? t('workspaces.financials.original.saveAsDraftQuestion') : t('workspaces.financials.remaining.saveAsDraftQuestion'),
      bgClass: 'bg-primary',
      on: {
        submit: () => {
          SaveAsDraft()
          openDeleteModal(null)
        }
      }
    }
  } else if (dialogs.data === 'distribute') {
    const selectedRows = tabulator.value.getSelectedRows()
    if (selectedRows.length === 0) {
      dialogs.categoryRequired = true
      openDeleteModal(null)
    }
    else
      return {
        title: t(`workspaces.financials.${routeName.value as string}.distributeQuestion`),
        text: t(`workspaces.financials.${routeName.value as string}.distributeText`),
        bgClass: 'bg-primary',
        on: {
          submit: () => {
            distributeData()
            openDeleteModal(null)
          }
        }
      }
  } else if (dialogs.data?.type === 'delCat') {
    return {
      title: t('workspaces.financials.remaining.actions.removeCategory'),
      text: t('workspaces.financials.remaining.removeCategory'),
      on: {
        submit: () => {
          deleteCategoryRow(dialogs.data?.cellData)
          openDeleteModal(null)
        }
      }
    }
  }
})

const threeDotsMenuItems = [
  {
    title: t('workspaces.financials.remaining.actions.distribute'),
    click: () => openDeleteModal('distribute')
  },
  {
    title: t('workspaces.financials.remaining.actions.saveAsDraft'),
    click: () => openDeleteModal('draft')
  },
  {
    title: t('workspaces.financials.remaining.actions.saveAsCurrent'),
    click: () => {
      const data = tabulator.value.getData()[0]
      if(data.difference !== 0) {
        dialogs.differenceWarning = true;
        return;
      }
      openDeleteModal('current')
    }
  },
  {
    title: t('workspaces.financials.remaining.actions.restoreCurrent'),
    click: () => openDeleteModal('restore')
  },
  {
    title: t('workspaces.financials.remaining.actions.clear'),
    click: () => openDeleteModal('clear')
  }
]
const showDataBy = [
  { name: t('workspaces.financials.remaining.monthly'), id: 'MONTHLY' },
  { name: t('workspaces.financials.remaining.quaterly'), id: 'QUATERLY' },
  { name: t('workspaces.financials.remaining.yearly'), id: 'YEARLY' }
]
const phases = ref()
const historyRemaingCostRef = ref()
const { sendRequest } = useApis()

const route = useRoute()
var representDataBy = ref('MONTHLY')
const tabulator = ref()
const draft = ref()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`
const showHistory = ref(false)
const phaseId = ref()
const categories = ref([])
const routeNameSelected = ref()

const routeName = computed(() => {
  return router?.currentRoute?.value?.name || ''
})

watch(routeName, async (newVal) => {
  if (newVal === 'remaining' || newVal === 'original') {
    routeNameSelected.value = newVal
    await sendRequest(getPhases)
    historyRemaingCostRef.value.opened = showHistory.value = false
    await setTabulator()
    selectedCategories.value = []
  }
})

// get phases
const urlAjaxPhases = `${apiUrls.phaseGates
  .replace(/%tenantId/, tenantId)
  .replace(/%projectId/, projectId)}/`
const getPhases: HttpRequest = {
  method: 'get',
  url: urlAjaxPhases,
  onSuccess: {
    callback: (response) => {
      phases.value = response.data.items.filter((p: any) => p.type === 'phase')
      phaseId.value = phases.value[0]?.id
    }
  }
}

// export current api
const ajaxUrlCurrentExport = computed(
  () =>
    `${apiUrls.currentRemainingCost
      .replace(/%tenantId/, tenantId)
      .replace(/%projectId/, projectId)
      .replace(/%phaseId/, phaseId.value)}csv/`
)

// export budget api
const ajaxUrlBudgetExport = computed(
  () =>
    `${apiUrls.budget
      .replace(/%tenantId/, tenantId)
      .replace(/%projectId/, projectId)
      .replace(/%phaseId/, phaseId.value)}csv/`
)

// export history remaining api
const ajaxUrlHistoryExport = computed(
  () =>
    `${apiUrls.historicRemainingCost
      .replace(/%tenantId/, tenantId)
      .replace(/%projectId/, projectId)
      .replace(/%phaseId/, phaseId.value)}csv/`
)

// export history budget api
const ajaxUrlHistoryBudgetExport = computed(
  () =>
    `${apiUrls.historicBudget
      .replace(/%tenantId/, tenantId)
      .replace(/%projectId/, projectId)
      .replace(/%phaseId/, phaseId.value)}csv/`
)

// get categories
const urlAjaxCategories = `${apiUrls.reasons.replace(/%tenantId/, tenantId)}`

const getCategories: HttpRequest = {
  method: 'get',
  url: urlAjaxCategories,
  onSuccess: {
    callback: (response) => {
      categories.value = response.data.items?.filter((item: any) => item.active)
    }
  }
}
sendRequest(getCategories)

// get current remaining cost
const ajaxUrlCurrentRemainingCost = computed(
  () =>
    `${apiUrls.currentRemainingCost
      .replace(/%tenantId/, tenantId)
      .replace(/%projectId/, projectId)
      .replace(/%phaseId/, phaseId.value)}`
)

// get budget
const ajaxUrlBudget = computed(
  () =>
    `${apiUrls.budget
      .replace(/%tenantId/, tenantId)
      .replace(/%projectId/, projectId)
      .replace(/%phaseId/, phaseId.value)}`
)

// get draft current
const ajaxUrlDraftRemainingCost = computed(
  () =>
    `${apiUrls.draftRemainingCost
      .replace(/%tenantId/, tenantId)
      .replace(/%projectId/, projectId)
      .replace(/%phaseId/, phaseId.value)}`
)

// get draft budget
const ajaxUrlDraftBudget = computed(
  () =>
    `${apiUrls.draftBudget
      .replace(/%tenantId/, tenantId)
      .replace(/%projectId/, projectId)
      .replace(/%phaseId/, phaseId.value)}`
)



const getDraftCurrent = computed(() => ({
  method: 'get',
  url: routeName.value === 'original' ? ajaxUrlDraftBudget.value : ajaxUrlDraftRemainingCost.value,
  onSuccess: {
    callback: async (response: any) => {
      const parsedCateg = await Promise.all(
        response.data?.categories?.map(async ({ transaction_category, ...item }: any) => {
          const costData = await parseInitialCostData(item)
          return {
            ...item,
            isCategory: true,
            isEditable: true,
            distributed: 0,
            difference: 0,
            costType: transaction_category?.name,
            id: transaction_category.id,
            ...costData
          }
        })
      )
      draft.value = {
        ...response.data,
        categories: parsedCateg
      }
    }
  }
}
))

function openImport() {
  dialogs.uploadFile = true
}
function exportCsv() {
  const getCsvFileCurrent: HttpRequest = {
    method: 'get',
    url: routeName.value === 'original' ? ajaxUrlBudgetExport.value : ajaxUrlCurrentExport.value,
    onSuccess: {
      callback: (response) => {
        var downloadLink = document.createElement('a')
        var blob = new Blob(['\ufeff', response.data])
        var url = URL.createObjectURL(blob)
        downloadLink.href = url
        downloadLink.download = 'current.csv'
        document.body.appendChild(downloadLink)
        downloadLink.click()
      }
    }
  }
  const getCsvFileHistory: HttpRequest = {
    method: 'get',
    url: routeName.value === 'original' ? ajaxUrlHistoryBudgetExport.value : ajaxUrlHistoryExport.value,
    onSuccess: {
      callback: (response) => {
        var downloadLink = document.createElement('a')
        var blob = new Blob(['\ufeff', response.data])
        var url = URL.createObjectURL(blob)
        downloadLink.href = url
        downloadLink.download = 'history.csv'
        document.body.appendChild(downloadLink)
        downloadLink.click()
      }
    }
  }
  sendRequest(getCsvFileCurrent)
  sendRequest(getCsvFileHistory)
}

const handleShowHistory = () => {
  historyRemaingCostRef.value.opened = showHistory.value
  if (showHistory.value) {
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight)
    }, 1000)
  }
}

const table = ref()

const dynamicColoumnName = ref([])
const { emptyHeaderFilter, numberHeaderFilter } = useTabulatorOptions()

const getDataDifference = (arg: any, type: any) => {
  if (arg?.isCategory) {
    const totalCost =
      dynamicColoumnName.value.map((item) => parseFloat(arg[item]))?.reduce((a, b) => a + b, 0) || 0
    if (type === 'distributed') return totalCost
    return parseFloat(arg?.total_remaining || 0) - totalCost
  } else if (arg?.categories) {
    const dynamicColoumnObj = {
      total_remaining: 0,
      distributed: 0,
      difference: 0
    } as any
    arg.categories.forEach((item: any) => {
      dynamicColoumnName?.value?.forEach((col) => {
        dynamicColoumnObj[col] = dynamicColoumnObj[col]
          ? dynamicColoumnObj[col] + parseFloat(item[col] || 0)
          : parseFloat(item[col] || 0)
      })
      dynamicColoumnObj.total_remaining += parseFloat(item.total_remaining || 0)
    })
    dynamicColoumnName?.value?.forEach(
      (item) => (dynamicColoumnObj.distributed += dynamicColoumnObj[item] || 0)
    )
    dynamicColoumnObj.difference =
      dynamicColoumnObj.total_remaining - dynamicColoumnObj.distributed || 0
    return type ? dynamicColoumnObj[type] : dynamicColoumnObj
  } else if (arg?.isDifference) {
    const tableData = tabulator.value.getData()
    const data = tableData.map((item: any) => item[type] || 0)
    return data[0] - data[1]
  }
  return null
}

const setDifferenceRow = async () => {
  const tableData = await tabulator.value.getData()
  const differenceRow = await tabulator.value.getRow(3)
  const differenceData = {} as any
  const staticArray: any = [
    'difference',
    'distributed',
    'total_remaining',
    ...dynamicColoumnName.value
  ]
  await staticArray.forEach((item: any) => {
    differenceData[item] = tableData[0][item] - tableData[1][item]
  })
  differenceRow.update(differenceData)
}

const unCheckRow = (row: RowComponent) => {
  const checkbox = row.getCells()[0]
  if (checkbox) {
    checkbox?.getElement()?.getElementsByTagName('input')[0]?.click()
  }
}

const updateParentRows = async (row: RowComponent) => {
  const parentRow = await row.getTreeParent()
  // @ts-ignore
  const parentRowData = await parentRow.getData()
  // @ts-ignore
  parentRow.update({
    ...getDataDifference(parentRowData, null)
  })
}

const handleCellEdit = async (cell: CellComponent) => {
  var data = cell.getData()
  const distributed = getDataDifference(data, 'distributed')
  const difference = getDataDifference(data, null)
  const row = cell.getRow()
  await row.update({
    distributed: distributed,
    difference: difference
  })
  if (row.isSelected()) {
    unCheckRow(row)
  }
  await updateParentRows(row)
  setDifferenceRow()
}

const isRowEditable = (cell: any) => {
  const data = cell.getRow().getData()
  if (data.isEditable) return true
  return false
}

const columns = computed(() => {
  return [
    {
      headerSort: false,
      title: '',
      resizable: false,
      frozen: true,
      minWidth: 30,
      width: 30,
      hozAlign: 'center',
      cssClass: 'selection-column',
      formatter: (cell: CellComponent) => {
        const cellData = cell.getData() as any
        return cellData.isEditable ? `<input type="checkbox" aria-label="Select Row" data-testid="row-checkbox">` : ''
      },
      cellClick: async (e, cell) => {
        const cellData = cell.getData() as any
        if (cellData.isCategory && !cellData.transaction_category) {
          await cell.getRow().toggleSelect()
          const checkBox = cell.getElement()?.getElementsByTagName('input')[0]
          if (checkBox) checkBox.checked = cell.getRow().isSelected()
        }
      }
    },
    {
      field: 'costType',
      title: t('workspaces.financials.remaining.costType'),
      hozAlign: 'left',
      sorter: 'string',
      headerHozAlign: 'left',
      headerSort: false,
      frozen: true,
      minWidth: 200,
      formatter: (cell: CellComponent) => {
        const cellData = cell.getData() as any
        if (cellData.costType === 'add_btn') {
          const div = document.createElement('div')
          // @ts-ignore
          div.innerHTML =
              '<button type="button" class="v-btn v-btn--elevated v-btn--icon v-theme--light bg-primary v-btn--density-default v-btn--size-small v-btn--variant-elevated"><span class="v-btn__overlay"></span><span class="v-btn__underlay"></span><span class="v-btn__content" data-no-activator=""><i class="mdi-plus mdi v-icon notranslate v-theme--light v-icon--size-default" aria-hidden="true" data-testid="add-new"></i></span></button>'
          div.addEventListener('click', () => {
            dialogs.categories = true
          })
          return div
        }
        if (cellData.isCategory) {
          const span = document.createElement('span')
          span.style.width = '110px'
          span.style.overflow = 'hidden'
          span.style.textOverflow = 'ellipsis'
          span.title = cellData.costType
          span.innerText = cellData.costType
          return span
        }
        return cell.getValue()
      }
    },
    {

      field: 'total_remaining',
      title: t(`workspaces.financials.${routeName.value as string}.totalRemaining`),
      hozAlign: 'center',
      headerSort: false,
      sorter: 'string',
      frozen: true,
      minWidth: 160,
      editor: 'number',
      editable: isRowEditable,
      // @ts-ignore
      validator: ['min:0', 'numeric', 'required'],
      // @ts-ignore
      headerPopup: numberHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: '>',
      headerFilterFuncParams: 'useGtLt',
      cellEdited: handleCellEdit,
      mutator: (value, data) => {
        if (data?.isCategory) return data.total_remaining
        return getDataDifference(data, 'total_remaining')
      },
      formatter: (cell: CellComponent) => {
        const isNegative = formatNumber(cell.getValue()).includes('-');
        return cell.getValue() !== null
            ? `<div class="${isNegative ? 'text-red' : ''}">${formatNumber(cell.getValue())}</div>`
            : ''
      },
    },
    {
      field: 'difference',
      title: t('workspaces.financials.remaining.difference'),
      hozAlign: 'center',
      sorter: 'string',
      headerSort: false,
      frozen: true,
      minWidth: 120,
      mutator: (value, data) => {
        return getDataDifference(data, 'difference')
      },
      formatter: (cell: CellComponent) => {
        const isNegative = formatNumber(cell.getValue()).includes('-');
        return cell.getValue() !== null
            ? `<div class="${isNegative ? 'text-red' : ''}">${formatNumber(cell.getValue())}</div>`
            : ''
      }
    },
    {
      field: 'distributed',
      title: t('workspaces.financials.remaining.distributed'),
      hozAlign: 'center',
      sorter: 'string',
      headerSort: false,
      frozen: true,
      minWidth: 140,
      mutator: (value, data) => {
        return getDataDifference(data, 'distributed')
      },
      formatter: (cell: CellComponent) => {
        const isNegative = formatNumber(cell.getValue()).includes('-');
        return cell.getValue() !== null
            ? `<div class="${isNegative ? 'text-red' : ''}">${formatNumber(cell.getValue())}</div>`
            : ''
      },
    }
  ] as  Array<ColumnDefinition>
})

const deleteCategoryRow = async (cell: CellComponent) => {
  const row = cell.getRow()
  const cellData = cell.getData() as any
  const parentRow = await row.getTreeParent()
  await row.delete()
  // @ts-ignore
  const parentRowData = await parentRow.getData()
  // @ts-ignore
  await parentRow.update({
    ...getDataDifference(parentRowData, null)
  })
  selectedCategories.value = selectedCategories.value.filter(
    (item: any) => item.id !== cellData?.id
  )
  setDifferenceRow()
}

// get data quatarly
const parseCostDataQuaterly = (data: any) => {
  const quaterData = {} as any
  Object.keys(quaters).forEach(
    (item) =>
      (quaterData[item] = [])
  )
  data.forEach((item: any) => {
    Object.keys(quaters).some((q) => {
      if (quaters[q].includes(item.month)) {
        const getQuaterValueIndex = quaterData[q]?.findIndex((qter: any) => qter.month === q && qter.year === item.year);
        if (getQuaterValueIndex !== -1) {
          const getQuaterValue = quaterData[q][getQuaterValueIndex]
          quaterData[q][getQuaterValueIndex] = {
            month: q,
            year: item.year,
            value: getQuaterValue.value + parseFloat(item.value || 0)
          }
        } else {
          quaterData[q].push({
            month: q,
            year: item.year,
            value: parseFloat(item.value || 0)
          })
        }
        return true
      }
    })
  })
  let quaterlyCost = [] as any
  const filterCost = Object.keys(quaterData)
    .filter((item) => !!quaterData[item].length)
    .map((item) => {
      quaterlyCost = [...quaterlyCost, ...quaterData[item]]
    })
  return quaterlyCost?.sort((a: any, b: any) => a.year < b.year ? -1 : 1)
}

const createMonthlyCost = () => {
  const currentPhase = phases.value.find((item: any) => item.id === phaseId.value)
  const startDate = new Date(currentPhase.start_date)
  startDate.setDate(1)
  const endDate = new Date(currentPhase.end_date)
  const dateArray = []
  while (startDate <= endDate) {
    dateArray.push({
      month: startDate.getMonth() + 1,
      year: startDate.getFullYear()
    })
    startDate.setMonth(startDate.getMonth() + 1)
  }
  return dateArray
}

const setDynamicRows = (data: any) => {
  let getCosts = { ...data?.find((item: any) => item?.costs?.length > 0) }
  if (!Object.keys(getCosts)?.length) {
    getCosts = {
      costs: createMonthlyCost()
    }
  }
  if (representDataBy.value === 'QUATERLY') {
    getCosts.costs = parseCostDataQuaterly(getCosts.costs)
  }
  if (representDataBy.value === 'YEARLY') {
    getCosts.costs = Array.from(new Set(getCosts.costs.map((item: any) => item.year))).map(
      (item) => ({
        year: item
      })
    )
  }


  const dynamicColoumn = getCosts?.costs?.map((item: any) => ({
    title: item.month ? `${item.year}-${item.month < 10 ? '0' + item.month : '' + item.month}` : `${item.year}`,
    field: item.month ? `${item.year}-${item.month < 10 ? '0' + item.month : '' + item.month}` : `${item.year}`,
    movableColumns: false,
    visible: true,
    minWidth: 80,
    maxWidth:130,
    hozAlign: 'center',
    headerSort: false,
    editor: 'number',
    editable: isRowEditable,
    validator: ['min:0', 'numeric', 'required'],
    cellEdited: handleCellEdit,
    mutator: (value: any, data: any) => {
      if (data?.isCategory) return data[item.month ? `${item.year}-${item.month < 10 ? '0' + item.month : '' + item.month}` : `${item.year}`]
      return getDataDifference(data, [item.month ? `${item.year}-${item.month < 10 ? '0' + item.month : '' + item.month}` : `${item.year}`])
    },
    formatter: (cell: CellComponent) => {
      const costType = cell.getRow().getData().costType;
      if(costType === 'Difference') {
        const isNegative = formatNumber(cell.getValue()).includes('-');
        return `<div class="${isNegative ? 'text-red' : ''}">${formatNumber(cell.getValue())}</div>`
      }
      return (cell.getValue() !== null)
        ? formatNumber(cell.getValue())
        : ''
    },
  }))
  dynamicColoumnName.value = dynamicColoumn?.map((item: any) => item.title)
  dynamicColoumn?.forEach((element: any) => {
    tabulator.value.addColumn(element)
  })

  tabulator.value.addColumn({
    title: '',
    field: '',
    frozen: true,
    minWidth: 50,
    headerSort: false,
    width: 50,
    formatter: (cell: CellComponent) => {
      const cellData = cell.getData() as any
      if (cellData.isCategory && !cellData.transaction_category) {
        const span = document.createElement('span')
        span.setAttribute('class', 'mdi mdi-trash-can text-red text-h5 del-btn')
        span.addEventListener('click', async () => {
          openDeleteModal({
            cellData: cell,
            type: 'delCat'
          })
        })
        return span
      }
      return null
    }
  })
}

const parseInitialCostData = async (item: any) => {
  let inital = item.costs
  if (representDataBy.value === 'QUATERLY') {
    inital = parseCostDataQuaterly(item.costs)
  }
  if (representDataBy.value === 'YEARLY') {
    const yearlyValue = {} as any
    item.costs.forEach(
      (item: any) =>
      (yearlyValue[item.year] = yearlyValue[item.year]
        ? yearlyValue[item.year] + parseFloat(item.value)
        : parseFloat(item.value))
    )
    inital = Object.keys(yearlyValue).map((item) => ({ year: item, value: yearlyValue[item] }))
  }
  return inital.reduce(
    (obj: any, item: any) =>
      Object.assign(obj, {
        [item.month ? `${item.year}-${item.month < 10 ? '0' + item.month : '' + item.month}` : `${item.year}`]: item.value
      }),
    {}
  )
}

const unSavedValues: any = ref([])

const getInitialData = async (arg: any) => {
  await setDynamicRows(arg?.categories)
  await sendRequest(getDraftCurrent.value)
  const parsedCategories = await Promise.all(
    arg.categories?.map(async (item: any) => {
      const costData = await parseInitialCostData(item)
      return {
        ...item,
        isCategory: true,
        distributed: 0,
        difference: 0,
        costType: item.transaction_category?.name,
        ...costData
      }
    })
  )
  const draftedValues = draft.value?.categories || [];
  const data = [
    {
      costType: routeName.value === 'remaining' ? t('workspaces.financials.remaining.newRemaining') : t('workspaces.financials.original.newBudget'),
      difference: 0,
      total_remaining: 0,
      distributed: 0,
      id: 1,
      categories: [
        ...unSavedValues.value,
        ...draftedValues,
        {
          costType: 'add_btn'
        }
      ],
      ...dynamicColoumnName.value?.reduce(
        (obj: any, item: any) => Object.assign(obj, { [item]: 0 }),
        {}
      )
    },
    {
      costType: routeName.value === 'remaining' ? t('workspaces.financials.remaining.currentRemaining') : t('workspaces.financials.original.currentBudget'),
      id: 2,
      total_remaining: arg?.total_remaining,
      categories: parsedCategories,
      phase_dates_out_of_sync: arg?.phase_dates_out_of_sync
    },
    {
      costType: t('workspaces.financials.remaining.difference'),
      id: 3,
      isDifference: true,
    }
  ]
  unSavedValues.value = []
  return data
}

const { tabulatorOptions } = useTabulatorOptions()
tabulatorOptions.movableColumns = false

const tableDefinition: any = computed(() => {
  return {
    columns: columns.value,
    layout: 'fitColumns',
    ajaxURL: phases.value.length !== 0 ? (routeName.value === 'original' ? ajaxUrlBudget.value : ajaxUrlCurrentRemainingCost.value) : '',
    dataTree: true,
    dataTreeChildField: 'categories',
    dataTreeElementColumn: 'costType',
    dataTreeCollapseElement: '<span class="mdi mdi-chevron-up text-h5"></span>',
    dataTreeExpandElement: '<span class="mdi mdi-chevron-down text-h5"></span>',
    dataTreeChildIndent: 50,
    ...tabulatorOptions,
    height:'auto',
    ajaxResponse: async (url: string, params: any, response: any) => {
      const totalElements = response.data?.total || 0
      const addition = totalElements.value % params.per_page > 0 ? 1 : 0
      const lastPage = Math.floor(totalElements.value / params.per_page) + addition
      const initialData = await getInitialData(response.data)
      togglePagination(totalElements);
      const retObj = {
        contentType: 'application/json; charset=utf-8',
        data: initialData,
        last_page: lastPage
      }
      return retObj
    }
  }
})

const setTabulator = async () => {
  if (table.value) {
    tabulator.value = await new Tabulator(table.value, tableDefinition.value)
  }
}

const selectedCategories = ref([] as any)

const onCategoryAdd = (arg: any) => {
  const cat = categories.value.find((item: any) => item.id === arg.value)
  selectedCategories.value = [...selectedCategories.value, cat]
  if (cat) {
    const tableData = tabulator.value.getData()[0]
    const { categories, id, ...rest } = tableData
    const catData = [cat].map((item: any) => {
      return {
        ...rest,
        costType: item.name,
        id: item.id,
        difference: 0,
        total_remaining: 0,
        distributed: 0,
        isCategory: true,
        isEditable: true,
        ...dynamicColoumnName.value.reduce(
          (obj: any, item: any) => Object.assign(obj, { [item]: 0 }),
          {}
        )
      }
    })
    tabulator.value.updateData([{ ...tableData, categories: [...catData, ...categories] }])
    dialogs.categories = false
  }
}

const handlePhaseChange = async () => {
  const tableData = tabulator.value.getData()[0]
  const monthlyArray = createMonthlyCost()
  const parsedCategories = await Promise.all(tableData.categories.map(async (item: any) => {
    if (item.costType === "add_btn" || item.costs) return null;
    const perItemCost = item.total_remaining / monthlyArray.length
    const monthlyCost = monthlyArray.map(mVal => ({ ...mVal, value: item.distributed ? perItemCost.toString() : '0' }))
    const costs = await parseInitialCostData({ ...item, costs: monthlyCost })
    return { ...item, ...costs }
  }))
  unSavedValues.value = parsedCategories.filter(item => !!item)
  await setTabulator()
}

const onFileUpload = (formData: FormData) => {
  const uploadFile: HttpRequest = {
    method: 'post',
    url: routeName.value === 'original' ? ajaxUrlBudget.value + `import/` : ajaxUrlCurrentRemainingCost.value + `import/`,
    data: formData,
    onSuccess: {
      callback: () => {
        setTabulator()
        dialogs.uploadFile = false
      },
      message: t('workspaces.financials.transactions.importSuccess')
    },
  }
  sendRequest(uploadFile)
}

onMounted(async () => {
  await sendRequest(getPhases)
  if (phases.value.length === 0) dialogs.phasesWarning = true
  await setTabulator()
})

const onSelectPhase = () => {
  selectedCategories.value = []
  setTabulator();
}

const getComputedCategories = computed(() => {
  let carArray: any = categories.value
  if (selectedCategories.value) {
    const selectedCatId = selectedCategories.value.map((item: any) => item.id)
    carArray = categories.value.filter((item: any) => !selectedCatId.includes(item.id))
  }
  return carArray
})

</script>
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <div class="mt-n16 mb-5 flex">
          <span class="flex">
            <v-select class="selectPhase" variant="outlined" density="compact" v-model="phaseId"
              :label="$t('workspaces.financials.remaining.selectPhase')"
              :items="phases?.map((t: any) => ({ title: t.name, value: t.id }))" data-testid="phase"
              @update:modelValue="onSelectPhase">
            </v-select>
          </span>
          <v-btn v-if="modifyEnabled" class="secondary-action-btn" @click="openImport">
            {{ $t('misc.import') }}
          </v-btn>
          <v-btn class="secondary-action-btn  ml-3" @click="exportCsv">
            {{ $t('misc.export') }}
          </v-btn>
        </div>
      </v-col>
      <v-card width="100%" fluid>
        <v-row class="justify-space-between pa-6 mb-n7">
          <span class="text-h6 flex">
            <v-switch color="primary" class="mr-5 mt-n2" :label="$t('workspaces.financials.remaining.showHistory')"
              v-model="showHistory" @change="handleShowHistory"></v-switch>
            <v-select class="selectPhase" variant="outlined" density="compact" v-model="representDataBy"
              :label="$t('workspaces.financials.remaining.showData')"
              :items="showDataBy?.map((t: any) => ({ title: t.name, value: t.id }))" data-testid="status"
              @update:modelValue="handlePhaseChange">
            </v-select>
          </span>
          <span class="flex">
            <v-menu v-if="modifyEnabled">
              <template v-slot:activator="{ props }">
                <v-btn class="mt-n1" icon="mdi-dots-vertical" v-bind="props" data-testid="three-dots"></v-btn>
              </template>
              <v-list>
                <v-list-item v-for="(item, i) in threeDotsMenuItems" :key="i" @click="item.click" class="cursor-pointer">
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </span>
        </v-row>
        <v-row>
          <v-col>
            <div ref="table" class="my-5" id="histroy-table" />
          </v-col>
        </v-row>
        <HistoricRemainingCost v-model="showHistory" :phaseId="phaseId" ref="historyRemaingCostRef" :quaters="quaters"
          :type="representDataBy" :route="routeNameSelected" />
      </v-card>
    </v-row>
    <AddCategory v-if="dialogs.categories" :reasons="getComputedCategories" v-model="dialogs.categories"
      @submit="onCategoryAdd" />
    <DeleteDialog v-if="dialogs.delete" v-bind="getDeleteProps" v-on="getDeleteProps?.on" v-model="dialogs.delete">
    </DeleteDialog>
    <NoPhasesWarningDialog v-if="dialogs.phasesWarning" :title="$t(`workspaces.financials.${routeName as string}.noPhasesTitle`)"
      :text="$t(`workspaces.financials.${routeName as string}.noPhasesText`)" v-model="dialogs.phasesWarning">
    </NoPhasesWarningDialog>
    <NoPhasesWarningDialog v-if="dialogs.categoryRequired"
      :title="$t('workspaces.financials.remaining.selectCategoryRequired')"
      :text="$t('workspaces.financials.remaining.selectCategoryRequiredText')" v-model="dialogs.categoryRequired">
    </NoPhasesWarningDialog>
    <NoPhasesWarningDialog
        v-if="dialogs.differenceWarning"
        :title=" t(`workspaces.financials.${routeName as string}.differenceValidationTitle`)"
        :text=" t(`workspaces.financials.${routeName as string}.differenceValidationText`)"
        v-model="dialogs.differenceWarning"
        icon-color="#E54949"
    />
    <UploadFileDialog v-if="dialogs.uploadFile" v-model="dialogs.uploadFile" @submit="onFileUpload" />
  </v-container>
</template>
<style scoped lang="scss">
.flex {
  display: flex;
}

.selectPhase {
  margin-right: 15px;
  min-height: 30px;
  margin-top: -3px;
}
</style>
<style lang="scss">
.selectPhase span,
.v-autocomplete span {
  overflow: hidden !important;
}

#histroy-table {
  .tabulator-editable {
    border: 1px solid #1d68cd;
    border-radius: 4px;
  }

  .tabulator-validation-fail {
    border: 1px solid #db2828 !important;
  }

  .tabulator-footer {
    display: none;
  }

  .tabulator-selectable .del-btn {
    display: none;
  }

  .tabulator-selectable:hover .del-btn {
    display: block;
  }
}
</style>
