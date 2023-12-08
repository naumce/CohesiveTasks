<script setup lang="ts">
import {ref, onMounted, watch, nextTick, defineProps, defineEmits, computed, onUnmounted} from 'vue';
import useApis from '@/composables/api'
import useTabulatorOptions from '@/composables/tabulator'
import {TabulatorFull as Tabulator, type ColumnDefinition, type CellComponent, type RowComponent} from 'tabulator-tables'
import { apiUrls } from '@/plugins/axios'
import {useRoute, useRouter} from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { HttpRequest } from '@/types'

const route = useRoute()
const router = useRouter()

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  phaseId: {
    required: true,
    type: String
  },
  quaters: {
    type: Object
  },
  type: {
    type: String
  },
  route: {
    type: String
  }
})

const { sendRequest } = useApis()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`
const historicRemainingCostByCategory = computed(() => `${apiUrls.historicRemainingCostByCategory.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId).replace(/%phaseId/, props.phaseId)}`) // get history by id
const historicBudgetByCategory = computed(() => `${apiUrls.historicBudgetByCategory.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId).replace(/%phaseId/, props.phaseId)}`) // get history by id
const routeName = computed(() => {
  return router?.currentRoute?.value?.name || ''
})
const table = ref()
const tabulator = ref()
const historicRemainingByCategory = ref()
const totalElements = ref()

function getHistoryByCategories(category_id: string, data: any) {
  const getHistoryCategories: HttpRequest = {
    method: 'get',
    url: routeName.value === 'remaining' ? `${historicRemainingCostByCategory.value}${category_id}/` : `${historicBudgetByCategory.value}${category_id}/`,
    onSuccess: {
      callback: (response) => {
        historicRemainingByCategory.value = response.data
        let reponseCategories = response.data.categories
        if (props.type === 'QUATERLY') {
          reponseCategories = reponseCategories.map((item:any) => ({ ...item, costs: parseCostDataQuaterly(item.costs)}))
        }
        if (props.type === 'YEARLY') {
          reponseCategories = reponseCategories.map((item:any) => ({ ...item, costs: parseYearlyData(item)}))
        }
        const categories = reponseCategories.map((item: any) => ({
          updated_at: item?.transaction_category.name,
          total_remaining: item?.total_remaining,
          distributed: item?.total_remaining,
          difference: 0,
          isCategory: true,
          ...item.costs?.reduce(
            (obj: any, item: any) => Object.assign(obj, { [item.month ? `${item.month}/${item.year}` : `${item.year}`]: item.value }), {})
        }))
        tabulator.value.updateData([{ ...data, categories: categories }]);
      }
    }
  }
  sendRequest(getHistoryCategories)
}
const { t } = useI18n()
const { emptyHeaderFilter, dateHeaderFilter, numberHeaderFilter } = useTabulatorOptions()
const columns: Array<ColumnDefinition> = [
  {
    field: 'updated_at',
    title: t('workspaces.financials.remaining.date'),
    hozAlign: 'left',
    headerHozAlign: 'left',
    headerSort: false,
    sorter: 'string',
    frozen: true,
    minWidth: 150,
    formatter: (cell: CellComponent) => {
      const cellData = cell.getData() as any
      const isExpanded = cell.getRow().isTreeExpanded();
      if (cellData.isCategory) {
        return `<span class="child-updated-at">${cellData.updated_at}</span>`
      }
      return `<div class="parent-updated-at">
                  <span class="mdi mdi-chevron-${!isExpanded ? 'down' : 'up'} text-h5 icon" />
                  <span class="text">${cell.getValue()}</span>
              </div>`
    },
    // @ts-ignore
    headerPopup: dateHeaderFilter,
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: '>',
    headerFilterFuncParams: 'useGtLt',
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
  },
  {
    field: 'total_remaining',
    title: t('workspaces.financials.remaining.totalRemaining'),
    hozAlign: 'center',
    headerSort: false,
    sorter: 'string',
    frozen: true,
    minWidth: 160,
    // @ts-ignore
    headerPopup: numberHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: '>',
    headerFilterFuncParams: 'useGtLt',
  },
  {
    field: 'difference',
    title: t('workspaces.financials.remaining.difference'),
    hozAlign: 'center',
    sorter: 'string',
    headerSort: false,
    frozen: true,
    minWidth: 120
  },
  {
    field: 'distributed',
    title: t('workspaces.financials.remaining.distributed'),
    hozAlign: 'center',
    sorter: 'string',
    headerSort: false,
    frozen: true,
    minWidth: 140
  }
]


const rowSetted = ref(false);

const parseCostDataQuaterly = (data:any) => {
  const quaterData = {} as any
  const quaters = props.quaters as any
  Object.keys(quaters).forEach(item => (
    quaterData[item] = {
      value: 0,
      month: null,
      year: null
    }
  ));
  data.forEach((item:any) => {
    Object.keys(quaters).some(q => {
      if (quaters[q].includes(item.month)) {
        quaterData[q] = {
          month: q,
          year: item.year,
          value: quaterData[q].value + parseFloat(item.value || 0)
        }
        return true
      }
    })
  })
  const quaterlyCost = Object.keys(quaterData).filter(item => !!quaterData[item].month).map(item => quaterData[item])
  return quaterlyCost
}

const historicRemainingCosts = ref()

const setDynamicRows = async (data: any) => {
  const getCosts = data.find((item: any) => item?.costs?.length > 0)
  let dataArray = [...getCosts?.costs]
  if (props.type === 'QUATERLY') {
    dataArray = parseCostDataQuaterly(getCosts?.costs)
  }
  if (props.type === 'YEARLY') {
    dataArray = Array.from(new Set(dataArray.map(item => item.year))).map(item => ({
      year: item
    }))
  }
  const dynamicColoumn = dataArray?.map((item: any) => ({ title: item.month ? `${item.month}/${item.year}` : `${item.year}`, field: item.month ? `${item.month}/${item.year}` : `${item.year}`, visible: true, minWidth: 80, hozAlign: 'center', headerSort: false }))
  dynamicColoumn?.forEach((element: any) => {
    tabulator.value.addColumn(element)
  });
  rowSetted.value = true;
}

const parseYearlyData = (itemCost:any) => {
  const yearlyValue = {} as any
  itemCost.costs.forEach((item:any) => yearlyValue[item.year] = yearlyValue[item.year] ? yearlyValue[item.year] + parseFloat(item.value) : parseFloat(item.value))
  return Object.keys(yearlyValue).map(item => ({ year: item, value: yearlyValue[item] }))
}

const ajaxUrlRemaining = computed(() => `${apiUrls.historicRemainingCost.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId).replace(/%phaseId/, props.phaseId)}`)
const ajaxUrlBudget = computed(() => `${apiUrls.historicBudget.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId).replace(/%phaseId/, props.phaseId)}`)
const { tabulatorOptions } = useTabulatorOptions()
const tableDefinition: any = computed(() => {
  return {
  columns: columns,
  layout: 'fitColumns',
  ajaxURL: props.phaseId ? (routeName.value === 'remaining' ? ajaxUrlRemaining.value : ajaxUrlBudget.value) : '',
  dataTree: true,
  dataTreeChildField: 'categories',
  dataTreeChildIndent: 15,
  rowClick: onRowClick,
  ...tabulatorOptions,
  initialSort: [
    { column: 'updated_at', dir: "desc" }, //sort by this first
  ],
  ajaxResponse: (url: string, params: any, response: any) => {
    totalElements.value = response?.data?.total || 0
    const addition = totalElements?.value % params.per_page > 0 ? 1 : 0
    const lastPage = Math.floor(totalElements?.value / params.per_page) + addition
    historicRemainingCosts.value = response.data.items
    setDynamicRows(response.data.items)
    let repsonseData = response.data.items
    if (props.type === 'QUATERLY') {
      repsonseData = response.data.items.map((item:any) => ({ ...item, costs: parseCostDataQuaterly(item.costs)}))
    } else if (props.type === 'YEARLY') {
      repsonseData = response.data.items.map((item:any) => ({ ...item, costs: parseYearlyData(item)}))
    }
    const retObj = {
      contentType: 'application/json; charset=utf-8',
      data: repsonseData.map((item: any) => ({
        ...item,
        distributed: item.total_remaining,
        difference: 0,
        categories: [],
        ...item.costs?.reduce(
          (obj: any, item: any) => Object.assign(obj, { [item.month ? `${item.month}/${item.year}` : `${item.year}`]: item.value }), {})
      })),
      last_page: lastPage
    }
    return retObj
  }
}
})
const onRowClick = (e: Event, cell: RowComponent) => {
  const data = cell.getData() as any
  const allRows = tabulator.value.getRows()
  const selectedRow = allRows.find(
      (row: RowComponent) => data?.id === row.getData().id
  )
  const isChild = cell.getTreeParent();

  if (!data.categories?.length && !isChild) {
    getHistoryByCategories(data.id, data)
  }
  !isChild && selectedRow.treeToggle()
}
const setTabulator = async () => {
  if (table.value) {
    tabulator.value = new Tabulator(table.value, tableDefinition.value)
    tabulator.value.on('rowClick', onRowClick)
  }
}

onMounted(() => {
  setTabulator()
})
onUnmounted(() => {
  if (table.value) {
    tabulator.value.off('rowClick', onRowClick)
  }
});

const opened = ref(false);

watch(opened, async (newVal, olVal) => {
  if (newVal) {
    await nextTick()
    setTabulator()
  }
  emit('update:modelValue', opened.value ? opened.value : false)
})

watch(() => props.phaseId, async(newVal, oldVal) => {
  await nextTick()
  setTabulator()
})

watch(() => props.type, async(newVal, oldVal) => {
  await nextTick()
  setTabulator()
})


defineExpose({
  opened: opened,
  setTabulator: setTabulator
})
</script>
<template>
  <div class="history">
    <v-expansion-panels v-model="opened">
      <v-expansion-panel :value="true" :title="$t('workspaces.financials.remaining.historyTitle')"
        :text="totalElements === 0 ? $t('workspaces.financials.remaining.noData') : $t(`workspaces.financials.${routeName as string}.historySubTitle`)" data-testid="history">
        <v-expansion-panel-text>
          <span v-show="totalElements > 0">
            <div ref="table" class="mt-5" />
          </span>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<style lang="scss">
@import '../../../../assets/styles/global/variables';

.history {
  .tabulator-cell {
    .tabulator-data-tree-control {
      display: none!important;
    }
  }
  .child-updated-at {
    width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .parent-updated-at {
    display: flex;
    align-items: center;
    .icon {
      vertical-align: middle;
    }
    .text {
      font-size: $font-table-row!important;
      font-family: 'Poppins',serif!important;
    }
  }
}

</style>