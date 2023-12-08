export interface Role {
  id: number
  editable: boolean
  name: string
  permissions?: Array<string>
}

export interface EventCharacterizationPostRole {
  id: number
  name: string
  permissions?: Array<string>
}

export interface AllPermissions {
  [key: string]: { text: string; value: string }
}
