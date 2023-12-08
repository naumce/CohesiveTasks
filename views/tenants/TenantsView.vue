<script setup lang="ts">
import { ref } from 'vue'
import CardSelection from '@/components/card-selection/CardSelection.vue'
import TenantForm from './components/TenantForm.vue'
import useApis from '@/composables/api'
import { apiUrls } from '@/plugins/axios'
import { useAuthStore } from '@/stores/authorization'
import { useCustomizerStore } from '@/stores/customizer'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { HttpRequest, RequestTenant, Tenant } from '@/types'
import CustomNavigationIcon from "@/components/CustomNavigationIcon.vue";

const card = ref()
const { t } = useI18n()
const { user } = useAuthStore()
const title = user ? `${t('tenants.welcomeMsg')}, ${user.firstName}!` : ''
const url = apiUrls.tenants
const {
  setTenant,
  setTenantRole,
  setProject,
  setWorkspace,
  setWorkspaceRole,
  setPortfolio,
  setPortfolioRole
} = useCustomizerStore();

const router = useRouter()
const { sendRequest } = useApis()

const selectTenant = async (item: Tenant) => {
  setTenant(item)
  const getTenantRoleRequest: HttpRequest = {
    method: 'get',
    url: apiUrls.tenantRole.replace(/%tenantId/, `${item.id}`),
    onSuccess: {
      callback: (response) => {
        setTenantRole(response.data)
      }
    }
  }
  await sendRequest(getTenantRoleRequest)
  router.push({ name: 'workspaces', params: { tenantId: item.id } })
}

const requestTenant = (formObject: RequestTenant) => {
  const createNewTenant: HttpRequest = {
    method: 'post',
    url: `${apiUrls.tenants}/`,
    data: formObject,
    onSuccess: {
      callback: () => {
        card.value.getData()
      },
      message: t('tenants.requestNewTenant').replace(/%name/, formObject.name)
    }
  }

  sendRequest(createNewTenant)
}
</script>
<template>
  <CardSelection
    ref="card"
    :url="url"
    :title="title"
    :searchText="$t('tenants.searchLabel')"
    :form="TenantForm"
    can-create
    :createText="$t('tenants.requestNewTenant')"
    :newTitle="$t('tenants.requestNewTenant')"
    @submit="requestTenant"
    @select="selectTenant"
  >
    <template v-slot:icon>
      <custom-navigation-icon icon="tenants" color="white" class="ma-2" />
    </template>
  </CardSelection>
</template>
