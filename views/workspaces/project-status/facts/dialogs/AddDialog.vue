<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { type Filter, type Options, type RowComponent, TabulatorFull as Tabulator } from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import useApis from '@/composables/api'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiUrls } from '@/plugins/axios'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import SearchInput from '@/components/SearchInput.vue'
import type { HttpRequest } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'close'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const { loading } = storeToRefs(useLoaderStore())
const route = useRoute()
// const { project } = storeToRefs(useCustomizerStore())
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`

const table = ref()
const tabulator = ref()

const ajaxUrl = apiUrls.factsNoValue.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId)
const { t } = useI18n()
const { tabulatorOptions } = useTabulatorOptions()
const tableDefinition: Options = {
  columns: [
    {
      formatter: 'rowSelection',
      title: '',
      resizable: false,
      minWidth: 45,
      width: 45,

      cssClass: 'selection-column',
      headerSort: false,
      cellClick: function (e, cell) {
        cell.getRow().toggleSelect()
      }
    },
    {
      field: 'custom_id',
      title: t('projectStatus.facts.fields.custom_id'),
      width: 100,
      headerHozAlign: 'left',
      sorter: 'string'
    },
    {
      field: 'name',
      title: t('projectStatus.facts.fields.name'),
      sorter: 'string',
      headerHozAlign: 'left'
    }
  ],
  ajaxURL: ajaxUrl,
  ...tabulatorOptions
}

onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
  tabulator.value.on('rowSelected', add)
  tabulator.value.on('rowDeselected', remove)
})
onUnmounted(() => {
  tabulator.value.off('rowSelected', add)
  tabulator.value.off('rowDeselected', remove)
})

const { sendRequest } = useApis()
function add(row: RowComponent) {
  const rowData = row.getData()
  const url = `${apiUrls.fact
    .replace(/%tenantId/, tenantId)
    .replace(/%projectId/, projectId)
    .replace(/%factId/, rowData.id)}`

  const addFact: HttpRequest = {
    method: 'post',
    url: url,
    onSuccess: {
      message: t('projectStatus.facts.add.success')
    }
  }
  sendRequest(addFact)
}
function remove(row: RowComponent) {
  const rowData = row.getData()
  const url = `${apiUrls.fact
    .replace(/%tenantId/, tenantId)
    .replace(/%projectId/, projectId)
    .replace(/%factId/, rowData.id)}`

  const removeFact: HttpRequest = {
    method: 'delete',
    url: url,
    onSuccess: {
      message: t('projectStatus.facts.remove.success')
    }
  }
  sendRequest(removeFact)
}
function onSearchInput(event: InputEvent) {
  const value = (event.target as HTMLInputElement).value
  const currentFilters = tabulator.value
    .getFilters()
    .filter((filter: Filter) => filter.field !== 'name')
  const filters = [
    ...currentFilters,
    ...(value ? [{ field: 'name', type: 'like', value: encodeURIComponent(value) }] : [])
  ]
  tabulator.value.setFilter(filters)
}
function close() {
  emit('update:modelValue', false)
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent width="700">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ $t(`projectStatus.facts.addNew`) }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <SearchInput :placeholder="$t('projectStatus.facts.searchLabel')" @input="onSearchInput"
                data-testid="facts-search" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div ref="table" class="mt-5" data-testid="facts-list"/>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="loading" class="primary-negative-btn" @click="emit('close')" data-testid="close">
          {{ $t('misc.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
