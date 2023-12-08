export const navigationGuard: Record<string, string[]> = {
  'schedules-overview': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'SPACE_ADMINISTRATION',
    'PROJECT_VIEW'
  ],
  'schedules-management': ['TENANT_ADMIN', 'PROJECT_ADMINISTRATION', 'SPACE_ADMINISTRATION'],
  'schedules-gantt': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'SPACE_ADMINISTRATION',
    'PROJECT_VIEW'
  ],
  'project-status': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'PROJECT_CARD_VIEW',
    'PROJECT_KPI_MODIFY',
    'PROJECT_EVENT_CHARACTERIZATION_MODIFY',
    'PROJECT_FACTS_MODIFY',
    'PROJECT_INFORMATION_MODIFY',
    'PROJECT_MODEL_MODIFY'
  ],
  'phase-gate': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'PROJECT_CARD_VIEW',
    'PROJECT_MODEL_MODIFY'
  ],
  'project-facts': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'PROJECT_CARD_VIEW',
    'PROJECT_FACTS_MODIFY'
  ],
  'project-information': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'PROJECT_CARD_VIEW',
    'PROJECT_INFORMATION_MODIFY'
  ],
  'project-risk-and-opportunities': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'PROJECT_CARD_VIEW',
    'PROJECT_EVENT_CHARACTERIZATION_MODIFY'
  ],
  'project-kpis': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'PROJECT_CARD_VIEW',
    'PROJECT_KPI_MODIFY'
  ],
  'workspace-settings': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'PROJECT_CARD_USER_MANAGEMENT',
    'PROJECT_CARD_ROLE_MANAGEMENT'
  ],
  'workspace-user-management': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'PROJECT_CARD_USER_MANAGEMENT'
  ],
  'workspace-roles-management': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'PROJECT_CARD_ROLE_MANAGEMENT'
  ],
  'financials': [
    'TENANT_ADMIN',
    'PROJECT_ADMINISTRATION',
    'PROJECT_FINANCE_VIEW',
    'PROJECT_FINANCE_EDIT',
  ],
  'portfolio-score-card': ['TENANT_ADMIN', 'PORTFOLIO_ADMIN', 'PORTFOLIO_USER', 'PORTFOLIO_ADD_REMOVE_PROJECTS'],
  'portfolio-user-management': ['TENANT_ADMIN', 'PORTFOLIO_ADMIN', 'PORTFOLIO_USER_MANAGEMENT'],
  'tenant-administration': ['TENANT_ADMIN'],
  'tenant-administration-facts': ['TENANT_ADMIN'],
  'tenant-administration-kpis': ['TENANT_ADMIN'],
  'tenant-administration-matrixes': ['TENANT_ADMIN'],
  'tenant-administration-users': ['TENANT_ADMIN']
}
