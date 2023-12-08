import type {CellComponent, ColumnDefinition, MenuObject} from 'tabulator-tables'
import {isoToStandardString} from '@/utils/date'
import {useI18n} from 'vue-i18n'
import useTabulatorOptions from '@/composables/tabulator'

export default function getColumnsDefinition(
  actions: MenuObject<CellComponent>[]
): ColumnDefinition[] {
  const { t } = useI18n()
  const { contextActionsFormatter } = useTabulatorOptions()
  const columns: ColumnDefinition[] = [
    {
      field: 'date',
      title: t('projectStatus.information.fields.date'),
      width: 120,

        sorter: 'string',
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (!value) return ''
        return isoToStandardString(value)
      }
    },
    {
      field: 'shown_in_card',
      title: t('projectStatus.information.fields.shown_in_card'),
      width: 150,

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
      title: t('projectStatus.information.fields.description'),
      sorter: 'string',
      headerHozAlign: 'left'
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
