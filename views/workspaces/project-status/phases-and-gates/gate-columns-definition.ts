import type {CellComponent, ColumnDefinition, MenuObject} from 'tabulator-tables'
import {useI18n} from 'vue-i18n'
import useTabulatorOptions from '@/composables/tabulator'
import {isoToStandardString} from '@/utils/date'

export default function getColumnsDefinition(
    actions: MenuObject<CellComponent>[]
): ColumnDefinition[] {
    const {t} = useI18n()
    const {inputHeaderFilter, emptyHeaderFilter, contextActionsFormatter} = useTabulatorOptions()
    const columns: ColumnDefinition[] = [
        {
            field: 'name',
            title: t('projectStatus.phaseGate.fields.name'),
            width: 200,
            sorter: 'string',
            cssClass:'font-weight-bold',
            // @ts-ignore
            headerPopup: inputHeaderFilter,
            headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
            headerFilter: emptyHeaderFilter,
            headerFilterFunc: 'like'
        },
        {
            field: 'status',
            title: t('projectStatus.phaseGate.fields.status'),

            sorter: 'string',
            formatter: (cell: CellComponent) => {
                const value = cell.getValue()
                return t(`PhaseStatus.${value}`)
            }
        },
        {
            field: 'end_date',
            title: t('misc.date'),

            sorter: 'string',
            formatter: (cell: CellComponent) => {
                const value = cell.getValue()
                if (!value) return ''
                return isoToStandardString(value)
            }
        },
        {
            field: 'comment',
            title: t('projectStatus.phaseGate.fields.comment'),

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
