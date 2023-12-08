function quarterFormat(date: Date) {
  return 'Q' + (Math.floor(date.getMonth() / 3) + 1)
}
function weekScaleTemplate(date: Date) {
  // const dateToStr = gantt.date.date_to_str('%d %M');
  // const endDate = gantt.date.add(gantt.date.add(date, 1, 'week'), -1, 'day');
  // return dateToStr(date) + ' - ' + dateToStr(endDate);
  // @ts-ignore
  return 'W' + gantt.date.getWeek(date);
}
interface GanttScales {
  [key: string]: any[]
}
export const ganttScales: GanttScales = {
  day: [
    { unit: 'year', step: 1, date: '%Y' },
    { unit: 'quarter', step: 1, date: quarterFormat },
    { unit: 'month', step: 1, date: '%F' },
    { unit: 'week', step: 1, date: weekScaleTemplate },
    { unit: 'day', step: 1, date: '%d' },
  ],
  week: [
    { unit: 'year', step: 1, date: '%Y' },
    { unit: 'quarter', step: 1, date: quarterFormat },
    { unit: 'month', step: 1, date: '%F' },
    { unit: 'week', step: 1, date: weekScaleTemplate },
  ],
  month: [
    { unit: 'year', step: 1, date: '%Y' },
    { unit: 'quarter', step: 1, date: quarterFormat },
    { unit: 'month', step: 1, date: '%F' }
  ],
  quarter: [
    { unit: 'year', step: 1, date: '%Y' },
    { unit: 'quarter', step: 1, date: quarterFormat }
  ],
  year: [{ unit: 'year', step: 1, date: '%Y' }]
}

export const versionifyId = (id: number, version_id: number) => `${version_id}${id}`