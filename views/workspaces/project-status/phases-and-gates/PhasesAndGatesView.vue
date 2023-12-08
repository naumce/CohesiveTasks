<script setup lang="ts">
import {ref, computed} from 'vue'
import PhasesAndGatesOverview from './PhasesAndGatesOverview.vue'
import TabContent from './TabContent.vue'
import useApis from '@/composables/api'
import {apiUrls} from '@/plugins/axios'
import {useRoute} from 'vue-router'
import {useCustomizerStore} from '@/stores/customizer'
import type {HttpRequest, ProjectPhaseGate, ProjectStatus} from '@/types'
import {storeToRefs} from "pinia";
const {canModify, setProject} = useCustomizerStore()
const { project } = storeToRefs(useCustomizerStore())
const route = useRoute()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`
const activeTab = ref(0)
const tabComponent = ref()

const url = `${apiUrls.phaseGates
    .replace(/%tenantId/, tenantId)
    .replace(/%projectId/, projectId)}/?page=1&per_page=10000`
const {sendRequest} = useApis()
const getPhases: HttpRequest = {
  method: 'get',
  url: url,
  onSuccess: {
    callback: (response) => {
      const projectCopy: ProjectStatus = JSON.parse(JSON.stringify(project))
      overviewKey.value++
      setProject({...projectCopy,phase_gates:response.data.items })
    }
  }
}
sendRequest(getPhases)

const overviewKey = ref(0)

const currentType = computed(() => {
  return activeTab.value ? 'gate' : 'phase'
})
const currentData = computed(() => {
  return project?.value?.phase_gates.filter((item: ProjectPhaseGate) => item.type === currentType.value)
})


function add() {
  sendRequest(getPhases)
}
function edit() {
  sendRequest(getPhases)
}

function remove() {
  sendRequest(getPhases)
}

function openAddModal() {
  tabComponent.value?.openAddModal();
}
const modifyEnabled = canModify(['TENANT_ADMIN', 'PROJECT_ADMINISTRATION', 'PROJECT_MODEL_MODIFY'])
</script>
<template>
  <v-container fluid>
    <v-row v-if="project?.phase_gates?.length">
      <v-col cols="12" class="phase-gate-container">
        <PhasesAndGatesOverview :key="overviewKey" :items="project?.phase_gates"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-tabs v-model="activeTab" >
          <v-row>
            <v-col>
              <v-tab class="text-none">{{ $t('projectStatus.phaseGate.phase.label', 2) }}</v-tab>
              <v-tab data-testid="tab-tollgates" class="text-none">{{
                  $t('projectStatus.phaseGate.gate.label', 2)
                }}
              </v-tab>
            </v-col>
            <v-col v-if="modifyEnabled" cols="2" class="d-flex align-center justify-end">
              <v-btn class="primary-action-btn" data-testid="phase-add" @click="openAddModal">
                {{ $t(`misc.add`) }}
              </v-btn>
            </v-col>
          </v-row>
        </v-tabs>
        <TabContent
            ref="tabComponent"
            :key="activeTab"
            :type="currentType"
            :data="currentData"
            :modify="modifyEnabled"
            @add="add"
            @edit="edit"
            @remove="remove"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped lang="scss">
.phase-gate-container {
  height: 300px;
}
</style>
