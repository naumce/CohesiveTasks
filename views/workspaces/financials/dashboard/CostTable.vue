<template>
  <v-card width="100%" height="auto"  class="px-4 card-item">
    <div class="d-flex align-center justify-space-between">
      <div>
        <v-card-title>{{ $t('workspaces.financials.dashboard.costTableTitle') }}</v-card-title>
        <v-card-subtitle>{{ $t('workspaces.financials.dashboard.costTableSubTitle') }}</v-card-subtitle>
      </div>
      <div class="d-flex align-center justify-end">
        <!-- <span>
          {{ t('workspaces.financials.dashboard.tables.costGraph') }}
        </span>
        <v-switch hide-details class="mx-4"></v-switch> -->
        <v-select label="" v-model="showby" :items="['Monthly', 'Quarterly', 'Yearly']" variant="outlined" class="mt-5" @update:modelValue="setupTabulator" />
        <v-menu :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <img src="/src/assets/FILTERROWS.svg" alt="img" height="24" width="24" id="FilterColumnsIcon"
              class="mb-2 mx-4 cursor-pointer" v-bind="props" />
          </template>
          <v-list>
            <v-list-item v-for="(item, index) in rowsArray" :key="index" :value="index">
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
        <div ref="table" class="my-5" id="cost-table" style="height: auto!;" />
      </v-col>
    </v-row>
  </v-card>
</template>
<script setup lang="ts">
import { ref, onMounted, defineProps, computed, watch } from 'vue';
import {
  TabulatorFull as Tabulator, type Options,
  type CellComponent,
  type ColumnDefinition
} from 'tabulator-tables';
import useTabulatorOptions from '@/composables/tabulator'
import { useI18n } from 'vue-i18n'
import {formatNumber} from "@/utils/number";

const showby = ref('Monthly');
const { t } = useI18n()

const props = defineProps({
  costData: {
    type: Array
  }
});

watch(() => props.costData, async(newVal, oldVal) => {
  setupTabulator()
})

const rowsArray = ref([
  {
    title: t('workspaces.financials.dashboard.cards.revenue'),
    key: 'revenue',
    visible: true
  },
  {
    title: t('workspaces.financials.dashboard.cards.actualCost'),
    key: 'actual_cost',
    visible: true
  },
  {
    title: t('workspaces.financials.dashboard.cards.remainingCost'),
    key: 'remaining_cost',
    visible: true
  },
  {
    title: t('workspaces.financials.dashboard.cards.atCompletionCost'),
    key: 'at_completion_cost',
    visible: true
  },
  {
    title: t('workspaces.financials.dashboard.cards.originalBudget'),
    key: 'original_budget',
    visible: true
  },
  {
    title: t('workspaces.financials.dashboard.cards.actualApprovedCost'),
    key: 'current_budget',
    visible: true
  },
  {
    title: t('workspaces.financials.dashboard.cards.pendingActualCost'),
    key: 'proposed_budget',
    visible: true
  },
  {
    title: t('workspaces.financials.dashboard.cards.margin'),
    key: 'margin',
    visible: true,
  }
])

const quarterOfYear = (date = new Date()) => ({ quater: Math.ceil((date.getMonth() + 1) / 3),
  year: date.getFullYear()
});

const dynmaicColoumns = computed(() => {
  const costData = props.costData || []
  const monthlyColoumns = costData?.sort((a: any, b: any) => {
    return new Date(a.date).valueOf() - new Date(b.date).valueOf();
  })?.map((item: any) => ({
    minWidth: 180,
    visible: true,
    title: `${item.year}-${item.month < 10 ? '0' + item.month : '' + item.month}`,
    field: `${item.month < 10 ? '0' + item.month : '' + item.month}/${item.year}`,
    formatter: (cell: CellComponent) => {
      const isNegative = formatNumber(cell.getValue()).includes('-');
      return cell.getValue() !== null
          ? `<div class="${isNegative ? 'text-red' : ''}">${formatNumber(cell.getValue(),false)}</div>`
          : ''
    },
    headerSort: false,
    data: item
  })) || []
  if (showby.value === 'Quarterly') {
    const quatersObj: Record<string, any> = {};
    const quaterArray: any = []
    monthlyColoumns.forEach((item:any) => {
      const { quater , year } = quarterOfYear(new Date(item.data.date));
      const key: string = `${year}-Q${quater}`
      const itemObj = {
        ...item,
        title: key,
        field: key
      }
      if (quatersObj[key]) return quatersObj[key].push(itemObj);
      else quatersObj[key] = [itemObj];
      return quaterArray.push(itemObj)
    })
    return { arry: quaterArray, obj: quatersObj }
  } else if (showby.value === 'Yearly') {
    const yearObj:any = {};
    const yearArray: any = [];
    monthlyColoumns.forEach((item: any) => {
      const key = item.data.year?.toString();
      const itemObj = {
        ...item,
        title: key,
        field: key
      }
      if (yearObj[key]) return yearObj[key].push(itemObj);
      else yearObj[key] = [itemObj];
      return yearArray.push(itemObj)
    })
    return { arry: yearArray, obj: yearObj }
  }
  return { arry: monthlyColoumns, obj: {}  };
})
const columns: Array<ColumnDefinition> = [
  {
    minWidth: 180,
    visible: true,
    title: t('workspaces.financials.remaining.costType'),
    field: 'fieldName',
    frozen: true,
    headerSort: false
  },
  {
    minWidth: 180,
    visible: true,
    title: t('misc.total'),
    field: 'total',
    headerSort: false,
    cssClass:'total-column font-weight-bold text-primary',
    frozen: true,
    formatter: (cell: CellComponent) => {
      const isNegative = formatNumber(cell.getValue()).includes('-');
      return cell.getValue() !== null
          ? `<div class="font-weight-bold ${isNegative ? 'text-red' : 'text-primary'}">${formatNumber(cell.getValue(),false)}</div>`
          : ''
    },
  }
];

const tabulator = ref()
const { tabulatorOptions } = useTabulatorOptions()
const table = ref();

const getCostData = computed(() => {
  const parsedData = rowsArray.value?.filter(item => item.visible).map((item) => {
    let parsed;
    if (showby.value === 'Monthly') {
      parsed = dynmaicColoumns.value?.arry?.length > 0 ? {
        ...dynmaicColoumns.value.arry.reduce(
          (obj: any, arrayItem: any) => Object.assign(obj, { [arrayItem.field]: arrayItem.data[item.key] }), {})
      } : {}
    } else if (showby.value === 'Quarterly' || showby.value === 'Yearly') {
      const { obj } = dynmaicColoumns.value
      const quatersObj: Record<string, any> = {}
      Object.keys(obj).map((qItem: any) => {
        quatersObj[qItem] = obj[qItem].reduce((a:any, b:any) => {
          return a + parseFloat(b.data[item.key])
        }, 0)
      })
      parsed = quatersObj
    }
    const total = Object.values(parsed)?.length > 0 ? Object.values(parsed)?.reduce((sum: any, num: any) => parseFloat(sum) + parseFloat(num)) : 0
    return { fieldName: item.title, id: item.key, ...parsed, total: total }
  });
  return parsedData;
});

const setupTabulator = () => {
  const tableDefinition: Options = {
    ...tabulatorOptions,
    layout: "fitDataTable",
    height: "auto",
    pagination: false,
    columns: [columns[0], ...(dynmaicColoumns.value?.arry || []), columns[1]],
    sortMode: 'remote',
    filterMode: 'remote',
  }
  tabulator.value = new Tabulator(table.value, { ...tableDefinition, data: getCostData.value })
}

onMounted(() => {
  setupTabulator()
});

</script>


<style lang="scss">
@import "@/assets/styles/global/variables";
.total-column {
  .tabulator-col-title{
    font-weight: 600!important;
    color: $primary-color!important;
  }
}
</style>