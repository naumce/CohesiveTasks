<script setup lang="ts">
import { ref } from 'vue'
import CardSelection from '@/components/card-selection/CardSelection.vue'
import PortfolioForm from './components/PortfolioForm.vue'
import useApis from '@/composables/api'
import { apiUrls } from '@/plugins/axios'
import { useAuthStore } from '@/stores/authorization'
import { useCustomizerStore } from '@/stores/customizer'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { HttpRequest, PortfolioData, Portfolio } from '@/types'

const card = ref()
const { t } = useI18n()
const { user } = useAuthStore()
const title = user ? `${t('portfolios.welcomeMsg')}, ${user.firstName}!` : ''

const route = useRoute()
const tenantId = route.params.tenantId.toString()
const url = apiUrls.portfolios.replace(/%tenantId/, tenantId)

const { canModify, setPortfolio, setPortfolioRole } = useCustomizerStore()
const modifyEnabled = canModify(['TENANT_ADMIN', 'PORTFOLIO_ADMIN'])

const router = useRouter()
const { sendRequest } = useApis()

const selectPortfolio = async (item: Portfolio) => {
  setPortfolio(item)
  const getPortfolioRoleRequest: HttpRequest = {
    method: 'get',
    url: apiUrls.portfolioRole.replace(/%portfolioId/, `${item.id}`),
    onSuccess: {
      callback: (response) => {
        setPortfolioRole(response.data)
      }
    }
  }
  await sendRequest(getPortfolioRoleRequest)
  router.push({
    name: 'portfolio-score-card',
    params: { tenantId: tenantId, portfolioId: item.id }
  })
}

const newPortfolio = (formObject: PortfolioData) => {
  const createPortfolio: HttpRequest = {
    method: 'post',
    url: apiUrls.portfolio,
    data: { tenant_id: tenantId, ...formObject },
    onSuccess: {
      callback: () => {
        card.value.getData()
      },
      message: t('portfolios.add.success')
    }
  }

  sendRequest(createPortfolio)
}

interface IPortfolioData {
  formObject: PortfolioData
  id: number
}
const editPortfolio = (item: IPortfolioData) => {
  const editReq: HttpRequest = {
    method: 'patch',
    url: `${apiUrls.portfolio}${item.id}/`,
    data: item.formObject,
    onSuccess: {
      callback: () => {
        card.value.getData()
      },
      message: t('portfolios.edit.success')
    }
  }

  sendRequest(editReq)
}

const deletePortfolio = (id: number) => {
  const deleteReq: HttpRequest = {
    method: 'delete',
    url: `${apiUrls.portfolio}${id}/`,
    onSuccess: {
      callback: () => {
        card.value.refresh()
      },
      message: t('portfolios.delete.success')
    }
  }

  sendRequest(deleteReq)
}
</script>
<template>
  <CardSelection
    ref="card"
    :url="url"
    :title="title"
    icon="mdi-folder"
    :searchText="$t('portfolios.searchLabel')"
    :form="PortfolioForm"
    :can-create="modifyEnabled"
    :can-modify="modifyEnabled"
    :createText="$t('portfolios.createNew')"
    :newTitle="$t('portfolios.add.title')"
    :editTitle="$t('portfolios.edit.title')"
    delete-detail-field="name"
    @submit="newPortfolio"
    @edit="editPortfolio"
    @delete="deletePortfolio"
    @select="selectPortfolio"
  />
</template>
