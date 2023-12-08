<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import {
  type AjaxConfig,
  type CellComponent,
  type ColumnDefinition,
  type Filter,
  type Options,
  type SorterFromTable,
  TabulatorFull as Tabulator
} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import { apiUrls } from '@/plugins/axios'
import getColumnsDefinition from './columns-definition'
import { getFactValue } from '@/utils/facts'
import { formatNumber, thousandSeparatedFormat } from '@/utils/number'
import useApis from '@/composables/api'
import type {
  HttpRequest,
  PortfolioProject,
  PortfolioProjectRaw,
  PortfolioScoreCardFilter,
  ProjectFact,
  ProjectFactType,
  ProjectKpi,
  ProjectKpiCellValue
} from '@/types'
import { useRoute } from 'vue-router'
import { useCustomizerStore } from '@/stores/customizer'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import PhasesGant from './PhasesGantt.vue'
import AddDialog from './dialogs/AddDialog.vue'
import { togglePagination } from '@/utils/pagination'

const route = useRoute()
const portfolioId = route.params.portfolioId as string
const { loading } = storeToRefs(useLoaderStore())
const { canModify } = useCustomizerStore()
const modifyEnabled = canModify([
  'TENANT_ADMIN',
  'PORTFOLIO_ADMIN',
  'PORTFOLIO_ADD_REMOVE_PROJECTS'
])
const table = ref()
const tabulator = ref()
const tabulatorId = 'portfolio-score-card'

const storedColumns: ColumnDefinition[] = JSON.parse(
  localStorage.getItem(`tabulator-${tabulatorId}-columns`) ?? '[]'
)
const columns = getColumnsDefinition()
const factColumns = ref(new Map<number, ColumnDefinition>())
const kpiColumns = ref(new Map<number, ColumnDefinition>())
const roColumns = ref<ColumnDefinition[]>(columns.filter((column: any) => column.type === 'ro'))
const costColumns = ref<ColumnDefinition[]>(columns.filter((column: any) => column.type === 'cost'))

const ajaxUrl = apiUrls.portfolioProjectsFilter.replace(/%portfolioId/, portfolioId)

const {
  tabulatorOptions,
  numberHeaderFilter,
  dateHeaderFilter,
  tenantUsersHeaderFilter,
  thresholdsHeaderFilter,
  emptyHeaderFilter
} = useTabulatorOptions()
const tableDefinition: Options = {
  columns: columns,
  ajaxURL: ajaxUrl,
  ...tabulatorOptions,
  layout: 'fitData',
  rowFormatter: (row) => {
    if (row.getData().name === "TOTAL") {
      row.getElement().classList.add('total-row')
    }
  },
  persistence: {
    columns: true
  },
  ajaxConfig: {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=utf-8'
    }
  },
  ajaxParams: {
    data: {
      kpi_filters: [],
      fact_filters: [],
      sort: []
    }
  },
  ajaxResponse: ajaxResponse,
  ajaxRequestFunc: ajaxRequestFunc
}

interface ByField {
  [key: string]: string
}
const factRegex = /^fact_([\d]+)$/
const kpiRegex = /^kpi_([\d]+)$/
function getFieldName(field: string) {
  const parseFields: ByField = {
    name: 'name',
    risk_score: 'average_risk.score',
    opportunity_score: 'average_opportunity.score'
  }
  const parsed = parseFields[field]
  if (parsed) return parsed

  if (factRegex.test(field)) {
    const factId = field.replace(factRegex, '$1')
    return `tenant_level_facts.fact.id==${factId}`
  }

  if (kpiRegex.test(field)) {
    const kpiId = field.replace(kpiRegex, '$1')
    return `kpis.kpi.id==${kpiId}`
  }
  return field
}
function getFilters(filters: Filter[]) {
  const factFilters: PortfolioScoreCardFilter[] = []
  const kpiFilters: PortfolioScoreCardFilter[] = []

  filters.forEach((filter) => {
    const isNumber = !!Object.keys(filter.value.number || {}).length
    const isDate = !!Object.keys(filter.value.datetime || {}).length
    const isUser = !!filter.value.user?.user_id
    const isThreshold = !!filter.value.thresholds

    if (!isNumber && !isDate && !isUser && !isThreshold) return
    if (factRegex.test(filter.field)) {
      const factId = filter.field.replace(factRegex, '$1')
      factFilters.push({
        id: factId,
        ...(isUser ? { user_id: filter.value.user.user_id } : filter.value)
      })
    }

    if (kpiRegex.test(filter.field)) {
      const kpiId = filter.field.replace(kpiRegex, '$1')
      kpiFilters.push({ kpi_id: kpiId, ...filter.value })
    }
  })
  return { fact_filters: factFilters, kpi_filters: kpiFilters }
}
const { sendRequest } = useApis()
function ajaxRequestFunc(url: string, config: AjaxConfig, params: any) {
  let queryString = url.includes('?') ? '&' : '?'
  const data = JSON.parse(JSON.stringify(params.data))

  const queries = Object.keys(params).reduce((acc: string[], key) => {
    switch (key) {
      case 'sort': {
        if (!params[key].length) break
        if (!data.sort) break
        const sorts = params[key].map(
          (sort: SorterFromTable) => `${sort.dir === 'desc' ? '-' : ''}${getFieldName(sort.field)}`
        )
        data.sort = sorts
        break
      }
      case 'filter': {
        if (!params[key].length) break
        const filters = getFilters(params[key])
        data.fact_filters = filters.fact_filters
        data.kpi_filters = filters.kpi_filters
        break
      }
      case 'page':
      case 'per_page':
        acc.push(`${key}=${params[key]}`)
        break
    }
    return acc
  }, [])
  queryString += queries.join('&')
  const getData: HttpRequest = {
    method: config.method || 'get',
    url: url + queryString,
    data: data
  }

  return sendRequest(getData)
}

function getColumnDefinitionByType(itemType: ProjectFactType) {
  interface ByType {
    [key: string]: object
  }
  const propsByType: ByType = {
    FLOAT: {
      bottomCalc: 'sum',
      bottomCalcFormatter: (cell: CellComponent) => {
        const value = cell.getValue()
        return thousandSeparatedFormat(value)
      },
      headerPopup: numberHeaderFilter,
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        return thousandSeparatedFormat(value)
      }
    },
    DATETIME: {
      headerPopup: dateHeaderFilter
    },
    USER: {
      headerPopup: tenantUsersHeaderFilter
    },
    THRESHOLDS: {
      headerPopup: thresholdsHeaderFilter
    }
  }

  return propsByType[itemType]
}
const phases = ref<PortfolioProjectRaw[]>([])
const projectIds = computed(() => {
  return phases.value.map((item) => item.id)
})
function ajaxResponse(url: string, params: any, response: any) {
  const totalElements = response.data?.total || 0
  const addition = totalElements % params.per_page > 0 ? 1 : 0
  const lastPage = Math.floor(totalElements / params.per_page) + addition
  phases.value = response.data.items
  togglePagination(totalElements)
  const aggregations = response.data.aggregations
  const retObj = {
    contentType: 'application/json; charset=utf-8',
    data: response.data.items.map((item: PortfolioProjectRaw) => {
      const processed: PortfolioProject = {
        id: item?.id,
        workspaceId: item?.uv_workspace_id,
        name: item.name,
        risk_score: item.average_risk.score,
        risk_color: item.average_risk.color,
        risk_matrix: item.risk_matrix.name,
        opportunity_score: item.average_opportunity.score,
        opportunity_color: item.average_opportunity.color,
        opportunity_matrix: item.opportunity_matrix.name,
        ...item.project_cost[0]
      }
      item.tenant_level_facts.forEach((fact: ProjectFact) => {
        const factId = `fact_${fact.fact.id}`
        processed[factId] = getFactValue(fact, false)
        if (factColumns.value.get(fact.fact.id)) return
        factColumns.value.set(fact.fact.id, {
          field: factId,
          title: fact.fact.name,
          visible: storedColumns.find((column) => column.field === factId)?.visible || false,
          formatter: (cell: CellComponent) => {
            const value = cell.getValue()
            if (
              value &&
              typeof value === 'object' &&
              Object.prototype.hasOwnProperty.call(value, 'title')
            ) {
              return value.title || ''
            }
            return value
          },
          // @ts-ignore
          headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
          headerFilter: emptyHeaderFilter,
          ...getColumnDefinitionByType(fact.fact.type)
        } as ColumnDefinition)
      })

      item.kpis.forEach((kpi: ProjectKpi) => {
        const kpiId = `kpi_${kpi.kpi.id}`
        processed[kpiId] = {
          value: kpi.latest_kpi_value?.threshold.value,
          color: kpi.latest_kpi_value?.threshold.color,
          trend: kpi.trend,
          comment: kpi.latest_kpi_value?.comment,
          thresholds: kpi.kpi.thresholds
        } as ProjectKpiCellValue
        if (kpiColumns.value.get(kpi.kpi.id)) return
        kpiColumns.value.set(kpi.kpi.id, {
          field: kpiId,
          title: kpi.kpi.name,
          visible: storedColumns.find((column) => column.field === kpiId)?.visible || false,
          tooltip: (event: Event, cell: CellComponent) => {
            const cellValue = cell.getValue()
            if (!cellValue) return ''
            if (!cellValue.comment) return ''
            return cellValue.comment
          },
          // @ts-ignore
          headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
          headerFilter: emptyHeaderFilter,
          headerFilterParams: {
            thresholds: kpi.kpi.thresholds
          },
          ...getColumnDefinitionByType('THRESHOLDS'),
          formatter: (cell: CellComponent) => {
            const row = cell.getRow()?.getData()
            const cellValue = cell.getValue()
            if (row.name === 'TOTAL') return ''
            if (!cellValue) return ''
            if (!cellValue.color) return ''
            const container = document.createElement('div')
            container.classList.add('d-flex')
            container.classList.add('align-center')

            const circle = document.createElement('span')
            circle.classList.add('mdi')
            circle.classList.add('mdi-circle')
            circle.style.fontSize = '24px'
            circle.style.color = cellValue.color === '#000000' ? '#d9d9d9' : cellValue.color

            const text = document.createElement('span')
            const value = cellValue.value
            text.innerText = value

            interface ByTrend {
              [key: string]: string
            }

            const arrowByTrend: ByTrend = {
              NEUTRAL: 'mdi-arrow-right-thin',
              UP: 'mdi-arrow-top-right-thin',
              DOWN: 'mdi-arrow-bottom-right-thin'
            }
            const arrow = document.createElement('span')
            arrow.classList.add('mdi')
            arrow.classList.add(arrowByTrend[cellValue.trend])
            arrow.style.fontSize = '24px'
            arrow.style.color = cellValue.color === '#000000' ? '#d9d9d9' : cellValue.color

            container.appendChild(circle)
            container.appendChild(text)
            container.appendChild(arrow)
            return container
          }
        } as ColumnDefinition)
      })

      return processed
    }),
    last_page: lastPage
  }
  // dynamically add columns
  const definitions = tabulator.value.getColumnDefinitions()
  factColumns.value.forEach((column: ColumnDefinition) => {
    if (definitions.some((def: ColumnDefinition) => def.field === column.field)) return
    tabulator.value.addColumn(column)
  })
  kpiColumns.value.forEach((column: ColumnDefinition) => {
    if (definitions.some((def: ColumnDefinition) => def.field === column.field)) return
    tabulator.value.addColumn(column)
  })
  const costFields = [
    'revenue',
    'actual_cost',
    'remaining_cost',
    'original_budget',
    'at_completion_cost',
    'proposed_budget',
    'margin',
    'margin_percent',
    'current_budget'
  ]

  let totalRow: any = {
    name: 'TOTAL'
  }
  aggregations.facts.forEach((f: any) => {
    totalRow[`fact_${f.id}`] = formatNumber(
        f.sum,
        false
    )
  })
  retObj.data.forEach((item: any) => {
    costFields.forEach((field: string) => {
      const total = isNaN(parseFloat(totalRow[field])) ? 0 : parseFloat(totalRow[field])
      totalRow[field] =  total + parseFloat(item[field])
    })
  })
  retObj.data.push(totalRow)
  return retObj
}
onMounted(() => {
  tabulator.value = new Tabulator(table.value, tableDefinition)
})
onUnmounted(() => {
  tabulator.value.destroy()
})

function setColumns() {
  const nameColumn = columns.find((column) => column.field === 'name')
  const newColumns = [
    nameColumn,
    ...roColumns.value,
    ...costColumns.value,
    ...Array.from(factColumns.value.values()),
    ...Array.from(kpiColumns.value.values())
  ]
  tabulator.value.setColumns(newColumns)
  addColumnsVisible.value = false
}
const addColumnsVisible = ref(false)
const phaseView = ref(false)
const dialogs = reactive({
  add: false
})
function onManageProjectsClosed() {
  tabulator.value.setData()
  dialogs.add = false
}
</script>
<template>
  <v-container fluid class="scorecard-content">
    <portal to="header-actions">
    <v-row  class="align-center justify-end mr-1">
        <div class="d-flex align-center">
          <v-switch
            v-model="phaseView"
            color="secondary"
            :label="$t('portfolios.scoreCard.phaseView')"
            :disabled="loading"
            hide-details
            class="mx-2"
          />
          <v-menu
            v-if="!phaseView"
            v-model="addColumnsVisible"
            :close-on-content-click="false"
            location="end"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                color="primary"
                v-bind="props"
                :disabled="loading"
                icon
                size="sm"
                :title="$t('portfolios.scoreCard.addColumns')"
                class="rounded"
              >
                <v-icon icon="mdi-view-column-outline" />
              </v-btn>
            </template>

            <v-card max-width="510">
              <v-container fluid>
                <v-list>
                  <v-list-group v-if="roColumns.length" value="roColumns">
                    <template v-slot:activator="{ props }">
                      <v-list-item
                        v-bind="props"
                        :title="$t('portfolios.scoreCard.risksAndOpportunities')"
                      />
                    </template>
                    <v-row no-gutters>
                      <v-col cols="12" sm="6" v-for="(column, index) in roColumns" :key="index">
                        <v-list-item>
                          <v-switch
                            v-model="column.visible"
                            color="secondary"
                            :label="column.title"
                            hide-details
                          />
                        </v-list-item>
                      </v-col>
                    </v-row>
                  </v-list-group>
                  <v-divider />
                  <v-list-group v-if="factColumns.size" value="factsColumns">
                    <template v-slot:activator="{ props }">
                      <v-list-item v-bind="props" :title="$t('portfolios.scoreCard.facts')" />
                    </template>
                    <v-row no-gutters>
                      <v-col cols="12" sm="6" v-for="[key, column] in factColumns" :key="key">
                        <v-list-item>
                          <v-switch
                            v-model="column.visible"
                            color="secondary"
                            :label="column.title"
                            hide-details
                          />
                        </v-list-item>
                      </v-col>
                    </v-row>
                  </v-list-group>
                  <v-divider />
                  <v-list-group v-if="kpiColumns.size" value="kpiColumns">
                    <template v-slot:activator="{ props }">
                      <v-list-item v-bind="props" :title="$t('portfolios.scoreCard.kpis')" />
                    </template>
                    <v-row no-gutters>
                      <v-col cols="12" sm="6" v-for="[key, column] in kpiColumns" :key="key">
                        <v-list-item>
                          <v-switch
                            v-model="column.visible"
                            color="secondary"
                            :label="column.title"
                            hide-details
                          />
                        </v-list-item>
                      </v-col>
                    </v-row>
                  </v-list-group>
                  <v-divider />
                  <v-list-group v-if="costColumns.length" value="costColumns">
                    <template v-slot:activator="{ props }">
                      <v-list-item v-bind="props" :title="$t('portfolios.scoreCard.costColumns')" />
                    </template>
                    <v-row no-gutters>
                      <v-col cols="12" sm="6" v-for="(column, index) in costColumns" :key="index">
                        <v-list-item>
                          <v-switch
                            v-model="column.visible"
                            color="secondary"
                            :label="column.title"
                            hide-details
                          />
                        </v-list-item>
                      </v-col>
                    </v-row>
                  </v-list-group>
                </v-list>
              </v-container>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  variant="text"
                  class="primary-negative-btn"
                  @click="addColumnsVisible = false"
                >
                  {{ $t('misc.cancel') }}
                </v-btn>
                <v-btn class="primary-action-btn" @click="setColumns" data-testid="confirm">
                  {{ $t('misc.confirm') }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </div>
        <v-btn
          v-if="modifyEnabled"
          :disabled="loading"
          class="primary-action-btn ml-4"
          @click="dialogs.add = true"
          data-testid="manage-projects"
        >
          {{ $t('portfolios.scoreCard.manageProjects') }}
        </v-btn>
    </v-row>
    </portal>
    <div v-if="phaseView" style="flex-grow: 1">
      <PhasesGant :projects="phases" />
    </div>
    <div v-show="!phaseView" :id="tabulatorId" ref="table" />
  </v-container>
  <AddDialog
    v-if="dialogs.add"
    v-model="dialogs.add"
    :projects="projectIds"
    @close="onManageProjectsClosed"
  />
</template>
<style  lang="scss">
.scorecard-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
