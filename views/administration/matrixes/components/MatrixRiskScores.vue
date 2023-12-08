<script setup lang="ts">
import {computed, onMounted, onUnmounted, reactive, ref} from 'vue'
import {type CellComponent, type Options, TabulatorFull as Tabulator} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import {apiUrls} from '@/plugins/axios'
import {useRoute} from 'vue-router'
import useApis from '@/composables/api'
import {useI18n} from 'vue-i18n'
import type {HttpRequest, MatrixRiskScore} from '@/types'
import ManageMatrixRiskScoreDialog from '../dialogs/ManageMatrixRiskScoreDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'

const props = defineProps({
  matrixId: {
    type: Number,
    required: true,
    default: 0
  },
  value: {
    type: Object as () => MatrixRiskScore[],
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['change'])

const thresholds = ref<MatrixRiskScore[]>(JSON.parse(JSON.stringify(props.value || [])))

const sortedValues = computed<MatrixRiskScore[]>(() => {
  const factsCopy = JSON.parse(JSON.stringify(thresholds.value))
  return factsCopy.sort((a: MatrixRiskScore, b: MatrixRiskScore) => {
    return a.high - b.high
  })
})

const route = useRoute()
const tenantId = route.params.tenantId as string

const dialogs = reactive({
  new: false,
  edit: false,
  delete: false
})

const table = ref()
const tabulator = ref()

const { tabulatorOptions, contextActionsFormatter } = useTabulatorOptions()
const { t } = useI18n()

const selectedRow = ref<MatrixRiskScore>()
const actionsContextMenu = [
  {
    label: t('misc.edit'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as MatrixRiskScore
      selectedRow.value = data
      dialogs.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as MatrixRiskScore
      selectedRow.value = data
      dialogs.delete = true
    }
  }
]

const tableDefinition: Options = {
  columns: [
    {
      field: '',
      title: t('misc.operator'),
      headerSort: false,
      headerHozAlign: 'left',
      formatter: (cell: CellComponent) => {
        const data = cell.getData() as MatrixRiskScore
        return data.high ? '>' : '<='
      }
    },
    {
      field: 'high',
      title: t('misc.high'),
      headerSort: false,
      headerHozAlign: 'left'
    },
    {
      field: 'color',
      title: t('misc.color'),
      headerSort: false,

      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        const span = document.createElement('span')
        span.style.borderRadius = '4px'
        span.style.padding = '10px'
        span.style.minWidth = '50px'
        span.style.backgroundColor = value === '#ffffff' ? 'grey' : value
        return span
      }
    },
    {
      title: '',
      clickMenu: actionsContextMenu,

      headerSort: false,
      width: 60,
      formatter: contextActionsFormatter
    }
  ],
  ...tabulatorOptions,
  data: sortedValues.value,
  pagination: false,
  layout: 'fitColumns'
}

onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})
onUnmounted(() => {
  tabulator.value.destroy()
})

const apiUrl = `${apiUrls.matrix.replace(/%tenantId/, tenantId)}/${props.matrixId}/threshold`
const { sendRequest } = useApis()
const newRisk = (data: MatrixRiskScore) => {
  const { id, ...rest } = data
  const postReq: HttpRequest = {
    method: 'post',
    url: apiUrl,
    data: [...thresholds.value, rest],
    onSuccess: {
      callback: (response) => {
        thresholds.value = response.data
        tabulator.value.setData(sortedValues.value)
        emit('change')
      },
      message: t(`administration.matrixes.risk.new.success`)
    },
    finally: () => {
      dialogs.new = false
    }
  }
  sendRequest(postReq)
}
const editRisk = (data: MatrixRiskScore) => {
  const edited = thresholds.value.find((r) => r.id === data.id)
  if (!edited) {
    console.error(`Edited risk score ${data} not found`)
    return
  }
  Object.assign(edited, data)
  const postReq: HttpRequest = {
    method: 'post',
    url: apiUrl,
    data: thresholds.value,
    onSuccess: {
      callback: (response) => {
        thresholds.value = response.data
        tabulator.value.setData(sortedValues.value)
        emit('change')
      },
      message: t(`administration.matrixes.risk.edit.success`)
    },
    finally: () => {
      dialogs.edit = false
    }
  }
  sendRequest(postReq)
}
const deleteRisk = () => {
  if (!selectedRow.value) return
  const postReq: HttpRequest = {
    method: 'post',
    url: apiUrl,
    data: thresholds.value.filter((r) => r.id !== selectedRow.value?.id),
    onSuccess: {
      callback: (response) => {
        thresholds.value = response.data
        tabulator.value.setData(sortedValues.value)
        emit('change')
      },
      message: t(`administration.matrixes.risk.delete.success`)
    },
    finally: () => {
      dialogs.delete = false
    }
  }
  sendRequest(postReq)
}

defineExpose({
  dialogs
})
</script>
<template>
  <v-container fluid class="ma-0 pa-0">
    <v-row dense>
      <v-col cols="12">
        <div ref="table" />
      </v-col>
    </v-row>
    <ManageMatrixRiskScoreDialog
      v-if="dialogs.new"
      v-model="dialogs.new"
      type="new"
      @submit="newRisk"
    />
    <ManageMatrixRiskScoreDialog
      v-if="dialogs.edit"
      v-model="dialogs.edit"
      :value="selectedRow"
      type="edit"
      @submit="editRisk"
    />
    <DeleteDialog
      v-if="dialogs.delete"
      v-model="dialogs.delete"
      :text="$t(`administration.matrixes.risk.delete.text`)"
      @submit="deleteRisk"
    />
  </v-container>
</template>
