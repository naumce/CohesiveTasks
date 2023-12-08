<script setup lang="ts">
import {ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useCustomizerStore} from '@/stores/customizer'
import RiskTabContent from './RiskTabContent.vue'
import OpportunityTabContent from './OpportunityTabContent.vue'

const activeTab = ref(0)
const { t } = useI18n()
const tabs = [
  { label: t('misc.risk', 2), component: RiskTabContent },
  { label: t('misc.opportunity', 2), component: OpportunityTabContent }
]

const { canModify } = useCustomizerStore()
const modifyEnabled = canModify([
  'TENANT_ADMIN',
  'PROJECT_ADMINISTRATION',
  'PROJECT_EVENT_CHARACTERIZATION_MODIFY'
])
</script>
<template>
  <v-container fluid>
    <v-tabs v-model="activeTab">
      <v-tab v-for="(tab, index) in tabs" :key="index" class="text-none">
        {{ tab.label }}
      </v-tab>
    </v-tabs>
    <v-window v-model="activeTab" :key="activeTab">
      <v-window-item v-for="(tab, index) in tabs" :key="index">
        <component :is="tab.component" :modify="modifyEnabled" :activeTab="activeTab" />
      </v-window-item>
    </v-window>
  </v-container>
</template>

