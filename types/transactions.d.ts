export interface User {
    id: number,
    email: string,
    name: string,
  }
  export interface Phase {
    comment: string,
    start_date: string,
    end_date: string,
    id:number,
    type: string,
    lane: number,
    name: string
  }
  export interface Transactions {
    id?: string
    transaction_category: TransactionReason
    description: string
    custom_id: string 
    financial_type: 'ORIGINAL_BUDGET' | 'CHANGE_ORDER' | 'ACTUAL_COST' | 'REVENUE'
    assigned_date: string
    effective_date: string
    value: string
    is_outside_phase: boolean
    comment: string
    updated_at: string
    assigned_by_user: User
    updated_by: User
    status: 'APPROVED' | 'REJECTED' | 'DISCARDED' | 'PENDING'
  }