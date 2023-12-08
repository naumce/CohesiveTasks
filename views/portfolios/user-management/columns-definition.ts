import type {CellComponent, ColumnDefinition, MenuObject} from 'tabulator-tables'
import {useI18n} from 'vue-i18n'
import useTabulatorOptions from '@/composables/tabulator'

export default function getColumnsDefinition(
  actions: MenuObject<CellComponent>[]
): Array<ColumnDefinition> {
  const { t } = useI18n()
  const { inputHeaderFilter, emptyHeaderFilter, contextActionsFormatter } = useTabulatorOptions()
  return [
    {
      field: 'user___name',
      title: t('portfolios.userManagement.fields.name'),
      headerHozAlign: 'left',
      sorter: 'string',
      headerSort: false,
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
    },
    {
      field: 'user___email',
      title: t('portfolios.userManagement.fields.email'),
      sorter: 'string',
      headerHozAlign: 'left',
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
    },
    {
      field: 'role___name',
      title: t('portfolios.userManagement.fields.role'),
      sorter: 'string',
      headerHozAlign: 'left'
    },
    {
      title: '',
      clickMenu: actions,

        headerSort: false,
      width: 60,
      formatter: contextActionsFormatter
    }
  ]
}
