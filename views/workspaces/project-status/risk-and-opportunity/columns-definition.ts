import type {CellComponent, ColumnDefinition, MenuObject} from 'tabulator-tables'
import type {EventCharacterization} from '@/types'
import {useI18n} from 'vue-i18n'
import useTabulatorOptions from '@/composables/tabulator'

export default function getColumnsDefinition(
  actions: MenuObject<CellComponent>[]
): ColumnDefinition[] {
  const { contextActionsFormatter, inputHeaderFilter, emptyHeaderFilter } = useTabulatorOptions()
  const { t } = useI18n()
  const columns: ColumnDefinition[] = [
    {
      field: 'custom_id',
      title: t('projectStatus.riskAndOpportunities.fields.custom_id'),

        sorter: 'string',
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
    },
    {
      field: 'shown_in_card',
      title: t('projectStatus.riskAndOpportunities.fields.shown_in_card'),

        sorter: 'boolean',
      formatter: (cell: CellComponent) => {
        const span = document.createElement('span')
        span.classList.add('mdi')
        span.classList.add(cell.getValue() ? 'mdi-eye-outline' : 'mdi-eye-off-outline')
        span.style.fontSize = '24px'
        span.style.verticalAlign = 'middle'
        span.style.margin = 'auto'
        span.style.cursor = 'pointer'
        return span
      }
    },
    {
      field: 'description',
      title: t('projectStatus.riskAndOpportunities.fields.description'),
      sorter: 'string',
      headerHozAlign: 'left',
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
    },
    {
      field: 'status',
      title: t('projectStatus.riskAndOpportunities.fields.status'),

        sorter: 'string',
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (value === 'EventStatus.OPEN') return t('EventStatus.OPEN')
        if (value === 'EventStatus.CLOSED') return t('EventStatus.CLOSED')
        return ''
      }
    },
    {
      field: 'severity',
      title: t('projectStatus.riskAndOpportunities.fields.severity'),

        sorter: 'number',
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (!value) return ''
        const data = cell.getData() as EventCharacterization
        return `${data.full_severity.name} (${value})`
      }
    },
    {
      field: 'probability',
      title: t('projectStatus.riskAndOpportunities.fields.probability'),

        sorter: 'number',
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (!value) return ''
        const data = cell.getData() as EventCharacterization
        return `${data.full_probability.name} (${value})`
      }
    },
    {
      field: 'score',
      title: t('projectStatus.riskAndOpportunities.fields.score'),

        sorter: 'number',
      formatter: (cell: CellComponent) => {
        const data = cell.getData() as EventCharacterization
        const span = document.createElement('span')
        span.innerHTML = cell.getValue()
        span.className = 'score-status-chip'
        span.style.backgroundColor = data.color
        span.style.color = '#fff'
        return span
      }
    },
    {
      field: 'owner',
      title: t('projectStatus.riskAndOpportunities.fields.ownerEmail'),
      sorter: 'string'
    },
    {
      field: 'ownerId',
      title: '',
      visible: false
    }
  ]
  actions.length &&
    columns.push({
      title: '',
      clickMenu: actions,

        headerSort: false,
      width: 60,
      formatter: contextActionsFormatter
    })
  return columns
}
