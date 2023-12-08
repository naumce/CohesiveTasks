<script setup lang="ts">
import {ref, onMounted, computed, reactive} from 'vue'
import useTabulatorOptions from '@/composables/tabulator'
import { TabulatorFull as Tabulator, type Options, type Filter } from 'tabulator-tables'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import { useRoute } from 'vue-router'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { HttpRequest, ProjectKpi } from '@/types'
import type { CellComponent, ColumnDefinition } from 'tabulator-tables'
import { useI18n } from 'vue-i18n'
import SearchInput from '@/components/SearchInput.vue'
import DeleteDialog from "@/components/dialogs/DeleteDialog.vue";
import {togglePagination} from "@/utils/pagination";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  }
})

const { loading } = storeToRefs(useLoaderStore())
const removeKpiDialog = reactive({
  opened: false,
  type: '',
  data:{},
})

const { t } = useI18n()
const columns: Array<ColumnDefinition> = [
  {
    field: 'custom_id',
    title: 'KPI ID',
    hozAlign: 'center',
    sorter: 'boolean',
    width: 100,
    formatter: (cell: CellComponent) => {
      const value = cell.getValue()
      return value
    }
  },
  {
    field: 'name',
    title: t('projectStatus.kpi.fields.kpi_name'),
    hozAlign: 'center',
    sorter: 'string',
    sorterParams: {
      locale: true
    },
    width: 200
  },
  {
    field: 'description',
    title: t('projectStatus.kpi.fields.description'),
    sorter: 'string',
    headerHozAlign: 'left',
    width: 200
  },
  {
    field: 'threshold_levels',
    title: t('projectStatus.kpi.fields.threshold_levels'),
    hozAlign: 'center',
    headerSort: false,
    width: 200
  },
  {
    field: 'in_use',
    title: t('projectStatus.kpi.fields.use'),
    hozAlign: 'center',
    headerSort: false,
    width: 100,
    formatter: (cell: CellComponent) => {
      const value = cell.getValue();
      return `<input type='checkbox' ${value ? 'checked' : ''}  onclick=" return false" />`
    },
    cellClick: function (e, cell) {
      const value = cell.getValue()
      const data = cell.getData() as ProjectKpi
      if(value){
        removeKpiDialog.data = data;
        removeKpiDialog.opened = true;
        return;
      }
       addRemoveKpi(data.id, 'post')
    }
  }
]
const { sendRequest } = useApis()

const emit = defineEmits(['update:modelValue', 'close'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const table = ref()
const tabulator = ref()
const { tabulatorOptions } = useTabulatorOptions()
const route = useRoute()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`
const ajaxUrl = `${apiUrls.tenantKpis.replace(/%tenantId/, tenantId)}in_project/${projectId}/`

const tableDefinition: Options = {
  columns: columns,
  ajaxURL: `${ajaxUrl}`,
  ...tabulatorOptions,
  ajaxResponse: (url: any, params: any, response: any) => {
    const totalElements = response.data?.total || 0
    const addition = totalElements % params.per_page > 0 ? 1 : 0
    const lastPage = Math.floor(totalElements / params.per_page) + addition
    togglePagination(totalElements,table.value);
    const retObj = {
      contentType: 'application/json; charset=utf-8',
      data: response.data.items.map((item: any) => ({
        ...item,
        threshold_levels: item.thresholds.length
      })),
      last_page: lastPage
    }
    return retObj
  }
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})

function addRemoveKpi(kpiId: number, method: string) {
  const selectKpi: HttpRequest = {
    method: method,
    url: apiUrls.kpis.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId),
    data: { kpi_id: kpiId },
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
        removeKpiDialog.data = {};
        removeKpiDialog.opened = false;
      }
    }
  }
  sendRequest(selectKpi)
}
function onSearchInput(event: InputEvent) {
  const value = (event.target as HTMLInputElement).value
  const currentFilters = tabulator.value
    .getFilters()
    .filter((filter: Filter) => filter.field !== 'name')
  const filters = [
    ...currentFilters,
    ...(value ? [{ field: 'name', type: 'like', value: encodeURIComponent(value) }] : [])
  ]
  tabulator.value.setFilter(filters)
}

function deleteKpi() {
  const data =  removeKpiDialog?.data as ProjectKpi;
  addRemoveKpi(data.id, 'delete')
}
</script>
<template>
  <v-dialog v-model="show" persistent width="905">
    <v-card>
      <v-card-title>
        <span class="dialog-title">{{ $t('projectStatus.kpi.dialog.kpiList') }}</span>
        <div class="d-flex flex-column">
          <span class="dialog-desc">{{ $t('projectStatus.kpi.dialog.chooseKpiText') }}</span>
          <v-col cols="12" class="ma-0 pa-0 mt-5">
            <SearchInput :placeholder="$t('projectStatus.kpi.dialog.searchKpis')"
                         @input="onSearchInput" data-testid="search-kpi"/>
          </v-col>
        </div>
      </v-card-title>

      <v-card-text>
        <div ref="table" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="loading" class="primary-negative-btn" @click="emit('close')" data-testid="close">
          {{ $t('misc.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
    <DeleteDialog
        v-if="removeKpiDialog.opened"
        v-model="removeKpiDialog.opened"
        :title="$t(`projectStatus.kpi.dialog.deleteKpiWarningTitle`)"
        :text="$t(`projectStatus.kpi.dialog.deleteKpiWarningMsg`)"
        @submit="deleteKpi"
        no-question-mark
    />
  </v-dialog>
</template>
