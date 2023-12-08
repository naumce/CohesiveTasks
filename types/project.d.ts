import type { User } from './user'

export interface ProjectCard {
  custom_id: string
  id: number
}
export interface RawFact {
  id: number
  custom_id: string
  name: string
  description?: string
}
export type ProjectFactType = 'DATETIME' | 'FLOAT' | 'STRING' | 'USER' | 'THRESHOLDS'
export interface RawProjectFact extends RawFact {
  type: ProjectFactType
}
export interface ProjectInformation {
  id: number
  date: string
  shown_in_card: boolean
  description: string
  active: boolean
  created_by_user: User
}
export interface ProjectInformationUnix extends ProjectInformation {
  date: number
}
export interface ProjectInformationPost {
  date: number
  description: string
  shown_in_card?: boolean
}
export interface ProjectFact {
  value: string
  number: number
  user: User
  shown_in_card: boolean
  order: number
  datetime: number
  fact: RawProjectFact
}
export interface ProjectCost {
  revenue: string | number,
  actual_cost: string | number,
  remaining_cost: string | number,
  original_budget: string | number,
  at_completion_cost: string | number,
  proposed_budget: string | number,
  margin: string | number,
  margin_percent: string | number | null,
  current_budget: string | number,
}
export interface ReasonType {
  id?: number
  custom_id: string
  name: string
  description?: string
  financial_type: 'ORIGINAL_BUDGET' | 'CHANGE_ORDER' | 'ACTUAL_COST' | 'REVENUE'
  active: boolean
  used_in_transaction?: boolean
}
export interface ProjectKpiThreshold extends RawFact {
  value: number
  color: string
}
export interface RawKpi extends RawFact {
  mandatory: boolean
  thresholds: ProjectKpiThreshold[]
}
export interface ProjectKpiValue {
  id: number
  date: string
  comment: string
  threshold: ProjectKpiThreshold
  responsible_action_user: User
  updated_by_user: User
}
export interface ProjectKpi {
  id: number
  order?: number
  kpi: RawKpi
  trend: string
  shown_in_card?: boolean
  values?: ProjectKpiValue[]
  latest_kpi_value?: ProjectKpiValue
}
export interface ProjectKpiCellValue {
  value: number
  color: string
  trend: string
  comment: string
}
export interface ResponsibleActionUser {
  id: number
  name: string
  active: boolean
  email: string
}
export interface ThresholdKpi {
  id: number
  custom_id: string
  name: string
  description: string
  value: number
  color: string
}
export interface ReportKpi {
  comment: string
  date: string
  id: number
  reponsible_action: string
  responsible_action_user: ResponsibleActionUser
  threshold: ThresholdKpi
  updated_by_user: ResponsibleActionUser
  value: number
}
export interface ProjectPhaseGate {
  comment?: string
  custom_id?: string
  cost_actual?: number | null
  cost_budget?: number | null
  end_date: string | number | null
  hours_actual?: number | null
  hours_budget?: number | null
  id?: number
  lane?: number
  name?: string
  remaining_cost?: number | null
  remaining_hours?: number | null
  start_date?: string | number | null
  status?: 'CREATING' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  type?: 'gate' | 'phase'
}

export interface ProjectPhaseGatePost extends ProjectPhaseGate {
  start_date: number
  end_date: number
}
export interface RiskMatrixParameter extends RawFact {
  score: number
  matrix_id: number
}

export interface MatrixRiskScore {
  id: number
  high: number
  color: string
}

export interface RiskMatrixRaw extends RawFact {
  probabilities: RiskMatrixParameter[]
  severities: RiskMatrixParameter[]
  thresholds: MatrixRiskScore[]
  type: 'opportunity_matrix' | 'risk_matrix'
}
export interface EventCharacterization extends RawFact {
  actions: string
  status: string
  type: string
  probability: number
  severity: number
  full_probability: RiskMatrixParameter
  full_severity: RiskMatrixParameter
  full_owner: User
  score: number
  color: string
  shown_in_card: boolean
}
export interface EventCharacterizationPost {
  actions: string
  comment: string
  id?: number
  custom_id: string
  description: string
  owner: number | null
  probability: number | null
  severity: number | null
  shown_in_card: boolean
  status: string | null
  type: 'RISK' | 'OPPORTUNITY'
}
export interface ProjectStatus extends ProjectCard {
  name: string
  project_structure_node: Array<any>
  uv_workspace_id: number
  risk_matrix: RawProjectFact
  opportunity_matrix: RawProjectFact
  current_goal: ProjectInformation
  current_status: ProjectInformation
  event_characterization: Array<EventCharacterization>
  tenant_level_facts_in_card: Array<ProjectFact>
  kpis_in_card: Array<ProjectKpi>
  phase_gates: Array<ProjectPhaseGate>
}

export interface MatrixParameter extends RawFact {
  score: number
  matrix_id: number
}
