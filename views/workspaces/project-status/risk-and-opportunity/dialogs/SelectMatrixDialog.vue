<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  TabulatorFull as Tabulator,
  type CellComponent,
  type Options,
  type ColumnDefinition,
  type Filter
} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import { useI18n } from 'vue-i18n'
import useApis from '@/composables/api'
import { apiUrls } from '@/plugins/axios'
import { useCustomizerStore } from '@/stores/customizer'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import type { HttpRequest } from '@/types'
import SearchInput from '@/components/SearchInput.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  type: {
    type: String,
    required: true,
    default: 'risk'
  },
  project: {
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const { loading } = storeToRefs(useLoaderStore())

const table = ref()
const tabulator = ref()

const { t } = useI18n()
const columns: Array<ColumnDefinition> = [
  {
    formatter: 'rowSelection',
    title: '',
    resizable: false,
    minWidth: 45,
    width: 45,
    hozAlign: 'center',
    cssClass: 'selection-column',
    headerSort: false,
    cellClick: (e, cell) => {
      cell.getRow().toggleSelect()
    }
  },
  {
    field: 'custom_id',
    title: t('projectStatus.riskAndOpportunities.matrixSelect.fields.custom_id'),
    hozAlign: 'center',
    sorter: 'string'
  },
  {
    field: 'name',
    title: t('projectStatus.riskAndOpportunities.matrixSelect.fields.name'),
    hozAlign: 'center',
    sorter: 'string'
  },
  {
    field: 'probabilities',
    title: t('projectStatus.riskAndOpportunities.matrixSelect.fields.size'),
    headerSort: false,
    headerHozAlign: 'left',
    formatter: (cell: CellComponent) => {
      const value = cell.getValue()
      const severities = cell.getRow().getData().severities
      return `${value?.length || 0} * ${severities?.length || 0}`
    }
  }
]

const route = useRoute()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`

const { tabulatorOptions } = useTabulatorOptions()
const tableDefinition: Options = {
  columns: columns,
  ajaxURL: `${apiUrls.matrix.replace(/%tenantId/, tenantId)}`,
  ...tabulatorOptions,
  initialFilter: [
    {
      field: 'type',
      type: '=',
      value: props.type === 'risk' ? 'RISK_MATRIX' : 'OPPORTUNITY_MATRIX'
    }
  ],
  selectable: 1
}
const selectedMatrix = ref<Array<any>>([])
function selectionChanged(data: Array<any>) {
  selectedMatrix.value = data
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
  tabulator.value.on('rowSelectionChanged', selectionChanged)
})
onUnmounted(() => {
  tabulator.value.off('rowSelectionChanged', selectionChanged)
})
function closeMatrixSelectionDialog() {
  emit('update:modelValue', false)
}

const { sendRequest } = useApis()
const { setProject } = useCustomizerStore()
const isDisabled = computed(() => {
  if (loading.value) return true
  if (!selectedMatrix.value.length) return true
  return selectedMatrix.value[0].id === props.project[`${props.type}_matrix`].id
})
function selectMatrix() {
  if (!selectedMatrix.value.length) return
  const selected = selectedMatrix.value[0]
  if (selected.id === props.project[`${props.type}_matrix`].id) return

  const data = {
    custom_id: props.project.custom_id,
    name: props.project.name,
    [`${props.type}_matrix_id`]: selected.id
  }

  const assingMatrix: HttpRequest = {
    method: 'patch',
    url: `${apiUrls.projects.replace(/%tenantId/, tenantId)}/${projectId}/`,
    data: data,
    onSuccess: {
      callback: (response) => {
        setProject(response.data)
        emit('change')
      }
    }
  }

  sendRequest(assingMatrix)
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
</script>
<template>
  <v-dialog v-model="show" persistent width="700">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{
          $t('projectStatus.riskAndOpportunities.matrixSelect.title')
        }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" class="bg-error">
              <v-icon icon="mdi-alert" class="mr-2" />
              <span>{{ $t('projectStatus.riskAndOpportunities.matrixSelect.text') }}</span>
            </v-col>
          </v-row>
          <v-row class="mt-4">
            <v-col cols="12">
              <SearchInput
                :placeholder="$t('projectStatus.riskAndOpportunities.matrixSelect.searchLabel')"
                @input="onSearchInput"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div ref="table" class="mt-5" />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="closeMatrixSelectionDialog">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn :disabled="isDisabled" class="primary-action-btn" @click="selectMatrix" data-testid="save">
          {{ $t('misc.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
