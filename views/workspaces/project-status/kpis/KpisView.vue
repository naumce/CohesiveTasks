<script setup lang="ts" >
import {ref, reactive, onMounted, watch} from 'vue'
import { isoToStandardString } from '@/utils/date'
import { thousandSeparatedFormat } from '@/utils/number'
import useTabulatorOptions from '@/composables/tabulator'
import { TabulatorFull as Tabulator, type Options, type CellComponent } from 'tabulator-tables'
import getColumnsDefinition from './columns-definition'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCustomizerStore } from '@/stores/customizer'
import { storeToRefs } from 'pinia'
import type { HttpRequest, ProjectKpi, ProjectStatus } from '@/types'
import ManageKpisDialog from './dialogs/ManageKpisDialog.vue'
import ReportKpisDialog from './dialogs/ReportKpisDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import PreviewDialog from './dialogs/PreviewDialog.vue'
import { useLoaderStore } from '@/stores/loader'
import dayjs from "dayjs";
import {Chart, CategoryScale, Chart as ChartJS, LinearScale, PointElement, LineElement, Title, Tooltip} from "chart.js";
import {togglePagination} from "@/utils/pagination";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip)
const table = ref()
const tabulator = ref()
const totalRows = ref(0)
const { sendRequest } = useApis()
const showGraph = ref(false)

const dialog = reactive({
  newOrRemoveKpi: false,
  deleteKpi: false,
  reportKpi: false,
  preview: false
})

const selectedKpi = ref<ProjectKpi>()
const previewDialog = ref()
const tableKpis = ref<ProjectKpi[]>([])
const { tabulatorOptions } = useTabulatorOptions()
const route = useRoute()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`
const ajaxUrl = `${apiUrls.kpis.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId)}`

const { t } = useI18n()
const { project } = storeToRefs(useCustomizerStore())
const { setProject, canModify } = useCustomizerStore()
const modifyEnabled = canModify(['TENANT_ADMIN', 'PROJECT_ADMINISTRATION', 'PROJECT_KPI_MODIFY'])
const { loading } = storeToRefs(useLoaderStore())

const actionsContextMenu = !modifyEnabled
  ? []
  : [
      {
        label: t('misc.report'),
        action: (e: Event, cell: CellComponent) => {
          const data = cell.getData() as ProjectKpi
          selectedKpi.value = data
          dialog.reportKpi = !dialog.reportKpi
        }
      },
      {
        label: t('misc.delete'),
        action: (e: Event, cell: CellComponent) => {
          const data = cell.getData() as ProjectKpi
          selectedKpi.value = data
          dialog.deleteKpi = true
        }
      },
      {
        label: (cell: CellComponent) => {
          const rowData = cell.getData() as ProjectKpi
          const show = rowData.shown_in_card
          if (show) return t('misc.hide_in_card')
          return t('misc.show_in_card')
        },
        action: (e: Event, cell: CellComponent) => {
          const rowData = cell.getData() as ProjectKpi
          selectedKpi.value = rowData
          showInCardKpi(selectedKpi.value)
        }
      },
      {
        label: t('misc.up'),
        disabled: (cell: CellComponent) => {
          const data = cell.getData() as ProjectKpi
          return data.order === 1
        },
        action: (e: Event, cell: CellComponent) => {
          const data = cell.getData() as ProjectKpi
          selectedKpi.value = data
          move('up')
        }
      },
      {
        label: t('misc.down'),
        disabled: (cell: CellComponent) => {
          const data = cell.getData() as ProjectKpi
          return data.order === totalRows.value
        },
        action: (e: Event, cell: CellComponent) => {
          const data = cell.getData() as ProjectKpi
          selectedKpi.value = data
          move('down')
        }
      }
    ]

function getGradient(ctx:any, chartArea:any, chart:any,colors:any) {
  let gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  const getColorStop = (val:any, max:any) => (val / max);

  const {
    scales: {
      y: {
        max
      }
    }
  } = chart;


  colors.forEach((color:any) => {
    if (color.value > max) {
      color.value = max;
    }
    gradient.addColorStop(getColorStop(color.value, max), color.color);
  });
  return gradient;
}
const labels: string[] = []
const tableDefinition: Options = {
  movableRows: true,
  ajaxURL: `${ajaxUrl}?sort=["order"]`,
  ...tabulatorOptions,
  layout: 'fitData',
  rowHeight:80,
  columns: getColumnsDefinition(actionsContextMenu),
  ajaxResponse: (url: string, params: any, response: any) => {
    const totalElements = response.data?.total || 0
    togglePagination(totalElements);
    totalRows.value = totalElements
    tableKpis.value = response.data.items
    const addition = totalElements % params.per_page > 0 ? 1 : 0
    const lastPage = Math.floor(totalElements / params.per_page) + addition
    const allDates: string[] = []
    const kpisInCard =  response.data.items.filter((kpi:ProjectKpi) => kpi.shown_in_card);
    const projectCopy: ProjectStatus = JSON.parse(JSON.stringify(project.value));
    setProject({...projectCopy, kpis_in_card: kpisInCard})

    const retObj = {
      contentType: 'application/json; charset=utf-8',
      data: response.data.items.map((item: ProjectKpi) => {
        const dates = {}
        const values: number[] = []
        const colors: string[] = []
        const colorsWithValues: object[] = []
        const sortedKpiValues = [...(item.values || [])].sort(
            (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix()
        )
        const chartLabels : string[] = []
        sortedKpiValues.forEach((value) => {
          values.push(value.threshold.value)
          colors.push(value.threshold.color)
          colorsWithValues.push({color: value.threshold.color, value: value.threshold.value})
          labels.push(isoToStandardString(value.date))
          chartLabels.push(isoToStandardString(value.date))
          allDates.push(isoToStandardString(value.date))
          Object.assign(dates, {
            [`date_${isoToStandardString(value.date)}`]: {
              value: value.threshold.value,
              color: value.threshold.color
            }
          })
        })
        return { ...item, kpi___name: item.kpi.name, kpi_graph :{
            chartData: {
              labels:chartLabels,
              datasets: [
                {
                  label: item.kpi.name,
                  borderColor:  function(context:any) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                      return null;
                    }
                    return getGradient(ctx, chartArea, chart,colorsWithValues);
                  },
                  pointBackgroundColor: colors,
                  data: values,
                }
              ]
            }
          }, ...dates }
      }),
      last_page: lastPage
    }
    allDates.sort((a: string, b: string) => {
      return a.localeCompare(b)
    })
    const uniqueDates = [...new Set(allDates)]

    const columns = tabulator.value.getColumns()
    const actionsColumn = columns[columns.length - 1]

    uniqueDates.forEach((date) => {
      tabulator.value.addColumn(
        {
          title: date,
          field: `date_${date}`,
          headerSort: false,
          visible:true,
          hozAlign: 'center',
          formatter: (cell: CellComponent) => {
            const value = cell.getValue()
            if (!value) return ''
            const span = document.createElement('span')
            span.innerText = thousandSeparatedFormat(value.value) as string
            span.className = 'score-status-chip'
            span.style.backgroundColor = value.color
            span.style.textAlign = 'center'
            span.style.color = 'white'
            return span
          }
        },
        true,
        actionsColumn
      )
    })

    tabulator.value.addColumn({
      title:t('projectStatus.kpi.fields.kpi_graph'),
      field:'kpi_graph',
      headerSort: false,
      width:'70%',
      visible:false,
      cssClass:'kpi-graph',
      formatter: (cell: CellComponent) => {
        const value = cell.getValue();
        const canvas = document.createElement("canvas");
        const ctx: any = canvas.getContext('2d');
        ctx.height = 65
        new Chart(ctx, {
          type: 'line',
          data: value.chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
              point: {
                radius: 3.5,
                borderWidth: 1,
              },
              line: {
                borderWidth: 3,
              }
            },
            scales: {
              x: {
                display:false,
              },
              y: {
                display:false,
              }
            }}
        });

        return canvas
      }
    },false)



    return retObj
  }
}

onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
  tabulator.value.on('rowMoved', (row: CellComponent) => {
    const data = row.getData() as ProjectKpi
    move('', {...data, order: getKpiOrder(data.id)})
  })
})

function openAddNewOrRemoveKpiModal() {
  dialog.newOrRemoveKpi = !dialog.newOrRemoveKpi
}
function showInCardKpi(passedKpi: ProjectKpi) {
  if (!passedKpi) return
  const { id, order, kpi, trend, shown_in_card, values } = passedKpi
  const data = {
    id: id,
    order: order,
    shown_in_card: !shown_in_card
  }
  const showInCardKpi: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}update/${passedKpi.kpi.id}/`,
    data: data,
    onSuccess: {
      callback: () => {
          reloadTable();
        const projectCopy: ProjectStatus = JSON.parse(JSON.stringify(project.value))
        const kpiIndex = projectCopy.kpis_in_card.findIndex((kpi) => kpi.id === id)
        if (kpiIndex === -1 && data.shown_in_card) {
          projectCopy.kpis_in_card.push({
            id,
            order,
            kpi,
            trend,
            shown_in_card: !shown_in_card,
            values
          })
          setProject(projectCopy)
          return
        }
        projectCopy.kpis_in_card.splice(kpiIndex, 1)
        setProject(projectCopy)
      },
      message: t('projectStatus.kpi.dialog.editKpiProjectSuccess')
    }
  }
  sendRequest(showInCardKpi)
}
function deleteKpi() {
  if (!selectedKpi.value) return
  const { id } = selectedKpi.value
  const deleteRequest: HttpRequest = {
    method: 'delete',
    url: ajaxUrl,
    data: { kpi_id: selectedKpi.value.kpi.id },
    onSuccess: {
      callback: () => {
        reloadTable();
        const projectCopy: ProjectStatus = JSON.parse(JSON.stringify(project.value))
        const kpiIndex = projectCopy.kpis_in_card.findIndex((kpi) => kpi.id === id)
        if (kpiIndex === -1) return
        projectCopy.kpis_in_card.splice(kpiIndex, 1)
        setProject(projectCopy)
      },
      message: t('projectStatus.kpi.delete.success')
    },
    finally: () => {
      dialog.deleteKpi = false
    }
  }
  sendRequest(deleteRequest)
}

const move = (direction: string, kpi?: ProjectKpi) => {
  const selected = previewDialog.value?.selected ? previewDialog.value?.selected.kpi : selectedKpi.value;
  const { id, order, shown_in_card, } =  kpi ? kpi.kpi : selected
  const addition = direction === 'up' ? -1 : 1
  const newOrder = (order || 0) + addition
  const data = {
    id: kpi ? kpi.id : id || '',
    order: kpi ? kpi.order : newOrder,
    shown_in_card: kpi ? kpi.shown_in_card: shown_in_card
  }
  const moveRequest: HttpRequest = {
    method: 'patch',
    url: `${ajaxUrl}update/${kpi ? kpi.kpi.id : selected.kpi.id }/`,
    data: data,
    onSuccess: {
      callback: () => {
        if(!kpi) {
          reloadTable();
          previewDialog.value && previewDialog.value.unSelect();
          return;
        }

        const projectCopy: ProjectStatus = JSON.parse(JSON.stringify(project.value));
        const kpisInCard =  projectCopy.kpis_in_card.map((kpi:ProjectKpi) => {
          return {
            ...kpi,
            order: getKpiOrder(kpi.id),
          }
        });
        setProject({...projectCopy, kpis_in_card: kpisInCard})
      },
      message: !previewDialog.value?.selected ? t('projectStatus.kpi.dialog.editKpiProjectSuccess') : ''
    },
    onError: {
      callback: () => {
        reloadTable();
      }
    }
  }
  sendRequest(moveRequest)
}

const onReportsDialogClose = () => {
  dialog.reportKpi = false
  reloadTable();
}

const onManageKpisDialogClose = () => {
  dialog.newOrRemoveKpi = false
  showGraph.value = false;
  reloadTable();
}

const reloadTable = async () => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
}

const getKpiOrder = (id: string | number) => {
  const orderedData = tabulator.value.getRows().map((row:any) => {
    return {
      id:row.getData().id,
      order: row.getPosition(),
    }
  })
  return orderedData.find((item:any) => item.id === id).order;
}


watch(showGraph,(newValue) => {
  tabulator.value.toggleColumn('actions');
  tabulator.value.toggleColumn('kpi_graph')
  tabulator.value.toggleColumn('shown_in_card')
  labels.forEach((label) => {
    tabulator.value[!newValue ? 'showColumn' :'hideColumn'](`date_${label}`)
  })
})

</script>
<template>
  <v-container fluid>
    <portal to="header-actions">
    <v-row no-gutters>
      <v-col cols="12" class="d-flex justify-end">
        <div class="d-flex align-center">
          <v-switch
            v-model="showGraph"
            :label="$t('projectStatus.kpi.switchToKpi')"
            color="info"
            hide-details
            :disabled="loading"
            class="me-2 graph-switch"
          />
          <v-btn :disabled="loading" class="secondary-action-btn ml-4" @click="dialog.preview = true" data-testid="preview">
            {{ $t('misc.preview') }}
          </v-btn>
          <v-btn class="primary-action-btn ml-4" :disabled="loading" @click="openAddNewOrRemoveKpiModal" data-testid="manage-kpi">
            {{ $t('projectStatus.kpi.addRemoveBtn') }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
    </portal>
    <v-row no-gutters>
      <v-col  cols="12">
        <div ref="table" />
      </v-col>
    </v-row>
    <ManageKpisDialog
      v-if="dialog.newOrRemoveKpi"
      v-model="dialog.newOrRemoveKpi"
      @close="onManageKpisDialogClose"
    />
    <ReportKpisDialog
      v-if="dialog.reportKpi"
      v-model="dialog.reportKpi"
      :kpi="selectedKpi"
      @close="onReportsDialogClose"
    />
    <DeleteDialog
      v-if="dialog.deleteKpi"
      v-model="dialog.deleteKpi"
      :title="$t(`projectStatus.kpi.dialog.delete`)"
      :text="$t(`projectStatus.kpi.dialog.deleteText`)"
      @submit="deleteKpi"
    >
      <strong class="mt-4">{{ selectedKpi?.kpi.name || '' }}</strong>
    </DeleteDialog>
    <PreviewDialog ref="previewDialog"  v-if="dialog.preview" v-model="dialog.preview" @remove="showInCardKpi" @move="move" />
  </v-container>
</template>

<style >
.graph-switch .v-label {
    font-size: 14px!important;
}
</style>