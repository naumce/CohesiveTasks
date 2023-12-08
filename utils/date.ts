import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { standardDateFormat } from '@/constants/dates'

dayjs.extend(utc);

export const unixToStandardString = (date: number) => dayjs.unix(date).format(standardDateFormat)

export const isoToStandardString = (date: string) => dayjs(date).format(standardDateFormat)

export const isoToUnix = (date: string) => dayjs.utc(date).unix() // dayjs(date).unix()
