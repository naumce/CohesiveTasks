import { defineStore } from 'pinia'
import {reactive, ref} from 'vue'
import type {
  Portfolio,
  ProjectStatus,
  Tenant,
  TenantRole,
  Workspace,
  WorkspaceRole,
  PortfolioRole,
  SchedulesGroup
} from '@/types'

export const useCustomizerStore = defineStore(
  'customizer',
  () => {
    const theme = ref<string>('light')
    const sidebarCollapse = ref<boolean>(false)
    const tenant = ref<Tenant>()
    const tenantRole = ref<TenantRole>()
    const workspace = ref<Workspace>()
    const workspaceRole = ref<WorkspaceRole>()
    const project = ref<ProjectStatus>()
    const portfolio = ref<Portfolio>()
    const portfolioRole = ref<PortfolioRole>()
    const schedulesSelectedGroup = ref<SchedulesGroup>()
    const schedulesViewItems = ref<any>()
    const currentRouteName = ref<string>();

    function toggleSidebar() {
      sidebarCollapse.value = !sidebarCollapse.value
    }
    function expandSidebar() {
      sidebarCollapse.value = false
    }
    function setTenant(value: Tenant | undefined) {
      tenant.value = value
    }
    function setScheduleGroup(value: SchedulesGroup | undefined) {
      schedulesSelectedGroup.value = value
    }
    function setScheduleViewTable(value: any | undefined) {
        schedulesViewItems.value = value
    }
    function setTenantRole(value: TenantRole | undefined) {
      tenantRole.value = value
    }
    function setWorkspace(value: Workspace | undefined) {
        workspace.value = value
    }
    function setWorkspaceRole(value: WorkspaceRole | undefined) {
      workspaceRole.value = value
    }
    function setProject(value: ProjectStatus | undefined) {
      project.value = value
    }
    function setPortfolio(value: Portfolio | undefined) {
      portfolio.value = value
    }
    function setPortfolioRole(value: PortfolioRole | undefined) {
      portfolioRole.value = value
    }
    function setCurrentRouteName(value: string | undefined) {
        currentRouteName.value = value
      }

    function getUserPermissions(): Array<string> {
      const permissions: string[] = []
      tenantRole.value?.permissions?.length && permissions.push(...tenantRole.value.permissions)
      workspaceRole.value?.permissions?.length && permissions.push(...workspaceRole.value.permissions)
      portfolioRole.value?.permissions?.length && permissions.push(...portfolioRole.value.permissions)
      return permissions
    }
    function canModify(permissions: string[]) {
      return permissions.some((permission: string) => getUserPermissions().includes(permission))
    }
    function clearCustomizerStore(): void {
      tenant.value = undefined
      tenantRole.value = undefined
      workspace.value = undefined
      workspaceRole.value = undefined
      project.value = undefined
      portfolio.value = undefined
    }
    function isSchedulesAdmin(): boolean {
      return ['TENANT_ADMIN', 'PROJECT_ADMINISTRATION', 'SPACE_ADMINISTRATION'].some((permission) =>
        workspaceRole.value?.permissions.includes(permission)
      )
    }

    return {
      theme,
      sidebarCollapse,
      tenant,
      tenantRole,
      workspace,
      workspaceRole,
      project,
      portfolio,
      portfolioRole,
      schedulesViewItems,
      schedulesSelectedGroup,
      currentRouteName,
      toggleSidebar,
      expandSidebar,
      setTenant,
      setScheduleGroup,
      setScheduleViewTable,
      setTenantRole,
      setWorkspace,
      setWorkspaceRole,
      setProject,
      getUserPermissions,
      canModify,
      clearCustomizerStore,
      setPortfolio,
      setPortfolioRole,
      isSchedulesAdmin,
      setCurrentRouteName,
    }
  },
  {
    persist: true
  }
)
