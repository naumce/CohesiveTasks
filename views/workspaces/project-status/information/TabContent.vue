<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { TabulatorFull as Tabulator, type Options, type CellComponent } from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import { apiUrls } from '@/plugins/axios'
import getColumnsDefinition from './columns-definition'
import useApis from '@/composables/api'
import type { HttpRequest, ProjectInformation, ProjectInformationPost } from '@/types'
import { useRoute } from 'vue-router'
import { useCustomizerStore } from '@/stores/customizer'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import AddDialog from './dialogs/AddDialog.vue'
import EditDialog from './dialogs/EditDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import { isoToUnix } from '@/utils/date'

const props = defineProps({
  type: {
    type: String,
    required: true,
    default: 'objectives'
  }
})

const { sendRequest } = useApis()
const route = useRoute()
const { project } = storeToRefs(useCustomizerStore())
const { setProject, canModify } = useCustomizerStore()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`

const table = ref()
const tabulator = ref()
const addDialog = ref()
const editDialog = ref()
const dialog = reactive({
  add: false,
  edit: false,
  delete: false
})
const selected = ref<ProjectInformation>()

const { t } = useI18n()
const modifyEnabled = canModify([
  'TENANT_ADMIN',
  'PROJECT_ADMINISTRATION',
  'PROJECT_INFORMATION_MODIFY'
])

const actionsContextMenu = !modifyEnabled
  ? []
  : [
      {
        label: t('misc.edit'),
        action: (e: Event, cell: CellComponent) => {
          const data = cell.getData() as ProjectInformation
          selected.value = data
          dialog.edit = true
        }
      },
      {
        label: t('misc.delete'),
        action: (e: Event, cell: CellComponent) => {
          const data = cell.getData() as ProjectInformation
          selected.value = data
          dialog.delete = true
        }
      },
      {
        label: (cell: CellComponent) => {
          //component - column/cell/row component that triggered the menu
          const rowData = cell.getData() as ProjectInformation
          const show = rowData.shown_in_card
          if (show) return t('misc.hide_in_card')
          return t('misc.show_in_card')
        },
        action: (e: Event, cell: CellComponent) => {
          const rowData = cell.getData() as ProjectInformation
          selected.value = rowData
          const data: ProjectInformationPost = {
            date: isoToUnix(rowData.date),
            description: rowData.description,
            shown_in_card: !rowData.shown_in_card
          }
          toggleShow(data)
        }
      }
    ]

const ajaxUrl = `${apiUrls[props.type]
  .replace(/%tenantId/, tenantId)
  .replace(/%projectId/, projectId)}`

const { tabulatorOptions } = useTabulatorOptions()
const tableDefinition: Options = {
  columns: getColumnsDefinition(actionsContextMenu),
  ajaxURL: `${ajaxUrl}`,
  ...tabulatorOptions,
  initialSort: [{ column: 'date', dir: 'desc' }]
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})
onUnmounted(() => {
  tabulator.value.destroy()
})
function add(data: ProjectInformationPost) {
  const addRequest: HttpRequest = {
    method: 'post',
    url: ajaxUrl,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
        addDialog.value.close()
      },
      message: t(`projectStatus.information.${props.type}.addNewSuccess`)
    }
  }
  sendRequest(addRequest)
}

function edit(data: ProjectInformationPost) {
  const editInformation: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}/${selected.value?.id}/`,
    data: data,
    onSuccess: {
      callback: (response) => {
        tabulator.value.setData()
        editDialog.value.close()
        if (project.value?.current_goal.id !== selected.value?.id) return
        const projectCopy = JSON.parse(JSON.stringify(project.value))
        projectCopy.current_goal = response.data
        setProject(projectCopy)
      },
      message: t(`projectStatus.information.${props.type}.editSuccess`)
    }
  }
  sendRequest(editInformation)
}
function remove() {
  const deleteObjective: HttpRequest = {
    method: 'delete',
    url: `${ajaxUrl}/${selected.value?.id}/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
        if (project.value?.current_goal.id !== selected.value?.id) return
        const projectCopy = JSON.parse(JSON.stringify(project.value))
        projectCopy.current_goal = {
          id: null,
          date: null,
          shown_in_card: null,
          description: null,
          active: null,
          created_by_user: {
            id: null,
            name: null,
            active: null,
            email: null
          }
        }
        setProject(projectCopy)
      },
      message: t(`projectStatus.information.${props.type}.deleteSuccess`)
    },
    finally: () => {
      dialog.delete = false
      selected.value = undefined
    }
  }
  sendRequest(deleteObjective)
}
function toggleShow(data: ProjectInformationPost) {
  const toggle: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}/${selected.value?.id}/`,
    data: data,
    onSuccess: {
      callback: (response) => {
        tabulator.value.setData()
        if (!response.data.shown_in_card) return
        const projectCopy = JSON.parse(JSON.stringify(project.value))
        props.type === 'objectives' ? projectCopy.current_goal = response.data : projectCopy.current_status = response.data
        setProject(projectCopy)
      },
      message: t(`projectStatus.information.${props.type}.editSuccess`)
    }
  }
  sendRequest(toggle)
}

function openAddModal() {
  dialog.add = !dialog.add
}
</script>
<template>
  <div class="mt-5">
    <portal  to="header-actions">
    <v-row v-if="modifyEnabled">
      <v-col cols="12" class="text-right">
        <v-btn class="primary-action-btn" @click="openAddModal" data-testid="information-add-new">
          {{ $t(`misc.add`) }}
        </v-btn>
      </v-col>
    </v-row>
    </portal>
    <div ref="table" class="mt-5 information-table" />
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
      :type="props.type"
      @submit="edit"
    />
    <DeleteDialog v-model="dialog.delete" :title="$t(`projectStatus.information.${props.type}.deleteTitle`)" :text="$t(`projectStatus.information.${props.type}.deleteText`)" @submit="remove" />
  </div>
</template>

<style>
.information-table {
  .tabulator-cell {
    white-space: normal!important;
    //line-height: 30px;
  }
}
</style>
