<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import type { HttpRequest } from '@/types'
import { useCustomizerStore } from '@/stores/customizer'
import { storeToRefs } from 'pinia'
import PhasesAndGatesOverview from '../../project-status/phases-and-gates/PhasesAndGatesOverview.vue'
import CostTable from './CostTable.vue'
import CostSheet from './CostSheet.vue'
import { formatNumber } from "@/utils/number";
const { t } = useI18n()
const { project } = storeToRefs(useCustomizerStore())
const phases = ref()
const reasons = ref()
const route = useRoute()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`

const { sendRequest } = useApis()

const selectAllOption = {
  name: 'Select All',
  value: 'select',
  id: 0,
  visible: true
}
const getReasons: HttpRequest = {
  method: 'get',
  url: `${apiUrls.reasons.replace(/%tenantId/, tenantId)}`,
  onSuccess: {
    callback: (response) => {
      reasons.value = response.data.items.filter((p: any) => p.active && p.used_in_transaction && p.used).map((item: any) => ({ ...item, visible: true }))
      reasons.value.unshift({ ...selectAllOption })
    }
  }
}

const ajaxFinancialDashboard = computed(
  () =>
    `${apiUrls.financialDashboard
      .replace(/%tenantId/, tenantId)
      .replace(/%projectId/, projectId)}`
)

const dashboard = ref()
const url = `${apiUrls.phaseGates.replace(/%tenantId/, tenantId).replace(/%projectId/, projectId)}/`
const getPhases: HttpRequest = {
  method: 'get',
  url: url,
  onSuccess: {
    callback: (response) => {
      phases.value = response.data.items.filter((p: any) => p.type === 'phase' && p.used_in_cost).map((item: any) => ({ ...item, visible: true }))
      phases.value.unshift({ ...selectAllOption })
    }
  }
}
const toggleSelectAll = (type: string) => {
  if (type === 'reasons') reasons.value[0] = { ...reasons.value[0], visible: false }
  else phases.value[0] = { ...phases.value[0], visible: false }
}

const getDashboardData = async (item: any, type: string = 'phases') => {
  await nextTick()
  if (item?.raw) {
    const visible = item?.raw.visible
    if (item?.raw?.id === 0) {
      if (type === 'phases') phases.value = phases.value?.map((item: any) => ({ ...item, visible: visible }))
      else reasons.value = reasons.value?.map((item: any) => ({ ...item, visible: visible }))
    } else {
      if (!visible) toggleSelectAll(type)
    }
  }
  const getDashboard: HttpRequest = {
    method: 'post',
    url: ajaxFinancialDashboard.value,
    data: {
      "transaction_category_id__in": [
        ...reasons.value?.filter((item: any) => item?.visible && item.id !== 0).map((item: any): any => item.id) || []
      ],
      "phase_id__in": [
        ...phases.value?.filter((item: any) => item?.visible && item.id !== 0).map((item: any) => item.id) || []
      ]
    },
    onSuccess: {
      callback: (response) => {
        dashboard.value = response.data
      }
    }
  }
  return sendRequest(getDashboard)
}

onMounted(async () => {
  await sendRequest(getReasons)
  await sendRequest(getPhases)
  getDashboardData(null, '')
})

function exportCsv() {
  const getCsvFileCostSheet: HttpRequest = {
    method: 'post',
    url: ajaxFinancialDashboard.value + 'cost_sheet/csv/',
    data: {
      "transaction_category_id__in": [
        ...reasons.value?.filter((item: any) => item.visible && item.id !== 0).map((item: any) => item.id) || []
      ],
      "phase_id__in": [
        ...phases.value?.filter((item: any) => item.visible && item.id !== 0).map((item: any) => item.id) || []
      ]
    },
    onSuccess: {
      callback: (response) => {
        var downloadLink = document.createElement('a')
        var blob = new Blob(['\ufeff', response.data])
        var url = URL.createObjectURL(blob)
        downloadLink.href = url
        downloadLink.download = 'cost_sheet.csv'
        document.body.appendChild(downloadLink)
        downloadLink.click()
      }
    }
  }
  const getCsvFileCostTable: HttpRequest = {
    method: 'post',
    url: ajaxFinancialDashboard.value + 'cost_table/csv/',
    data: {
      "transaction_category_id__in": [
        ...reasons.value?.filter((item: any) => item.visible && item.id !== 0).map((item: any) => item.id) || []
      ],
      "phase_id__in": [
        ...phases.value?.filter((item: any) => item.visible && item.id !== 0).map((item: any) => item.id) || []
      ]
    },
    onSuccess: {
      callback: (response) => {
        var downloadLink = document.createElement('a')
        var blob = new Blob(['\ufeff', response.data])
        var url = URL.createObjectURL(blob)
        downloadLink.href = url
        downloadLink.download = 'cost_table.csv'
        document.body.appendChild(downloadLink)
        downloadLink.click()
      }
    }
  }
  sendRequest(getCsvFileCostSheet)
  sendRequest(getCsvFileCostTable)
}

function createSelectionComputed(selectors: any) {
  return computed(() => {
    return selectors.value
      ?.filter((item: any) => item.value !== 'select')
      .every((item: any) => item.visible);
  });
}

const reasonsSelection = createSelectionComputed(reasons);
const phasesSelection = createSelectionComputed(phases);

watch([reasonsSelection, phasesSelection], ([reason, phase]) => {
  if (reason) {
    reasons.value[0].visible = reason
  }
  if (phase) {
    phases.value[0].visible = phase
  }
})

const dataDashboard = computed(() => {
  return dashboard?.value
})

const cards = computed(() => {
  return [{ name: 'total change requests', change_requests: dashboard?.value?.total_change_requests, change_requests_budget: dashboard?.value?.total_change_requests_budget, color: 'primary' },
  { name: 'approved change requests', change_requests: dashboard?.value?.approved_change_requests, change_requests_budget: dashboard?.value?.approved_change_requests_budget, color: 'green1' },
  { name: 'pending change requests', change_requests: dashboard?.value?.pending_change_requests, change_requests_budget: dashboard?.value?.pending_change_requests_budget, color: 'orange1' }]
})

const marginPercent = computed(() => {
  if (!dataDashboard?.value?.margin_percent) return 0
  return dataDashboard?.value.margin_percent * 100
})
const handleItemClose = (item: any, type: string) => {
  item.visible = false
  toggleSelectAll(type)
  getDashboardData(null, '')
}

const toggleAllCategories = () => {
  reasons.value = reasons.value.map((item: any) => ({ ...item, visible: false }))
  getDashboardData(null, '')
}

const toggleAllPhases = () => {
  phases.value = phases.value.map((item: any) => ({ ...item, visible: false }))
  getDashboardData(null, '')
}

const costSheetByPhase = computed(() => {
  return dashboard?.value.cost_sheet_by_phase.map((value: any) => {
    return {
      ...value,
      margin_percent: !value.margin_percent ? 0 : value.margin_percent * 100
    }
  })
})
const costSheet = computed(() => {
  return dashboard?.value.cost_sheet.map((value: any) => {
    return {
      ...value,
      margin_percent: !value.margin_percent ? 0 : value.margin_percent * 100
    }
  })
})

const isReasonSelectedAll = computed(() => reasons.value[0]?.visible)
const isPhaseSelectedAll = computed(() => phases.value[0]?.visible)

</script>
<template>
  <v-container fluid>
    <v-row>
      <portal to="header-actions">
        <div class="flex d-flex align-center justify-end">
          <div>
            <v-select :items="reasons" density="compact" variant="outlined" :multiple="true" item-title="name"
              item-value="id" :value="[]" :label="$t('workspaces.financials.transactions.category')" hide-details
              style="width: 200px;" :menu-props="{ maxHeight: '400px' }">
              <template v-slot:item="{ item }">
                <v-list-item class="px-4">
                  <div class="w-100 d-flex align-center justify-space-between">
                    <span :htmlFor="item.value + item.title" class="w-75 d-block">{{ item.title }}</span>
                    <v-switch :id="item.value + item.title" class="ml-4" v-model="item.raw.visible"
                      @update:modelValue="getDashboardData(item, 'reasons')" color="secondary" label=" " flat inline
                      hide-details style="max-width: 50px;" />
                  </div>
                </v-list-item>
              </template>
            </v-select>
          </div>
          <div class="mx-4">
            <v-select :items="phases" density="compact" variant="outlined" :menu-props="{ maxHeight: '400px' }"
              :multiple="true" item-title="name" item-value="id" :value="[]"
              :label="$t('workspaces.financials.transactions.phase')" hide-details style="width: 200px;">
              <template v-slot:item="{ item }">
                <v-list-item class="px-4">
                  <div class="w-100 d-flex align-center justify-space-between">
                    <span :htmlFor="item.value + item.title" class="w-75 d-block">{{ item.title }}</span>
                    <v-switch :id="item.value + item.title" @update:modelValue="getDashboardData(item, 'phases')"
                      class="ml-4" v-model="item.raw.visible" color="secondary" label=" " flat inline hide-details
                      style="max-width: 50px;" />
                  </div>
                </v-list-item>
              </template>
            </v-select>
          </div>
          <v-btn class="secondary-action-btn" height="44px" @click="exportCsv">
            {{ $t('misc.export') }}
          </v-btn>
        </div>
      </portal>
      <v-col cols="12" class="d-flex justify-space-between mb-4 pa-0">
        <div>
          <template v-if="reasons?.length && isReasonSelectedAll">
            <v-chip closable color="primary" class="ma-2" @click:close="toggleAllCategories"> All Categories</v-chip>
          </template>
          <template v-for="item in reasons" v-else>
            <v-chip v-if="item.visible && item.id !== 0" :key="item.id" closable variant="flat" color="white"
              class="ma-2 reason-chip" @click:close="handleItemClose(item, 'reasons')" close-icon="mdi mdi-close"> {{
                item.name }}</v-chip>
          </template>
          <template v-if="phases?.length && isPhaseSelectedAll">
            <v-chip closable color="info" class="ma-2" @click:close="toggleAllPhases"> All Phases</v-chip>
          </template>
          <template v-for="item in phases" v-else>
            <v-chip v-if="item.visible && item.id !== 0" :key="item.id" closable variant="flat" color="white"
              class="ma-2 phase-chip" @click:close="handleItemClose(item, 'phases')" close-icon="mdi mdi-close"> {{
                item.name }}</v-chip>
          </template>
        </div>
      </v-col>
      <div class="d-flex w-100">
        <div class="cards" v-for="n in 3" :key="n">
          <v-card class="card-item d-flex column  mr-2 top-card-item ">
            <v-card-title class="titlecard mt-3">{{ cards[n - 1].name }}</v-card-title>
            <v-card-subtitle class="text-h4 mt-auto ma-0 ml-2 font-weight-bold subtitlecard"
              :class="`text-${cards[n - 1].color}`" style="margin: 10px; padding: 10px;">{{ cards[n - 1].change_requests
              }}</v-card-subtitle>
            <div class="d-flex column mt-auto mb-3  px-5">
              <span class="costImpact" :class="`text-${cards[n - 1].color}`">{{
                $t('workspaces.financials.dashboard.cards.costImpact') }}</span>
              <span class="changeRequest">{{ formatNumber(cards[n - 1].change_requests_budget, false) }}</span>
            </div>
          </v-card>
        </div>
        <v-card class="card-item columns-card px-4">
          <div class="row w-100 h-100 mt-2">
            <v-card-text class="column">
              <div class="d-flex column align-start mb-2 column-item">
                <span class="text-primary font-weight-medium">{{
                  $t('workspaces.financials.dashboard.cards.originalBudget') }}</span>
                <span :class="`font-weight-medium ${dataDashboard?.original_budget < 0 ? 'text-red' : ''}`">{{
                  formatNumber(dataDashboard?.original_budget, false) }}</span>
              </div>
              <div class="d-flex column align-start mb-2 column-item">
                <span class="text-primary font-weight-medium">{{ $t('workspaces.financials.dashboard.cards.currentBudget')
                }}</span>
                <span :class="`font-weight-medium ${dataDashboard?.current_budget < 0 ? 'text-red' : ''}`">{{
                  formatNumber(dataDashboard?.current_budget, false) }}</span>
              </div>
              <div class="d-flex column align-start column-item">
                <span class=" text-primary font-weight-medium">{{
                  $t('workspaces.financials.dashboard.cards.proposedBudget') }}</span>
                <span :class="`pl-1 font-weight-medium ${dataDashboard?.proposed_budget < 0 ? 'text-red' : ''}`">{{
                  formatNumber(dataDashboard?.proposed_budget, false) }}</span>
              </div>
            </v-card-text>
            <v-card-text class="column">
              <div class="d-flex column align-start mb-2 column-item">
                <span class="text-primary font-weight-bold">{{ $t('workspaces.financials.dashboard.cards.actualCost')
                }}</span>
                <span :class="`font-weight-bold ${dataDashboard?.actual_cost < 0 ? 'text-red' : ''}`">{{
                  formatNumber(dataDashboard?.actual_cost, false) }}</span>
              </div>
              <div class="d-flex column align-start mb-2 column-item">
                <span class="text-primary font-weight-bold">{{ $t('workspaces.financials.dashboard.cards.remainingCost')
                }}</span>
                <span :class="`font-weight-bold ${dataDashboard?.remaining_cost < 0 ? 'text-red' : ''}`">{{
                  formatNumber(dataDashboard?.remaining_cost, false) }}</span>
              </div>
              <div class="d-flex column align-start mb-2 column-item">
                <span class="text-primary font-weight-bold">{{
                  $t('workspaces.financials.dashboard.cards.atCompletionCost') }}</span>
                <span :class="`font-weight-bold ${dataDashboard?.at_completion_cost < 0 ? 'text-red' : ''}`">{{
                  formatNumber(dataDashboard?.at_completion_cost, false) }}</span>
              </div>
            </v-card-text>
            <v-card-text class="column">
              <div class="d-flex column align-start mb-3 column-item">
                <span class="text-primary font-weight-bold">{{ $t('workspaces.financials.dashboard.cards.revenue')
                }}</span>
                <span :class="`font-weight-bold ${dataDashboard?.revenue < 0 ? 'text-red' : ''}`">{{
                  formatNumber(dataDashboard?.revenue, false) }}</span>
              </div>
              <div class="d-flex column align-start mb-2 column-item">
                <span class="text-primary font-weight-bold">{{ $t('workspaces.financials.dashboard.cards.margin')
                }}</span>
                <span :class="`font-weight-bold ${dataDashboard?.margin < 0 ? 'text-red' : ''}`">{{
                  formatNumber(dataDashboard?.margin, false) }}</span>
              </div>
              <div class="d-flex column align-start mb-2 column-item">
                <span class="text-primary font-weight-bold">{{ $t('workspaces.financials.dashboard.cards.marginPercent')
                }}</span>
                <span :class="`font-weight-bold ${marginPercent < 0 ? 'text-red' : ''}`">{{ formatNumber(marginPercent,
                  false) }}</span>
              </div>
            </v-card-text>
          </div>
        </v-card>
      </div>
      <v-container v-if="project?.phase_gates?.length" fluid class="phase-gate-container my-4 card-item">
        <PhasesAndGatesOverview :items="project?.phase_gates" />
      </v-container>
      <CostTable :costData="dashboard?.cost_table" :key="dashboard?.cost_table?.length + 'table'" />
      <CostSheet :costDataPhase="costSheetByPhase" :costDataAll="dashboard" :costDataCategory="costSheet"
        :key="dashboard?.cost_sheet?.length + 'cost_sheet' + dashboard?.cost_sheet_by_phase?.length" />
    </v-row>
  </v-container>
</template>
<style  lang="scss">
@import '../../../../assets/styles/global/variables';

.flex {
  display: flex;
}

.column {
  display: flex;
  flex-direction: column;
}

.cards {
  width: 16.60%;
  margin-right: 5px;

}

.card-item {
  box-shadow: $card-shadow !important;
}

.top-card-item {
  min-height: 190px !important;
}

.columns-card {
  min-width: 50%;
}

.titlecard {
  white-space: initial;
  font-size: 17px;
  text-transform: capitalize;
  line-height: 22px !important;
  font-weight: 600;
  color: $grey-1;
}

.subtitlecard {
  margin: 10px;
  padding: 10px;
  font-size: $font-xl !important;
}

.changeRequest {
  font-size: 14px;
  font-weight: $font-weight-md;
}

.costImpact {
  font-size: 14px;
  white-space: nowrap;
  font-weight: $font-weight-md;
}

.row {
  display: flex;
  flex-direction: row;
}

.tableTitle {
  margin-bottom: -60px;
  margin-top: 10px;
}

.selectPhase {
  margin-right: 15px;
  min-height: 30px;
  margin-top: -3px;
}

.selectCategory {
  margin-right: 15px;
  min-height: 30px;
  margin-top: -3px;
  min-width: 200px;
}

.selectStatus {
  margin-right: 15px;
  width: 200px;
  height: 30px;
}

.phase-gate-container {
  height: 300px;
  max-height: 350px !important;
  background-color: white;
  border-radius: $default-radius;
}

.reason-chip {
  color: $primary-color !important;
  font-weight: $font-weight-md !important;
}

.phase-chip {
  color: $green-1 !important;
  font-weight: $font-weight-md !important;
}

.column-item {
  span {
    font-weight: $font-weight-md !important;
  }
}</style>
