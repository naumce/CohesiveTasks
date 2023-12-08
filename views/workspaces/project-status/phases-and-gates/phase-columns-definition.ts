import type {CellComponent, ColumnDefinition, MenuObject} from 'tabulator-tables'
import {useI18n} from 'vue-i18n'
import useTabulatorOptions from '@/composables/tabulator'
import {isoToStandardString} from '@/utils/date'
import {thousandSeparatedFormat} from '@/utils/number'

export default function getColumnsDefinition(
  actions: MenuObject<CellComponent>[]
): ColumnDefinition[] {
  const { t } = useI18n()
  const { inputHeaderFilter, emptyHeaderFilter, contextActionsFormatter } = useTabulatorOptions()
  const columns: ColumnDefinition[] = [
    {
      field: 'name',
      title: t('projectStatus.phaseGate.fields.name'),
      width: 200,
      sorter: 'string',
      cssClass:'font-weight-bold',
      frozen: true,
      // @ts-ignore
      headerPopup: inputHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: 'like'
    },
    {
      field: 'status',
      title: t('projectStatus.phaseGate.fields.status'),
      width: 100,
      sorter: 'string',
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        return t(`PhaseStatus.${value}`)
      }
    },
    {
      field: 'start_date',
      title: t('projectStatus.phaseGate.fields.start_date'),
      width: 140,
      sorter: 'string',
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (!value) return ''
        return isoToStandardString(value)
      }
    },
    {
      field: 'end_date',
      title: t('projectStatus.phaseGate.fields.end_date'),
      width: 140,
      sorter: 'string',
      formatter: (cell: CellComponent) => {
        const value = cell.getValue()
        if (!value) return ''
        return isoToStandardString(value)
      }
    },
    // {
    //   field: 'cost_budget',
    //   title: t('projectStatus.phaseGate.fields.cost_budget'),
    //   width: 160,
    //   sorter: 'number',
    //   formatter: (cell: CellComponent) => {
    //     const value = cell.getValue()
    //     return `${thousandSeparatedFormat(value)}`
    //   }
    // },
    // {
    //   field: 'cost_actual',
    //   title: t('projectStatus.phaseGate.fields.cost_actual'),
    //   width: 160,
    //   sorter: 'number',
    //   formatter: (cell: CellComponent) => {
    //     const value = cell.getValue()
    //     return `${thousandSeparatedFormat(value)}`
    //   }
    // },
    // {
    //   field: 'hours_actual',
    //   title: t('projectStatus.phaseGate.fields.hours_actual'),
    //   width: 160,
    //   sorter: 'number',
    //   formatter: (cell: CellComponent) => {
    //     const value = cell.getValue()
    //     return `${thousandSeparatedFormat(value)}`
    //   }
    // },
    // {
    //   field: 'remaining_cost',
    //   title: t('projectStatus.phaseGate.fields.remaining_cost'),
    //   width: 180,
    //   sorter: 'number',
    //   formatter: (cell: CellComponent) => {
    //     const value = cell.getValue()
    //     return `${thousandSeparatedFormat(value)}`
    //   }
    // },
    // {
    //   field: 'remaining_hours',
    //   title: t('projectStatus.phaseGate.fields.remaining_hours'),
    //   width: 180,
    //   sorter: 'number',
    //   formatter: (cell: CellComponent) => {
    //     const value = cell.getValue()
    //     return `${thousandSeparatedFormat(value)}`
    //   }
    // },
    {
      field: 'custom_id',
      title: t('projectStatus.phaseGate.fields.phase_id'),
      width: 200,
      sorter: 'string'
    },
    {
      field: 'comment',
      title: t('projectStatus.phaseGate.fields.comment'),
      width: '100%',
      sorter: 'string'
    }
  ]

  actions.length &&
    columns.push({
      title: '',
      clickMenu: actions,
      frozen: true,
      headerSort: false,
      width: 60,
      formatter: contextActionsFormatter
    })

  return columns
}
