export const ganttTimesWidths = [75, 150, 225, 300]
export const mpxjToDhtmlxDependencyLineTypes = {
  FS: 0,
  SS: 1,
  FF: 2,
  SF: 3
}
const timeSchedule = Object.freeze({
  YEAR: { title: 'Year', value: 'year' },
  QUARTER: { title: 'Quarter', value: 'quarter' },
  MONTH: { title: 'Month', value: 'month' },
  WEEK: { title: 'Week', value: 'week' },
  DAY: { title: 'Day', value: 'day' }
})
export const timeScheduleItems = Object.values(timeSchedule)
export const columns = [
  {
    name: 'text',
    label: 'Name',
    tree: true,
    min_width: 180,
    width: 180,
    resize: true,
    template: (task: any) => {
      var str = task.text
      str = str.replace(/\</g, "&lt;")
      str = str.replace(/\>/g, "&gt;")
      return str
    }
  },
  {
    name: 'activity_id',
    label: 'ActivityID',
    min_width: 100,
    width: 100,
    resize: true
  },
  {
    name: 'start_date',
    label: 'Start date',
    align: 'center',
    width: 100,
    resize: true
  },
  {
    name: 'finishFormatted',
    label: 'End date',
    align: 'center',
    width: 100,
    // template: function (task) {
    //   return gantt.templates.date_grid(task.end_date, task);
    // },
    resize: true
  },
  {
    name: 'planned_duration',
    label: 'Duration',
    align: 'center',
    width: 80,
    template: (task: any) => {
      return task.planned_duration || `${task.duration}d`
    }
    // { name: 'add', width: 40 },
  }
]
export const Colors = {
  critical: '#ff595e',
  actual: '#1982c4',
  remaining: '#8ac926',
  wbs: '#929393',
  project: '#1e73ac',
  workspace: '#2045BC',
  portfolio: '#009999',
  admin: '#F2AF5C'
}
