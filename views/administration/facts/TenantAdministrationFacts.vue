<script setup lang="ts">
import {onMounted, onUnmounted, reactive, ref} from 'vue'
import {type CellComponent, type Options, TabulatorFull as Tabulator} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import {useLoaderStore} from '@/stores/loader'
import {storeToRefs} from 'pinia'
import {apiUrls} from '@/plugins/axios'
import type {HttpRequest, RawProjectFact} from '@/types'
import {useRoute} from 'vue-router'
import useApis from '@/composables/api'
import {useI18n} from 'vue-i18n'
import ManageFactDialog from './dialogs/ManageFactDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'

const { loading } = storeToRefs(useLoaderStore())

const route = useRoute()
const tenantId = route.params.tenantId as string

const dialogs = reactive({
  new: false,
  edit: false,
  delete: false
})

const table = ref()
const tabulator = ref()

const { tabulatorOptions, inputHeaderFilter, emptyHeaderFilter, contextActionsFormatter } =
  useTabulatorOptions()
const { t } = useI18n()

const selectedRow = ref<RawProjectFact>()
const actionsContextMenu = [
  {
    label: t('misc.edit'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as RawProjectFact
      selectedRow.value = data
      dialogs.edit = true
    }
  },
  {
    label: t('misc.delete'),
    action: (e: Event, cell: CellComponent) => {
      const data = cell.getData() as RawProjectFact
      selectedRow.value = data
      dialogs.delete = true
    }
  }
]

const apiUrl = apiUrls.tenantAdminFacts.replace(/%tenantId/, tenantId)
const tableDefinition: Options = {
  columns: [
    {
      field: 'custom_id',
      title: t('misc.id'),
      headerHozAlign: 'left'
    },
    {
      field: 'name',
      title: t('misc.name'),
      headerSort: false,
      headerHozAlign: 'left',
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
    },
    {
      field: 'type',
      title: t('misc.type'),
      headerHozAlign: 'left',
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (!value) return ''
        if (value === 'FLOAT') return t('misc.number')
        if (value === 'USER') return t('misc.user')
        if (value === 'STRING') return t('misc.text')
        if (value === 'DATETIME') return t('misc.date')
        return value
      }
    },
    {
      field: 'description',
      title: t('misc.description'),
      headerHozAlign: 'left'
    },
    {
      title: '',
      clickMenu: actionsContextMenu,
      headerSort: false,
      width: 60,
      formatter: contextActionsFormatter
    }
  ],
  ajaxURL: apiUrl,
  ...tabulatorOptions,
  layout: 'fitColumns'
}

onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})
onUnmounted(() => {
  tabulator.value.destroy()
})

const { sendRequest } = useApis()
const newFact = (data: RawProjectFact) => {
  const postReq: HttpRequest = {
    method: 'post',
    url: apiUrl,
    data: data,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.facts.new.success')
    },
    finally: () => {
      dialogs.new = false
    }
  }
  sendRequest(postReq)
}
const deleteFact = () => {
  if (!selectedRow.value) return
  const deleteReq: HttpRequest = {
    method: 'delete',
    url: `${apiUrl}${selectedRow.value.id}/`,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.facts.delete.success')
    },
    finally: () => {
      dialogs.delete = false
    }
  }
  sendRequest(deleteReq)
}
const editFact = (fact: RawProjectFact) => {
  if (!selectedRow.value) return
  const editReq: HttpRequest = {
    method: 'patch',
    url: `${apiUrl}${selectedRow.value.id}/`,
    data: fact,
    onSuccess: {
      callback: () => {
        tabulator.value.setData()
      },
      message: t('administration.facts.edit.success')
    },
    finally: () => {
      dialogs.edit = false
    }
  }
  sendRequest(editReq)
}
function refresh() {
  tabulator.value.setData()
}
defineExpose({
  refresh
})
</script>
<template>
  <v-container fluid>
    <portal to="header-actions">
      <v-btn :disabled="loading" class="primary-action-btn" @click="dialogs.new = true" data-testid="add">
        {{ $t('misc.add') }}
      </v-btn>
    </portal>
    <v-row dense>
      <v-col cols="12">
        <div ref="table" />
      </v-col>
    </v-row>

    <DeleteDialog
      v-if="dialogs.delete"
      v-model="dialogs.delete"
      :text="$t('administration.facts.delete.text')"
      :title="$t('administration.facts.delete.title')"
      @submit="deleteFact"
    >
      <strong class="mt-4">{{ selectedRow?.name || '' }}</strong>
    </DeleteDialog>
    <ManageFactDialog v-if="dialogs.new" v-model="dialogs.new" @submit="newFact" />
    <ManageFactDialog
      v-if="dialogs.edit"
      v-model="dialogs.edit"
      type="edit"
      :value="selectedRow"
      @submit="editFact"
    />
  </v-container>
</template>
