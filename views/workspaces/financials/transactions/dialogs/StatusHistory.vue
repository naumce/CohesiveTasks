<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiUrls } from '@/plugins/axios'
import { useI18n } from 'vue-i18n'
import {
    TabulatorFull as Tabulator,
    type Options,
} from 'tabulator-tables'
import useTabulatorOptions from '@/composables/tabulator'
import type { CellComponent, ColumnDefinition } from 'tabulator-tables'
import { TransactionsStatusObject } from '../constants'
import type { Transactions } from '@/types'
import {togglePagination} from "@/utils/pagination";

const props = defineProps({
    transaction: {
        type: Object,
        required: true,
        default: () => {
            return {}
        }
    }
})
const emit = defineEmits(['close'])

const { t } = useI18n()
const columns: Array<ColumnDefinition> = [
    {
        field: 'updated_at',
        title: t('workspaces.financials.transactions.updatedAt'),
        hozAlign: 'left',
        headerHozAlign: 'left',
        width: 200
    },
    {
        field: 'updated_by',
        title: t('workspaces.financials.transactions.updatedBy'),
        headerSort: false,
        hozAlign: 'left',
        headerHozAlign: 'left',
        width: 350
    },
    {
        field: 'status',
        title: t('workspaces.financials.transactions.status'),
        headerSort: false,
        hozAlign: 'left',
        headerHozAlign: 'left',
        width: 170,
        formatter: (cell: CellComponent) => {
            const value = cell.getValue()
            const span = document.createElement('span')
            const data = cell.getData() as Transactions
            const status = TransactionsStatusObject[data.status]?.text.toUpperCase()
            span.style.color = status === 'REJECTED' ? 'red' : (status === 'PENDING' ? 'orange' : (status === 'APPROVED' ? 'green' : (status === 'DISCARDED' ? 'gray' : '')))
            span.innerText = value && TransactionsStatusObject[data.status]?.text
            return span
        },
    },
    {
        field: 'comment',
        title: t('workspaces.financials.transactions.comment'),
        headerSort: false,
        hozAlign: 'left',
        minWidth: 150,
        headerHozAlign: 'left'
    },
    {
        field: 'value',
        title: t('workspaces.financials.transactions.amount'),
        headerSort: false,
        hozAlign: 'left',
        headerHozAlign: 'left',
        width: 100
    },
    {
        field: 'effective_date',
        title: t('workspaces.financials.transactions.effectiveDate'),
        headerSort: false,
        hozAlign: 'left',
        headerHozAlign: 'left',
        minWidth: 180
    }
]


const route = useRoute()
const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`
const table = ref()
const tabulator = ref()
const ajaxUrl = `${apiUrls.transactions
    .replace(/%tenantId/, tenantId)
    .replace(/%projectId/, projectId)}${props.transaction.id}/history/`

const { tabulatorOptions } = useTabulatorOptions()
const tableDefinition: Options = {
    columns: columns,
    ajaxURL: ajaxUrl,
    ...tabulatorOptions,
    height:'auto',
    initialSort:[
        {column:"updated_at", dir:"desc"}, //sort by this first
    ],
    ajaxResponse: (url: string, params: any, response: any) => {
        const totalElements = response.data?.total || 0
        const addition = totalElements % params.per_page > 0 ? 1 : 0
        const lastPage = Math.floor(totalElements / params.per_page) + addition
        togglePagination(totalElements);
      const retObj = {
            contentType: 'application/json; charset=utf-8',
            data: response.data.items.map((item: any) => ({
                ...item,
                updated_by: item.updated_by.name
            })),
            last_page: lastPage
        }
        return retObj
    }
}

function close() {
    emit('close')
}

onMounted(() => {
    tabulator.value = new Tabulator(table.value, tableDefinition)
})

</script>
<template>
    <div class="pa-8">
        <v-row class="d-flex justify-space-between">
            <span class="pl-5">{{ $t(`workspaces.financials.transactions.transaction`) }} <span class="text-blue">{{
                props.transaction.custom_id }}</span></span>
            <v-btn density="compact" class="mt-n6" @click="close()" icon="mdi-close"></v-btn>
        </v-row>
        <div ref="table" class="mt-5" width="50%" />
    </div>
</template>