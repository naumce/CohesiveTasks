import { t } from '@/plugins/i18n'

export default [
  {
    path: '/tenants',
    name: 'tenants',
    component: () => import('@/views/tenants/TenantsView.vue')
    // props: { color: Colors.workspace },
    // meta: {
    //   breadcrumb: state.tenant.name,
    // },
  },
  {
    path: '/usv/:tenantId/overview',
    name: 'workspaces',
    component: () => import('@/views/workspaces/WorkspacesView.vue'),
    meta: {
      title: '%tenantName',
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: '' } }
      ]
    },
  },
  {
    path: '/usv/:tenantId/workspace/:workspaceId/schedules/:projectId/overview',
    name: 'schedules-overview',
    component: () => import('@/views/workspaces/schedules/SchedulesOverview.vue')
  },
  {
    path: '/usv/:tenantId/workspace/:workspaceId/schedules/:projectId/management/manage-group',
    name: 'manage-group',
    component: () => import('@/views/workspaces/schedules/management/ManageGroup.vue'),
    meta: {
      title: '%manageGroup',
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: 'workspaces' } },
        { label: '%workspaceName', link: { name: 'project-status' } },
        { label: t('workspaces.schedules.navigationTitle') }
      ]
    }
  },
  {
    path: '/usv/:tenantId/workspace/:workspaceId/schedules/:projectId/management',
    name: 'schedules-management',
    component: () => import('@/views/workspaces/schedules/management/SchedulesManagement.vue'),
    meta: {
      title: t('workspaces.schedules.management.title'),
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: 'workspaces' } },
        { label: '%workspaceName', link: { name: 'project-status' } },
        { label: t('workspaces.schedules.navigationTitle') }
      ]
    },
  },
  {
    path: '/usv/:tenantId/workspace/:workspaceId/schedules/:projectId/gantt',
    name: 'schedules-gantt',
    component: () => import('@/views/workspaces/schedules/gantt/SchedulesGantt.vue'),
    meta: {
      title: t('workspaces.schedules.gantt.title'),
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: 'workspaces' } },
        { label: '%workspaceName', link: { name: 'project-status' } }
      ]
    }
  },
  {
    path: '/usv/:tenantId/workspace/:workspaceId/settings',
    name: 'workspace-settings',
    children: [
      {
        path: '/usv/:tenantId/workspace/:workspaceId/settings/:projectId/user-management',
        name: 'workspace-user-management',
        component: () => import('@/views/workspaces/settings/users/UserManagement.vue'),
        meta: {
          title: t('workspaces.settings.userManagement.title'),
          breadcrumb: [
            { label: '%mainTenant', link: { name: 'tenants' } },
            { label: '%tenantName', link: { name: 'workspaces' } },
            { label: '%workspaceName', link: { name: 'project-status' } },
            { label: t('workspaces.settings.userManagement.navigationTitle') }

          ]
        }
      },
      {
        path: '/usv/:tenantId/workspace/:workspaceId/settings/:projectId/roles-management',
        name: 'workspace-roles-management',
        component: () => import('@/views/workspaces/settings/roles/RolesManagement.vue'),
        meta: {
          title: t('workspaces.settings.rolesManagement.title'),
          breadcrumb: [
            { label: '%mainTenant', link: { name: 'tenants' } },
            { label: '%tenantName', link: { name: 'workspaces' } },
            { label: '%workspaceName', link: { name: 'project-status' } },
            { label: t('workspaces.settings.rolesManagement.navigationTitle') }

          ]
        }
      },
    ]
  },
  {
    path: '/usv/:tenantId/workspace/:workspaceId/financials',
    name: 'financials',
    meta: {
      title: '%workspaceName',
      breadcrumb: [{ label: '%tenantName', link: { name: 'tenants' } }]
    },
    children: [
      {
        path: '/usv/:tenantId/workspace/:workspaceId/financials/:projectId/transactions',
        name: 'transactions',
        component: () => import('@/views/workspaces/financials/transactions/Transactions.vue'),
        meta: {
          title: t('workspaces.financials.transactions.title'),
          breadcrumb: [
            { label: '%mainTenant', link: { name: 'tenants' } },
            { label: '%tenantName', link: { name: 'workspaces' } },
            { label: '%workspaceName', link: { name: 'project-status' } },
            { label: t('workspaces.financials.transactions.title') }
          ]
        }
      },
      {
        path: '/usv/:tenantId/workspace/:workspaceId/financials/:projectId/dashboard',
        name: 'dashboard',
        component: () => import('@/views/workspaces/financials/dashboard/Dashboard.vue'),
        meta: {
          title: t('workspaces.financials.dashboard.navigationTitle'),
          breadcrumb: [
            { label: '%mainTenant', link: { name: 'tenants' } },
            { label: '%tenantName', link: { name: 'workspaces' } },
            { label: '%workspaceName', link: { name: 'workspaces' } },
            { label: t('workspaces.financials.dashboard.navigationTitle') }
          ]
        }
      },
      {
        path: '/usv/:tenantId/workspace/:workspaceId/financials/:projectId/remaining',
        name: 'remaining',
        component: () => import('@/views/workspaces/financials/remaining-cost/Remaining.vue'),
        meta: {
          title: t('workspaces.financials.remaining.title'),
          breadcrumb: [
            { label: '%mainTenant', link: { name: 'tenants' } },
            { label: '%tenantName', link: { name: 'workspaces' } },
            { label: '%workspaceName', link: { name: 'workspaces' } },
            { label: t('workspaces.financials.remaining.navigationTitle') }

          ]
        }
      },
      {
        path: '/usv/:tenantId/workspace/:workspaceId/financials/:projectId/original-budget',
        name: 'original',
        component: () => import('@/views/workspaces/financials/remaining-cost/Remaining.vue'),
        meta: {
          title: t('workspaces.financials.original.title'),
          breadcrumb: [
            { label: '%mainTenant', link: { name: 'tenants' } },  
            { label: '%tenantName', link: { name: 'workspaces' } },
            { label: '%workspaceName', link: { name: 'workspaces' } },
            { label: t('workspaces.financials.original.navigationTitle') }

          ]
        }
      }
    ]
  },
  {
    path: '/usv/:tenantId/workspace/:workspaceId/project/:projectId/status-card',
    name: 'project-status',
    component: () => import('@/views/workspaces/project-status/ProjectStatusView.vue'),
    meta: {
      title: '%workspaceName',
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: 'workspaces' } },
        { label: '%workspaceName', link: '' }
      ]
    },
    children: [
      {
        path: 'phase-gate',
        name: 'phase-gate',
        component: () =>
          import('@/views/workspaces/project-status/phases-and-gates/PhasesAndGatesView.vue'),
        meta: {
          title: t('projectStatus.phaseGate.title'),
          breadcrumb: [
            { label: '%mainTenant', link: { name: 'tenants' } },
            { label: '%tenantName', link: { name: 'workspaces' } },
            { label: '%workspaceName', link: { name: 'project-status' } },
            { label: t('projectStatus.phaseGate.title') }
          ]
        }
      },
      {
        path: 'project-facts',
        name: 'project-facts',
        component: () => import('@/views/workspaces/project-status/facts/FactsView.vue'),
        meta: {
          title: t('projectStatus.facts.title'),
          breadcrumb: [
            { label: '%mainTenant', link: { name: 'tenants' } },
            { label: '%tenantName', link: { name: 'workspaces' } },
            { label: '%workspaceName', link: { name: 'project-status' } },
            { label: t('projectStatus.facts.title') }
          ]
        }
      },
      {
        path: 'project-information',
        name: 'project-information',
        component: () =>
          import('@/views/workspaces/project-status/information/InformationView.vue'),
        meta: {
          title: t('projectStatus.information.title'),
          breadcrumb: [
            { label: '%mainTenant', link: { name: 'tenants' } },
            { label: '%tenantName', link: { name: 'workspaces' } },
            { label: '%workspaceName', link: { name: 'project-status' } },
            { label: t('projectStatus.information.title') }
          ]
        }
      },
      {
        path: 'risks-and-opportunities',
        name: 'project-risk-and-opportunities',
        component: () =>
          import(
            '@/views/workspaces/project-status/risk-and-opportunity/RiskAndOpportunityView.vue'
          ),
        meta: {
          title: t('projectStatus.riskAndOpportunities.title'),
          breadcrumb: [
            { label: '%mainTenant', link: { name: 'tenants' } },
            { label: '%tenantName', link: { name: 'workspaces' } },
            { label: '%workspaceName', link: { name: 'project-status' } },
            { label: t('projectStatus.riskAndOpportunities.title') }
          ]
        }
      },
      {
        path: 'project-kpis',
        name: 'project-kpis',
        component: () => import('@/views/workspaces/project-status/kpis/KpisView.vue'),
        meta: {
          title: t('projectStatus.kpi.title'),
          breadcrumb: [
            { label: '%mainTenant', link: { name: 'tenants' } },
            { label: '%tenantName', link: { name: 'workspaces' } },
            { label: '%workspaceName', link: { name: 'project-status' } },
            { label: t('projectStatus.kpi.title') }
          ]
        }
      }
    ]
  },

  {
    path: '/portfolios/:tenantId',
    name: 'portfolios',
    component: () => import('@/views/portfolios/PortfoliosView.vue'),
    meta: {
      title: '%tenantName',
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: '' }]
    },
  },

  {
    path: 'portfolios/:tenantId/portfolio/:portfolioId/score-card',
    name: 'portfolio-score-card',
    component: () => import('@/views/portfolios/score-card/ScoreCardView.vue'),
    meta: {
      title: '%portfolioName',
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: 'workspaces' } },
        { label: '%portfolioName', link: '' },
      ]
    }
  },
  {
    path: 'portfolios/:tenantId/portfolio/:portfolioId/user-management',
    name: 'portfolio-user-management',
    component: () => import('@/views/portfolios/user-management/PortfoliosUserManagement.vue'),
    meta: {
      title: t('portfolios.userManagement.navigationTitle'),
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: 'workspaces' } },
        { label: '%portfolioName', link: { name: 'portfolios' } },
        { label: t('portfolios.userManagement.navigationTitle') }
      ]
    }
  },
  {
    path: '/tenant/:tenantId/facts',
    name: 'tenant-administration-facts',
    component: () => import('@/views/administration/facts/TenantAdministrationFacts.vue'),
    meta: {
      title: t('administration.facts.navigationTitle'),
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: '' } },
        { label: t('administration.title') }
      ]
    }
  },
  {
    path: '/tenant/:tenantId/kpis',
    name: 'tenant-administration-kpis',
    component: () => import('@/views/administration/kpis/TenantAdministrationKpis.vue'),
    meta: {
      title: t('administration.kpis.navigationTitle'),
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: '' } },
        { label: t('administration.kpis.navigationTitle') }
      ]
    }
  },
  {
    path: '/tenant/:tenantId/matrixes',
    name: 'tenant-administration-matrixes',
    component: () => import('@/views/administration/matrixes/TenantAdministrationMatrixes.vue'),
    meta: {
      title: t('administration.matrixes.navigationTitle'),
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: '' } },
        { label: t('administration.matrixes.navigationTitle') }
      ]
    }
  },
  {
    path: '/tenant/:tenantId/users',
    name: 'tenant-administration-users',
    component: () => import('@/views/administration/users/TenantAdministrationUsers.vue'),
    meta: {
      title: t('administration.users.navigationTitle'),
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: '' } },
        { label: t('administration.users.navigationTitle') }
      ]
    }
  },
  {
    path: '/tenant/:tenantId/reason-types',
    name: 'tenant-administration-reason-types',
    component: () => import('@/views/administration/reasonTypes/TenantAdministrationReasonTypes.vue'),
    meta: {
      title: t('administration.reasonTypes.navigationTitle'),
      breadcrumb: [
        { label: '%mainTenant', link: { name: 'tenants' } },
        { label: '%tenantName', link: { name: '' } },
        { label: t('administration.reasonTypes.navigationTitle') }
      ]
    }
  }
]
