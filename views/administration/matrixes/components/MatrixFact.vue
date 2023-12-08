<script setup lang="ts">
import {computed, onMounted, onUnmounted, reactive, ref} from 'vue'
import {type CellComponent, type Options, TabulatorFull as Tabulator} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import {apiUrls} from '@/plugins/axios'
import {useRoute} from 'vue-router'
import useApis from '@/composables/api'
import {useI18n} from 'vue-i18n'
import type {HttpRequest, MatrixParameter} from '@/types'
import ManageMatrixFactsDialog from '../dialogs/ManageMatrixFactsDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'

const props = defineProps({
  matrixId: {
    type: Number,
    required: true,
    default: 0
  },
  value: {
    type: Object as () => MatrixParameter[],
    default: () => {
      return {}
    }
  },
  type: {
    type: String,
    required: true,
    default: 'severities'
  }
})

const emit = defineEmits(['change'])

const facts = ref<MatrixParameter[]>(JSON.parse(JSON.stringify(props.value || [])))

const sortedValues = computed<MatrixParameter[]>(() => {
  const factsCopy = JSON.parse(JSON.stringify(facts.value))
  return factsCopy.sort((a: MatrixParameter, b: MatrixParameter) => {
    return a.score - b.score
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

const selectedRow = ref<MatrixParameter>()
const actionsContextMenu = [
  {
    label: t('misc.edit'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as MatrixParameter
      selectedRow.value = data
      dialogs.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as MatrixParameter
      selectedRow.value = data
      dialogs.delete = true
    }
  }
]

const tableDefinition: Options = {
  columns: [
    {
      field: 'custom_id',
      title: t('misc.id'),
      headerSort: false,
      headerHozAlign: 'left'
    },
    {
      field: 'name',
      title: t('misc.name'),
      headerSort: false,
      headerHozAlign: 'left'
    },
    {
      field: 'score',
      title: t('misc.score'),
      headerSort: false,
      hozAlign: 'center'
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

const apiUrl = `${apiUrls.matrix.replace(/%tenantId/, tenantId)}/${props.matrixId}/${
  props.type === 'severities' ? 'severity' : 'probability'
}`
const { sendRequest } = useApis()
const newFact = (data: MatrixParameter) => {
  const postReq: HttpRequest = {
    method: 'post',
    url: apiUrl,
    data: data,
    onSuccess: {
      callback: (response) => {
        facts.value.push(response.data)
        tabulator.value.setData(sortedValues.value)
        emit('change')
      },
      message: t(`administration.matrixes.${props.type}.new.success`)
    },
    finally: () => {
      dialogs.new = false
    }
  }
  sendRequest(postReq)
}
const editFact = (fact: MatrixParameter) => {
  if (!selectedRow.value) return
  const editReq: HttpRequest = {
    method: 'patch',
    url: `${apiUrl}/${selectedRow.value.id}/`,
    data: fact,
    onSuccess: {
      callback: (response) => {
        if (!selectedRow.value) return
        const fact = facts.value.find((f) => f.id === selectedRow.value?.id)
        if (!fact) {
          console.error('Fact not found')
          return
        }
        Object.assign(fact, response.data)
        tabulator.value.setData(sortedValues.value)
        emit('change')
      },
      message: t(`administration.matrixes.${props.type}.edit.success`)
    },
    finally: () => {
      dialogs.edit = false
    }
  }
  sendRequest(editReq)
}
const deleteFact = () => {
  if (!selectedRow.value) return
  const deleteReq: HttpRequest = {
    method: 'delete',
    url: `${apiUrl}/${selectedRow.value.id}/`,
    onSuccess: {
      callback: () => {
        if (!selectedRow.value) return
        facts.value = facts.value.filter((f) => f.id !== selectedRow.value?.id)
        tabulator.value.setData(sortedValues.value)
        emit('change')
      },
      message: t(`administration.matrixes.${props.type}.delete.success`)
    },
    finally: () => {
      dialogs.delete = false
    }
  }
  sendRequest(deleteReq)
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
    <ManageMatrixFactsDialog
      v-if="dialogs.new"
      v-model="dialogs.new"
      type="new"
      :fact-type="props.type"
      @submit="newFact"
    />
    <ManageMatrixFactsDialog
      v-if="dialogs.edit"
      v-model="dialogs.edit"
      :value="selectedRow"
      type="edit"
      :fact-type="props.type"
      @submit="editFact"
    />
    <DeleteDialog
      v-if="dialogs.delete"
      v-model="dialogs.delete"
      :text="$t(`administration.matrixes.${props.type}.delete.text`)"
      @submit="deleteFact"
    >
      <strong class="mt-4">{{ selectedRow?.name || '' }}</strong>
    </DeleteDialog>
  </v-container>
</template>
