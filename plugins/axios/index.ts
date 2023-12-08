import axios from 'axios'
import { useCookies } from 'vue3-cookies'
import type { InternalAxiosRequestConfig } from 'axios'
import Router from '@/router'

interface Urls {
  [key: string]: string
}
const apiUrls: Urls = {
  refreshToken: '/openid/refresh',
  userInfo: 'users/info',
  tenants: 'tenants',
  workspaces: 'project_space',
  projects: '/tenants/%tenantId/projects',
  tenantRole: '/tenants/%tenantId/current_role/',
  tenantUsers: 'permissions/tenant/%tenantId/users/',
  tenantRoles: 'permissions/tenant/%tenantId/roles/',
  workspaceRole: 'project_space/%workspaceId/permissions_v2',
  projectRole: '/tenants/%tenantId/projects/%projectId/current_role/',
  portfolioRole: '/portfolio/%portfolioId/current_role/',
  projectRisksAndOpportunities: '/tenants/%tenantId/projects/%projectId/event_characterization',
  projectUsers: '/project_space/%workspaceId/user_management',
  matrix: '/tenants/%tenantId/matrix',
  facts: '/tenants/%tenantId/projects/%projectId/factswithvalue',
  reasonTypes: '/tenants/%tenantId/transaction_category/',
  factsNoValue: '/tenants/%tenantId/projects/%projectId/factswithnovalue',
  fact: '/tenants/%tenantId/projects/%projectId/tenant_facts/%factId/',
  kpis: '/tenants/%tenantId/projects/%projectId/kpi/',
  tenantKpis: '/tenants/%tenantId/kpi/',
  factsOrder: '/tenants/%tenantId/projects/%projectId/tenant_facts_order',
  objectives: 'tenants/%tenantId/projects/%projectId/goals_objectives',
  informationStatus: 'tenants/%tenantId/projects/%projectId/status',
  phaseGates: 'tenants/%tenantId/projects/%projectId/phase_gate',
  phases: 'tenants/%tenantId/projects/%projectId/phases',
  gates: 'tenants/%tenantId/projects/%projectId/gates',
  portfolios: 'portfolio/tenant/%tenantId',
  portfolioProjects: 'portfolio/%portfolioId/projects_filter/',
  userRoles: '/permissions/tenant/%tenantId/project_card_roles_v2/%projectCard/',
  portfolioProjectsFilter: 'portfolio/%portfolioId/projects_filter/',
  portfolioProject: 'portfolio/%portfolioId/projects/%projectId/',
  portfolioUsers: 'portfolio/%portfolioId/users',
  portfolioRoles: 'permissions/tenant/%tenantId/portfolio_roles/',
  portfolio: 'portfolio/',
  scheduleGroups: 'project_space/%workspaceId/groups/',
  scheduleUserGroups: 'project_space/%workspaceId/groups_for_current_user/',
  scheduleView: 'project_space/%workspaceId/view/%groupId/',
  scheduleViewV2: 'universal_viewer/%workspaceId/group/%groupId/view/',
  schedulesVersions: 'project_space/%workspaceId/admin_paginated/',
  schedulesVersionsV2: 'universal_viewer/%workspaceId/admin/',
  scheduleVersion: 'projects/version/%versionId',
  schedulesFileUpload: 'projects/upload?project_space=%workspaceId/',
  schedulesFileUploadV2: 'universal_viewer/%workspaceId/project_file/',
  publishView: 'project_space/view/create_ordered?space_id=%workspaceId',
  publishViewV2: 'universal_viewer/%workspaceId/group/%groupId/view/',
  schedulesGanttAdmin: 'projects/admin_versions_filter?ids=%versionIds&space_id=%workspaceId',
  schedulesGantt: 'projects/versions_filter?space_id=%workspaceId&group_id=%groupId',
  tenantAdminFacts: 'tenants/%tenantId/facts/',
  transactions: '/tenants/%tenantId/projects/%projectId/transactions/',
  score: '/tenants/%tenantId/projects/%projectId/get_score/',
  reasons: '/tenants/%tenantId/transaction_category/',
  historicRemainingCost: 'tenants/%tenantId/projects/%projectId/%phaseId/historic_remaining_costs/',
  historicBudget: 'tenants/%tenantId/projects/%projectId/%phaseId/historic_budget/',
  currentRemainingCost: 'tenants/%tenantId/projects/%projectId/%phaseId/current_remaining_costs/',
  budget: 'tenants/%tenantId/projects/%projectId/%phaseId/budget/',
  draftRemainingCost:
    'tenants/%tenantId/projects/%projectId/%phaseId/draft_current_remaining_costs/',
  draftBudget: 'tenants/%tenantId/projects/%projectId/%phaseId/draft_budget/',
  historicRemainingCostByCategory:
    'tenants/%tenantId/projects/%projectId/%phaseId/historic_remaining_costs/by_categories/',
  historicBudgetByCategory:
    'tenants/%tenantId/projects/%projectId/%phaseId/historic_budget/by_categories/',
  financialDashboard: 'tenants/%tenantId/financial_dashboard/%projectId/',
  schedulesAssignedToGroups: 'project_space/%workspaceId/project_version/%selectedProject/groups/',
  latestSchedulesAssignedToGroups:
    'project_space/%workspaceId/latest_project_version/%selectedProject/groups/'
}

axios.defaults.baseURL = import.meta.env.VITE_APP_USV_BASEURL
axios.defaults.headers.common['Content-Type'] = 'application/json'
// contains regex for public endpoints
const publicEndpoints: RegExp[] = []
let isAlreadyFetchingAccessToken = false

// This is the list of waiting requests that will retry after the JWT refresh complete
let subscribers: any[] = []

axios.interceptors.response.use(
  function (response) {
    // If the request succeeds, we don't have to do anything and just return the response
    return response
  },
  function (error) {
    const errorResponse = error.response
    if (isTokenExpiredError(errorResponse, error.request.responseURL) === true) {
      return resetTokenAndReattemptRequest(error)
    } else {
      // If the error is due to other reasons, we just throw it back to axios
      return Promise.reject(error)
    }
  }
)

function isTokenExpiredError(errorResponse: any, requestUrl: string) {
  const tokenExpired =
    errorResponse?.data?.error_code.includes('TOKEN_EXPIRED') && errorResponse.status === 401
  const isRefreshToken = requestUrl.includes(apiUrls.refreshToken)
  if (tokenExpired && isRefreshToken) {
    logout()
    return Promise.reject('')
  }
  if (errorResponse?.data?.error_code.includes('TOKEN_EXPIRED') && errorResponse.status === 401) {
    return true
  } else {
    return Promise.reject('')
  }
}

function resetTokenAndReattemptRequest(error: any) {
  try {
    const { response: errorResponse } = error
    const retryOriginalRequest = new Promise((resolve) => {
      addSubscriber((access_token: string) => {
        errorResponse.config.headers = {
          Authorization: access_token ? `Bearer ${access_token}` : null
        }
        resolve(axios(errorResponse.config))
      })
    })
    if (!isAlreadyFetchingAccessToken) {
      isAlreadyFetchingAccessToken = true
      refreshToken()
    }
    return retryOriginalRequest
  } catch (err) {
    return Promise.reject(err)
  }
}

function addSubscriber(callback: any) {
  subscribers.push(callback)
}

function onAccessTokenFetched(access_token: string) {
  // When the refresh is successful, we start retrying the requests one by one and empty the queue
  subscribers.forEach((callback) => callback(access_token))
  subscribers = []
  isAlreadyFetchingAccessToken = false
}

const refreshToken = () => {
  const { cookies } = useCookies()
  axios({
    method: 'post',
    url: apiUrls.refreshToken,
    data: {
      refresh_token: cookies.get('_refresh')
    }
  })
    .then((res) => {
      cookies.remove('_token')
      cookies.set('_token', res.data.access_token, undefined, '/')
      const newToken = res.data.access_tokenn
      onAccessTokenFetched(newToken)
      isAlreadyFetchingAccessToken = false
      subscribers = []
    })
    .catch(async (error) => {
      logout()
      return Promise.reject(error)
    })
}

const logout = () => {
  const { cookies } = useCookies()

  cookies.remove('_token', '/')
  cookies.remove('_refresh', '/')
  Router.push('/').then(() => {
    location.reload()
  })
}

axios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    for (const regex of publicEndpoints) {
      if (regex.test(config.url ?? '')) return config
    }

    const { cookies } = useCookies()
    const token = cookies.get('_token')

    if (token && !isAlreadyFetchingAccessToken) {
      config.headers['Authorization'] = `Bearer ${cookies.get('_token')}`
    }
    return config
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error)
  }
)

export { axios as apiClient, apiUrls }
