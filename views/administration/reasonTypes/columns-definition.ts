import type { CellComponent, ColumnDefinition, MenuObject } from 'tabulator-tables'
import { useI18n } from 'vue-i18n'
import useTabulatorOptions from '@/composables/tabulator'

export default function getColumnsDefinition(
    actions: MenuObject<CellComponent>[]
): Array<ColumnDefinition> {
    const { t } = useI18n()
    const { contextActionsFormatter, inputHeaderFilter, emptyHeaderFilter, enumHeaderFilter } = useTabulatorOptions()
    return [
        {
            field: 'custom_id',
            title: t('administration.reasonTypes.fields.customId'),
            sorter: 'string',
            headerHozAlign: 'left',
            // @ts-ignore
            headerPopup: inputHeaderFilter,
            headerPopupIcon: '<span class="mdi mdi-filter-menu" data-testid="filter-reason-type"/>',
            headerFilter: emptyHeaderFilter,
            headerFilterFunc: 'like'
        },
        {
            field: 'active',
            title: t('administration.reasonTypes.fields.status'),
            headerHozAlign: 'left',
            // @ts-ignore
            headerPopup: inputHeaderFilter,
            headerPopupIcon: '<span class="mdi mdi-filter-menu" />',
            headerFilter: emptyHeaderFilter,
            headerFilterFunc: 'like',
            formatter: (cell: CellComponent) => {
                const value = cell.getValue()
                return value ? t('administration.reasonTypes.activate.activated').charAt(0).toUpperCase() + t('administration.reasonTypes.activate.activated').slice(1)
                    : t('administration.reasonTypes.activate.deactivated').charAt(0).toUpperCase() + t('administration.reasonTypes.activate.deactivated').slice(1)
            }
        },
        {
            field: 'name',
            title: t('administration.reasonTypes.fields.name'),
            headerHozAlign: 'left',
            // @ts-ignore
            headerPopup: inputHeaderFilter,
            headerPopupIcon: '<span class="mdi mdi-filter-menu" data-testid="filter-reason-name"/>',
            headerFilter: emptyHeaderFilter,
            headerFilterFunc: 'like'
        },
        {
            field: 'description',
            title: t('administration.reasonTypes.fields.description'),
            headerHozAlign: 'left',
            // @ts-ignore
            headerPopup: inputHeaderFilter,
            headerPopupIcon: '<span class="mdi mdi-filter-menu" data-testid="filter-reason-description"/>',
            headerFilter: emptyHeaderFilter,
            headerFilterFunc: 'like'
        },
        {
            title: '',
            clickMenu: actions,
            hozAlign: 'center',
            headerSort: false,
            width: 60,
            formatter: contextActionsFormatter
        }
    ]
}
