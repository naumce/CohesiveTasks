import type { Role } from './role'
export interface User {
  id: number
  name: string,
  active?: boolean
  email: string
  role?: number
  status?: string
}
export interface TokenInfo {
  firstName: string
  fullName: string
  lastName: string
  email: string
}
export interface UserValue {
  value: number
  title: string
}
export interface UserManagement {
  role: Role
  user: User
}

export interface UserData {
  id?: number | null
  email: string | null
  role_id: number | null
}
