<script lang="ts">
declare global {
  interface Window {
    Gantt: any
  }
}
</script>
<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import type {
  HttpRequest,
  GanttTask,
  GanttSchedulesVersions,
  GanttSchedulesActivityCode,
  GanttSchedulesFilter,
  GanttSchedulesTask,
  GanttSchedulesTaskActivityCodeValue,
  GanttSchedulesActivityCodeFilter,
  GanttSchedulesAdvancedFilters,
  IWbs,
  ProjectWbs,
  ListItem
} from '@/types'
import { ganttScales, versionifyId } from '@/utils/gantt'
import dayjs, { Dayjs } from 'dayjs'
import { standardDateFormat } from '@/constants/dates'
import { apiUrls } from '@/plugins/axios'
import useApis from '@/composables/api'
import { useRoute } from 'vue-router'
import {
  mpxjToDhtmlxDependencyLineTypes,
  Colors,
  columns,
  timeScheduleItems
} from '@/constants/gantt'
import SearchInput from '@/components/SearchInput.vue'
import ActivityCodesList from './dialogs/ActivityCodesList.vue'
import FiltersDialog from './dialogs/FiltersDialog.vue'
import { storeToRefs } from 'pinia'
import { useLoaderStore } from '@/stores/loader'
import isBetween from 'dayjs/plugin/isBetween'
import { useGanttSorting } from '@/composables'

dayjs.extend(isBetween)

const route = useRoute()
const workspaceId = route.params.workspaceId as string
const groupId = computed(() => route.query.groupId as string)
const versionIds = route.query.versionIds as string
const activityCodes = route.query.activityCodes as string
// Ver2 const quickFilters = JSON.parse(route.query.quickFilters as string)

const quickFilters = route.query.quickFilters ? JSON.parse(route.query.quickFilters as string) : []

const { sendRequest } = useApis()

const versions = ref<GanttSchedulesVersions[]>([])
const { loading } = storeToRefs(useLoaderStore())

const groups = ref<ListItem[]>([])
const selectedGroup = ref()
const expanded = ref(false)

const toggleExpanded = () => (expanded.value = !expanded.value)

const getGroups: HttpRequest = {
  method: 'get',
  url: apiUrls.scheduleUserGroups.replace(/%workspaceId/, workspaceId),
  onSuccess: {
    callback: (response) => {
      groups.value = response.data.items.map((group: any) => ({
        value: group.id,
        title: group.name
      }))
      selectedGroup.value = groups.value.find((item) => item.value === parseInt(groupId.value))
    }
  }
}

const appliedFilters: GanttSchedulesAdvancedFilters = reactive({
  general: {
    startDate: '',
    endDate: '',
    status: [],
    hideIfEmpty: true
  },
  wbs: [],
  activityCodes: []
})

const applyActivityCodeFilters = (
  task: GanttSchedulesTask,
  tasks: GanttSchedulesTask[],
  filters: GanttSchedulesActivityCodeFilter[]
): boolean => {
  if (!filters.length) return true
  if (task.is_project) return true
  if (!filters.length) return true
  if (task.is_wbs) {
    const children = tasks.filter((t) =>
      t.activity_code_values.some((code) =>
        filters.some(
          (f) => f.activity_code_id === code.activity_code_id && f.value_id === code.value_id
        )
      )
    )
    return !!children.length
  }
  return task.activity_code_values.some((code) =>
    filters.some(
      (f) => f.activity_code_id === code.activity_code_id && f.value_id === code.value_id
    )
  )
}

const applyGeneralFilters = (task: GanttSchedulesTask, tasks: GanttSchedulesTask[]) => {
  if (
    !appliedFilters.general.startDate &&
    !appliedFilters.general.endDate &&
    !appliedFilters.general.status.length
  )
    return true
  if (task.is_project) return true
  if (!appliedFilters.general) return true
  const status = appliedFilters.general.status
  const startDate = appliedFilters.general.startDate
  const endDate = appliedFilters.general.endDate
  let tempEndDate = task.finish?.substring(0, 10) || task.start?.substring(0, 10)
  if (task.is_wbs) {
    const children = tasks.filter((t) => {
      if (t.parent_task_unique_id !== task.unique_id) return false
      if (status.length && !status.includes(t.activity_status as string)) return false
      if (startDate && endDate)
        if (
          dayjs(`${startDate}`).isBetween(
            dayjs(t.start?.substring(0, 10)),
            dayjs(tempEndDate),
            null,
            '[]'
          ) ||
          dayjs(`${endDate}`).isBetween(
            dayjs(t.start?.substring(0, 10)),
            dayjs(t.finish?.substring(0, 10), '[]')
          )
        )
          return true
      if (startDate && dayjs(t.start?.substring(0, 10)).isBefore(dayjs(`${startDate}`)))
        return false
      if (endDate && dayjs(t.finish?.substring(0, 10)).isAfter(dayjs(`${endDate}`))) return false
      return true
    })
    return !!children.length
  }
  if (status.length && !status.includes(task.activity_status as string)) return false
  if (startDate && endDate)
    if (
      dayjs(`${startDate}`).isBetween(
        dayjs(task.start?.substring(0, 10)),
        dayjs(tempEndDate),
        null,
        '[]'
      ) ||
      dayjs(`${endDate}`).isBetween(
        dayjs(task.start?.substring(0, 10)),
        dayjs(task.finish?.substring(0, 10), '[]')
      )
    )
      return true
  if (startDate && dayjs(task.start?.substring(0, 10)).isBefore(dayjs(`${startDate}`))) return false
  if (endDate && dayjs(task.finish?.substring(0, 10)).isAfter(dayjs(`${endDate}`))) return false
  return true
}

const applyWbsFilters = (task: GanttSchedulesTask, versionId: number) => {
  if (!appliedFilters.wbs.length) return true
  const taskId = versionifyId(task.unique_id, versionId)
  if (appliedFilters.wbs.includes(taskId)) return false
  if (!task.parent_task_unique_id) return true
  const parentId = versionifyId(task.parent_task_unique_id, versionId)
  return !appliedFilters.wbs.includes(parentId)
}

const hideIfEmpty = computed(() => appliedFilters.general.hideIfEmpty)

const taskHasActivity = (task: any) => {
  return task.activity_status !== null || task.activity_code_values.length > 0
}

const shouldDisplayTask = (task: any, allTasks: any, seenIds = new Set()) => {
  if (seenIds.has(task.id)) {
    return false
  }

  seenIds.add(task.id)

  if (!task.is_wbs && taskHasActivity(task)) return true

  const children = allTasks.filter((t: any) => t.parent === task.id)
  return children.length
    ? children.some((child: any) => shouldDisplayTask(child, allTasks, seenIds))
    : taskHasActivity(task)
}

const allWbs = ref<ProjectWbs[]>([])

const ganttOptions = computed(() => {
  const result = {
    tasks: [] as any[],
    links: [] as any[],
    projects: [] as any[]
  }

  if (!versions.value.length) return result
  const [actualFirstTime, actualLastTime] = getTimes(versions.value)
  const [firstTime] = getExtendedTimes(actualFirstTime, actualLastTime)
  versions.value.forEach((version) => {
    const activityCodes = version.activity_codes || []
    const project = getProjectDefinition(version, activityCodes)
    if (!project) return
    result.projects.push(project)
    // if version has no tasks, create task for the version
    if (!version.tasks?.length) {
      result.tasks.push(project.project_object.task)
      result.links.push(...project.project_object.links)
      return
    }

    const projectWbs: ProjectWbs = {
      id: project.project_task_id,
      text: project.text,
      children: []
    }

    version.tasks.forEach((task) => {
      if (task.is_wbs && task.parent_task_unique_id) {
        const wbs: IWbs = {
          id: versionifyId(task.unique_id, version.project_version_id),
          text: task.name,
          parentId: versionifyId(task.parent_task_unique_id, version.project_version_id)
        } // @ts-ignore
        projectWbs.children.push(wbs)
      } // handle activity code filters localy
      const activityCodeFilters = appliedFilters.activityCodes.filter(
        (filter) => filter.project_version_id === version.project_version_id
      )
      if (!applyActivityCodeFilters(task, version.tasks, activityCodeFilters)) return
      // handle general filters localy
      if (!applyGeneralFilters(task, version.tasks)) return
      // handle wbs filters localy
      if (!applyWbsFilters(task, version.project_version_id)) return

      const definition = getTaskDefinition(
        task,
        version.project_version_id,
        activityCodes,
        firstTime,
        version.tasks,
        result.links
      )

      result.tasks.push(definition.task)
    })
    allWbs.value.push(projectWbs)
    if (hideIfEmpty.value) {
      const visibleTasks = result.tasks.filter((task) => shouldDisplayTask(task, result.tasks))

      result.tasks = visibleTasks
    }
  })
  return result
})

watch(
  ganttOptions,
  (newVal) => {
    const { projects, ...rest } = newVal
    gantt.clearAll()
    addMarkers()
    gantt.init(ganttRef.value)
    gantt.parse(rest)
  },
  { deep: true }
)

function tooltipsDefinition(start: any, end: any, task: any) {
  const codes = task.activity_code_values || []
  const codesTooltip = codes.map(
    (code: any) => `<div>${code.activity_code_name}: ${code.activity_code_value_description}</div>`
  )
  return (
    `<strong>ID: </strong>${task.activity_id}<br/>` +
    `<strong>Start date: </strong>${dayjs(task.start_date).format(standardDateFormat)}<br/>` +
    (task.type === 'milestone'
      ? ''
      : `<strong>End date: </strong>${dayjs(task.end_date).format(standardDateFormat)}<br/>`) +
    `${
      task.progress ? '<strong>Progress: </strong>' + Math.round(task.progress * 100) + '%' : ''
    }<br/>` +
    codesTooltip.join('<br/>')
  )
}
const gantt = window.Gantt.getGanttInstance()
const ganttRef = ref()
const dependencyLinesDisplay = ref<boolean>(false)
const { attachSortEvent } = useGanttSorting(gantt)

function addMarkers() {
  const dateToStr = gantt.date.date_to_str(gantt.config.task_date)
  const currentDate = new Date()
  gantt.addMarker({
    start_date: currentDate, //a Date object that sets the marker's date
    // css: 'today', //a CSS class applied to the marker
    // text: 'Now', //the marker title
    title: dateToStr(currentDate) // the marker's tooltip
  })
  ganttOptions.value.projects.forEach((project) => {
    if (!project.data_date) return
    const date = new Date(project.data_date)
    gantt.addMarker({
      start_date: date,
      css: 'data_line',
      title: `${project?.project_object?.task?.text || ''} - Data date: ${dateToStr(date)}`
    })
  })
}

gantt.config.readonly = true
gantt.config.static_background = true
// gantt.config.scale_height = 80;
gantt.config.min_column_width = 50
gantt.config.scale_height = 50
gantt.config.link_line_width = 1
gantt.config.row_height = 32
gantt.config.bar_height = 16
gantt.config.grid_resize = true
gantt.config.grid_width = 200
gantt.config.drag_links = false
gantt.config.drag_progress = false
// gantt.config.date_format = '%Y-%m-%dT%H:%i';
gantt.config.scales = ganttScales['quarter']
gantt.config.columns = columns
gantt.config.sort = true
gantt.config.drag_timeline = {
  ignore: '.gantt_task_line, .gantt_task_link',
  useKey: false
}

gantt.config.type_renderers[gantt.config.types.project] = (task: GanttTask) => {
  const main_el = document.createElement('div')
  main_el.setAttribute(gantt.config.task_attribute, task.id)
  const size = gantt.getTaskPosition(task)
  main_el.innerHTML = [
    "<div class='project-left'></div>",
    "<div class='project-right'></div>",
    `<span class='task-custom-label'>${task.text}</span>`
  ].join('')
  main_el.className = 'custom-project'

  main_el.style.left = size.left + 'px'
  main_el.style.top = size.top + 7 + 'px'
  main_el.style.width = size.width + 'px'
  return main_el
}

const getIcon = (item: any) => {
  if (!item?.icon) return ''
  const imageUrl = new URL(`/src/assets/${item.icon}.svg`, import.meta.url)
  return `<div class="column-task-icon"><img src="${imageUrl.href}" alt=""/></div>`
}

gantt.templates.grid_folder = getIcon
gantt.templates.grid_file = getIcon
gantt.templates.task_text = function () {
  return ''
}

gantt.templates.rightside_text = function (start: any, end: any, task: GanttTask) {
  var str = task.text || ''
  // eslint-disable-next-line no-useless-escape
  str = str.replace(/\</g, '&lt;')
  // eslint-disable-next-line no-useless-escape
  str = str.replace(/\>/g, '&gt;')
  return str
}

gantt.templates.tooltip_text = tooltipsDefinition
gantt.config.show_links = dependencyLinesDisplay.value

gantt.templates.link_class = () => {
  if (!gantt.config.show_links) {
    return 'hidden'
  }
  return ''
}

gantt.plugins({
  tooltip: true,
  marker: true,
  drag_timeline: true
})

const apiUrl = computed(() => {
  const groupID =
    typeof selectedGroup.value === 'object'
      ? selectedGroup.value.value
      : selectedGroup.value || groupId.value
  return groupID
    ? `${apiUrls.schedulesGantt.replace(/%workspaceId/, workspaceId).replace(/%groupId/, groupID)}`
    : `${apiUrls.schedulesGanttAdmin
        .replace(/%workspaceId/, workspaceId)
        .replace(/%versionIds/, versionIds)}${
        activityCodes
          ? `&activity_code_ids=${activityCodes}${
              quickFilters ? `&quick_filter_code_ids=${quickFilters}` : ''
            }`
          : ''
      }`
})

const setupTask = () => {
  const getTasks: HttpRequest = {
    method: 'post',
    url: apiUrl.value,
    onSuccess: {
      callback: (response) => {
        const data = response.data as GanttSchedulesVersions[]
        console.log('setupTask', data)

        versions.value = data
        if (data.length === 0) {
          expanded.value = false
        }
      }
    }
  }
  sendRequest(getTasks)
}

const onGroupChange = async () => {
  setupTask()
  selectedScale.value = 'quarter'
  clearAllFilters()
  onScheduleChange()
}

onMounted(() => {
  setupTask()
  sendRequest(getGroups)
  attachSortEvent()
})

onUnmounted(() => {
  gantt.destructor()
})

function getTimes(versions: GanttSchedulesVersions[]) {
  const currentDate = dayjs()
  if (!versions.length) return [currentDate, currentDate]

  let firstTime = dayjs(versions[0].min_tasks_start)
  let lastTime = dayjs(versions[0].max_tasks_finish)

  for (let i = 0; i < versions.length; i++) {
    const versionMinTime = dayjs(versions[i].min_tasks_start)
    const versionMaxTime = dayjs(versions[i].max_tasks_finish)
    if (versionMinTime < firstTime) {
      firstTime = versionMinTime
    }
    if (lastTime < versionMaxTime) {
      lastTime = versionMaxTime
    }
  }
  return [firstTime, lastTime]
}

function getExtendedTimes(firstTime: Dayjs, lastTime: Dayjs): Dayjs[] {
  return [
    firstTime.startOf('year').subtract(1, 'months').startOf('day'),
    lastTime.endOf('year').add(1, 'months').endOf('year')
  ]
}

const determineType = (task: GanttSchedulesTask) => {
  if (task.milestone) {
    return gantt.config.types.milestone
  }
  if (task.is_activity) {
    return gantt.config.types.task
  }
  if (task.is_wbs) {
    return gantt.config.types.project
  }
  if (task.is_project) {
    return gantt.config.types.project
  }
  return null
}

function getActualProgress(task: GanttSchedulesTask) {
  if (task.is_project || task.is_wbs) return null
  const roundProgress = (progress: number) => {
    return progress > 0 ? Math.round((progress / 100) * 100) / 100 : 0
  }
  if (
    task.percent_complete_type === 'PHYSICAL' &&
    typeof task.physical_percent_complete !== 'undefined'
  ) {
    return roundProgress(task.physical_percent_complete)
  }

  if (
    task.percent_complete_type === 'UNITS' &&
    typeof task.percentage_work_complete !== 'undefined'
  ) {
    return roundProgress(task.percentage_work_complete)
  }

  if (typeof task.percent_complete !== 'undefined') {
    return roundProgress(task.percent_complete)
  }

  if (typeof task.percentage_complete !== 'undefined') {
    return roundProgress(task.percentage_complete)
  }
  return 0
}

interface ByType {
  [key: string]: (
    isCritical: boolean,
    progress: number | null
  ) => {
    color: string
    textColor: string
    icon: string
  }
}

const typeSpecificStyle: ByType = {
  milestone: (isCritical: boolean, progress: number | null) => {
    return {
      color:
        progress !== null && progress > 0
          ? Colors.actual
          : isCritical
          ? Colors.critical
          : Colors.remaining,
      textColor: '#fff',
      icon:
        progress !== null && progress > 0
          ? 'Milestone'
          : isCritical
          ? 'Milestone-critical'
          : 'Milestone-progress'
      // height: '16px',
      // width: '16px',
    }
  },
  task: (isCritical: boolean, progress: number | null) => {
    return {
      color: isCritical ? Colors.critical : Colors.remaining,
      progressColor: Colors.actual,
      textColor: '#fff',
      icon:
        progress !== null && progress > 0
          ? 'Activity'
          : isCritical
          ? 'Activity-critical'
          : 'Activity-progress'
      // ...(progress > 0 ? { progressColor: Colors.actual } : {}),
      // height: '10px',
    }
  },
  wbs: () => {
    return {
      color: Colors.wbs,
      textColor: '#fff',
      icon: 'Wbs'
      // height: '18px',
    }
  },
  project: () => {
    return {
      color: Colors.wbs,
      textColor: '#fff',
      icon: 'Project'
      // height: '18px',
    }
  }
}

type DependencyLineType = keyof typeof mpxjToDhtmlxDependencyLineTypes

function getTaskDefinition(
  task: any,
  version_id: number,
  activity_codes: GanttSchedulesActivityCode[],
  firstTime: Dayjs,
  tasks: any[] = [],
  links: any[] = []
) {
  const taskId = versionifyId(task.unique_id, version_id)
  const parentId = task.parent_task_unique_id
    ? versionifyId(task.parent_task_unique_id, version_id)
    : ''
  const predecessors = task.predecessors || []

  predecessors.forEach((predecessor: any) => {
    const predecessorId = versionifyId(predecessor.task_unique_id, version_id)
    links.push({
      id: links.length + 1,
      source: predecessorId,
      target: taskId,
      type: mpxjToDhtmlxDependencyLineTypes[predecessor.type as DependencyLineType]?.toString() // https://docs.dhtmlx.com/gantt/desktop__link_properties.html
    })
  })
  const taskType = determineType(task)
  const taskProgress = getActualProgress(task)

  const returnObj = {
    firstTime: firstTime,
    id: taskId,
    activity_id: task.activity_id,
    activity_status: task.activity_status || null,
    text: task.name,
    start: task.start,
    finish: task.finish,
    start_date: dayjs(task.start).format('DD-MM-YYYY HH:mm:ss'),
    end_date: dayjs(task.finish).format('DD-MM-YYYY HH:mm:ss'),
    startdayjs: dayjs(task.start),
    finishdayjs: dayjs(task.finish),
    startFormatted: task.start ? dayjs(task.start).format(standardDateFormat) : '',
    finishFormatted:
      taskType === 'milestone'
        ? ''
        : task.finish
        ? dayjs(task.finish).format(standardDateFormat)
        : '',
    // ...(task.start && task.finish
    //   ? { duration: dayjs(task.finish).diff(dayjs(task.start), 'day', true) }
    //   : {}),
    planned_duration: task.planned_duration,
    ...(taskProgress !== null && taskProgress >= 0 ? { progress: taskProgress } : {}),
    ...(taskType ? { type: taskType } : {}),
    ...(parentId ? { parent: parentId } : {}),
    open: true,
    ...typeSpecificStyle[task.is_wbs ? 'wbs' : taskType](task.critical, taskProgress),
    activity_code_values: task.activity_code_values?.reduce(
      (acc: any[], item: GanttSchedulesTaskActivityCodeValue) => {
        const code = activity_codes.find((code) => code.unique_id === item.activity_code_id)
        if (!code) return acc
        const condeValue = code.values.find((v) => v.unique_id === item.value_id)
        acc.push({
          ...item,
          activity_code_name: code.name,
          activity_code_value_description: condeValue?.description || ''
        })
        return acc
      },
      []
    )
  }
  return { task: returnObj, links: links }
}

function getProjectDefinition(
  version: GanttSchedulesVersions,
  activity_codes: GanttSchedulesActivityCode[]
) {
  if (!version.project) return null
  const data_date = version.property_values.status_date
  const project_task_id = versionifyId(version.project.unique_id, version.project_version_id)
  const project_version_id = version.project_version_id
  const project_version = version.project.project_version
  const text = `${version.project.name} v${project_version}`

  const filters: GanttSchedulesActivityCode[] = version.filters
    ? version.filters.reduce((acc: any[], item: GanttSchedulesFilter) => {
        const code = activity_codes.find((code) => code.unique_id === item.id)
        if (!code) return acc
        code.quick_filter = item.quick_filter
        acc.push(code)
        return acc
      }, [])
    : []
  const project = {
    text,
    project_version_id,
    project_task_id,
    project_version,
    data_date,
    project_object: getTaskDefinition(
      version.project,
      version.project_version_id,
      activity_codes,
      dayjs(version.project.start).startOf('year').subtract(1, 'years').startOf('day')
    ),
    activity_codes,
    filters
  }
  return project
}

let controller: AbortController | null

function onSearchInput(event: InputEvent) {
  const value = (event.target as HTMLInputElement).value || ''
  // abort request
  controller && controller.abort()
  controller = new AbortController()
  const getTasks: HttpRequest = {
    method: 'post',
    url: `${apiUrl.value}${value ? `&name=${encodeURIComponent(value)}` : ''}`,
    onSuccess: {
      callback: (response) => {
        versions.value = response.data as GanttSchedulesVersions[]
      }
    }
  }
  sendRequest(getTasks)
}
const expandAll = ref<boolean>(true)
const storeValueExpandedCollapsed = ref<any>(undefined)

function toggleExpand() {
  if (expandAll.value === undefined && storeValueExpandedCollapsed.value === undefined) return
  gantt.eachTask((task: any) => {
    if (expandAll.value === false || expandAll.value === true)
      storeValueExpandedCollapsed.value = expandAll.value
    task.$open = storeValueExpandedCollapsed.value
      ? storeValueExpandedCollapsed.value
      : expandAll.value
  })
  gantt.render()
}

const tooltipsVisible = ref<boolean>(true)
const toggleTooltips = () => {
  tooltipsVisible.value = !tooltipsVisible.value
  const tooltipsFunc = tooltipsVisible.value
    ? tooltipsDefinition
    : () => {
        return ''
      }
  gantt.templates.tooltip_text = tooltipsFunc
  gantt.render()
}

const columnsVisible = ref<boolean>(true)
function toggleColumnVisibility() {
  columnsVisible.value = !columnsVisible.value
  gantt.config.grid_width = columnsVisible.value ? 200 : 0
  gantt.render()
}

const selectedScale = ref<string>('quarter')
function onScheduleChange() {
  gantt.config.min_column_width = 50
  gantt.config.scales = ganttScales[selectedScale.value]
  gantt.render()
}

const dependencyLinesVisible = ref<boolean>(false)

function toggleDependencyLinesDisplay() {
  dependencyLinesVisible.value = !dependencyLinesVisible.value
  gantt.config.show_links = dependencyLinesVisible.value
  gantt.render()
}

function zoom(i: number) {
  const colWidth = gantt.getScale().col_width
  gantt.config.min_column_width = colWidth + i * 0.25 * colWidth
  gantt.render()
}

function onQuickFilterApplied(filter: GanttSchedulesActivityCodeFilter) {
  if (filter.selected) {
    appliedFilters.activityCodes.push(filter)
    return
  }
  const index = appliedFilters.activityCodes.findIndex(
    (f) =>
      f.project_version_id === filter.project_version_id &&
      f.activity_code_id === filter.activity_code_id &&
      f.value_id === filter.value_id
  )
  if (index === -1) return
  appliedFilters.activityCodes.splice(index, 1)
}

function onFiltersApplied(filters: any) {
  appliedFilters.general = filters.general
  appliedFilters.wbs = filters.wbs
  appliedFilters.activityCodes = filters.activityCodes
  dialogs.filters = false
}

const dialogs = reactive({
  filters: false
})

const showClearAllFilters = computed(() => {
  return (
    !!appliedFilters.general.startDate ||
    !!appliedFilters.general.endDate ||
    !!appliedFilters.general.status.length ||
    !!appliedFilters.wbs.length ||
    !!appliedFilters.activityCodes.length
  )
})

const filtersKey = ref(0)

const clearAllFilters = () => {
  appliedFilters.general.startDate = ''
  appliedFilters.general.endDate = ''
  appliedFilters.general.status = []
  appliedFilters.wbs = []
  appliedFilters.activityCodes = []
  filtersKey.value++
}

const filtersDialog = ref()

const disableStartDate = computed(() => {
  const dates = filtersDialog.value?.filters?.general
  const [actualFirstTime, actualLastTime] = getTimes(versions.value)

  const dateFirstTask = dayjs(actualFirstTime).format(standardDateFormat)
  const dateLastTask = dates?.endDate
    ? dates?.endDate
    : dayjs(actualLastTime).format(standardDateFormat)

  return { min: dateFirstTask, max: dateLastTask }
})

const disableEndDate = computed(() => {
  const dates = filtersDialog.value?.filters?.general
  const [actualFirstTime, actualLastTime] = getTimes(versions.value)
  let dateFirstTask = dates?.startDate
    ? dates?.startDate
    : dayjs(actualFirstTime).format(standardDateFormat)
  let dateLastTask = dayjs(actualLastTime).format(standardDateFormat)
  return { min: dateFirstTask, max: dateLastTask }
})

const getTimeScheduleItems = timeScheduleItems.reverse()
</script>

<template>
  <v-container fluid class="d-flex flex-column">
    <!-- <img :src="logoIconUrl" alt="img" /> -->
    <portal to="search">
      <SearchInput
        :placeholder="$t('workspaces.schedules.gantt.searchLabel')"
        :disabled="loading"
        @input="onSearchInput"
      />
    </portal>
    <div class="d-flex flex-grow-0 flex-wrap align-center justify-space-between py-2 border-t">
      <div class="mb-3">
        <v-btn-toggle
          v-model="selectedScale"
          rounded="4"
          mandatory
          color="primary text-white"
          group
          divided
          density="compact"
          class="border mr-4"
          @update:modelValue="onScheduleChange"
        >
          <template v-for="item in getTimeScheduleItems" :key="item.title">
            <v-btn :value="item.value" size="small" class="text-capitalize text-caption">
              {{ item.title }}
            </v-btn>
          </template>
        </v-btn-toggle>
        <v-btn-toggle
          v-model="expandAll"
          rounded="4"
          variant="plain"
          group
          divided
          density="compact"
          @update:modelValue="toggleExpand"
        >
          <v-btn :value="true" class="text-capitalize text-caption">
            {{ $t('misc.expand') }}
          </v-btn>
          <v-btn :value="false" class="text-capitalize text-caption">
            {{ $t('misc.collapse') }}
          </v-btn>
        </v-btn-toggle>
      </div>
      <div class="d-flex align-center">
        <v-chip
          v-if="showClearAllFilters"
          color="primary"
          closable
          :title="$t('workspaces.schedules.gantt.filters.clearAllTooltip')"
          @click:close="clearAllFilters"
        >
          {{ $t('misc.clearAll') }}
        </v-chip>
      </div>
      <div class="d-flex align-center mb-3">
        <v-select
          prepend-inner-icon="mdi-account-multiple"
          :label="$t('workspaces.schedules.gantt.scheduleGroups')"
          variant="outlined"
          v-model="selectedGroup"
          :items="groups"
          hide-details
          density="compact"
          :disabled="loading"
          class="mr-4 rounded-lg"
          @update:model-value="onGroupChange"
        />

        <v-btn
          :disabled="loading"
          class="mr-1 rounded-lg bg-grey-lighten-4 elevation-0"
          @click="dialogs.filters = true"
          icon="mdi-filter"
          size="small"
          density="default"
        ></v-btn>

        <v-btn
          :color="columnsVisible ? 'primary' : 'grey'"
          :title="columnsVisible ? $t('misc.hideColumns') : $t('misc.showColumns')"
          :disabled="loading"
          class="mr-1 rounded-lg bg-grey-lighten-4 elevation-0 mx-1"
          @click="toggleColumnVisibility"
          icon="mdi-table"
          size="small"
          density="default"
        ></v-btn>
        <v-btn
          :color="tooltipsVisible ? 'primary' : 'grey'"
          :title="tooltipsVisible ? $t('misc.hideTooltips') : $t('misc.showTooltips')"
          :disabled="loading"
          class="mr-1 rounded-lg bg-grey-lighten-4 elevation-0 mr-1"
          @click="toggleTooltips"
          icon="mdi-tooltip-outline"
          size="small"
          density="default"
        ></v-btn>

        <v-btn
          :color="dependencyLinesVisible ? 'primary' : 'grey'"
          :title="$t('workspaces.schedules.gantt.toggleDependencyLines')"
          :disabled="loading"
          class="mr-4 rounded-lg bg-grey-lighten-4 elevation-0 mr-1"
          @click="toggleDependencyLinesDisplay"
          icon="mdi-chart-timeline-variant"
          size="small"
          density="default"
        >
          <img src="@/assets/arrow.svg" />
        </v-btn>

        <v-btn
          :disabled="loading"
          icon="mdi-plus"
          size="small"
          density="default"
          class="rounded-lg bg-grey-lighten-4 elevation-0 mr-1"
          @click="zoom(1)"
        ></v-btn>
        <v-btn
          icon="mdi-minus"
          size="small"
          density="default"
          class="rounded-lg bg-grey-lighten-4 elevation-0"
          :disabled="loading"
          @click="zoom(-1)"
        ></v-btn>
      </div>
    </div>
    <div class="d-flex flex-row flex-grow-1 position-relative">
      <div
        ref="ganttRef"
        class="gantt-container flex-grow-1"
        style="height: calc(100vh - 300px); width: calc(100% - 50px)"
      />
      <div
        v-if="quickFilters.length"
        class="side-panel position-relative justify-center align-center cursor-pointer bg-white rounded-lg border-lg"
        :class="{ expanded: expanded, 'd-flex': !expanded }"
      >
        <span class="heading text-body-1 quick-filters-font" v-if="!expanded">
          {{ $t('workspaces.schedules.gantt.quickFilters') }}
        </span>
        <div v-else class="px-2 py-3">
          <span class="pb-2 text-body-1 quick-filters-font font-weight-bold">
            {{ $t('workspaces.schedules.gantt.quickFilters') }}
          </span>
          <div class="activity-list">
            <ActivityCodesList
              :gant-filters="true"
              v-if="ganttOptions.projects?.length"
              :projects="ganttOptions.projects"
              :filters="appliedFilters.activityCodes"
              @change="onQuickFilterApplied"
              @more="dialogs.filters = true"
            />
          </div>
        </div>
        <v-btn
          class="expand-btn"
          :style="`margin-left: ${expanded ? '-25px' : '-50px'}`"
          :icon="expanded ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          @click="toggleExpanded"
        ></v-btn>
      </div>
    </div>
    <FiltersDialog
      ref="filtersDialog"
      v-model="dialogs.filters"
      :projects="allWbs"
      :project-definitions="ganttOptions.projects"
      :quick-filters="appliedFilters.activityCodes"
      :key="filtersKey"
      @submit="onFiltersApplied"
      :disable-start-date="disableStartDate"
      :disable-end-date="disableEndDate"
    />
  </v-container>
</template>

<style lang="scss">
.gantt-container {
  .gantt_task_row {
    border-bottom: 1px solid #ebebeb !important;
  }

  .gantt_task_cell {
    border-right: 1px solid #ebebeb !important;
  }

  .gantt_cell {
    border-right: 1px solid #ebebeb !important;
  }

  .gantt_task_bg {
    div {
      background-repeat: repeat;
    }
  }

  .gantt_grid_scale .gantt_grid_head_cell,
  .gantt_scale_cell {
    color: #605f5f !important;
  }
}

.side-panel {
  width: 50px;
  z-index: 2;

  .expand-btn {
    position: absolute;
    z-index: 1;
    top: 47%;
    width: 30px;
    height: 40px;
  }

  .activity-list {
    height: calc(100vh - 360px);
    overflow-y: auto;
    margin-top: 10px;
  }

  .heading {
    transform: rotate(90deg);
    white-space: nowrap;
    height: 25px;
  }

  .quick-filters-font {
    font-family: 'Roboto', sans-serif !important;
  }
}

.expanded {
  position: absolute !important;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  height: 100%;
}

.sort_asc::after {
  content: '▲';
}

.sort_desc::after {
  content: '▼';
}
</style>
