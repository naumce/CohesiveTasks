import type { CellComponent, ColumnDefinition } from 'tabulator-tables'
import { useI18n } from 'vue-i18n'
import type { PortfolioProject } from '@/types'
import useTabulatorOptions from '@/composables/tabulator'
import { formatNumber } from '@/utils/number'
import {useRoute, useRouter} from "vue-router";
import {useCustomizerStore} from "@/stores/customizer";
import type {HttpRequest, Workspace} from "@/types";
import {apiUrls} from "@/plugins/axios";
import {navigationGuard} from "@/router/navigation-guard";
import useApis from "@/composables/api";

export default function getColumnsDefinition(): Array<ColumnDefinition> {
  const { t } = useI18n()
  const { numberHeaderFilter } = useTabulatorOptions()
  const router = useRouter();
  const route = useRoute()
  const tenantId = route.params.tenantId.toString()
  const { setWorkspace, setWorkspaceRole, getUserPermissions} = useCustomizerStore()
  const { sendRequest } = useApis()
  const selectWorkspace = async (item: any) => {
    setWorkspace(item)
    const getWorkspaceRoleRequest: HttpRequest = {
      method: 'get',
      url: apiUrls.workspaceRole.replace(/%workspaceId/, `${item.workspaceId}`),
      onSuccess: {
        callback: (response) => {
          setWorkspaceRole(response.data)
        }
      }
    }
    await sendRequest(getWorkspaceRoleRequest)
    const userPermissions = getUserPermissions()

    const canViewProjectStatus = navigationGuard['project-status'].some((permission: string) =>
        userPermissions.includes(permission)
    )
    const redirectRoute = canViewProjectStatus
        ? {
          name: 'project-status',
          params: { tenantId: tenantId, workspaceId: item.id, projectId: item.project_card?.id }
        }
        : userPermissions.includes('SPACE_ADMINISTRATION')
            ? {
              name: 'schedules-management',
              params: { tenantId: tenantId, workspaceId: item.id, projectId: item.project_card?.id }
            }
            : userPermissions.includes('PROJECT_FINANCE_VIEW')
                ? {
                  name: 'dashboard',
                  params: { tenantId: tenantId, workspaceId: item.id, projectId: item.project_card?.id }
                }
                : {
                  name: 'schedules-overview',
                  params: { tenantId: tenantId, workspaceId: item.id, projectId: item.project_card?.id }
                }

    await router.push(redirectRoute)
  }

  return [
    {
      field: 'name',
      title: t('portfolios.scoreCard.fields.name'),
      frozen: true,
      cssClass: 'font-weight-bold',
      cellClick: async (e,cell:CellComponent) => {
        const row = cell.getRow().getData();
        const workspace= {
          ...row,
          project_card:{
            id: row.id
          }
        }
        await selectWorkspace(workspace)
      }
      },
    {
      //@ts-ignore
      type: 'ro',
      field: 'risk_score',
      title: t('portfolios.scoreCard.fields.risk_score'),
      visible: false,
      width: 120,
      formatter: (cell: CellComponent) => {
        const data = cell.getData() as PortfolioProject
        const row = cell.getRow()?.getData()
        if (row.name === 'TOTAL') return ''
        const container = document.createElement('div')
        container.classList.add('d-flex')
        container.classList.add('align-center')

        const circle = document.createElement('span')
        circle.classList.add('mdi')
        circle.classList.add('mdi-circle')
        circle.style.fontSize = '24px'
        circle.style.color = data.risk_color === '#000000' ? '#d9d9d9' : data.risk_color

        const text = document.createElement('span')
        const value = cell.getValue()
        text.innerText = value ? cell.getValue().toFixed(2) : ''
        container.appendChild(circle)
        container.appendChild(text)
        return container
      }
    },
    {
      //@ts-ignore
      type: 'ro',
      field: 'risk_matrix',
      title: t('portfolios.scoreCard.fields.risk_matrix'),
      visible: false,
      width: 200,
      headerHozAlign: 'left',
      headerSort: false,
      formatter: (cell: CellComponent) => {
        const row = cell.getRow()?.getData()
        if (row.name === 'TOTAL') return ''
        return cell.getValue()
      }
    },
    {
      //@ts-ignore
      type: 'ro',
      field: 'opportunity_score',
      title: t('portfolios.scoreCard.fields.opportunity_score'),
      visible: false,
      width: 120,

      formatter: (cell: CellComponent) => {
        const data = cell.getData() as PortfolioProject
        const row = cell.getRow()?.getData()
        if (row.name === 'TOTAL') return ''
        const container = document.createElement('div')
        container.classList.add('d-flex')
        container.classList.add('align-center')
        const circle = document.createElement('span')
        circle.classList.add('mdi')
        circle.classList.add('mdi-circle')
        circle.style.fontSize = '24px'
        circle.style.color =
          data.opportunity_color === '#000000' ? '#d9d9d9' : data.opportunity_color
        // circle.style.verticalAlign = 'middle'
        const text = document.createElement('span')
        const value = cell.getValue()
        text.innerText = value ? cell.getValue().toFixed(2) : ''
        container.appendChild(circle)
        container.appendChild(text)
        return container
      }
    },
    {
      //@ts-ignore
      type: 'ro',
      field: 'opportunity_matrix',
      title: t('portfolios.scoreCard.fields.opportunity_matrix'),
      visible: false,
      width: 200,
      headerHozAlign: 'left',
      headerSort: false,
      formatter: (cell: CellComponent) => {
        const row = cell.getRow()?.getData()
        if (row.name === 'TOTAL') return ''
        return cell.getValue()
      }
    },
    {
      //@ts-ignore
      type: 'cost',
      minWidth: 180,
      visible: false,
      title: t('workspaces.financials.dashboard.cards.originalBudget'),
      field: 'original_budget',
      // @ts-ignore
      headerPopup: numberHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      formatter: (cell: CellComponent) => {
        const isNegative = formatNumber(cell.getValue()).includes('-')
        return `<div class=" ${isNegative ? 'text-red' : ''}">${formatNumber(
          cell.getValue(),
          false
        )}</div>`
      }
    },
    {
      //@ts-ignore
      type: 'cost',
      minWidth: 180,
      visible: false,
      title: t('workspaces.financials.dashboard.cards.currentBudget'),
      field: 'current_budget',
      // @ts-ignore
      headerPopup: numberHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      formatter: (cell: CellComponent) => {
        const isNegative = formatNumber(cell.getValue()).includes('-')
        return `<div class=" ${isNegative ? 'text-red' : ''}">${formatNumber(
          cell.getValue(),
          false
        )}</div>`
      }
    },
    {
      //@ts-ignore
      type: 'cost',
      minWidth: 180,
      visible: false,
      title: t('workspaces.financials.dashboard.cards.proposedBudget'),
      field: 'proposed_budget',
      // @ts-ignore
      headerPopup: numberHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      formatter: (cell: CellComponent) => {
        const isNegative = formatNumber(cell.getValue()).includes('-')
        return `<div class=" ${isNegative ? 'text-red' : ''}">${formatNumber(
          cell.getValue(),
          false
        )}</div>`
      }
    },
    {
      //@ts-ignore
      type: 'cost',
      minWidth: 180,
      visible: false,
      title: t('workspaces.financials.dashboard.cards.actualCost'),
      field: 'actual_cost',
      // @ts-ignore
      headerPopup: numberHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      formatter: (cell: CellComponent) => {
        const isNegative = formatNumber(cell.getValue()).includes('-')
        return `<div class=" ${isNegative ? 'text-red' : ''}">${formatNumber(
          cell.getValue(),
          false
        )}</div>`
      }
    },
    {
      //@ts-ignore
      type: 'cost',
      minWidth: 180,
      visible: false,
      title: t('workspaces.financials.dashboard.cards.remainingCost'),
      field: 'remaining_cost',
      // @ts-ignore
      headerPopup: numberHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      formatter: (cell: CellComponent) => {
        const isNegative = formatNumber(cell.getValue()).includes('-')
        return `<div class=" ${isNegative ? 'text-red' : ''}">${formatNumber(
          cell.getValue(),
          false
        )}</div>`
      }
    },
    {
      //@ts-ignore
      type: 'cost',
      minWidth: 180,
      visible: false,
      title: t('workspaces.financials.dashboard.cards.atCompletionCost'),
      field: 'at_completion_cost',
      // @ts-ignore
      headerPopup: numberHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      formatter: (cell: CellComponent) => {
        const isNegative = formatNumber(cell.getValue()).includes('-')
        return `<div class=" ${isNegative ? 'text-red' : ''}">${formatNumber(
          cell.getValue(),
          false
        )}</div>`
      }
    },
    {
      //@ts-ignore
      type: 'cost',
      minWidth: 180,
      visible: false,
      title: t('workspaces.financials.dashboard.cards.revenue'),
      field: 'revenue',
      // @ts-ignore
      headerPopup: numberHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      formatter: (cell: CellComponent) => {
        const isNegative = formatNumber(cell.getValue()).includes('-')
        return `<div class=" ${isNegative ? 'text-red' : ''}">${formatNumber(
          cell.getValue(),
          false
        )}</div>`
      }
    },
    {
      //@ts-ignore
      type: 'cost',
      minWidth: 180,
      visible: false,
      title: t('workspaces.financials.dashboard.cards.margin'),
      field: 'margin',
      // @ts-ignore
      headerPopup: numberHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      formatter: (cell: CellComponent) => {
        const isNegative = formatNumber(cell.getValue()).includes('-')
        return `<div class=" ${isNegative ? 'text-red' : ''}">${formatNumber(
          cell.getValue(),
          false
        )}</div>`
      }
    },
    {
      //@ts-ignore
      type: 'cost',
      minWidth: 180,
      visible: false,
      title: t('workspaces.financials.dashboard.cards.marginPercent'),
      field: 'margin_percent',
      // @ts-ignore
      headerPopup: numberHeaderFilter,
      headerPopupIcon: "<span class='mdi mdi-filter-menu'></span>",
      formatter: (cell: CellComponent) => {
        let row = cell.getRow()?.getData()
        if(row.name === 'TOTAL') {
          row.margin_percent =  row.revenue === 0 ? 0 : (row.margin / row.revenue)
        }
        const value = formatNumber(cell.getValue() * 100,false);
        const isNegative = value.includes('-')
        return `<div class=" ${isNegative ? 'text-red' : ''}">${value}</div>`
      }
    }
  ]
}
