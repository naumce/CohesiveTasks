<template>
  <v-card width="100%" fluid class="my-4 px-4">
    <div class="d-flex align-center justify-space-between">
      <div>
        <v-card-title>{{ $t('workspaces.financials.dashboard.costSheetTitle') }}</v-card-title>
        <v-card-subtitle>{{ $t('workspaces.financials.dashboard.costSheetSubTitle') }}</v-card-subtitle>
      </div>
      <div class="d-flex align-center justify-end">
        <span>
          {{ $t(`workspaces.financials.dashboard.tables.financialTypeView`) }}
      </span>
        <v-switch color="primary" v-model="isCategory" hide-details class="mx-4"></v-switch>
        <v-menu :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <img src="/src/assets/FilterColumnsIcon.svg" alt="img" height="24" width="24" id="FilterColumnsIcon"
                 class="mb-4 mx-4 cursor-pointer" v-bind="props" />
          </template>
          <v-list>
            <v-list-item v-for="(item, index) in dynmaicColoumns" :key="index" :value="index">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <template v-slot:append>
                <v-switch color="secondary" label=" " hide-details v-model="item.visible"
                          @update:modelValue="setupTabulator" />
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
    <v-row>
      <v-col>
        <div ref="table" class="my-5" id="cost-sheet" />
      </v-col>
    </v-row>
  </v-card>
</template>
<script setup lang="ts">

import { ref, onMounted, defineProps, computed, watch, nextTick } from 'vue';
import {
  TabulatorFull as Tabulator, type Options,
  type CellComponent,
  type ColumnDefinition
} from 'tabulator-tables';
import useTabulatorOptions from '@/composables/tabulator';
import { useI18n } from 'vue-i18n'
import {formatNumber} from "@/utils/number";
const { t } = useI18n()

const props = defineProps({
  costDataPhase: {
    type: Array
  },
  costDataCategory: {
    type: Array
  }
});

const isCategory = ref(false)

watch(() => isCategory.value, async(newVal, oldVal) => {
  costData.value = newVal === true ? props.costDataCategory : props.costDataPhase
  setupTabulator()
})

var costData = ref([]) as any
const tabulator = ref()
const table = ref();
const {
  emptyHeaderFilter,
  numberHeaderFilter,
  tabulatorOptions
} = useTabulatorOptions()

const customHeaderFilter = (headerValue: any, rowValue: any) => {
  const { ge = 0, le = 0 } = headerValue
  const value = parseFloat(rowValue || 0)
  const great = parseFloat(ge || 0)
  const less = parseFloat(le || 0)
  if (great && less) return value >= parseFloat(ge) && value <= parseFloat(le || 0)
  if (great && ge) return value >= parseFloat(ge)
  if (less && le) return value <= parseFloat(le || 0)
  return true
}

const dynmaicColoumns = ref([
  {
    minWidth: 180,
    visible: true,
    title: t('workspaces.financials.dashboard.cards.originalBudget'),
    field: 'original_budget',
    // @ts-ignore
    headerPopup: numberHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: customHeaderFilter,
    headerFilterFuncParams: 'useGtLt',
  },
  {
    minWidth: 180,
    visible: true,
    title: t('workspaces.financials.dashboard.cards.currentBudget'),
    field: 'current_budget',
    // @ts-ignore
    headerPopup: numberHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: customHeaderFilter,
    headerFilterFuncParams: 'useGtLt',
  },
  {
    minWidth: 180,
    visible: true,
    title: t('workspaces.financials.dashboard.cards.proposedBudget'),
    field: 'proposed_budget',
    // @ts-ignore
    headerPopup: numberHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: customHeaderFilter,
    headerFilterFuncParams: 'useGtLt',
  },
  {
    minWidth: 180,
    visible: true,
    title: t('workspaces.financials.dashboard.cards.actualCost'),
    field: 'actual_cost',
    // @ts-ignore
    headerPopup: numberHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: customHeaderFilter,
    headerFilterFuncParams: 'useGtLt',
  },
  {
    minWidth: 180,
    visible: true,
    title: t('workspaces.financials.dashboard.cards.remainingCost'),
    field: 'remaining_cost',
    // @ts-ignore
    headerPopup: numberHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: customHeaderFilter,
    headerFilterFuncParams: 'useGtLt',
  },
  {
    minWidth: 180,
    visible: true,
    title: t('workspaces.financials.dashboard.cards.atCompletionCost'),
    field: 'at_completion_cost',
    // @ts-ignore
    headerPopup: numberHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: customHeaderFilter,
    headerFilterFuncParams: 'useGtLt',
  },
  {
    minWidth: 180,
    visible: true,
    title: t('workspaces.financials.dashboard.cards.revenue'),
    field: 'revenue',
    // @ts-ignore
    headerPopup: numberHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: customHeaderFilter,
    headerFilterFuncParams: 'useGtLt',
  },
  {
    minWidth: 180,
    visible: true,
    title: t('workspaces.financials.dashboard.cards.margin'),
    field: 'margin',
    // @ts-ignore
    headerPopup: numberHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: customHeaderFilter,
    headerFilterFuncParams: 'useGtLt',
  },
  {
    minWidth: 180,
    visible: true,
    title: t('workspaces.financials.dashboard.cards.marginPercent'),
    field: 'margin_percent',
    // @ts-ignore
    headerPopup: numberHeaderFilter,
    headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
    headerFilter: emptyHeaderFilter,
    headerFilterFunc: customHeaderFilter,
    headerFilterFuncParams: 'useGtLt',
  }
]);

const columns: Array<ColumnDefinition> = [
  {
    minWidth: 180,
    visible: true,
    title: t('misc.id'),
    field: 'custom_id',
    frozen: true,
    formatter: (cell: CellComponent) => {
      const row = cell.getRow()?.getData();
      const value = cell.getValue() || ' '
      if (row.custom_id !== 'TOTAL') return value.trim();
      const span = document.createElement('span')
      span.className = 'font-weight-bold text-primary'
      span.innerText =  value?.trim()
      return span
    }
  }
];

const getColoumns = computed(() => {
  const phaseCol =   {
    minWidth: 180,
    visible: true,
    title: isCategory.value ? t('workspaces.financials.dashboard.tables.financialCategory') : t('workspaces.financials.transactions.phase'),
    field: 'name',
    frozen: true
  }
  dynmaicColoumns.value = dynmaicColoumns.value.map(item => ({
    ...item,
    headerSort: false,
    formatter: (cell: CellComponent) => {
      let row = cell.getRow()?.getData()
      const isNegative = formatNumber(cell.getValue()).includes('-');

      if (row.custom_id !== 'TOTAL') {
        return `<div class="${isNegative ? 'text-red' : ''}">${formatNumber(cell.getValue(),false)}</div>`
      }
      row.margin_percent = row.revenue === 0 ? 0 : (row.margin / row.revenue) * 100
      return `<div class="font-weight-bold ${isNegative ? 'text-red' : 'text-primary'}">${formatNumber(cell.getValue(),false)}</div>`
    }
  }))
  return [...columns, phaseCol, ...dynmaicColoumns.value].map(item => ({
    ...item,
    headerSort: false,
  }))
})

const getTableData = computed(() => {
  const data = costData?.value && costData?.value.map((item: any) => ({ ...item, custom_id: isCategory.value ? item.transaction_category.custom_id : item.phase.custom_id, name: isCategory.value ? item.transaction_category.name : item.phase.name })) || []
  const total: Record<string, any> = {
    custom_id: 'TOTAL',
    phase: 'All'
  }
  dynmaicColoumns.value?.forEach((item: any) => { total[item.field] = 0 })
  costData?.value && costData?.value.forEach((item: any) => {
    dynmaicColoumns.value?.forEach((col: any) => {
      console.log(col.field);
      total[col.field] += parseFloat(item[col.field]) || 0.00
    })
  })
  if (data?.length) data.push(total)
  return data;
})

const setupTabulator = () => {
  const tableDefinition: Options = {
    ...tabulatorOptions,
    pagination: false,
    height: "auto",
    columns: getColoumns.value,
    sortMode: 'local',
    filterMode: 'local',
  }
  tabulator.value = new Tabulator(table.value, { ...tableDefinition, data: getTableData.value })
}

onMounted(() => {
  costData.value = props.costDataPhase
  nextTick()
  setupTabulator()
});
</script>