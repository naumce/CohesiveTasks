import type { AllPermissions } from '@/types'

export const TenantAdminPermissions = Object.freeze({
  TENANT_ADMIN: 'TENANT_ADMIN',
  PORTFOLIO_ADMIN: 'PORTFOLIO_ADMIN'
})
export const TenantAdminPermissionsArray = Object.values(TenantAdminPermissions)

export const TenantAdminPermissionsObjects = Object.freeze({
  [TenantAdminPermissions.TENANT_ADMIN]: {
    text: 'Tenant Admin',
    value: TenantAdminPermissions.TENANT_ADMIN
  },
  [TenantAdminPermissions.PORTFOLIO_ADMIN]: {
    text: 'Portfolio Admin',
    value: TenantAdminPermissions.PORTFOLIO_ADMIN
  }
})

// workspace permissions
export const WorkspacePermissions = Object.freeze({
  PROJECT_ADMINISTRATION: 'PROJECT_ADMINISTRATION', // workspace admin - can access anyting in workspace

  PROJECT_CARD_VIEW: 'PROJECT_CARD_VIEW',

  PROJECT_INFORMATION_MODIFY: 'PROJECT_INFORMATION_MODIFY',
  PROJECT_FACTS_MODIFY: 'PROJECT_FACTS_MODIFY',
  PROJECT_EVENT_CHARACTERIZATION_MODIFY: 'PROJECT_EVENT_CHARACTERIZATION_MODIFY', // risks and opportunities
  PROJECT_KPI_MODIFY: 'PROJECT_KPI_MODIFY',
  PROJECT_MODEL_MODIFY: 'PROJECT_MODEL_MODIFY', //phase gate

  // PROJECT_MODEL_METADATA_MODIFY: 'PROJECT_MODEL_METADATA_MODIFY', //resources - phase gate - currently not in use

  SPACE_ADMINISTRATION: 'SPACE_ADMINISTRATION', // schedules
  PROJECT_VIEW: 'PROJECT_VIEW', // view gantt

  PROJECT_CARD_USER_MANAGEMENT: 'PROJECT_CARD_USER_MANAGEMENT',
  PROJECT_CARD_ROLE_MANAGEMENT: 'PROJECT_CARD_ROLE_MANAGEMENT',

  PERMISSIONS_ADMINISTRATION: 'PERMISSIONS_ADMINISTRATION', // currently not in use
  PROJECT_FINANCE_VIEW: 'PROJECT_FINANCE_VIEW',
  PROJECT_FINANCE_EDIT: 'PROJECT_FINANCE_EDIT',
})
export const WorkspacePermissionsArray = Object.values(WorkspacePermissions)

// workspace permissions combinations

export const WorkspaceModifyPermissions = Object.freeze([
  TenantAdminPermissions.TENANT_ADMIN,
  WorkspacePermissions.PROJECT_ADMINISTRATION
])
export const ProjectCardViewPermissions = Object.freeze([
  ...WorkspaceModifyPermissions,
  WorkspacePermissions.PROJECT_CARD_VIEW
])
export const InformationModifyPermissions = Object.freeze([
  ...WorkspaceModifyPermissions,
  WorkspacePermissions.PROJECT_INFORMATION_MODIFY
])
export const FactsModifyPermissions = Object.freeze([
  ...WorkspaceModifyPermissions,
  WorkspacePermissions.PROJECT_FACTS_MODIFY
])
export const ROModifyPermissions = Object.freeze([
  ...WorkspaceModifyPermissions,
  WorkspacePermissions.PROJECT_EVENT_CHARACTERIZATION_MODIFY
])
export const KpisModifyPermissions = Object.freeze([
  ...WorkspaceModifyPermissions,
  WorkspacePermissions.PROJECT_KPI_MODIFY
])
export const PhaseGateModifyPermissions = Object.freeze([
  ...WorkspaceModifyPermissions,
  WorkspacePermissions.PROJECT_MODEL_MODIFY
])
export const SchedulesAdminPermissions = Object.freeze([
  ...WorkspaceModifyPermissions,
  WorkspacePermissions.SPACE_ADMINISTRATION
])
export const WorkspacePermissionsObjects = Object.freeze({
  [WorkspacePermissions.PROJECT_VIEW]: {
    text: 'View Gantt Chart',
    value: WorkspacePermissions.PROJECT_VIEW
  },
  [WorkspacePermissions.PROJECT_CARD_VIEW]: {
    text: 'View Status Card',
    value: WorkspacePermissions.PROJECT_CARD_VIEW
  },
  [WorkspacePermissions.PROJECT_FACTS_MODIFY]: {
    text: 'Update Facts',
    value: WorkspacePermissions.PROJECT_FACTS_MODIFY
  },
  [WorkspacePermissions.PROJECT_KPI_MODIFY]: {
    text: 'Update KPIs',
    value: WorkspacePermissions.PROJECT_KPI_MODIFY
  },
  [WorkspacePermissions.PROJECT_INFORMATION_MODIFY]: {
    text: 'Update Goals & Status',
    value: WorkspacePermissions.PROJECT_INFORMATION_MODIFY
  },
  [WorkspacePermissions.PROJECT_EVENT_CHARACTERIZATION_MODIFY]: {
    text: 'Update Risks & Opportunities',
    value: WorkspacePermissions.PROJECT_EVENT_CHARACTERIZATION_MODIFY
  },
  [WorkspacePermissions.PROJECT_MODEL_MODIFY]: {
    text: 'Update Phases & Tollgates',
    value: WorkspacePermissions.PROJECT_MODEL_MODIFY
  },
  // [WorkspacePermissions.PROJECT_MODEL_METADATA_MODIFY]: {
  //   text: 'Update Phases & Tollgates data',
  //   value: WorkspacePermissions.PROJECT_MODEL_METADATA_MODIFY,
  // },
  [WorkspacePermissions.PROJECT_CARD_USER_MANAGEMENT]: {
    text: 'User Administration',
    value: WorkspacePermissions.PROJECT_CARD_USER_MANAGEMENT
  },
  [WorkspacePermissions.PROJECT_CARD_ROLE_MANAGEMENT]: {
    text: 'Role Administration',
    value: WorkspacePermissions.PROJECT_CARD_ROLE_MANAGEMENT
  },
  [WorkspacePermissions.SPACE_ADMINISTRATION]: {
    text: 'Schedule Administration',
    value: WorkspacePermissions.SPACE_ADMINISTRATION
  },
  [WorkspacePermissions.PROJECT_ADMINISTRATION]: {
    text: 'Workspace Super Admin',
    value: WorkspacePermissions.PROJECT_ADMINISTRATION
  },
  [WorkspacePermissions.PERMISSIONS_ADMINISTRATION]: {
    text: 'Workspace Permissions Administration',
    value: WorkspacePermissions.PERMISSIONS_ADMINISTRATION
  }
})

export const workspaceAccessPerms = Object.freeze([
  {
    ...WorkspacePermissionsObjects[WorkspacePermissions.PROJECT_CARD_VIEW],
    children: [
      WorkspacePermissionsObjects[WorkspacePermissions.PROJECT_FACTS_MODIFY],
      WorkspacePermissionsObjects[WorkspacePermissions.PROJECT_KPI_MODIFY],
      WorkspacePermissionsObjects[WorkspacePermissions.PROJECT_INFORMATION_MODIFY],
      WorkspacePermissionsObjects[WorkspacePermissions.PROJECT_EVENT_CHARACTERIZATION_MODIFY],
      WorkspacePermissionsObjects[WorkspacePermissions.PROJECT_MODEL_MODIFY]
      // WorkspacePermissionsObjects[
      //   WorkspacePermissions.PROJECT_MODEL_METADATA_MODIFY
      // ],
    ]
  }
])
export const adminAccessPerms = Object.freeze([
  WorkspacePermissionsObjects[WorkspacePermissions.PROJECT_ADMINISTRATION],
  WorkspacePermissionsObjects[WorkspacePermissions.PROJECT_CARD_USER_MANAGEMENT],
  WorkspacePermissionsObjects[WorkspacePermissions.PROJECT_CARD_ROLE_MANAGEMENT]
])
export const scheduleAccessPerms = Object.freeze([
  WorkspacePermissionsObjects[WorkspacePermissions.PROJECT_VIEW],
  WorkspacePermissionsObjects[WorkspacePermissions.SPACE_ADMINISTRATION]
])
// portfolio permissions
export const PortfolioPermissions = Object.freeze({
  PORTFOLIO_USER: 'PORTFOLIO_USER',
  PORTFOLIO_ADD_REMOVE_PROJECTS: 'PORTFOLIO_ADD_REMOVE_PROJECTS',
  PORTFOLIO_USER_MANAGEMENT: 'PORTFOLIO_USER_MANAGEMENT',
  PORTFOLIO_ROLES_MANAGEMENT: 'PORTFOLIO_ROLES_MANAGEMENT'
})
export const PortfolioPermissionsArray = Object.values(PortfolioPermissions)

export const PortfolioPermissionsObjects = Object.freeze({
  [PortfolioPermissions.PORTFOLIO_USER]: {
    text: 'View Portfolio',
    value: PortfolioPermissions.PORTFOLIO_USER
  },
  [PortfolioPermissions.PORTFOLIO_ADD_REMOVE_PROJECTS]: {
    text: 'Update Portfolio',
    value: PortfolioPermissions.PORTFOLIO_ADD_REMOVE_PROJECTS
  },
  [PortfolioPermissions.PORTFOLIO_USER_MANAGEMENT]: {
    text: 'User Administration',
    value: PortfolioPermissions.PORTFOLIO_USER_MANAGEMENT
  },
  [PortfolioPermissions.PORTFOLIO_ROLES_MANAGEMENT]: {
    text: 'Role Administration',
    value: PortfolioPermissions.PORTFOLIO_ROLES_MANAGEMENT
  }
})

export const FinancialPermissionsObjects = Object.freeze({
  [WorkspacePermissions.PROJECT_FINANCE_VIEW]: {
    text: 'View Financials',
    value: WorkspacePermissions.PROJECT_FINANCE_VIEW
  },
  [WorkspacePermissions.PROJECT_FINANCE_EDIT]: {
    text: 'Update Finacials',
    value: WorkspacePermissions.PROJECT_FINANCE_EDIT
  }})

export const allPermissionsObject: AllPermissions = Object.freeze({
  ...TenantAdminPermissionsObjects,
  ...WorkspacePermissionsObjects,
  ...PortfolioPermissionsObjects,
  ...FinancialPermissionsObjects
})
