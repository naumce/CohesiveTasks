<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { TabulatorFull as Tabulator, type Options, type CellComponent } from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import { apiUrls } from '@/plugins/axios'
import getColumnsDefinition from './columns-definition'
import useApis from '@/composables/api'
import type {
  HttpRequest,
  EventCharacterization,
  EventCharacterizationPost,
  MatrixParameter
} from '@/types'
import { useRoute } from 'vue-router'
import { useCustomizerStore } from '@/stores/customizer'
import { useI18n } from 'vue-i18n'
import SelectMatrixDialog from './dialogs/SelectMatrixDialog.vue'
import PreviewDialog from './dialogs/PreviewDialog.vue'
import AddDialog from './dialogs/AddDialog.vue'
import EditDialog from './dialogs/EditDialog.vue'
// import DeleteDialog from './dialogs/DeleteDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import { storeToRefs } from 'pinia'
import {togglePagination} from "@/utils/pagination";

const props = defineProps({
  modify: {
    type: Boolean,
    required: true,
    default: false
  },
  activeTab: {
    type: Number,
  },
})

const { sendRequest } = useApis()
const route = useRoute()
const { project } = storeToRefs(useCustomizerStore())
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`

const table = ref()
const tabulator = ref()
const newRiskDialog = ref()
const editRiskDialog = ref()

const dialog = reactive({
  newRisk: false,
  matrixSelection: false,
  preview: false,
  edit: false,
  delete: false
})
const selectedRisk = ref()
const { t } = useI18n()
const actionsContextMenu = !props.modify
  ? []
  : [
      {
        label: t('misc.edit'),
        action: (e: Event, cell: CellComponent) => {
          const data = cell.getData() as EventCharacterization
          selectedRisk.value = { ...data, status: data.status.split('.')[1] }
          dialog.edit = true
        }
      },
      {
        label: t('misc.delete'),
        action: (e: Event, cell: CellComponent) => {
          const data = cell.getData() as EventCharacterization
          selectedRisk.value = data
          dialog.delete = true
        }
      },
      {
        label: (cell: CellComponent) => {
          //component - column/cell/row component that triggered the menu
          const rowData = cell.getData() as EventCharacterization
          const show = rowData.shown_in_card
          if (show) return t('misc.hide_in_card')
          return t('misc.show_in_card')
        },
        action: (e: Event, cell: CellComponent) => {
          const rowData: any = cell.getData()
          const data: EventCharacterizationPost = {
            actions: 'actions',
            comment: rowData.comment,
            id: rowData.id,
            custom_id: rowData.custom_id,
            description: rowData.description,
            owner: rowData.ownerId,
            probability: rowData.full_probability.id,
            severity: rowData.full_severity.id,
            shown_in_card: !rowData.shown_in_card,
            status: rowData.status.split('.')[1],
            type: 'RISK'
          }
          showInCardRisk(data)
        }
      }
    ]

const ajaxUrl = `${apiUrls.projectRisksAndOpportunities
  .replace(/%tenantId/, tenantId)
  .replace(/%projectId/, projectId)}`

const { tabulatorOptions } = useTabulatorOptions()
const tableDefinition: Options = {
  columns: getColumnsDefinition(actionsContextMenu),
  // ajaxURL: `${ajaxUrl}?filter={"type":"RISK"}`,
  ajaxURL: `${ajaxUrl}`,
  ...tabulatorOptions,
  initialFilter: [{ field: 'type', type: '=', value: 'RISK' }],
  ajaxResponse: (url: string, params: any, response: any) => {
    const totalElements = response.data?.total || 0
    const addition = totalElements % params.per_page > 0 ? 1 : 0
    const lastPage = Math.floor(totalElements / params.per_page) + addition
    togglePagination(totalElements);
    const retObj = {
      contentType: 'application/json; charset=utf-8',
      data: response.data.items.map((item: EventCharacterization) => ({
        ...item,
        severity: item.full_severity.score,
        probability: item.full_probability.score,
        owner: item.full_owner.name,
        ownerEmail: item.full_owner.email,
        ownerId: item.full_owner.id
      })),
      last_page: lastPage
    }
    return retObj
  }
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})

function createNewRisk(data: EventCharacterizationPost) {
  const addNewRisk: HttpRequest = {
    method: 'post',
    url: ajaxUrl,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
        newRiskDialog.value.close()
      },
      message: t('projectStatus.riskAndOpportunities.risk.addNewSuccess').replace(
        /%custom_id/,
        data.custom_id
      )
    }
  }
  sendRequest(addNewRisk)
}
const { setProject } = useCustomizerStore()
function editRisk(data: EventCharacterizationPost) {
  const addNewRisk: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}/${data.id}/`,
    data: data,
    onSuccess: {
      callback: (response) => {
        tabulator.value.setData()
        editRiskDialog.value.close()
        const projectCopy = JSON.parse(JSON.stringify(project.value))
        const riskIndex = projectCopy?.event_characterization.findIndex(
          (item: EventCharacterization) => item.id === response.data.id
        )
        if (riskIndex === -1) return
        projectCopy.event_characterization[riskIndex] = response.data
        setProject(projectCopy)
      },
      message: t('projectStatus.riskAndOpportunities.risk.editSuccess').replace(
        /%custom_id/,
        data.custom_id
      )
    }
  }
  sendRequest(addNewRisk)
}
function showInCardRisk(data: EventCharacterizationPost) {
  const addNewRisk: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}/${data.id}/`,
    data: data,
    onSuccess: {
      callback: (response) => {
        tabulator.value.setData()
        const projectCopy = JSON.parse(JSON.stringify(project.value))
        if (response.data.shown_in_card) {
          projectCopy.event_characterization.push(response.data)
          setProject(projectCopy)
          return
        }
        const filtered = projectCopy.event_characterization.filter(
          (item: EventCharacterization) => item.custom_id !== response.data.custom_id
        )
        projectCopy.event_characterization = filtered
        setProject(projectCopy)
      },
      message: t('projectStatus.riskAndOpportunities.risk.editSuccess').replace(
        /%custom_id/,
        data.custom_id
      )
    }
  }
  sendRequest(addNewRisk)
}
function deleteRisk() {
  const addNewRisk: HttpRequest = {
    method: 'delete',
    url: `${ajaxUrl}/${selectedRisk.value.id}/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
        const projectCopy = JSON.parse(JSON.stringify(project.value))
        const filtered = projectCopy?.event_characterization.filter(
          (item: EventCharacterization) => item.id !== selectedRisk.value.id
        )
        projectCopy.event_characterization = filtered
        setProject(projectCopy)
      },
      message: t('projectStatus.riskAndOpportunities.risk.deleteSuccess').replace(
        /%custom_id/,
        selectedRisk.value.custom_id
      )
    },
    finally: () => {
      dialog.delete = false
      selectedRisk.value = undefined
    }
  }
  sendRequest(addNewRisk)
}

function openAddNewRiskModal() {
  dialog.newRisk = !dialog.newRisk
}
function openMatrixSelectionDialog() {
  dialog.matrixSelection = !dialog.matrixSelection
}
function onMatrixAssigned() {
  tabulator.value.setData()
  dialog.matrixSelection = false
}
function openPreviewDialog() {
  dialog.preview = !dialog.preview
}
</script>
<template>
  <div class="mt-5">
    <portal v-if="props.modify" to="header-actions" :key="props.activeTab">
    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <div>
          <v-btn class="primary-negative-btn" @click="openMatrixSelectionDialog" data-testid="select-matrix">
            {{
              project?.risk_matrix?.name || $t('projectStatus.riskAndOpportunities.selectMatrix')
            }}
          </v-btn>
          <v-btn
            :disabled="!project?.risk_matrix?.id"
            class="secondary-action-btn ml-4"
            @click="openPreviewDialog"
            data-testid="preview"
          >
            {{ $t('misc.preview') }}
          </v-btn>
          <v-btn
              :disabled="!project?.risk_matrix?.id"
              class="primary-action-btn ml-4"
              @click="openAddNewRiskModal"
              data-testid="add-risk"
          >
            {{ $t('misc.add') }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
    </portal>
    <div ref="table" class="mt-5" />
    <AddDialog
      v-if="dialog.newRisk"
      v-model="dialog.newRisk"
      ref="newRiskDialog"
      type="risk"
      :project="project"
      :disabled="!project?.risk_matrix.id"
      @submit="createNewRisk"
    />
    <EditDialog
      v-if="dialog.edit"
      v-model="dialog.edit"
      :value="selectedRisk"
      ref="editRiskDialog"
      type="risk"
      :project="project"
      @submit="editRisk"
    />
    <DeleteDialog v-model="dialog.delete" :title="$t(`projectStatus.riskAndOpportunities.risk.delete`)"
      :text="$t(`projectStatus.riskAndOpportunities.risk.deleteText`)" @submit="deleteRisk" />
    <SelectMatrixDialog
      v-if="dialog.matrixSelection"
      v-model="dialog.matrixSelection"
      type="risk"
      :project="project"
      @change="onMatrixAssigned"
    />
    <PreviewDialog v-if="dialog.preview" v-model="dialog.preview" :project="project" />
  </div>
</template>
