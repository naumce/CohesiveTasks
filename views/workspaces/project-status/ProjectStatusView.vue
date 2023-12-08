<script setup lang="ts">
import {computed, watch} from 'vue'
import { useCustomizerStore } from '@/stores/customizer'
import { storeToRefs } from 'pinia'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import FactsOverview from './facts/FactsOverview.vue'
import KpisOverview from './kpis/KpisOverview.vue'
import PhasesAndGatesOverview from './phases-and-gates/PhasesAndGatesOverview.vue'
import RiskAndOpportunityPreview from './risk-and-opportunity/RiskAndOpportunityPreview.vue'
import { useRouter, useRoute } from 'vue-router'
import { navigationGuard } from '@/router/navigation-guard'
import type { HttpRequest } from '@/types'

const { getUserPermissions, setProject } = useCustomizerStore()
const { project } = storeToRefs(useCustomizerStore())
const userPermissions = getUserPermissions()
// legacy. Probably deprecated because of navigationGuard implementation on router
const hasViewAccess = navigationGuard['project-status'].some((permission: string) =>
  userPermissions.includes(permission)
)

const { sendRequest } = useApis()
const router = useRouter()

const route = useRoute()
// const customizerStore = useCustomizerStore()
const tenantId = `${route.params.tenantId}`
const workspaceId = route.params.workspaceId
const projectId = route.params.projectId
const geProjectStatus: HttpRequest = {
  method: 'get',
  url: `${apiUrls.projects.replace(/%tenantId/, tenantId)}/${projectId}/`,
  onSuccess: {
    callback: (response) => {
      setProject(response.data)
    }
  }
}

const routeName = computed(() => {
  return router.currentRoute.value.name;
})
sendRequest(geProjectStatus)

watch(routeName, (newVal => {
 if(newVal ==='project-status'){
   sendRequest(geProjectStatus)
 }
}))

const renderChildRoute = computed(() => {
  return router.currentRoute.value.name !== 'project-status'
})
</script>
<template>
  <router-view v-if="renderChildRoute"/>
  <v-container v-else fluid >
    <v-row>
      <v-col cols="12">
        <v-card flat class="card">
          <v-card-title class="d-flex justify-space-between">
             <h3 class="section-title">{{ $t('projectStatus.phaseGate.title') }}</h3>
            <v-btn
              v-if="hasViewAccess"
              :to="{
                name: 'phase-gate',
                params: { tenantId: tenantId, workspaceId: workspaceId, projectId: projectId }
              }"
              variant="outlined"
              class="secondary-action-btn"
              data-testid="status-page-phases"
            >
              {{ $t('misc.more') }}
            </v-btn>
          </v-card-title>
          <v-container v-if="project?.phase_gates?.length" fluid  class="phase-gate-container">
            <PhasesAndGatesOverview :items="project?.phase_gates" :key="`${project?.phase_gates}`" />
          </v-container>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="pt-3">
      <v-col cols="12">
        <v-card class="h-100 card" flat>
          <v-card-title class="d-flex justify-space-between">
            <div>
               <h3 class="section-title">{{ $t('projectStatus.information.title') }}</h3>
            </div>
            <v-btn
                v-if="hasViewAccess"
                :to="{
                name: 'project-information',
                params: { tenantId: tenantId, workspaceId: workspaceId, projectId: projectId }
              }"
                class="secondary-action-btn"
                data-testid="status-page-information"
            >
              {{ $t('misc.more') }}
            </v-btn>
          </v-card-title>
          <v-container fluid v-if="project"  class="pl-2">
            <v-row  class="mr-0 pa-2 justify-space-between">
              <v-col cols="12" sm="6" class="mr-0 pa-0 pr-6">
                <h5 class="section-subtitle mb-3">{{ $t('projectStatus.information.currentGoal') }}</h5>
                <div v-if="project.current_goal?.id">
                  <p class="pre-wrap section-desc">{{ project.current_goal.description }}</p>
                </div>
              </v-col>
              <v-col cols="12" sm="6" class="mr-0 pa-0 pl-6">
                <h5 class="section-subtitle mb-3">{{ $t('projectStatus.information.currentStatus') }}</h5>
                <div v-if="project.current_status?.id">
                  <p class="pre-wrap section-desc">{{ project.current_status.description }}</p>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="pt-3">
      <v-col cols="12">
        <v-card class="h-100 card" flat>
          <v-card-title class="d-flex justify-space-between">
             <h3 class="section-title">{{ $t('projectStatus.facts.title') }}</h3>
            <v-btn
              v-if="hasViewAccess"
              :to="{
                name: 'project-facts',
                params: { tenantId: tenantId, workspaceId: workspaceId, projectId: projectId }
              }"
              class="secondary-action-btn"
              data-testid="status-page-project-facts"
            >
              {{ $t('misc.more') }}
            </v-btn>
          </v-card-title>
          <FactsOverview :facts="project?.tenant_level_facts_in_card" />
        </v-card>
      </v-col>
    </v-row>

    <v-row class="pt-3">
      <v-col cols="12">
        <v-card flat class="card card">
          <v-card-title class="d-flex justify-space-between">
             <h3 class="section-title">{{ $t('projectStatus.kpi.title') }}</h3>
            <v-btn
              v-if="hasViewAccess"
              :to="{
                name: 'project-kpis',
                params: { tenantId: tenantId, workspaceId: workspaceId, projectId: projectId }
              }"
              class="secondary-action-btn"
              data-testid="status-page-project-kpis"
            >
              {{ $t('misc.more') }}
            </v-btn>
          </v-card-title>
          <KpisOverview :kpis="project?.kpis_in_card" />
        </v-card>
      </v-col>
    </v-row>
    <v-row class="pt-3">
      <v-col cols="12">
        <v-card flat class="card card">
          <v-card-title class="d-flex justify-space-between">
             <h3 class="section-title">{{ $t('projectStatus.riskAndOpportunities.title') }}</h3>
            <v-btn
              v-if="hasViewAccess"
              :to="{
                name: 'project-risk-and-opportunities',
                params: { tenantId: tenantId, workspaceId: workspaceId, projectId: projectId }
              }"
              class="secondary-action-btn"
              data-testid="status-page-project-r&o"
            >
              {{ $t('misc.more') }}
            </v-btn>
          </v-card-title>
          <RiskAndOpportunityPreview :project="project" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped  lang="scss">
.phase-gate-container {
  height: 200px;
  max-height: 350px!important;
}
.card{
  padding: 10px;
  box-shadow: 0px 0px 40px 0px #2196F31A;

}
.v-row {
  margin-left: 0;
  margin-right: 0;
}
</style>
