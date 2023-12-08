<script lang="ts">
declare global {
  interface Window {
    Gantt: any
  }
}
</script>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import type { ProjectPhaseGate, GanttTask, PortfolioProjectRaw } from '@/types'
import { ganttScales } from '@/utils/gantt'
import dayjs from 'dayjs'
import { standardDateFormat } from '@/constants/dates'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  projects: {
    type: Array<PortfolioProjectRaw>,
    required: true,
    default: () => []
  }
})

const { t } = useI18n()
const statuses = new Map([
  ['NOT_STARTED', t('projectStatus.phaseGate.status.notStarted')],
  ['IN_PROGRESS', t('projectStatus.phaseGate.status.inProgress')],
  ['COMPLETED', t('projectStatus.phaseGate.status.completed')]
])

const tasks = computed(() => {
  const result: GanttTask[] = []
  if (!props.projects.length) return;
  const projects: PortfolioProjectRaw[] = JSON.parse(JSON.stringify(props.projects))

  const phaseGatesColors = new Map([
    ['NOT_STARTED', '#D9D9D9'],
    ['IN_PROGRESS', '#F2AF5C'],
    ['COMPLETED', '#42B4B4']
  ])

  projects.forEach((project) => {
    if (!project.phase_gates?.length) return
    const projectTask: GanttTask = {
      id: `${project.id}`,
      text: project.name,
      type: 'task',
      start_date: '2022-08-15T06:59:32', // dates dont matter
      end_date: '2022-11-15T06:59:32',
      open: true,
      rollup: false,
      hide_bar: true
    }
    result.push(projectTask)

    const sortedItems: ProjectPhaseGate[] = JSON.parse(JSON.stringify(project.phase_gates))
    sortedItems.sort((a: ProjectPhaseGate, b: ProjectPhaseGate) => {
      if (a.lane === undefined && b.lane === undefined) return 0
      if (a.lane === undefined) return -1 // Put undefined values at the end
      if (b.lane === undefined) return 1 // Put undefined values at the end
      return a.lane - b.lane // Subtract the lane values
    })
    const uniqueLanes = sortedItems.reduce((acc: number[], item: ProjectPhaseGate) => {
      if (item.lane !== undefined && !acc.includes(item.lane)) {
        acc.push(item.lane)
      }
      return acc
    }, [])
    // make parent tasks to which items are going to be rolled up
    uniqueLanes.forEach((lane) => {
      const task: GanttTask = {
        id: `${project.id}_lane_${lane}`,
        type: 'project',
        parent: `${project.id}`,
        open: false,
        rollup: false,
        hide_bar: true
      }
      result.push(task)
    })
    sortedItems.forEach((item) => {
      if (item.lane === 0 && item.type === 'phase') return
      const startDate = item.type === 'gate' ? item.start_date || item.end_date : item.start_date
      const endDate = item.type === 'gate' ? null : item.end_date
      const task: GanttTask = {
        id: `${project.id}_${item.id}`,
        text: item.name,
        type: item.type === 'gate' ? 'milestone' : 'task',
        parent: `${project.id}_lane_${item.lane}`,
        start_date: `${startDate}`,
        ...(endDate ? { end_date: `${endDate}` } : {}),
        status: item.status,
        rollup: true,
        hide_bar: true,
        color: phaseGatesColors.get(item.status || 'NOT_STARTED'),
        textColor: '#fff'
      }
      result.push(task)
    })
    // on first lane only milestones should be displayed
  })
  return { data: result, links: [] }
})

function tooltipsDefinition(start: any, end: any, task: any) {
  const dates =
    task.type === 'milestone'
      ? `<strong>${t('misc.date')}: </strong><span>${dayjs(task.start_date).format(
          standardDateFormat
        )}</span>`
      : `<strong>${t('misc.startDate')}: </strong><span>${dayjs(task.start_date).format(
          standardDateFormat
        )}</span><br/>` +
        `<strong>${t('misc.finishDate')}: </strong><span>${dayjs(task.end_date).format(
          standardDateFormat
        )}</span>`
  return (
    `<strong>${task.text}</strong><br/><br/>` +
    `<strong>${t('misc.status')}: </strong>${statuses.get(task.status) || ''}<br/>` +
    dates
  )
}
const gantt = window.Gantt.getGanttInstance()
const ganttRef = ref()
const columns = [
  {
    name: 'text',
    label: t('portfolios.scoreCard.fields.name'),
    tree: true
  }
]
onMounted(() => {
  gantt.config.readonly = true
  gantt.config.grid_width = 200
  gantt.config.grid_resize = true
  gantt.config.show_task_cells = false
  gantt.config.scales = ganttScales['quarter']
  gantt.config.columns = columns
  gantt.config.drag_timeline = {
    ignore:".gantt_task_line, .gantt_task_link",
    useKey: false
}

  gantt.templates.tooltip_text = tooltipsDefinition
  gantt.templates.parse_date = function (date: string): Date {
    return new Date(date)
  }
  gantt.templates.format_date = function (date: Date): string {
    return date.toISOString()
  }

  gantt.templates.task_class = function (start: any, end: any, task: any) {
    if (task.type !== 'task') return ''
    return 'phase-arrow'
  }
  gantt.plugins({
    tooltip: true,
    marker: true,
    drag_timeline: true
  })
  const dateToStr = gantt.date.date_to_str(gantt.config.task_date)
  const currentDate = new Date()
  gantt.addMarker({
    start_date: currentDate, //a Date object that sets the marker's date
    // css: 'today', //a CSS class applied to the marker
    // text: 'Now', //the marker title
    title: dateToStr(currentDate) // the marker's tooltip
  })
  gantt.templates.grid_row_class = function (start: string, end: string, task: any) {
    if (gantt.isTaskExists(task.parent)) return 'nested'
    return ''
  }
  gantt.init(ganttRef.value)
  tasks.value && gantt.parse(tasks.value)
})

onUnmounted(() => {
  gantt.destructor()
})
</script>
<template>
  <div ref="ganttRef" class="gantt-container" style="height: calc(100vh - 300px)"/>
</template>
