import { standardDateFormat } from '@/constants/dates'
import dayjs from 'dayjs'
import type { ProjectFact, UserValue } from '@/types'
import {formatNumber} from "@/utils/number";
export function getFactValue(fact: ProjectFact, format: boolean = true) {
  if (fact.fact.type) {
    switch (fact.fact.type) {
      case 'USER':
        if (format) return fact.user.name
        return { value: fact.user.id, title: fact.user.name || '' } as UserValue
      case 'DATETIME':
        if (!fact.datetime) return ''
        return factDateFormat(fact.datetime)
      case 'FLOAT': {
        return formatNumber(fact.number,false)
      }
      default:

        return fact.value
    }
  }
  if (fact.user.id) return fact.user.email
  if (fact.datetime) factDateFormat(fact.datetime)
  if (fact.number) return fact.number
  return fact.value
}
export function factNumberFormat(number: number) {
  if (!number) return number
  const locale = window.navigator.language // || window.navigator.userLanguage for IE, but typescript throws error. Need to research further
  return number.toLocaleString(locale)
}
export function factDateFormat(date: number) {
  return dayjs.unix(date).format(standardDateFormat)
}

export function findEmptyOrders(arr: Array<any>, number = 12) {
  return Array.from(Array(number).keys())
    .filter((n) => arr.every((o) => o !== n))
    .sort((a, b) => a - b)
}
