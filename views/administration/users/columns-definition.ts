import type {CellComponent, ColumnDefinition, MenuObject} from 'tabulator-tables'
import {useI18n} from 'vue-i18n'
import useTabulatorOptions from '@/composables/tabulator'

export default function getColumnsDefinition(
  actions: MenuObject<CellComponent>[]
): Array<ColumnDefinition> {
  const { t } = useI18n()
  const { contextActionsFormatter, inputHeaderFilter, emptyHeaderFilter } = useTabulatorOptions()
  return [
    {
      field: 'user___name',
      title: t('workspaces.settings.userManagement.name'),
      sorter: 'string',
      headerHozAlign: 'left',
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
    },
    {
      field: 'user___email',
      title: t('workspaces.settings.userManagement.email'),
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
      title: t('workspaces.settings.userManagement.role'),
      headerHozAlign: 'left',
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
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
