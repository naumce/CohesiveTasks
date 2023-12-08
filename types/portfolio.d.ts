import type {RawProjectFact, ProjectKpi, ProjectFact, ProjectPhaseGate, ProjectCost} from './project'
import type { User, UserValue } from '.user'
import type { Role } from '.role'
export interface Portfolio {
  custom_id: string | null
  id: number
  name: string
}
export interface PortfolioData {
  tenant_id?: string
  name: string
}
interface PortfolioAverageRisk {
  score: number | null
  color: string
}
export interface PortfolioProjectRaw {
  id: number
  custom_id: string | null
  uv_workspace_id: number
  name: string
  risk_matrix: RawProjectFact
  opportunity_matrix: RawProjectFact
  kpis: ProjectKpi[]
  tenant_level_facts: ProjectFact[]
  phase_gates: ProjectPhaseGate[]
  average_risk: PortfolioAverageRisk
  average_opportunity: PortfolioAverageRisk
  phase_gates_summary: ProjectPhaseGate
  project_cost: ProjectCost[]
}
export interface PortfolioProject {
  name: string
  risk_score: number | null
  risk_color: string
  risk_matrix: string
  opportunity_score: number | null
  opportunity_color: string
  opportunity_matrix: string
  [key: string]: string | number | UserValue | ProjectKpiCellValue | null
}

interface FilterNumber {
  gte?: number
  lte?: number
}
export interface PortfolioScoreCardFilter {
  id: number
  number?: FilterNumber
  datetime?: FilterNumber
}

export interface PortfolioUser {
  user_id: number
  tenant_id: number
  role_id: number
  user: User
  role: Role
}

export interface PortfolioRole {
  id: number
  editable: boolean
  name: string
  permissions: string[]
}
