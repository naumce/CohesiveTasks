import type {CellComponent, ColumnDefinition, MenuObject} from 'tabulator-tables'
import {useI18n} from 'vue-i18n'
import useTabulatorOptions from '@/composables/tabulator'
import {isoToStandardString} from '@/utils/date'
import type {ReportKpi} from '@/types'

export default function getColumnsDefinition(
  actions: MenuObject<CellComponent>[]
): ColumnDefinition[] {
  const { t } = useI18n()
  const { contextActionsFormatter, emptyHeaderFilter, inputHeaderFilter } = useTabulatorOptions()

  const columns: ColumnDefinition[] = [
    // @ts-ignore
    {
      headerSort:false,
      frozen:true,
      width:40,
      minWidth:40,
      resizable: false,
      rowHandle:true,
      formatter: () => {
        const dragEl = document.createElement('span')
        dragEl.classList.add('mdi')
        dragEl.classList.add('mdi-drag-vertical')
        dragEl.classList.add('drag-icon')
        return dragEl
      },
    },
    {
      field: 'kpi___name',
      title: t('projectStatus.kpi.fields.kpi_name'),
      headerSort: false,
      width: '25%',
      frozen: true,
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
    },
    {
      field: 'shown_in_card',
      title: t('projectStatus.kpi.fields.shown_in_card'),
      visible:true,
      headerSort: false,
      formatter: (cell: CellComponent) => {
        const span = document.createElement('span')
        span.classList.add('mdi')
        span.classList.add(cell.getValue() ? 'mdi-eye-outline' : 'mdi-eye-off-outline')
        span.style.fontSize = '20px'
        span.style.verticalAlign = 'middle'
        span.style.margin = 'auto'
        return span
      }
    },
  ]

  actions?.length &&
    columns.push({
      title: '',
      field: 'actions',
      clickMenu: actions,
      visible:true,
      headerSort: false,
      width: 60,
      frozen: true,
      formatter: contextActionsFormatter
    })

  return columns
}

export function getColumnsDefinitionReportKpi(
  actions: MenuObject<CellComponent>[]
): ColumnDefinition[] {
  const { t } = useI18n()
  const { contextActionsFormatter } = useTabulatorOptions()
  const columns: ColumnDefinition[] = [
    {
      field: 'date',
      title: t('projectStatus.kpi.fields.report_date'),
      headerSort: false,
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (!value) return ''
        return isoToStandardString(value)
      }
    },
    {
      field: 'threshold___value',
      title: t('projectStatus.kpi.fields.report_value'),
      headerSort: false,
      formatter: (cell: CellComponent) => {
        const span = document.createElement('span')
        span.innerHTML = cell.getValue() !== undefined ? cell.getValue() : ''
        const data = cell.getData() as ReportKpi
        span.className = 'score-status-chip'
        span.style.textAlign = 'center'
        span.style.margin = 'auto'
        span.style.color = 'white'
        span.style.backgroundColor = data.threshold.color
        return span
      }
    },
    {
      field: 'comment',
      title: t('projectStatus.kpi.fields.report_comment'),
      headerHozAlign: 'left',
      headerSort: false
    },
    {
      field: 'responsible_action_user___name',
      title: t('projectStatus.kpi.fields.reponsible_action'),
      headerHozAlign: 'left',
      headerSort: false
    }
  ]

  actions?.length &&
    columns.push({
      title: '',
      clickMenu: actions,
      headerSort: false,
      width: 60,
      formatter: contextActionsFormatter
    })

  return columns
}
