<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { TabulatorFull as Tabulator, type Options, type CellComponent } from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import ManageReasonTypesDialog from './dialogs/ManageReasonTypesDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import DeactivateReasonTypesDialog from './dialogs/DeactivateReasonTypesDialog.vue'
import { apiUrls } from '@/plugins/axios'
import getColumnsDefinition from './columns-definition'
import useApis from '@/composables/api'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { HttpRequest, ReasonType } from '@/types'
import {togglePagination} from "@/utils/pagination";

const route = useRoute()
const tenantId = `${route.params.tenantId}`

const { loading } = storeToRefs(useLoaderStore())

const { t } = useI18n()
const selectedReasonType = ref<ReasonType>()
const { sendRequest } = useApis()
const actionsContextMenu = [
  {
    label: t('misc.edit'),
    disabled: (cell: CellComponent) => {
      const data = cell.getData() as ReasonType
      return data.used_in_transaction || false
    },
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as ReasonType
      selectedReasonType.value = data
      dialogs.edit = true
    }
  },
  {
    label: t('misc.delete'),
    disabled: (cell: CellComponent) => {
      const data = cell.getData() as ReasonType
      return data.used_in_transaction || false
    },
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as ReasonType
      selectedReasonType.value = data
      dialogs.delete = true
    }
  },
  {
    label: (cell: CellComponent) => {
      const data = cell.getData() as ReasonType
      if (data.active) return t('misc.deactivate')
      return t('misc.activate')
    },
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as ReasonType
      selectedReasonType.value = data as ReasonType
      data.active ? (dialogs.deactivate = true) : manageActiveDeactive(data)
    }
  }
]

function manageActiveDeactive(data: any) {
  const activateDeactive: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}${data.id}/active/`,
    data: {
      active: !data.active
    },
    onSuccess: {
      callback: (response) => {
        tabulator.value.setData()
        dialogs.deactivate = false
      },
      message: t('administration.reasonTypes.activate.success').replace(
        /%is_activated/,
        data.active
          ? t('administration.reasonTypes.activate.deactivated')
          : t('administration.reasonTypes.activate.activated')
      )
    }
  }
  sendRequest(activateDeactive)
}

const dialogs = reactive({
  add: false,
  edit: false,
  delete: false,
  deactivate: false
})
const table = ref()
const tabulator = ref()
const ajaxUrl = apiUrls.reasonTypes.replace(/%tenantId/, tenantId)

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
      data: response.data.items.map((item: ReasonType) => ({
        ...item
      })),
      last_page: lastPage
    }
    return retObj
  }
}

onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})
onUnmounted(() => {
  tabulator.value.destroy()
})

function onReasonTypeAdd(data: ReasonType) {
  const addNewReasonType: HttpRequest = {
    method: 'post',
    url: `${ajaxUrl}`,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.reasonTypes.new.success')
    },
    finally: () => {
      dialogs.add = false
    }
  }
  sendRequest(addNewReasonType)
}

function onReasonTypeEdit(data: ReasonType) {
  if (!selectedReasonType.value) return
  const editReasonType: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}${selectedReasonType.value.id}/`,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.reasonTypes.edit.success')
    },
    finally: () => {
      dialogs.edit = false
    }
  }
  sendRequest(editReasonType)
}

function onUserDelete() {
  if (!selectedReasonType.value) return
  const deleteRequest: HttpRequest = {
    method: 'delete',
    url: `${ajaxUrl}${selectedReasonType.value.id}/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.reasonTypes.delete.success')
    },
    finally: () => {
      dialogs.delete = false
    }
  }
  sendRequest(deleteRequest)
}

function onDeactivateReasonType() {
  manageActiveDeactive(selectedReasonType.value)
}
</script>
<template>
  <v-container fluid>
    <portal to="header-actions">
      <v-btn
          class="primary-action-btn"
          :disabled="loading"
          data-testid="add"
          @click="dialogs.add = true"
      >
        {{ $t('misc.add') }}
      </v-btn>
    </portal>
    <v-row dense>
      <v-col cols="12">
        <div ref="table" />
      </v-col>
    </v-row>
    <ManageReasonTypesDialog
      v-if="dialogs.add"
      v-model="dialogs.add"
      type="new"
      @submit="onReasonTypeAdd"
    />
    <ManageReasonTypesDialog
      v-if="dialogs.edit"
      v-model="dialogs.edit"
      :value="selectedReasonType"
      type="edit"
      @submit="onReasonTypeEdit"
    />
    <DeleteDialog v-if="dialogs.delete" v-model="dialogs.delete" :text="$t('administration.reasonTypes.delete.text')" :title="$t('administration.reasonTypes.delete.title')" @submit="onUserDelete">
      <strong class="mt-4">{{ selectedReasonType?.name || '' }}</strong>
    </DeleteDialog>
    <DeactivateReasonTypesDialog
      v-if="dialogs.deactivate"
      v-model="dialogs.deactivate"
      :title="$t(`administration.reasonTypes.deactivate.deactivateCategory`)"
      @submit="onDeactivateReasonType"
    ></DeactivateReasonTypesDialog>
  </v-container>
</template>
