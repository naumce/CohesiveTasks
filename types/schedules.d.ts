import { Dayjs } from 'dayjs'
export interface ActivityCode {
  id: number
  name: string
  unique_id: number
  selected?: boolean
  quick_filters?: boolean
}

export interface SelectedVersion {
  id: number
  name: string
  label: string
  created: string
  selected: boolean
  order: number | null
  activity_codes: ActivityCode[]
  project_versions?: ViewProjectVersion[]
  latestProjectId?: number | null
}
interface ProjectRaw {
  id: number
  name: string
  active: boolean
}
export interface ViewProjectVersion {
  id: number
  name?: string
  version_id: number
  created: string
  selected?: boolean
  order?: number
  activity_codes: ActivityCode[]
  project?: ProjectRaw
}

export interface ViewProject {
  id: number
  name: string
  active: boolean
  order: number
  created?: string
  selected?: boolean
  project_versions: ViewProjectVersion[]
}
export interface ViewProjectV2 {
  id: number
  name: string
  active: boolean
  order: number
  created?: string
  selected?: boolean
  versions: ViewProjectVersion[]
}

export interface ViewProjectList {
  project: ViewProject
}

export interface ViewFilter {
  quick_filter: boolean
  activity_code: ActivityCode
}
export interface ViewRaw {
  id: number
  project_versions: ViewProjectVersion[]
  latest_projects: ViewProjectList[]
  filters: ViewFilter[]
}
export interface ViewRawV2 {
  view_items: ViewScheduleItem[]
}

export interface ViewScheduleItem {
  schedule_version_id: number
  schedule_id: number
  filters: ScheduleItemFilter[]
  groups: ScheduleItemGroup[]
}

export interface ScheduleItemFilter {
  quick_filter: boolean
  schedule_metadata_type_id: number
  schedule_version_metadata_type_id: number
}
export interface ScheduleItemGroup {
  metadata_type: MetadataType
}
export interface MetadataType {
  schedule_metadata_type_id: number
  schedule_version_metadata_type_id: number
}

export interface GanttSchedulesActivityCodeValue {
  unique_id: number
  name: string
  description: string
}
export interface GanttSchedulesActivityCode {
  name: string
  unique_id: number
  values: GanttSchedulesActivityCodeValue[]
  quick_filter?: boolean
}

export interface GanttSchedulesFilter {
  id: number
  quick_filter: boolean
}
export interface GanttSchedulesProject {
  start: 'string'
  work: number
  baseline_work: number
  actual_work: number
  work_variance: number
  remaining_work: number
  cost: number
  baseline_cost: number
  actual_cost: number
  cost_variance: number
  remaining_cost: number
  name: string
  wbs: string
  constraint_type: string
  critical: boolean
  total_slack: number
  id: number
  baseline_duration: number
  duration: number
  duration_variance: number
  remaining_duration: number
  percent_complete: number
  early_start: string
  early_finish: string
  remaining_early_start: string
  remaining_early_finish: string
  remaining_late_start: string
  remaining_late_finish: string
  late_start: string
  late_finish: string
  actual_start: string
  baseline_start: string
  baseline_finish: string
  finish_variance: number
  project: string
  outline_level: number
  unique_id: number
  summary: boolean
  outline_number: string
  type: string
  start_slack: number
  finish_slack: number
  complete_through: string
  guid: string
  active: boolean
  planned_finish: string
  planned_start: string
  planned_duration: string
  planned_work: number
  activity_id: string
  percent_complete_type: 'DURATION' | 'PHYSICAL' | 'UNITS'
  planned_cost: number
  finish: string
  percentage_complete: number
  activity_code_values: any[]
  is_project: boolean
  status_date: string
  project_version: number
  matched: boolean
}
export interface GanttSchedulesProjectPropertyValue {
  currency_symbol: string
  currency_symbol_position: string
  currency_digits: number
  thousands_separator: string
  decimal_separator: string
  default_work_units: string
  default_standard_rate: string
  default_overtime_rate: string
  updating_task_status_updates_resource_status: boolean
  date_order: string
  time_format: string
  default_start_time: string
  date_separator: string
  time_separator: string
  am_text: string
  pm_text: string
  date_format: string
  bar_text_date_format: string
  project_title: string
  default_calendar_name: string
  schedule_from: string
  start_date: string
  status_date: string
  current_date: string
  minutes_per_day: number
  days_per_month: number
  minutes_per_week: number
  default_task_earned_value_method: string
  new_tasks_estimated: boolean
  auto_add_new_resources_and_tasks: boolean
  status_date: string
  auto_link: boolean
  microsoft_project_server_url: boolean
  name: string
  unique_id: number
  default_task_type: string
  default_fixed_cost_accrual: string
  fiscal_year_start_month: number
  new_task_start_is_project_start: boolean
  new_tasks_are_manual: boolean
  week_start_day: string
  custom_properties: {
    CalculateFloatBasedOnFishDateOfEachProject: boolean
    CalculateMultiplePathsUsingTotalFloat: boolean
    CalendarForSchedulingRelationshipLag: string
    ComputeStartToStartLagFromEarlyStart: boolean
    ComputeTotalFloatAs: string
    ConsiderAssignmentsInOtherProjectsWithPriorityEqualHigherThan: string
    IgnoreRelationshipsToAndFromOtherProjects: string
    LevelAllResources: boolean
    LevelingPriorities: string
    LimitNumberOfPathsToCalculate: boolean
    MaxPercentToOverallocateResources: string
    NumberofPathsToCalculate: string
    PreserveMinimumFloatWhenLeveling: string
    PreserveScheduledEarlyAndLateDates: boolean
    UseExpectedFinishDates: boolean
    WhenSchedulingProgressedActivitiesUseRetainedLogic: boolean
  }
  mpx_delimiter: string
  mpx_program_name: string
  mpx_file_version: string
  mpx_code_page: string
  file_application: string
  file_type: string
  export_flag: boolean
  guid: string
  project_id: string
  critical_activity_type: string
  scheduled_finish: string
  planned_start: string
  critical_drtn_hr_cnt: number
}

export interface GanttSchedulesTaskActivityCodeValue {
  activity_code_id: number
  value_id: number
}
export interface GanttSchedulesTaskPredecessor {
  task_unique_id: number
  type: 'FS' | 'SS' | 'FF' | 'SF'
}
export interface GanttSchedulesTask {
  unique_id: number
  name: string
  start: string
  start_date: Dayjs
  startFormatted: string
  startdayjs: Dayjs
  end_date: Dayjs
  finish: string
  finishFormatted: string
  finishdayjs: Dayjs
  activity_id: string
  is_project?: boolean
  is_wbs?: boolean
  is_activity?: boolean
  milestone?: boolean
  critical: boolean
  remaining_early_start: string
  parent_task_unique_id?: number
  planned_duration: string
  percentage_work_complete: number
  percent_complete_type: 'DURATION' | 'PHYSICAL' | 'UNITS'
  percent_complete: number
  percentage_complete: number
  physical_percent_complete: number
  predecessors?: GanttSchedulesTaskPredecessor[]
  activity_code_values: GanttSchedulesTaskActivityCodeValue[]
  activity_status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  activity_type: string
}
export interface GanttSchedulesVersions {
  activity_codes: GanttSchedulesActivityCode[]
  assignments: any[]
  custom_fields: any[]
  filters: GanttSchedulesFilter[]
  max_tasks_finish: string
  min_tasks_start: string
  project: GanttSchedulesProject
  project_version_id: number
  property_values: GanttSchedulesProjectPropertyValue
  resources: any[]
  tasks: GanttSchedulesTask[]
}
export interface GanttSchedulesActivityCodeFilter {
  selected: boolean
  project_version_id: number
  activity_code_id: number
  value_id: number
}

export interface GanttSchedulesAdvancedFilters {
  general: {
    startDate: string
    endDate: string
    status: string[]
    hideIfEmpty: boolean
  }
  wbs: string[]
  activityCodes: GanttSchedulesActivityCodeFilter[]
}
export interface GanttSchedulesAppliedFilters {
  quickFilters: GanttSchedulesActivityCodeFilter[]
  filters: GanttSchedulesAdvancedFilters | null
}

export interface IWbs {
  id: string
  text: string
  parentId: string
}
export interface ProjectWbs {
  id: string
  text: string
  children: IWbs[]
}

export interface SchedulesGroup {
  id: number
  name: string
  custom_id: string | null
}

export interface DisableDates {
  min: string
  max: string
}
