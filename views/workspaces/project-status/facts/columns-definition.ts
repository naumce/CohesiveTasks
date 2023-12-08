import type {CellComponent, ColumnDefinition, MenuObject} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import {useI18n} from 'vue-i18n'

export default function getColumnsDefinition(
  actions: MenuObject<CellComponent>[]
): ColumnDefinition[] {
  const { t } = useI18n()
  const { contextActionsFormatter, inputHeaderFilter, emptyHeaderFilter } = useTabulatorOptions()
  const columns: ColumnDefinition[] = [
    {
      field: 'fact___custom_id',
      title: t('projectStatus.facts.fields.custom_id'),

        sorter: 'string',
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
    },
    {
      field: 'shown_in_card',
      title: t('projectStatus.facts.fields.shown_in_card'),

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
      field: 'fact___name',
      title: t('projectStatus.facts.fields.name'),
      sorter: 'string',
      headerHozAlign: 'left',
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
    },
    {
      field: 'value',
      title: t('projectStatus.facts.fields.value'),

        sorter: 'string'
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
