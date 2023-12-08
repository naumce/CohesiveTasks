export interface Alert {
  type: string
  message: string
}

export interface IndexedAlert extends Alert {
  id: number
}

