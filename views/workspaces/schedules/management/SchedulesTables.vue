<script setup lang="ts">
import { ref, onMounted, defineExpose, defineEmits, onUnmounted } from 'vue'
import { useCustomizerStore } from '@/stores/customizer'
import { TabulatorFull as Tabulator, type CellComponent, type Options } from 'tabulator-tables'
import { useI18n } from 'vue-i18n'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['remove'])
const { t } = useI18n()
const customizer = useCustomizerStore()
const { schedulesViewItems } = storeToRefs(useCustomizerStore())

// const workspaceId = route.params.workspaceId as string
const table = ref()
const tabulator = ref()
const deleteItem = ref()

const showCodes: any = ref({
  dialog: false,
  activity_codes: [],
  title: ''
})

const tableDefinition: Options = {
  movableRows: true,
  columns: [
    // @ts-ignore
    {
      headerSort: false,
      width: 40,
      minWidth: 40,
      resizable: false,
      rowHandle: true,
      formatter: () => {
        const dragEl = document.createElement('span')
        dragEl.classList.add('mdi')
        dragEl.classList.add('mdi-drag-vertical')
        dragEl.classList.add('drag-icon')
        return dragEl
      }
    },
    {
      field: 'label',
      title: t('misc.name'),
      headerSort: false,
      headerHozAlign: 'left'
    },
    {
      title: '',
      resizable: false,
      minWidth: 30,
      width: 130,

      headerSort: false,
      formatter: (cell: CellComponent) => {
        const createButton = document.createElement('div')
        createButton.innerText = 'Activity Codes'
        createButton.style.display = 'none' // initially hide span
        createButton.style.cursor = 'pointer'
        createButton.style.border = '1px solid #2045bc'
        createButton.style.color = '#2045bc'
        createButton.style.padding = '2px'
        createButton.style.fontSize = '14px'
        createButton.style.fontWeight = '500'
        createButton.style.borderRadius = '5px'
        createButton.style.verticalAlign = 'middle'
        createButton.style.height = '60px'

        const row = cell.getRow()
        row.getElement().addEventListener('mouseenter', () => {
          createButton.style.display = 'inline'
        })
        row.getElement().addEventListener('mouseleave', () => {
          createButton.style.display = 'none'
        })
        return createButton
      },
      cellClick: (e: any, cell: CellComponent) => {
        const data = cell.getData() as any
        showCodes.value.activity_codes = data.activity_codes
        showCodes.value.title = data.name
        showCodes.value.dialog = true
      }
    },
    {
      title: '',
      resizable: false,
      minWidth: 50,
      width: 50,
      headerSort: false,
      formatter: (cell: CellComponent) => {
        const span = document.createElement('span')
        span.classList.add('mdi')
        span.classList.add('mdi-trash-can')
        span.style.display = 'none' // initially hide span
        span.style.cursor = 'pointer'
        span.style.fontSize = '20px'
        span.style.verticalAlign = 'middle'
        span.style.cursor = 'pointer'
        span.style.margin = 'auto'
        const row = cell.getRow()
        row.getElement().addEventListener('mouseenter', () => {
          span.style.display = 'inline'
        })
        row.getElement().addEventListener('mouseleave', () => {
          span.style.display = 'none'
        })
        return span
      },
      cellClick: (e: any, cell: CellComponent) => {
        const data = cell.getData() as any
        deleteItem.value = data
      }
    }
  ],
  layout: 'fitColumns'
}

const loadTable = () =>
  (tabulator.value = new Tabulator(table.value, {
    ...tableDefinition,
    data: schedulesViewItems.value
  }))

onMounted(() => {
  loadTable()
})

const handleSubmit = (item: any) => {
  console.log('item', item)
  console.log('deleteItem.value', deleteItem)
  console.log('emit received', deleteItem)
  emit('remove', deleteItem)
  deleteItem.value = null
}

const getScheduleOrder = (id: string | number) => {
  const orderedData = tabulator.value.getRows().map((row: any) => {
    return {
      id: row.getData().id,
      order: row.getPosition()
    }
  })
  return orderedData.find((item: any) => item.id === id).order
}

onUnmounted(() => {
  customizer.setScheduleViewTable([])
})

defineExpose({ loadTable, showCodes, getScheduleOrder })
</script>
<template>
  <v-container fluid>
    <div ref="table"></div>
    <DeleteDialog
      title="Delete Schedule"
      :modelValue="deleteItem"
      @update:modelValue="deleteItem = false"
      @submit="handleSubmit"
    />
    <v-dialog v-model="showCodes.dialog" width="auto">
      <v-card>
        <v-card-title>
          {{ $t('workspaces.schedules.management.activityCodesOf') }} {{ showCodes.title }}
        </v-card-title>
        <v-card-text class="dialog-content">
          <div class="px-2">
            <div class="align-center d-flex justify-space-between text-caption my-4">
              <span> {{ $t('misc.activityCodes') }} </span>
              <span> {{ $t('misc.quickFilters') }} </span>
            </div>
            <div
              v-for="item in showCodes.activity_codes"
              :key="item.id"
              class="align-center d-flex justify-space-between text-caption"
            >
              <v-checkbox :label="item.name" v-model="item.selected" hide-details />
              <v-switch
                color="primary"
                v-model="item.quick_filters"
                hide-details
                class="d-flex align-center justify-end"
                :disabled="!item.selected"
              ></v-switch>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="d-flex pt-9 cardactions">
          <v-spacer></v-spacer>
          <v-btn
            class="primary-action-btn"
            @click="showCodes.dialog = false"
            data-testid="delete-cancel"
          >
            {{ $t('misc.confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style lang="scss" scoped>
.cardactions {
  height: 50px;
}
.dialog-content {
  min-height: 70% !important;
  overflow: auto;
}
</style>
