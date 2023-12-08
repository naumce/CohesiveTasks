<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import {type CellComponent, type Options, type RowComponent, TabulatorFull as Tabulator} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import {useLoaderStore} from '@/stores/loader'
import {storeToRefs} from 'pinia'
import useApis from '@/composables/api'
import {useI18n} from 'vue-i18n'
import {useRoute} from 'vue-router'
import {apiUrls} from '@/plugins/axios'
import type {HttpRequest, ProjectStatus} from '@/types'
import {togglePagination} from "@/utils/pagination";
import {isoToStandardString} from "@/utils/date";
import SearchInput from "@/components/SearchInput.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  projects: {
    type: Array<number>,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'close'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { loading } = storeToRefs(useLoaderStore())
const route = useRoute()
// const { project } = storeToRefs(useCustomizerStore())
const tenantId = `${route.params.tenantId}`
const portfolioId = `${route.params.portfolioId}`

const table = ref()
const tabulator = ref()
const disableRowSelectionChanged = ref(false)
const selected = ref(false)

const ajaxUrl = `${apiUrls.projects.replace(/%tenantId/, tenantId)}/`
const { t } = useI18n()
const { tabulatorOptions } = useTabulatorOptions()
const tableDefinition: Options = {
  columns: [
    {
      field: 'name',
      title: t('portfolios.scoreCard.fields.name'),
      sorter: 'string',
      headerHozAlign: 'left'
    },
    {
      field: 'start_date',
      title: t('portfolios.scoreCard.fields.startDate'),
      headerSort: false,
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (!value) return ''
        return isoToStandardString(value)
      }
    },
    {
      field: 'end_date',
      title: t('portfolios.scoreCard.fields.endDate'),
      headerSort: false,
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (!value) return ''
        return isoToStandardString(value)
      }
    },
    {
      formatter: 'rowSelection',
      title: t('portfolios.scoreCard.fields.use'),
      resizable: false,
      hozAlign:"center",
      minWidth: 90,
      width: 90,
      cssClass: 'selection-column',
      headerSort: false,
    },
  ],
  ajaxURL: ajaxUrl,
  ...tabulatorOptions,
  ajaxResponse: (url: string, params: any, response: any) => {
    const totalElements = response.data?.total || 0
    const addition = totalElements % params.per_page > 0 ? 1 : 0
    const lastPage = Math.floor(totalElements / params.per_page) + addition
    togglePagination(totalElements);
    const retObj = {
      contentType: 'application/json; charset=utf-8',
      data: response.data.items.map((item: ProjectStatus | any) => ({
        ...item,
        selected: props.projects.includes(item.id),
        start_date: item?.phase_gates_summary.start_date,
        end_date: item?.phase_gates_summary.end_date,
      })),
      last_page: lastPage
    }
    return retObj
  }
}
const toggleSelect = async (e: Event, row: RowComponent) => {
  row.toggleSelect()
}

function selectRows(selected: ProjectStatus[]) {
  const rows: RowComponent[] = tabulator.value.getRows()
  disableRowSelectionChanged.value = true
  rows.forEach((row) => {
    const rowData = row.getData()
    const isSelected = (arr: ProjectStatus[], id: number): boolean => {
      return arr.some((item) => item.id === id)
    }
    const action = isSelected(selected, rowData.id) ? row.select : row.deselect
    action()
  })
  disableRowSelectionChanged.value = false
}

const onDataProcessed = () => {
  const selected = tabulator.value.getData().filter((ps:any)=>  ps.selected)
  selectRows(selected)
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
  tabulator.value.on('dataProcessed',onDataProcessed)
  tabulator.value.on('rowSelected', toggle)
  tabulator.value.on('rowDeselected', toggle)
})
onUnmounted(() => {
  tabulator.value.off('rowSelected', toggle)
  tabulator.value.on('dataProcessed', onDataProcessed)
  tabulator.value.off('rowDeselected', toggle)
})

const { sendRequest } = useApis()
function toggle(row: RowComponent) {
  const rowData = row.getData()
  if (disableRowSelectionChanged.value) return
  rowData.selected = !rowData.selected
  const url = `${apiUrls.portfolioProject
    .replace(/%portfolioId/, portfolioId)
    .replace(/%projectId/, rowData.id)}`

  const addFact: HttpRequest = {
    method: rowData.selected ? 'post' : 'delete',
    url: url,
  }
  sendRequest(addFact)
}

function close() {
  emit('update:modelValue', false)
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent width="800">
    <v-card>
      <v-card-title>
        <span class="dialog-title">{{ $t('portfolios.scoreCard.manageProjectsTitle') }}</span>
        <div class="d-flex flex-column">
          <span class="dialog-desc">{{ $t('portfolios.scoreCard.manageProjectsDesc') }}</span>
        </div>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <div ref="table" class="mt-5" data-testid="project-list"/>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="loading"
          class="primary-negative-btn"
          data-testid="dialog-close"
          @click="emit('close')"
        >
          {{ $t('misc.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
