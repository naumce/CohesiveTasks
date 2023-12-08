import { ref } from 'vue'
export default function useGanttSorting(gantt: any) {
  const direction = ref(true)

  const filterByTaskMilestone = ['task', 'milestone']

  const sortByTaskActivity = (a: any, b: any, columnName: string) => {
    if (!filterByTaskMilestone.includes(a.type) || !filterByTaskMilestone.includes(b.type)) {
      return 0
    }

    if (a[columnName] > b[columnName]) {
      return direction.value ? 1 : -1
    } else if (a[columnName] < b[columnName]) {
      return direction.value ? -1 : 1
    }
    return 0
  }

  const customSortByColumn = (columnName: string) => {
    direction.value = !direction.value
    gantt.sort((a: any, b: any) => sortByTaskActivity(a, b, columnName))
    updateSortIcon(columnName, direction)
  }

  const attachSortEvent = () => {
    gantt.attachEvent('onGridHeaderClick', (columnName: string) => {
      customSortByColumn(columnName)
      return false
    })
  }

  const updateSortIcon = (columnName: any, direction: any) => {
    const headers = gantt.$container.querySelectorAll('.gantt_grid_head_cell')
    headers.forEach((header: any) => {
      header.classList.remove('gantt_sort', 'gantt_desc', 'gantt_asc')
    })

    const column = gantt.$container.querySelector(
      `.gantt_grid_scale [data-column-id='${columnName}']`
    )
    if (column) {
      column.classList.add('gantt_sort')
      column.classList.toggle('sort_desc', direction.value)
      column.classList.toggle('sort_asc', !direction.value)
    }
  }

  return { attachSortEvent, updateSortIcon }
}
