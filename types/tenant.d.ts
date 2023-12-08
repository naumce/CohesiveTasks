export interface Tenant {
  id: number
  active: boolean
  name: string
}
export interface TenantRole {
  id: number
  name: string
  editable: boolean
  permissions: Array<string>
  creator_id: number
}

export interface RequestTenant {
  name: string
  email: string
}