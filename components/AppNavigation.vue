<script setup lang="ts">
import {computed, inject, ref, watch} from 'vue'
import {useCustomizerStore} from '@/stores/customizer'
import {storeToRefs} from 'pinia'
import {useDisplay} from 'vuetify'
import {useAuthStore} from '@/stores/authorization'
import {navigationGuard} from '@/router/navigation-guard'
import type {AppConfiguration} from '@/types'
import CustomNavigationIcon from "@/components/CustomNavigationIcon.vue";
import {useRouter} from "vue-router";
const router = useRouter()

const authStore = useAuthStore()

const {user} = authStore
const termsLink = 'https://www.ppmcore.com/terms-of-service/'
const {sidebarCollapse, tenant, workspace, portfolio,currentRouteName} = storeToRefs(useCustomizerStore())
const {toggleSidebar, expandSidebar, isSchedulesAdmin} = useCustomizerStore()
const {xs, mdAndDown} = useDisplay()
const showSidebar = ref(!xs.value)

const logoIconUrl = computed(() => {
  if (xs.value) return new URL('/src/assets/LogoFull.svg', import.meta.url).href
  // https://stackoverflow.com/a/71514878/2543400
  return new URL(
      `/src/assets/${sidebarCollapse.value ? 'LogoIcon' : 'LogoFull'}.svg`,
      import.meta.url
  ).href
})
const sidebarProps = computed(() => {
  if (!xs.value) return {rail: sidebarCollapse.value}
  return {}
})
const appConfig = inject('appConfig') as AppConfiguration

const workspaceView = computed(() => {
  return  currentRouteName.value === 'workspaces'
})

const portfolioView = computed(() => {
  return  currentRouteName.value === 'portfolios'
})

function signout() {
  const tokenRedirect = import.meta.env.DEV ? '?token_redirect=http://localhost:8080/token' : ''
  const logoutUrl = `/openid/logout${tokenRedirect}`
  authStore.logout()
  window.location.href = `${appConfig.api_root}${logoutUrl}`
}

const {getUserPermissions} = useCustomizerStore()
const canViewItem = (item: string, permissions: string[]) => {
  return navigationGuard[item].some((permission: string) => permissions.includes(permission))
}
const canViewProjectStatus = computed(() => {
  const userPermissions = getUserPermissions()
  return canViewItem('project-status', userPermissions)
})

const canViewTenantAdministration = computed(() => {
  const userPermissions = getUserPermissions()
  return canViewItem('tenant-administration', userPermissions)
})

const canViewSchedules = computed(() => {
  const userPermissions = getUserPermissions()
  return canViewItem('schedules-overview', userPermissions)
})
const canViewPhaseGate = computed(() => {
  const userPermissions = getUserPermissions()
  return canViewItem('phase-gate', userPermissions)
})
const canViewProjectFacts = computed(() => {
  const userPermissions = getUserPermissions()
  return canViewItem('project-facts', userPermissions)
})
const canViewProjectInformation = computed(() => {
  const userPermissions = getUserPermissions()
  return canViewItem('project-information', userPermissions)
})
const canViewProjectKpis = computed(() => {
  const userPermissions = getUserPermissions()
  return canViewItem('project-kpis', userPermissions)
})
const canViewProjectRO = computed(() => {
  const userPermissions = getUserPermissions()
  return canViewItem('project-risk-and-opportunities', userPermissions)
})
const canViewWorkspaceSettings = computed(() => {
  const userPermissions = getUserPermissions()
  return canViewItem('workspace-settings', userPermissions)
})
const canViewPortfolioUserManagement = computed(() => {
  const userPermissions = getUserPermissions()
  return canViewItem('portfolio-user-management', userPermissions)
})
const canViewFinancials = computed(() => {
  const userPermissions = getUserPermissions()
  return canViewItem('financials', userPermissions)
})

const routeName = computed(() => {
  return router?.currentRoute?.value?.name
})

const handleSidebar =() => {
  if(mdAndDown.value) {
    showSidebar.value = !showSidebar.value
    return;
  }
  toggleSidebar();
}
</script>
<template >
  <v-app-bar  class="app-bar">
    <v-row  align="center" justify="start" class="px-7">
      <div :class="{'logo-expanded' : !sidebarCollapse && !mdAndDown}" >
        <img :src="logoIconUrl" alt="img" />
      </div>
      <v-app-bar-nav-icon v-if="routeName !== 'tenants'"  variant="text" @click.stop="handleSidebar()" class="ml-1"/>
      <div class="header-search ml-2" @click.stop >
        <portal-target ref="search" name="search"/>
      </div>
    </v-row>

    <v-menu>
      <template v-slot:activator="{ props }">
        <v-icon class="mr-5" color="white" icon="mdi-bell" size="25" style="visibility: hidden !important"
                v-bind="props"></v-icon>
      </template>
      <v-list data-testid="three-dots-menu-items">
        <v-list-item :title="user?.fullName || ''" data-testid="current-user" disabled value="user"/>
        <v-divider/>
        <v-list-item
            :title="$t('header.menu.signout')"
            data-testid="signout"
            value="logout"
            @click="signout"
        />
        <v-divider/>
        <v-list-item
            :href="termsLink"
            :title="$t('header.menu.tos')"
            class="justify-center"
            data-testid="terms-of-service"
            target="_blank"
            value="tos"
        />
        <small style="color: grey" class="pa-2 justify-center" data-testid="copyright">{{
            $t('header.menu.copyright')
          }}</small>
      </v-list>
    </v-menu>

    <v-menu>
      <template v-slot:activator="{ props }">
        <v-avatar class="bg-primary mr-10" data-testid="avatar">
          <v-icon icon="mdi-account"  color="white"  v-bind="props" size="25"></v-icon>
        </v-avatar>
      </template>
      <v-list data-testid="three-dots-menu-items">
        <v-list-item :title="user?.fullName || ''" data-testid="current-user" disabled value="user"/>
        <v-divider/>
        <v-list-item
            :title="$t('header.menu.signout')"
            data-testid="signout"
            value="logout"
            @click="signout"
        />
        <v-divider/>
        <v-list-item
            :href="termsLink"
            :title="$t('header.menu.tos')"
            class="justify-center"
            data-testid="terms-of-service"
            target="_blank"
            value="tos"
        />
        <small style="color: grey" class="pa-2 justify-center" data-testid="copyright">{{
            $t('header.menu.copyright')
          }}</small>
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-navigation-drawer
      v-if="routeName !== 'tenants'"
      v-model="showSidebar"
      location="left"
      v-bind="sidebarProps"
      width="300"
      @click="expandSidebar"
      :class="`app-navigation pt-4 ${sidebarCollapse ? 'collapse-icons' : ''}`"
  >
    <v-list nav density="compact">
      <v-list-item
          :title="$t('tenants.navigationTitle')"
          :to="{ name: 'tenants' }"
          data-testid="menu-tenants"
          exact
          value="tenants"
          density="compact"
      >
        <template v-slot:prepend="{ isActive }">
          <CustomNavigationIcon class="custom-icon"  icon="tenants" :is-active="isActive"/>
        </template>
      </v-list-item>

      <v-list-group
          v-if="tenant"
          :title="$t('workspaces.navigationTitle')"
          data-testid="menu-workspaces"
          prepend-icon="mdi-gamepad-circle-right"
          value="workspaces"
      >
        <template v-slot:activator="{ props }">
          <v-list-item :title="$t('workspaces.navigationTitle')"
                       :to="{ name: 'workspaces', params: { tenantId: tenant?.id, projectId: workspace?.project_card.id } }"
                       v-bind="props"/>
        </template>

        <v-list-item
            :title="$t('misc.overview')"
            :to="{ name: 'workspaces', params: { tenantId: tenant?.id, projectId: workspace?.project_card.id } }"
            data-testid="workspaces-overview"
            prepend-icon="mdi-gamepad-circle-right"
            exact
            value="workspacesOverview"
            class="group-item"
            :active="routeName === 'workspaces'"
        />
        <v-list-item
            v-if="tenant && workspace && !workspaceView && canViewSchedules"
            :title="$t('workspaces.schedules.navigationTitle')"
            :to="{
            name: isSchedulesAdmin() ? 'schedules-management' : 'schedules-overview',
            params: {
              tenantId: tenant.id,
              workspaceId: workspace.id,
              projectId: workspace.project_card.id
            }
          }"
            data-testid="workspaces-schedules"
            value="workspaceSchedules"
            prepend-icon="mdi-file-arrow-left-right"
            class="group-item"
            :active="routeName === (isSchedulesAdmin() ? 'schedules-management' : 'schedules-overview') || routeName ==='manage-group' || routeName === 'schedules-gantt'"

        />
        <v-list-group
            v-if="tenant && workspace && !workspaceView && canViewFinancials"
            :title="$t('workspaces.financials.navigationTitle')"
            data-testid="workspaces-financials"
            value="financials"
            prepend-icon="mdi-finance"
        >
          <template v-slot:activator="{ props }">
            <v-list-item :title="$t('workspaces.financials.navigationTitle')" v-bind="props"/>
          </template>
          <v-list-item
              v-if="tenant && workspace && !workspaceView"
              :title="$t('workspaces.financials.dashboard.navigationTitle')"
              :to="{
              name: 'dashboard',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              data-testid="workspaces-dashboard"
              exact
              value="dashboard"
              prepend-icon="mdi-chart-arc"
              :active="routeName === 'dashboard'"
          />
          <v-list-item
              v-if="tenant && workspace && !workspaceView"
              :title="$t('workspaces.financials.transactions.navigationTitle')"
              :to="{
              name: 'transactions',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              data-testid="transactions"
              exact
              value="transactions"
              prepend-icon="mdi-swap-horizontal"
              :active="routeName === 'transactions'"

          />
          <v-list-item
              v-if="tenant && workspace && !workspaceView"
              :title="$t('workspaces.financials.remaining.navigationTitle')"
              :to="{
              name: 'remaining',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              data-testid="remaining"
              exact
              value="remaining"
              prepend-icon="mdi-transit-connection-horizontal"
              :active="routeName === 'remaining'"
          />
          <v-list-item
              v-if="tenant && workspace && !workspaceView"
              :title="$t('workspaces.financials.original.navigationTitle')"
              :to="{
              name: 'original',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              data-testid="original"
              exact
              value="original"
              prepend-icon="mdi-transit-detour"
              :active="routeName === 'original'"
          />
        </v-list-group>
        <v-list-group
            v-if="tenant && workspace && !workspaceView && canViewProjectStatus"
            :title="$t('projectStatus.navigationTitle')"
            data-testid="workspaces-project-card"
            value="projectStatus"
        >
          <template v-slot:activator="{ props }">
            <v-list-item prepend-icon="mdi-view-dashboard" :title="$t('projectStatus.navigationTitle')" v-bind="props"/>
          </template>
          <v-list-item
              :title="$t('projectStatus.overview')"
              :to="{
              name: 'project-status',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              data-testid="project-overview"
              exact
              value="projectOverview"
              prepend-icon="mdi-view-dashboard-edit"
              :active="routeName === 'project-status'"

          />
          <v-list-item
              v-if="canViewPhaseGate"
              :title="$t('projectStatus.phaseGate.navigationTitle')"
              :to="{
              name: 'phase-gate',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              :active="routeName === 'phase-gate'"
              data-testid="menu-phase-gate"
              exact
              value="projectPhaseGate"

          >
            <template v-slot:prepend="{ isActive }">
              <CustomNavigationIcon class="custom-icon"  icon="phase-gate" :is-active="isActive"/>
            </template>
          </v-list-item>
          <v-list-item
              v-if="canViewProjectFacts"
              :title="$t('projectStatus.facts.navigationTitle')"
              :to="{
              name: 'project-facts',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              data-testid="menu-project-facts"
              exact
              value="projectFacts"
              prepend-icon="mdi-format-list-text"
              :active="routeName === 'project-facts'"

          />
          <v-list-item
              v-if="canViewProjectInformation"
              :to="{
              name: 'project-information',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              data-testid="menu-project-information"
              exact
              value="projectInformation"
              :active="routeName === 'project-information'"

          >
            <template v-slot:prepend="{ isActive }">
              <CustomNavigationIcon class="custom-icon"  icon="project-info" :is-active="isActive"/>
            </template>
            <v-list-item-title  v-text="$t('projectStatus.information.navigationTitle')"></v-list-item-title>
          </v-list-item>
          <v-list-item
              v-if="canViewProjectKpis"
              :title="$t('projectStatus.kpi.navigationTitle')"
              :to="{
              name: 'project-kpis',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              data-testid="menu-kpi"
              exact
              value="projectKpis"
              :active="routeName === 'project-kpis'"

          >
            <template v-slot:prepend="{ isActive }">
              <CustomNavigationIcon class="custom-icon"  icon="kpis" :is-active="isActive"/>
            </template>
          </v-list-item>
          <v-list-item
              v-if="canViewProjectRO"
              :title="$t('projectStatus.riskAndOpportunities.navigationTitle')"
              :to="{
              name: 'project-risk-and-opportunities',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              data-testid="workspaces-risk-and-opportunities"
              exact
              prepend-icon="mdi-table"
              value="projectRiskAndOpportunities"
              :active="routeName === 'project-risk-and-opportunities'"
          />
        </v-list-group>
        <v-list-group
            v-if="tenant && workspace && !workspaceView && canViewWorkspaceSettings"
            :title="$t('workspaces.settings.navigationTitle')"
            data-testid="workspaces-settings"
            value="settings"
            prepend-icon="mdi-cog"
        >
          <template v-slot:activator="{ props }">
            <v-list-item :title="$t('workspaces.settings.navigationTitle')" v-bind="props"/>
          </template>
          <v-list-item
              v-if="tenant && workspace"
              :title="$t('workspaces.settings.userManagement.navigationTitle')"
              :to="{
              name: 'workspace-user-management',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              data-testid="user-management"
              exact
              value="userManagement"
              prepend-icon="mdi-account-multiple-plus-outline"
              :active="routeName === 'workspace-user-management'"

          />
          <v-list-item
              v-if="tenant && workspace"
              :title="$t('workspaces.settings.rolesManagement.navigationTitle')"
              :to="{
              name: 'workspace-roles-management',
              params: {
                tenantId: tenant?.id,
                workspaceId: workspace.id,
                projectId: workspace.project_card.id
              }
            }"
              data-testid="roles-management"
              exact
              value="rolesManagement"
              prepend-icon="mdi-account-details-outline"
              :active="routeName === 'workspace-roles-management'"


          />
        </v-list-group>
      </v-list-group>
      <v-list-group
          v-if="tenant"
          :title="$t('portfolios.navigationTitle')"
          prepend-icon="mdi-folder-multiple-outline"
          value="portfolios"

      >
        <template v-slot:activator="{ props }">
          <v-list-item
              :title="$t('portfolios.navigationTitle')"
              :to="{
                name: 'portfolios',
                params: {
                  tenantId: tenant?.id
                }
              }"
              data-testid="menu-portfolios"
              prepend-icon="mdi-folder"
              v-bind="props"
          />
        </template>
        <v-list-item
            v-if="tenant"
            :title="$t('portfolios.scoreCard.selectionTitle')"
            :to="{
              name: 'portfolios',
              params: {
                tenantId: tenant?.id
              }
            }"
            exact
            value="portfoliosSelection"
            prepend-icon="mdi-folder"
            :active="routeName === 'portfolios'"
        />
        <v-list-item
            v-if="tenant && portfolio && !portfolioView"
            :title="$t('portfolios.scoreCard.navigationTitle')"
            :to="{
            name: 'portfolio-score-card',
            params: {
              tenantId: tenant?.id,
              portfolioId: portfolio.id
            }
          }"
            data-testid="menu-portfolio-score-card"
            exact
            value="portfolioScoreCard"
            :active="routeName === 'portfolio-score-card'"

        >
          <template v-slot:prepend="{ isActive }">
            <CustomNavigationIcon class="custom-icon"  icon="score-card" :is-active="isActive"/>
          </template>
        </v-list-item>
        <v-list-item
            v-if="tenant && portfolio && !portfolioView && canViewPortfolioUserManagement"
            :title="$t('portfolios.userManagement.navigationTitle')"
            :to="{
            name: 'portfolio-user-management',
            params: {
              tenantId: tenant?.id,
              portfolioId: portfolio.id
            }
          }"
            data-testid="menu-portfolio-user-management"
            exact
            prepend-icon="mdi-account-multiple-plus-outline"
            value="portfolioUserManagement"
            :active="routeName === 'portfolio-user-management'"

        />
      </v-list-group>
      <v-list-group
          v-if="tenant && canViewTenantAdministration"
          :title="$t('administration.navigationTitle')"
          data-testid="menu-tenant-admin"
          value="tenantAdministration"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
              :title="$t('administration.navigationTitle')"
              v-bind="props"
          >
            <template v-slot:prepend="{ isActive }">
              <CustomNavigationIcon class="custom-icon"  icon="tenant-settings" :is-active="isActive"/>
            </template>
          </v-list-item>
        </template>
        <v-list-item
            :title="$t('administration.users.navigationTitle')"
            :to="{ name: 'tenant-administration-users', params: { tenantId: tenant?.id } }"
            exact
            prepend-icon="mdi-account-multiple-plus-outline"
            value="tenantAdministrationUsers"
            data-testid="users-tenant-admin"
            :active="routeName === 'tenant-administration-users'"
        />
        <v-list-item
            :title="$t('administration.facts.navigationTitle')"
            :to="{ name: 'tenant-administration-facts', params: { tenantId: tenant?.id } }"
            data-testid="facts-tenant-admin"
            exact
            value="tenantAdministrationFacts"
            :active="routeName === 'tenant-administration-facts'"
        >
          <template v-slot:prepend="{ isActive }">
            <CustomNavigationIcon class="custom-icon"  icon="project-fact-register" :is-active="isActive"/>
          </template>
        </v-list-item>
        <v-list-item
            :title="$t('administration.kpis.navigationTitle')"
            :to="{ name: 'tenant-administration-kpis', params: { tenantId: tenant?.id } }"
            data-testid="tenant-admin-kpi"
            exact
            value="tenantAdministrationKpis"
            :active="routeName === 'tenant-administration-kpis'"
        >
          <template v-slot:prepend="{ isActive }">
            <CustomNavigationIcon class="custom-icon"  icon="kpi-register" :is-active="isActive"/>
          </template>
        </v-list-item>
        <v-list-item
            :title="$t('administration.matrixes.navigationTitle')"
            :to="{ name: 'tenant-administration-matrixes', params: { tenantId: tenant?.id } }"
            data-testid="romatrix-tenant-admin"
            exact
            value="tenantAdministrationMatrixes"
            :active="routeName === 'tenant-administration-matrixes'"
        >
          <template v-slot:prepend="{ isActive }">
            <CustomNavigationIcon class="custom-icon"  icon="ro-register" :is-active="isActive"/>
          </template>
        </v-list-item>
        <v-list-item
            :title="$t('administration.reasonTypes.navigationTitle')"
            :to="{ name: 'tenant-administration-reason-types', params: { tenantId: tenant?.id } }"
            data-testid="financial-reason-type"
            exact
            value="tenantAdministrationReasonTypes"
            prepend-icon="mdi-playlist-plus"
            :active="routeName === 'tenant-administration-reason-types'"
        />
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>
<style lang="scss">
.logo-expanded {
  width: 300px;
}
</style>