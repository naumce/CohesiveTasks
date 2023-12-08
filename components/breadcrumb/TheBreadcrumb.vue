<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomizerStore } from '@/stores/customizer'
import { storeToRefs } from 'pinia'
import type { TheBreadcrumb } from './breadcrumb'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
const breadcrumbs: TheBreadcrumb[] = (router.currentRoute.value.meta?.breadcrumb ||
  []) as TheBreadcrumb[]

const { tenant, workspace, portfolio, schedulesSelectedGroup } = storeToRefs(useCustomizerStore())
const namedBreadcrumbs = computed(() => {
  return breadcrumbs.map((crumb) => ({
    label: crumb.label
      .replace(/%mainTenant/, t('tenants.navigationTitle') || 'tenant')
      .replace(/%tenantName/, tenant.value?.name || 'workspace')
      .replace(/%workspaceName/, workspace.value?.name || 'status-card')
      .replace(/%portfolioName/, portfolio.value?.name || 'portfolio'),
    link: crumb.link
  }))
})

const title = computed(() => {
  if (!router.currentRoute.value?.meta?.title) return ''
  return (router.currentRoute.value.meta.title as string).replace(
    /%workspaceName/,
    workspace.value?.name || 'workspace'
  ).replace(/%tenantName/, tenant.value?.name || 'workspace')
  .replace(/%manageGroup/,   schedulesSelectedGroup?.value?.name || '')
  .replace(/%portfolioName/, portfolio.value?.name || 'portfolio')
})
</script>
<template>
  <v-container v-if="breadcrumbs.length" fluid class="pa-0 ma-2">
    <v-row no-gutters>
      <v-col cols="12">
        <div class="main-page-title">{{ title }}</div>
      </v-col>
      <v-col cols="12" class="breadcrumb-label">
        <template v-for="(crumb, index) in namedBreadcrumbs" :key="index">
          <router-link
            v-if="crumb.link"
            :to="crumb.link"
            class="me-2"
            style="text-decoration: none"
          >
            <span class="prev-links">{{ crumb.label }}</span>
            <v-icon icon="mdi-chevron-right" color="primary" size="12px"></v-icon>
          </router-link>
          <span v-else class="me-2">{{ crumb.label }}</span>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>
