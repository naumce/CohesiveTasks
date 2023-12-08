// import { apiClient } from '@/plugins/axios'
import useApis from '@/composables/api'
import { useI18n } from 'vue-i18n'
import type {
  AjaxConfig,
  Options,
  Filter,
  SorterFromTable,
  ColumnComponent,
  ColumnDefinition,
  CellComponent
} from 'tabulator-tables'
import type { HttpRequest, PortfolioUser, ProjectKpiThreshold } from '@/types'
import { isoToUnix, unixToStandardString } from '@/utils/date'
import { apiUrls } from '@/plugins/axios'
import { useRouter } from 'vue-router'
import {togglePagination} from "@/utils/pagination";

export default function useTabulatorOptions() {
  const { sendRequest } = useApis()
  const router = useRouter()
  const sidebar:any  = document.querySelector('.v-navigation-drawer');
  const sidebarHeight  = sidebar?.getBoundingClientRect().height - 250;


  const tabulatorOptions: Options = {
    columnDefaults: {
      title: '',
      // tooltip: true,
      headerTooltip: true,
      resizable: true,
      headerHozAlign: 'center',
      vertAlign: 'middle'
    },
    movableColumns: true,
    // locale: 'en',
    pagination: true,
    // @ts-ignore
    stickyHeader: true,
    height:sidebarHeight,
    paginationMode: 'remote',
    dataLoader: false,
    layout: 'fitColumns',
    paginationInitialPage: 1,
    paginationSize: 50,
    paginationSizeSelector: [5, 10, 20, 50],
    sortMode: 'remote',
    filterMode: 'remote',
    layoutColumnsOnNewData: true,
    minHeight: 1,

    ajaxRequestFunc: (url: string, config: AjaxConfig, params: any) => {
      let queryString = url.includes('?') ? '&' : '?'

      const queries = Object.keys(params).reduce((acc: string[], key) => {
        switch (key) {
          case 'sort': {
            if (!params[key].length) break
            const sorts = params[key]
              .map((sort: SorterFromTable) => `"${sort.dir === 'desc' ? '-' : ''}${sort.field}"`)
              .join(',')
            acc.push(`${key}=[${sorts}]`)
            break
          }
          case 'filter': {
            if (!params[key].length) break
            const filters = params[key]
              .map((filter: Filter) => {
                if (filter.type === 'in' && filter.value?.length) {
                  return `"${filter.field}__in":[${filter.value}]`
                }
                if (filter.type === '>' && typeof (filter.value) === 'object') {
                  let filterString = ''
                  Object.keys(filter.value).forEach(value => {
                    if (filter.value[value]) filterString += `"${filter.field}__${value}":"${filter.value[value]}",`
                  });
                  return filterString.slice(0, -1);
                }
                if (filter.type === '>' && typeof filter.value === 'object') {
                  let filterString = ''
                  Object.keys(filter.value).forEach((value) => {
                    if (filter.value[value])
                      filterString += `"${filter.field}__${value}":"${filter.value[value]}",`
                  })
                  return filterString.slice(0, -1)
                }
                if (filter.type === 'like')
                  return `"${filter.field}__ilike":"%25${encodeURIComponent(filter.value)}%25"`
                return `"${filter.field}":"${encodeURIComponent(filter.value)}"`
              })
              .join(',')
            acc.push(`${key}={${filters}}`)
            break
          }
          case 'page':
          case 'per_page':
            acc.push(`${key}=${params[key]}`)
            break
        }
        return acc
      }, [])

      queryString += queries.join('&')

      const getData: HttpRequest = {
        method: config.method || 'get',
        url: url + queryString,
        ...(params.data ? { data: params.data } : {})
      }

      return sendRequest(getData)
    },
    ajaxResponse: (url: string, params: any, response: any) => {
      if (!response?.data?.items) {
        return {
          contentType: 'application/json; charset=utf-8',
          data: [],
          last_page: 0,
        };
      }
      const totalElements = response.data?.total || 0
      const addition = totalElements % params.per_page > 0 ? 1 : 0
      const lastPage = Math.floor(totalElements / params.per_page) + addition
      const retObj = {
        contentType: 'application/json; charset=utf-8',
        data: response.data.items,
        last_page: lastPage
      }
      togglePagination(totalElements)
      return retObj
    },
    dataSendParams: {
      page: 'page',
      size: 'per_page'
    }
    // langs: {
    //   en: i18n.messages.value.en.tabulator
    // }
  }
  const { t } = useI18n()

  const getHeaderFilterButtons = () => {
    const btnContainer = document.createElement('div');
    btnContainer.classList.add('actions-container');

    const clearButton = document.createElement('button');
    clearButton.innerText = t('misc.clear');
    clearButton.type = 'button'; // Set button type to "button"

    btnContainer.appendChild(clearButton);

    const okButton = document.createElement('button');
    okButton.innerText = t('misc.apply');
    okButton.classList.add('confirm');
    okButton.type = 'submit'; // Set button type to "submit"

    btnContainer.appendChild(okButton);

    return {
      btnContainer,
      clearButton,
      okButton,
    };
  };

  const inputHeaderFilter = (e: Event, column: ColumnComponent) => {
    e.stopPropagation();
    const container = document.createElement('div');
    container.classList.add('tabulator-header-filter-container');

    const form = document.createElement('form');

    const input = document.createElement('input');
    input.placeholder = `${t('tabulator.headerFilter.label')}...`;
    input.value = column.getHeaderFilterValue() || '';

    const { btnContainer, clearButton } = getHeaderFilterButtons();

    clearButton.addEventListener('click', () => {
      column.setHeaderFilterValue('');
      container.style.display = 'none'
      input.value = '';
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      column.setHeaderFilterValue(input.value);
      container.style.display = 'none'
    });

    form.appendChild(input);
    form.appendChild(btnContainer);

    container.appendChild(form);

    setTimeout(() => {
      input.focus();
    }, 0);

    return container;
  };


  const numberHeaderFilter = (e: Event, column: ColumnComponent) => {
    const container = document.createElement('div')
    container.classList.add('tabulator-header-filter-container')
    const currentValue = column.getHeaderFilterValue() || { number: null }

    const gte = document.createElement('div')
    const gteLabel = document.createElement('p')
    gteLabel.innerText = t('tabulator.headerFilter.gte')
    const gteInput = document.createElement('input')
    gteInput.type = 'number'
    gteInput.value = currentValue.number?.gte || currentValue?.ge
    gte.appendChild(gteLabel)
    gte.appendChild(gteInput)

    const lte = document.createElement('div')
    const lteLabel = document.createElement('p')
    lteLabel.innerText = t('tabulator.headerFilter.lte')
    const lteInput = document.createElement('input')
    lteInput.type = 'number'
    lteInput.value = currentValue.number?.lte || currentValue?.le
    lte.appendChild(lteLabel)
    lte.appendChild(lteInput)

    const btnContainer = document.createElement('div')
    btnContainer.classList.add('actions-container')

    const clearButton = document.createElement('button')
    clearButton.innerText = t('misc.clear')
    clearButton.addEventListener('click', () => {
      column.setHeaderFilterValue('')
    })
    btnContainer.appendChild(clearButton)

    const okButton = document.createElement('button')
    okButton.innerText = t('misc.confirm')
    okButton.classList.add('confirm')
    okButton.addEventListener('click', () => {
      if (!currentValue.number && !gteInput.value && !lteInput.value) return
      const gteValue = parseInt(gteInput.value)
      const lteValue = parseInt(lteInput.value)
      const coloumDetails = column.getDefinition();
      if (coloumDetails?.headerFilterFuncParams === 'useGtLt') {
        const numVal = {
          ge: gteInput.value,
          le: lteInput.value
        }
        column.setHeaderFilterValue(numVal)
        return;
      }
      const value = {
        number: {
          ...(gteValue && !isNaN(gteValue) ? { gte: gteValue } : {}),
          ...(lteValue && !isNaN(lteValue) ? { lte: lteValue } : {})
        }
      }
      column.setHeaderFilterValue(value)
    })
    btnContainer.appendChild(okButton)

    container.appendChild(gte)
    container.appendChild(lte)
    container.appendChild(lte)
    container.appendChild(btnContainer)

    return container
  }

  const dateHeaderFilter = (e: Event, column: ColumnComponent) => {
    const container = document.createElement('div')
    container.classList.add('tabulator-header-filter-container')
    const currentValue = column.getHeaderFilterValue() || { datetime: null }
    const gte = document.createElement('div')
    const gteLabel = document.createElement('p')
    gteLabel.innerText = t('tabulator.headerFilter.gte')
    const gteInput = document.createElement('input')
    gteInput.type = 'date'
    gteInput.value = currentValue.datetime?.gte
      ? unixToStandardString(currentValue.datetime.gte)
      : ''
    if (currentValue.gt) gteInput.value = currentValue.gt;
    gte.appendChild(gteLabel)
    gte.appendChild(gteInput)

    const lte = document.createElement('div')
    const lteLabel = document.createElement('p')
    lteLabel.innerText = t('tabulator.headerFilter.lte')
    const lteInput = document.createElement('input')
    lteInput.type = 'date'
    lteInput.value = currentValue.datetime?.lte
      ? unixToStandardString(currentValue.datetime.lte)
      : ''
    if (currentValue.lt) lteInput.value = currentValue.lt
    lte.appendChild(lteLabel)
    lte.appendChild(lteInput)

    const btnContainer = document.createElement('div')
    btnContainer.classList.add('actions-container')

    const clearButton = document.createElement('button')
    clearButton.innerText = t('misc.clear')
    clearButton.addEventListener('click', () => {
      column.setHeaderFilterValue('')
    })
    btnContainer.appendChild(clearButton)

    const okButton = document.createElement('button')
    okButton.innerText = t('misc.confirm')
    okButton.classList.add('confirm')
    okButton.addEventListener('click', () => {
      if (!currentValue.number && !gteInput.value && !lteInput.value) return
      const coloumDetails = column.getDefinition();
      if (coloumDetails?.headerFilterFuncParams === 'useGtLt') {
        const dateTimeValue = {
          ge: gteInput.value,
          le: lteInput.value
        }
        column.setHeaderFilterValue(dateTimeValue)
        return;
      }
      const value = {
        datetime: {
          ...(gteInput.value ? { gte: isoToUnix(gteInput.value) } : {}),
          ...(lteInput.value ? { lte: isoToUnix(lteInput.value) } : {})
        }
      }
      column.setHeaderFilterValue(value)
    })
    btnContainer.appendChild(okButton)

    container.appendChild(gte)
    container.appendChild(lte)
    container.appendChild(btnContainer)

    return container
  }
  let debounce: number
  const tenantUsersHeaderFilter = (e: Event, column: ColumnComponent) => {
    const container = document.createElement('div')
    container.style.padding = '8px'
    container.classList.add('tabulator-header-filter-container')
    const currentValue = column.getHeaderFilterValue() || { user: null }

    const inputLabel = document.createElement('p')
    inputLabel.innerText = t('tabulator.headerFilter.user')
    const input = document.createElement('input')
    input.placeholder = t('tabulator.headerFilter.userHint')
    input.value = currentValue.user?.text || ''

    const usersList = document.createElement('ul')
    const users: PortfolioUser[] = []
    const tenantId = router.currentRoute.value.params.tenantId as string

    input.addEventListener('keyup', () => {
      window.clearTimeout(debounce)
      debounce = window.setTimeout(async () => {
        usersList.innerHTML = ''
        users.length = 0
        const getUsers: HttpRequest = {
          method: 'get',
          url: `${apiUrls.tenantUsers.replace(
            /%tenantId/,
            tenantId
          )}?page=1&per_page=5&sort=["user___email"]&filter={"user___email__ilike":"%${input.value
            }%"}`,
          onSuccess: {
            callback: (response) => {
              users.push(...response.data.items)
              users.forEach((user) => {
                const item = document.createElement('li')
                item.innerText = user.user.email
                item.addEventListener('click', (event: Event) => {
                  const email = (event.target as HTMLElement)?.innerText
                  const selectedUser = users.find((u) => u.user.email === email)
                  const value = {
                    user: { user_id: selectedUser?.user.id, text: selectedUser?.user.email }
                  }
                  column.setHeaderFilterValue(value)
                })

                usersList.appendChild(item)
              })
            }
          }
        }
        await sendRequest(getUsers)
      }, 500)
    })

    const btnContainer = document.createElement('div')
    btnContainer.classList.add('actions-container')

    const clearButton = document.createElement('button')
    clearButton.innerText = t('misc.clear')
    clearButton.addEventListener('click', () => {
      column.setHeaderFilterValue('')
    })
    btnContainer.appendChild(clearButton)

    container.appendChild(inputLabel)
    container.appendChild(input)
    container.appendChild(usersList)
    container.appendChild(btnContainer)

    return container
  }

  const enumHeaderFilter = (e: Event, column: ColumnComponent) => {
    const container = document.createElement('div')
    container.classList.add('tabulator-header-filter-container')
    const columnDefinition: ColumnDefinition = column.getDefinition()
    const params: any = columnDefinition.headerFilterParams
    const filterList: any[] = params?.values
    const disableCase: any = params?.disableCase;
    const disableReplace = params?.disableReplace;
    let selected: any[] =  column.getHeaderFilterValue() || []
    const filterLabel = document.createElement('p')
    filterLabel.innerText = t('tabulator.headerFilter.filterBy').replace(/%title/, columnDefinition.title)

    const financialTypeList = document.createElement('ul')
    financialTypeList.style.maxHeight = '300px'
    financialTypeList.style.overflow = 'auto'
    filterList?.forEach((item) => {
      const listItem = document.createElement('li')
      listItem.classList.add('d-flex')
      listItem.classList.add('align-center')
      selected?.forEach((s) => {
        let itemText = disableCase ? item : item.toUpperCase()
        if (!disableReplace) itemText = itemText.replace(/ /g, '_')
        s === `"${itemText}"` && listItem.classList.add('selected')
      })

      listItem.setAttribute('data', JSON.stringify(item))

      const textNode = document.createTextNode(`${item}`)

      const check = document.createElement('span')
      check.classList.add('mdi')
      check.classList.add('mdi-check')
      check.style.fontSize = '24px'
      check.style.marginRight = '4px'

      // label.appendChild(input)
      listItem.appendChild(check)
      listItem.appendChild(textNode)

      listItem.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLLIElement
        const itemElement = target.closest('li')
        if (!itemElement) return
        let dataText: any = JSON.parse(itemElement.getAttribute('data') as string)
        if (!disableReplace) dataText = dataText.replace(/ /g, '_')
        const data: any = disableCase ? dataText : dataText?.toUpperCase()
        if (!itemElement.classList.contains('selected')) {
          itemElement.classList.add('selected')
          selected.push(`"${data}"`)
          return
        }
        itemElement.classList.remove('selected')
        selected = selected.filter(item => item !== `"${data}"`)
      })
      financialTypeList.appendChild(listItem)
    })

    const btnContainer = document.createElement('div')
    btnContainer.classList.add('actions-container')

    const clearButton = document.createElement('button')
    clearButton.innerText = t('misc.clear')
    clearButton.addEventListener('click', () => {
      column.setHeaderFilterValue(undefined)
    })
    btnContainer.appendChild(clearButton)

    const okButton = document.createElement('button')
    okButton.innerText = t('misc.confirm')
    okButton.classList.add('confirm')
    okButton.addEventListener('click', () => {
      if (!selected.length) {
        column.setHeaderFilterValue(undefined)
        return
      }
      column.setHeaderFilterValue(undefined)
      column.setHeaderFilterValue(selected)
    })
    
    btnContainer.appendChild(okButton)

    container.appendChild(filterLabel)
    container.appendChild(financialTypeList)
    container.appendChild(btnContainer)

    return container
  }

  const thresholdsHeaderFilter = (e: Event, column: ColumnComponent) => {
    const columnDefinition: ColumnDefinition = column.getDefinition()
    const params: any = columnDefinition.headerFilterParams
    const thresholds: ProjectKpiThreshold[] = params.thresholds
    const container = document.createElement('div')
    container.classList.add('tabulator-header-filter-container')

    const filterLabel = document.createElement('p')
    filterLabel.innerText = t('tabulator.headerFilter.thresholds')

    const thresholdsList = document.createElement('ul')
    const selected: ProjectKpiThreshold[] =
      column.getHeaderFilterValue()?.thresholds.map((id: number) => {
        const item = thresholds.find((threshold) => threshold.id === id)
        return item
      }) || []

    thresholds.forEach((item) => {
      const listItem = document.createElement('li')
      listItem.classList.add('d-flex')
      listItem.classList.add('align-center')
      if (selected.some((s) => s.id === item.id)) {
        listItem.classList.add('selected')
      }
      listItem.setAttribute('data', JSON.stringify(item))

      const textNode = document.createTextNode(`${item.value}`)

      const check = document.createElement('span')
      check.classList.add('mdi')
      check.classList.add('mdi-check')
      check.style.fontSize = '24px'
      check.style.marginRight = '4px'

      const circle = document.createElement('span')
      circle.classList.add('mdi')
      circle.classList.add('mdi-circle')
      circle.style.fontSize = '24px'
      circle.style.color = item.color === '#000000' ? '#d9d9d9' : item.color
      circle.style.marginRight = '4px'

      // label.appendChild(input)
      listItem.appendChild(check)
      listItem.appendChild(circle)
      listItem.appendChild(textNode)

      listItem.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLLIElement
        const itemElement = target.closest('li')
        if (!itemElement) return
        const data: ProjectKpiThreshold = JSON.parse(itemElement.getAttribute('data') as string)
        if (!itemElement.classList.contains('selected')) {
          itemElement.classList.add('selected')
          selected.push(data)
          return
        }
        itemElement.classList.remove('selected')
        const index = selected.findIndex((item) => item.id === data.id)
        if (index === -1) return
        selected.splice(index, 1)
      })

      thresholdsList.appendChild(listItem)
    })

    const btnContainer = document.createElement('div')
    btnContainer.classList.add('actions-container')

    const clearButton = document.createElement('button')
    clearButton.innerText = t('misc.clear')
    clearButton.addEventListener('click', () => {
      column.setHeaderFilterValue(undefined)
    })
    btnContainer.appendChild(clearButton)

    const okButton = document.createElement('button')
    okButton.innerText = t('misc.confirm')
    okButton.classList.add('confirm')
    okButton.addEventListener('click', () => {
      if (!selected.length) {
        column.setHeaderFilterValue(undefined)
        return
      }
      column.setHeaderFilterValue({
        thresholds: selected.map((item) => item.id)
      })
    })
    btnContainer.appendChild(okButton)

    container.appendChild(filterLabel)
    container.appendChild(thresholdsList)
    container.appendChild(btnContainer)

    return container
  }
  //create dummy header filter to allow popup to filter
  const emptyHeaderFilter = () => {
    return document.createElement('div')
  }
  // eslint-disable-next-line
  const getSwitch = () => {
    const container = document.createElement('div')

    const switchContainer = document.createElement('label')
    switchContainer.classList.add('cell-formatter-switch')

    const inputElement = document.createElement('input')
    inputElement.type = 'checkbox'
    inputElement.classList.add('cell-formatter-switch-input')

    const sliderElement = document.createElement('span')
    sliderElement.classList.add('cell-formatter-switch-slider')

    switchContainer.appendChild(inputElement)
    switchContainer.appendChild(sliderElement)

    container.appendChild(switchContainer)
  }
  const contextActionsFormatter = (cell: CellComponent) => {
    const span = document.createElement('span')
    span.classList.add('mdi')
    span.classList.add('mdi-dots-vertical')
    span.classList.add('tabulator-dots-action')
    const row = cell.getRow()
    row.getElement().addEventListener('mouseenter', () => {
      span.style.display = 'flex'
    })
    row.getElement().addEventListener('mouseleave', () => {
      span.style.display = 'none'
    })
    return span
  }

  return {
    tabulatorOptions,
    inputHeaderFilter,
    numberHeaderFilter,
    dateHeaderFilter,
    tenantUsersHeaderFilter,
    thresholdsHeaderFilter,
    emptyHeaderFilter,
    enumHeaderFilter,
    contextActionsFormatter
  }
}
