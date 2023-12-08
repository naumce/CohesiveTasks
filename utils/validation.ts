import { isoToStandardString, unixToStandardString } from './date'
import { helpers } from '@vuelidate/validators'

export const inputValidations = Object.freeze({
  longTextLength: 500,
  longestTextLength: 1000,
  customIdLength: 5,
  nameLength: 50,
  minNumberVal: 0,
  maxScoreVal: 999,
  sameValue: (array: Array<any>, field: string, text = 'threshold') =>
    helpers.withParams({ type: 'sameValue', text }, (value, item) => {
      if (!item) return false
      return !array.some((i: any) => {
        if (i.id === item.id) return false
        return Number(i[field]) === Number(item[field])
      })
    }),
  sameDate: (array: Array<any>, field: string, text = '') =>
    helpers.withParams({ type: 'sameDate', text }, (value: number, item) => {
      return !array.some((i) => {
        if (i.id === item.id) return false
        return isoToStandardString(i[field]) === unixToStandardString(value)
      })
    }),
  minDate: (min: any, text = '') =>
    helpers.withParams({ type: 'minDate', text }, (value: any) => {
      return min <= value
    }),
  lowerThanDate: (min: any, text = '') =>
    helpers.withParams({ type: 'lowerThanDate', text }, (value) => {
      return min && value ? min <= value : true
    }),
  higherThanDate: (max: any, text = '') =>
    helpers.withParams({ type: 'lowerThanDate', text }, (value) => {
      return max && value ? max >= value : true
    })
})
