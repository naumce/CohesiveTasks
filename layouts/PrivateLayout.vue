<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import AppNavigation from '@/components/AppNavigation.vue'
import TheBreadcrumb from '@/components/breadcrumb/TheBreadcrumb.vue'

const router = useRouter()

const { loading } = storeToRefs(useLoaderStore())

const routeKey = computed(() => {
  return router.currentRoute.value.fullPath
})
const routeName = computed(() => {
  return router?.currentRoute?.value?.name
})
</script>
<template>
  <AppNavigation />
  <router-view v-slot="{ Component }" >
    <v-progress-linear v-if="loading" indeterminate color="primary" />
    <div v-else style="height: 4px" />
    <keep-alive :include="['SchedulesManagement']">
      <v-container ref="layoutContainer" id="layoutContainer"  fluid class="h-100 layout-container" >
        <v-card class="h-100 container-card"  :class="{ cardcolor: routeName === 'project-status' || routeName === 'dashboard' }">
          <v-card-title id="layoutHeader" class="layout-header">
            <v-row class="justify-space-between align-center">
              <v-col cols="6">
                <TheBreadcrumb :key="routeKey" />
              </v-col>
              <v-col cols="6" class="d-flex justify-end align-end">
                <portal-target ref="header-actions" name="header-actions"/>
              </v-col>
            </v-row>
          </v-card-title>
          <component :is="Component" class="layout-content"/>
        </v-card>
      </v-container>
    </keep-alive>
  </router-view>
</template>
<style scoped lang="scss">
.container-card {
  outline: none;
  border: none;
  box-shadow: 0 0 50px 0 #2196F31A;
}
.cardcolor {
  background-color: transparent !important;
  border-color: white !important;
  box-shadow: none;

}
</style>
