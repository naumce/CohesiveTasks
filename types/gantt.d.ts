export interface GanttTask {
  id: string
  type: string
  text?: string
  open?: boolean
  rollup?: boolean
  hide_bar?: boolean
  parent?: string
  status?: string
  start_date?: string
  end_date?: string
  color?: string
  textColor?: string
}

export interface GanttOptions {
  tasks: GanttTask[]
  links: any[]
  projects: any[]
}
