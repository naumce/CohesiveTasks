<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authorization'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import { useRouter, useRoute } from 'vue-router'
import type {  SchedulesGroup } from '@/types'
import CardSelection from "@/components/card-selection/CardSelection.vue";

const { sendRequest } = useApis()

const page = ref(1)
const lastPage = ref(1)
const card = ref()

const route = useRoute()
const tenantId = route.params.tenantId as string
const workspaceId = route.params.workspaceId as string

const per_page = 18
const url = apiUrls.scheduleUserGroups.replace(/%workspaceId/, workspaceId)

const getData = (response:any) => {
  const groups = response?.data.items;
  if (groups.length !== 1) return
  router.push({
    name: 'schedules-gantt',
    params: { tenantId: tenantId, workspaceId: workspaceId },
    query: { groupId: groups.value[0].id }
  })
}

const authStore = useAuthStore()
const user = authStore.user

let controller: AbortController | null

const router = useRouter()

function selectGroup(item: SchedulesGroup) {
  router.push({
    name: 'schedules-gantt',
    params: { tenantId: tenantId, workspaceId: workspaceId },
    query: { groupId: item.id }
  })
}

</script>

<template>
  <CardSelection
      ref="card"
      :url="url"
      :title="$t('workspaces.schedules.welcomeMsg')"
      icon="mdi-format-list-text"
      @select="selectGroup"
      @get-data="getData"
  />

</template>

<style lang="scss" scoped></style>
