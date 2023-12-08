<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { TabulatorFull as Tabulator, type Options, type CellComponent } from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import useApis from '@/composables/api'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCustomizerStore } from '@/stores/customizer'
import { storeToRefs } from 'pinia'
import { apiUrls } from '@/plugins/axios'
import getColumnsDefinition from './columns-definition'
import SelectMatrixDialog from './dialogs/SelectMatrixDialog.vue'
import PreviewDialog from './dialogs/PreviewDialog.vue'
import AddDialog from './dialogs/AddDialog.vue'
import EditDialog from './dialogs/EditDialog.vue'
// import DeleteDialog from './dialogs/DeleteDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import type { HttpRequest, EventCharacterization, EventCharacterizationPost } from '@/types'
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

const route = useRoute()
const { project } = storeToRefs(useCustomizerStore())
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`
const editOpportunityDialog = ref()

const dialog = reactive({
  new: false,
  matrixSelection: false,
  preview: false,
  edit: false,
  delete: false
})
const selectedOpportunity = ref()

const { t } = useI18n()
const actionsContextMenu = !props.modify
  ? []
  : [
    {
      label: t('misc.edit'),
      action: (e: Event, cell: CellComponent) => {
        const data = cell.getData() as EventCharacterization
        selectedOpportunity.value = { ...data, status: data.status.split('.')[1] }
        dialog.edit = true
      }
    },
    {
      label: t('misc.delete'),
      action: (e: Event, cell: CellComponent) => {
        const data = cell.getData() as EventCharacterization
        selectedOpportunity.value = data
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
          type: 'OPPORTUNITY'
        }
        toggleShowInCard(data)
      }
    }
  ]

const ajaxUrl = `${apiUrls.projectRisksAndOpportunities
  .replace(/%tenantId/, tenantId)
  .replace(/%projectId/, projectId)}`

const table = ref()
const tabulator = ref()
const { tabulatorOptions } = useTabulatorOptions()
const tableDefinition: Options = {
  columns: getColumnsDefinition(actionsContextMenu),
  ajaxURL: ajaxUrl,
  ...tabulatorOptions,
  initialFilter: [{ field: 'type', type: '=', value: 'OPPORTUNITY' }],
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
      })),
      last_page: lastPage
    }
    return retObj
  }
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})

const { sendRequest } = useApis()
function createNewOpportunity(data: EventCharacterizationPost) {
  const add: HttpRequest = {
    method: 'post',
    url: ajaxUrl,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
        dialog.new = false
      },
      message: t('projectStatus.riskAndOpportunities.opportunity.addNewSuccess').replace(
        /%custom_id/,
        data.custom_id
      )
    }
  }
  sendRequest(add)
}

function onMatrixAssigned() {
  tabulator.value.setData()
  dialog.matrixSelection = false
}
function openAddNewOpportunityModal() {
  dialog.new = !dialog.new
}
function openPreviewDialog() {
  dialog.preview = !dialog.preview
}
function openMatrixSelectionDialog() {
  dialog.matrixSelection = !dialog.matrixSelection
}
const { setProject } = useCustomizerStore()
function edit(data: EventCharacterizationPost) {
  const editOpportunity: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}/${data.id}/`,
    data: data,
    onSuccess: {
      callback: (response) => {
        tabulator.value.setData()
        editOpportunityDialog.value.close()
        const projectCopy = JSON.parse(JSON.stringify(project.value))
        let opp = projectCopy?.event_characterization.find(
          (item: EventCharacterization) => item.id === response.data.id
        )
        if (!opp) return
        setProject(projectCopy)
      },
      message: t('projectStatus.riskAndOpportunities.opportunity.editSuccess').replace(
        /%custom_id/,
        data.custom_id
      )
    }
  }
  sendRequest(editOpportunity)
}
function toggleShowInCard(data: EventCharacterizationPost) {
  const toggle: HttpRequest = {
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
      message: t('projectStatus.riskAndOpportunities.opportunity.editSuccess').replace(
        /%custom_id/,
        data.custom_id
      )
    }
  }
  sendRequest(toggle)
}
function deleteOpportunity() {
  const deleteRequest: HttpRequest = {
    method: 'delete',
    url: `${ajaxUrl}/${selectedOpportunity.value.id}/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
        const projectCopy = JSON.parse(JSON.stringify(project.value))
        const filtered = projectCopy?.event_characterization.filter(
          (item: EventCharacterization) => item.id !== selectedOpportunity.value.id
        )
        projectCopy.event_characterization = filtered
        setProject(projectCopy)
      },
      message: t('projectStatus.riskAndOpportunities.opportunity.deleteSuccess').replace(
        /%custom_id/,
        selectedOpportunity.value.custom_id
      )
    },
    finally: () => {
      dialog.delete = false
      selectedOpportunity.value = undefined
    }
  }
  sendRequest(deleteRequest)
}
</script>
<template>
  <div class="mt-5">
    <portal v-if="props.modify" to="header-actions" :key="props.activeTab">
    <v-row >
      <v-col cols="12" class="d-flex justify-end align-center">

          <v-btn class="primary-negative-btn" @click="openMatrixSelectionDialog">
            {{
              project?.opportunity_matrix?.name ||
              $t('projectStatus.riskAndOpportunities.selectMatrix')
            }}
          </v-btn>
          <v-btn  :disabled="!project?.opportunity_matrix?.id"
                  class="secondary-action-btn ml-4" @click="openPreviewDialog">
            {{ $t('misc.preview') }}
          </v-btn>
        <v-btn :disabled="!project?.opportunity_matrix?.id" class="primary-action-btn ml-4"
               @click="openAddNewOpportunityModal">
          {{ $t(`misc.add`) }}
        </v-btn>
      </v-col>
    </v-row>
    </portal>
    <div ref="table" class="mt-5" />
    <AddDialog v-if="dialog.new" v-model="dialog.new" type="opportunity" :project="project"
      @submit="createNewOpportunity" />
    <EditDialog v-if="dialog.edit" v-model="dialog.edit" :value="selectedOpportunity" ref="editOpportunityDialog"
      type="opportunity" :project="project" @submit="edit" />
    <DeleteDialog v-model="dialog.delete" :title="$t(`projectStatus.riskAndOpportunities.opportunity.delete`)"
      :text="$t(`projectStatus.riskAndOpportunities.opportunity.deleteText`)" @submit="deleteOpportunity" />
    <SelectMatrixDialog v-if="dialog.matrixSelection" v-model="dialog.matrixSelection" type="opportunity"
      :project="project" @change="onMatrixAssigned" />
    <PreviewDialog v-if="dialog.preview" v-model="dialog.preview" :project="project" />
  </div>
</template>
