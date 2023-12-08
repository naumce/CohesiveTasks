<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import useTabulatorOptions from '@/composables/tabulator'
import { TabulatorFull as Tabulator, type Options, type CellComponent } from 'tabulator-tables'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import { useRoute } from 'vue-router'
import type {
  EventCharacterizationPostReport,
  HttpRequest,
  ProjectStatus,
  ProjectKpi,
  ProjectKpiValue
} from '@/types'
import { useI18n } from 'vue-i18n'
import { useCustomizerStore } from '@/stores/customizer'
import { getColumnsDefinitionReportKpi } from '../columns-definition'
import ManageKpiReportDialog from './ManageKpiReportDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
// import DeleteDialogKpiValue from './DeleteDialogKpiValue.vue'
import { storeToRefs } from 'pinia'
import { useLoaderStore } from '@/stores/loader'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  kpi: {
    type: Object as () => ProjectKpi,
    required: true,
    default: null
  }
})

const dialog = reactive({
  delete: false,
  new: false,
  edit: false
})

const selectedKpiReport = ref<ProjectKpiValue>()
const { loading } = storeToRefs(useLoaderStore())
const { project } = storeToRefs(useCustomizerStore())
const { setProject } = useCustomizerStore()

const { t } = useI18n()

const actionsContextMenu = [
  {
    label: t('misc.edit'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as ProjectKpiValue
      selectedKpiReport.value = data
      dialog.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as ProjectKpiValue
      selectedKpiReport.value = data
      dialog.delete = true
    }
  }
]

const { sendRequest } = useApis()

const emit = defineEmits(['update:modelValue', 'change', 'close'])
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
const ajaxUrl = `${apiUrls.kpis.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId)}${props.kpi.kpi.id
  }/`

const tableDefinition: Options = {
  columns: getColumnsDefinitionReportKpi(actionsContextMenu),
  ajaxURL: ajaxUrl,
  ...tabulatorOptions,
  pagination: false,
  ajaxResponse: (url: any, params: any, response: any) => {
    if (!response?.data?.values?.length) return []
    const sorted = response.data.values.sort(function (a:any, b:any) {
      return +new Date(b.date) - +new Date(a.date);
    });
    return sorted.map((item: any) => ({
      ...item,
      threshold___value: item.threshold.value,
      responsible_action_user___name: item.responsible_action_user.name
    }))
  }
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})

function createNewReport(data: EventCharacterizationPostReport) {
  const createNewReport: HttpRequest = {
    method: 'post',
    url: ajaxUrl,
    data: data,
    onSuccess: {
      callback: (response) => {
        tabulator.value.setData()

        const projectCopy: ProjectStatus = JSON.parse(JSON.stringify(project.value))
        const kpiIndex = projectCopy.kpis_in_card.findIndex((kpi) => kpi.id === props.kpi.id)
        if (kpiIndex === -1) return
        projectCopy.kpis_in_card[kpiIndex].values?.push(response.data)
        setProject(projectCopy)
      },
      message: t('projectStatus.kpi.report.new.success')
    },
    finally: () => {
      dialog.new = false
    }
  }
  sendRequest(createNewReport)
}

function editKpiReport(data: EventCharacterizationPostReport) {
  if (!selectedKpiReport.value) return
  const { id } = selectedKpiReport.value
  const editKpiReport: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}value/${id}/`,
    data: data,
    onSuccess: {
      callback: (response) => {
        tabulator.value.setData()

        const projectCopy: ProjectStatus = JSON.parse(JSON.stringify(project.value))
        const kpiIndex = projectCopy.kpis_in_card.findIndex((kpi) => kpi.id === props.kpi.id)
        if (kpiIndex === -1) return
        const kpi = projectCopy.kpis_in_card[kpiIndex]
        if (!kpi.values) return
        const valueIndex = kpi.values.findIndex((v) => v.id === id)
        if (valueIndex === undefined || valueIndex === -1) {
          console.error(`KPI report with id ${id} not found in project`)
          return
        }
        kpi.values[valueIndex] = response.data
        setProject(projectCopy)
      },
      message: t('projectStatus.kpi.report.edit.success')
    },
    finally: () => {
      dialog.edit = false
    }
  }
  sendRequest(editKpiReport)
}

function closeReportKpi() {
  emit('close')
}

function deleteKpiValue() {
  if (!selectedKpiReport.value) return
  const { id } = selectedKpiReport.value
  const deleteRequest: HttpRequest = {
    method: 'delete',
    url: `${ajaxUrl}value/${selectedKpiReport.value.id}/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()

        const projectCopy: ProjectStatus = JSON.parse(JSON.stringify(project.value))
        const kpiIndex = projectCopy.kpis_in_card.findIndex((kpi) => kpi.id === props.kpi.id)
        if (kpiIndex === -1) return
        const kpi = projectCopy.kpis_in_card[kpiIndex]
        if (!kpi.values) return
        const valueIndex = kpi.values.findIndex((v) => v.id === id)
        if (valueIndex === undefined || valueIndex === -1) return
        kpi.values.splice(valueIndex, 1)
        setProject(projectCopy)
      },
      message: t('projectStatus.kpi.report.delete.success')
    },
    finally: () => {
      dialog.delete = false
    }
  }
  sendRequest(deleteRequest)
}
</script>
<template>
  <v-dialog v-model="show" persistent width="905">
    <v-card>
      <v-card-title class="d-flex flex-column">
        <span class="dialog-title">{{ $t('projectStatus.kpi.dialog.kpiReports') }}</span>
        <span class="dialog-desc">{{ $t('projectStatus.kpi.dialog.clientRelationship') }}</span>
      </v-card-title>
<!--      <v-card-subtitle>-->
<!--        <span class="text-subtitle">{{ $t('projectStatus.kpi.dialog.clientRelationship') }}</span>-->
<!--      </v-card-subtitle>-->
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12" class="d-flex justify-end">
            <v-btn class="primary-action-btn" @click="dialog.new = true" data-testid="add-new-report">
              {{ $t('misc.add') }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <div ref="table" class="kpis-report-table" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="loading" class="primary-negative-btn" @click="closeReportKpi">
          {{ $t('misc.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <ManageKpiReportDialog v-if="dialog.new" ref="addNewReport" v-model="dialog.new" :thresholds="props.kpi.kpi.thresholds"
    @submit="createNewReport" />
  <ManageKpiReportDialog v-if="dialog.edit" ref="editNewReport" v-model="dialog.edit" type="edit"
    :value="selectedKpiReport" :thresholds="props.kpi.kpi.thresholds" @submit="editKpiReport" />
  <DeleteDialog v-if="dialog.delete" v-model="dialog.delete" :text="$t('projectStatus.kpi.report.delete.text')"
    @submit="deleteKpiValue" />
</template>

<style >
.kpis-report-table {
  .tabulator-cell {
    white-space: normal!important;
    line-height: 30px;
  }
}
</style>