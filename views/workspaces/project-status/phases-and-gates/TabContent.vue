<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import {
  TabulatorFull as Tabulator,
  type Options,
  type CellComponent,
  type RowComponent
} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import getPhaseColumnsDefinition from './phase-columns-definition'
import getGateColumnsDefinition from './gate-columns-definition'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import type { HttpRequest, ProjectPhaseGate } from '@/types'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AddDialog from './dialogs/AddDialog.vue'
import EditDialog from './dialogs/EditDialog.vue'
// import DeleteDialog from './dialogs/DeleteDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import type {AxiosError} from "axios";
import NoPhasesWarningDialog from "@/views/workspaces/financials/remaining-cost/dialogs/NoPhasesWarningDialog.vue";

const props = defineProps({
  type: {
    type: String,
    required: true,
    default: 'phase'
  },
  data: {
    type: Array<ProjectPhaseGate>,
    required: true,
    default: () => []
  },
  modify: {
    type: Boolean,
    required: true,
    default: false
  }
})
const emit = defineEmits(['add', 'edit', 'remove'])

const { sendRequest } = useApis()
const route = useRoute()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`

const table = ref()
const tabulator = ref()
const addDialog = ref()
const editDialog = ref()
const dialog = reactive({
  add: false,
  edit: false,
  delete: false,
  deleteWarning: false,
})
const selected = ref<ProjectPhaseGate>()
watch(
  () => props.data,
  (newValue) => {
    tabulator.value.setData(newValue)
  },
  { deep: true }
)

const { t } = useI18n()
const actionsContextMenu = !props.modify
  ? []
  : [
      {
        label: t('misc.edit'),
        action: (e: Event, cell: CellComponent) => {
          const data = cell.getData() as ProjectPhaseGate
          selected.value = data
          dialog.edit = true
        }
      },
      {
        label: t('misc.delete'),
        action: (e: Event, cell: CellComponent) => {
          const data = cell.getData() as ProjectPhaseGate
          selected.value = data
          dialog.delete = true
        }
      }
    ]
const rowContextMenu = [
  {
    label: t('misc.edit'),
    action: (e: Event, row: RowComponent) => {
      const data = row.getData() as ProjectPhaseGate
      selected.value = data
      dialog.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, row: RowComponent) => {
      const data = row.getData() as ProjectPhaseGate
      selected.value = data
      dialog.delete = true
    }
  }
]

const { tabulatorOptions } = useTabulatorOptions()
const tableDefinition: Options = {
  columns:
    props.type === 'phase'
      ? getPhaseColumnsDefinition(actionsContextMenu)
      : getGateColumnsDefinition(actionsContextMenu),
  data: props.data,
  ...tabulatorOptions,
  rowContextMenu: rowContextMenu,
  maxHeight: '400px',
  pagination: false,
  sortMode: 'local',
  filterMode: 'local'
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})
onUnmounted(() => {
  tabulator.value.destroy()
})
function add(data: ProjectPhaseGate) {
  const { type, ...rest } = data
  const url = (type === 'gate' ? apiUrls.gates : apiUrls.phases)
    .replace(/%tenantId/, tenantId)
    .replace(/%projectId/, projectId)
  const addRequest: HttpRequest = {
    method: 'post',
    url: url,
    data: rest,
    onSuccess: {
      callback: (response) => {
        const added = {
          id: 0,
          comment: '',
          lane: 0,
          name: '',
          start_date: null,
          end_date: null,
          cost_budget: null,
          cost_actual: null,
          hours_budget: null,
          hours_actual: null,
          remaining_hours: null,
          remaining_cost: null
        }
        emit('add', { ...added, ...response.data })
        dialog.add = false
      },
      message: t(`projectStatus.phaseGate.${type}.addSuccess`)
    }
  }

  sendRequest(addRequest)
}

function edit(data: ProjectPhaseGate) {
  const { type, ...rest } = data
  const url = `${(type === 'gate' ? apiUrls.gates : apiUrls.phases)
    .replace(/%tenantId/, tenantId)
    .replace(/%projectId/, projectId)}/${selected.value?.id}/`
  const editPhaseGate: HttpRequest = {
    method: 'patch',
    url: url,
    data: rest,
    onSuccess: {
      callback: (response) => {
        editDialog.value.close()
        emit('edit', response.data)
      },
      message: t(`projectStatus.phaseGate.${props.type}.editSuccess`)
    }
  }
  sendRequest(editPhaseGate)
}
function remove() {
  const url = `${(props.type === 'gate' ? apiUrls.gates : apiUrls.phases)
    .replace(/%tenantId/, tenantId)
    .replace(/%projectId/, projectId)}/${selected.value?.id}/`
  const deletePhaseGate: HttpRequest = {
    method: 'delete',
    url: url,
    onSuccess: {
      callback: () => {
        emit('remove', selected.value)
      },
      message: t(`projectStatus.phaseGate.${props.type}.deleteSuccess`)
    },
    onError: {
      callback(error: AxiosError) {
        const data:any = error?.response?.data;
        if(data?.error_code === "CAN_NOT_DELETE") {
          dialog.deleteWarning = true;
        }
      },
    },
    finally: () => {
      dialog.delete = false
      selected.value = undefined
    }
  }
  sendRequest(deletePhaseGate,{hideErrorMsg: true})
}

function openAddModal() {
  dialog.add = !dialog.add
}

defineExpose({
  openAddModal
});
</script>
<template>
  <div class="mt-5">
    <div ref="table" class="mt-5" />
    <AddDialog
      v-if="dialog.add"
      v-model="dialog.add"
      ref="addDialog"
      :type="props.type"
      @submit="add"
    />
    <EditDialog
      v-if="dialog.edit"
      v-model="dialog.edit"
      :value="selected"
      ref="editDialog"
      @submit="edit"
    />
    <DeleteDialog v-model="dialog.delete" :title="$t(`projectStatus.phaseGate.${props.type}.deleteTitle`)" :text="$t(`projectStatus.phaseGate.${props.type}.deleteText`)" @submit="remove" />
    <NoPhasesWarningDialog
        v-if="dialog.deleteWarning"
        :title=" t(`projectStatus.phaseGate.${props.type}.deleteWarningTitle`)"
        :text=" t(`projectStatus.phaseGate.${props.type}.deleteWarningText`)"
        v-model="dialog.deleteWarning"
        icon-color="#E54949"
    />
  </div>
</template>
