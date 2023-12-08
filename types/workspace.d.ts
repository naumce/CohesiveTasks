import type { ProjectCard } from './project'
export interface Workspace {
  id: number
  active: boolean
  name: string
  project_card: ProjectCard
  projects: Array<any>
  users: Array<any>
}
export interface WorkspaceRole {
  id: number
  name: string
  editable: boolean
  permissions: string[]
}

export interface RequestWorkspace {
  name: string
}

export interface IndexedWorkspace {
  formObject: RequestWorkspace
  id: number
}
