<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { TabulatorFull as Tabulator, type Options, type CellComponent } from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import AddDialog from './dialogs/AddDialog.vue'
import EditDialog from './dialogs/EditDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import PreviewDialog from './dialogs/PreviewDialog.vue'
import { apiUrls } from '@/plugins/axios'
import getColumnsDefinition from './columns-definition'
import useApis from '@/composables/api'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useCustomizerStore } from '@/stores/customizer'
import { storeToRefs } from 'pinia'
import type { HttpRequest, ProjectFact } from '@/types'
import { getFactValue } from '@/utils/facts'
import {togglePagination} from "@/utils/pagination";

const route = useRoute()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`

const { t } = useI18n()
const selectedFact = ref()
const { sendRequest } = useApis()
const { project } = storeToRefs(useCustomizerStore())
const { setProject, canModify } = useCustomizerStore()
const modifyEnabled = canModify(['TENANT_ADMIN', 'PROJECT_ADMINISTRATION', 'PROJECT_FACTS_MODIFY'])

const actionsContextMenu = !modifyEnabled
  ? []
  : [
    {
      label: t('misc.edit'),
      action: (e: Event, cell: CellComponent) => {
        const data = cell.getData()
        selectedFact.value = data
        dialogs.edit = true
      }
    },
    {
      label: t('misc.remove'),
      action: (e: Event, cell: CellComponent) => {
        const data = cell.getData()
        selectedFact.value = data
        dialogs.remove = true
      }
    },
    {
      label: (cell: CellComponent) => {
        //component - column/cell/row component that triggered the menu
        const rowData = cell.getData() as ProjectFact
        const show = rowData.shown_in_card
        if (show) return t('misc.hide_in_card')
        return t('misc.show_in_card')
      },
      action: (e: Event, cell: CellComponent) => {
        const rowData = cell.getData() as ProjectFact
        const factId = `${rowData.fact.id}`
        const url = `${apiUrls.fact
          .replace(/%tenantId/, tenantId)
          .replace(/%projectId/, projectId)
          .replace(/%factId/, factId)}order`
        const toggleShow: HttpRequest = {
          method: 'post',
          url: url,
          data: {
            order: rowData.order,
            shown_in_card: !rowData.shown_in_card
          },
          onSuccess: {
            callback: (response) => {
              tabulator.value.setData()
              const projectCopy = JSON.parse(JSON.stringify(project.value))
              const factIndex = projectCopy.tenant_level_facts_in_card.findIndex(
                (f: ProjectFact) => f.fact.id === rowData.fact.id
              )
              if (factIndex === -1 && response.data.shown_in_card) {
                projectCopy.tenant_level_facts_in_card.push(response.data)
                setProject(projectCopy)
                return
              }
              projectCopy.tenant_level_facts_in_card.splice(factIndex, 1)
              setProject(projectCopy)
            },
            message: t('projectStatus.facts.removeSuccess').replace(
              /%operation/,
              rowData.shown_in_card
                ? t('projectStatus.facts.removed')
                : t('projectStatus.facts.added')
            )
          }
        }
        sendRequest(toggleShow)
      }
    }
  ]
const dialogs = reactive({
  add: false,
  edit: false,
  remove: false,
  preview: false
})
const table = ref()
const tabulator = ref()

const ajaxUrl = `${apiUrls.facts.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId)}`

const { tabulatorOptions } = useTabulatorOptions()
const tableDefinition: Options = {
  columns: getColumnsDefinition(actionsContextMenu),
  ajaxURL: ajaxUrl,
  ...tabulatorOptions,
  ajaxResponse: (url: string, params: any, response: any) => {
    const totalElements = response.data?.total || 0
    const addition = totalElements % params.per_page > 0 ? 1 : 0
    const lastPage = Math.floor(totalElements / params.per_page) + addition
    togglePagination(totalElements);
    const retObj = {
      contentType: 'application/json; charset=utf-8',
      data: response.data.items.map((item: ProjectFact) => ({
        ...item,
        fact___custom_id: item.fact.custom_id,
        fact___name: item.fact.name,
        value: getFactValue(item)
      })),
      last_page: lastPage
    }
    return retObj
  }
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})

function onFactChanged(fact: ProjectFact) {
  dialogs.edit = false
  tabulator.value.setData()
  const projectCopy = JSON.parse(JSON.stringify(project.value))
  const factIndex = projectCopy.tenant_level_facts_in_card.findIndex(
    (f: ProjectFact) => f.fact.id === fact.fact.id
  )
  if (factIndex === -1) return
  projectCopy.tenant_level_facts_in_card[factIndex] = fact
  setProject(projectCopy)
}
function onFactRemoved() {
  const url = `${apiUrls.fact
    .replace(/%tenantId/, tenantId)
    .replace(/%projectId/, projectId)
    .replace(/%factId/, selectedFact.value.fact.id)}`

  const removeFact: HttpRequest = {
    method: 'delete',
    url: url,
    onSuccess: {
      callback: () => {
        dialogs.remove = false
        tabulator.value.setData()
      },
      message: t('projectStatus.facts.remove.success')
    }
  }
  sendRequest(removeFact)
  const projectCopy = JSON.parse(JSON.stringify(project.value))
  const factIndex = projectCopy.tenant_level_facts_in_card.findIndex(
    (f: ProjectFact) => f.fact.id === selectedFact.value.fact.id
  )
  if (factIndex === -1) return
  projectCopy.tenant_level_facts_in_card.splice(factIndex, 1)
  setProject(projectCopy)
}
function onOrderChange(facts: ProjectFact[]) {
  const projectCopy = JSON.parse(JSON.stringify(project.value))
  projectCopy.tenant_level_facts_in_card = facts.filter((fact) => fact.shown_in_card)
  setProject(projectCopy)
  dialogs.preview = false
  tabulator.value.setData()
}
function openAddFactsModal() {
  dialogs.add = true
}
function openPreviewDialog() {
  dialogs.preview = true
}
function onAddClosed() {
  tabulator.value.setData()
  dialogs.add = false
}
</script>
<template>
  <v-container fluid>
    <portal v-if="modifyEnabled" to="header-actions">
    <v-row >
      <v-col cols="12" class="d-flex justify-end">
        <v-btn class="secondary-action-btn" @click="openPreviewDialog" data-testid="preview">
          {{ $t('misc.preview') }}
        </v-btn>
        <v-btn class="primary-action-btn ml-4" @click="openAddFactsModal" data-testid="add">
          {{ $t('misc.add') }}
        </v-btn>
      </v-col>
    </v-row>
    </portal>
    <div ref="table" class="mt-5" />
    <AddDialog v-if="dialogs.add" v-model="dialogs.add" @close="onAddClosed" />
    <EditDialog v-if="dialogs.edit" v-model="dialogs.edit" :fact="selectedFact" @submit="onFactChanged" />
    <DeleteDialog v-if="dialogs.remove" v-model="dialogs.remove" :text="$t('projectStatus.facts.removeText')" :title="$t(`projectStatus.facts.removeTitle`)" @submit="onFactRemoved" />
    <PreviewDialog v-if="dialogs.preview" v-model="dialogs.preview" @submit="onOrderChange" />
  </v-container>
</template>
