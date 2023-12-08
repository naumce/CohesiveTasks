<script lang="ts" setup>
import { ref, computed } from 'vue'
import { thousandSeparatedFormat } from '@/utils/number'
import dayjs from 'dayjs'
import { isoToStandardString } from '@/utils/date'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import {kpisCardSparkLineOptions} from './chart-options'
import type { ProjectKpi, ProjectKpiValue } from '@/types'
import type {ContextProxy} from "chart.js/helpers";

const props = defineProps({
  selectable: {
    type: Boolean
  },
  kpis: {
    type: Array as () => ProjectKpi[],
    required: true,
    default: () => []
  },
  chartHeight: {
    type: Number,
    default: 60
  },
  activeKpi: {
    type: Object as () => ProjectKpi
  }
})

const emit = defineEmits(['selected'])

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip)

function getValues(kpiValues: ProjectKpiValue[]) {
  const values = {
    value: 0,
    date: '-',
    trend: '',
    color: '',
    comment: ''
  }
  const [second, latest] = [kpiValues[1], kpiValues[kpiValues.length - 1]];
  if (!latest) return values

  const getTrend = (latest: ProjectKpiValue, second: ProjectKpiValue) => {
    if (latest.threshold.value > second.threshold.value) return 'success'
    if (latest.threshold.value < second.threshold.value) return 'danger'
    return 'warning'
  }
  values.value = latest.threshold.value
  values.color = latest.threshold.color
  values.date = isoToStandardString(latest.date)
  values.comment = latest.comment
  if (second) {
    values.trend = getTrend(latest, second)
  }
  return values
}
function getGradient(ctx:any, chartArea:any, chart:any,colors:any) {
  let gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  const getColorStop = (val:any, max:any) => (val / max);

    const {
      scales: {
        y: {
          max
        }
      }
    } = chart;


    colors.forEach((color:any) => {
      if (color.value > max) {
        color.value = max;
      }
      gradient.addColorStop(getColorStop(color.value, max), color.color);
    });
  return gradient;
}

const orderedProjectKpis = computed(() => {
  if (!props.kpis) return []
  return JSON.parse(JSON.stringify(props.kpis))
      .sort((a: ProjectKpi, b: ProjectKpi) => {
        return (a.order || 0) - (b.order || 0)
      })
      .map((kpi: ProjectKpi) => {
        const sortedKpiValues = [...(kpi.values || [])].sort(
            (a: ProjectKpiValue, b: ProjectKpiValue) => dayjs(a.date).unix() - dayjs(b.date).unix()
        ).slice(-12)
        const values: number[] = []
        const colors: string[] = []
        const colorsWithValues: object[] = []
        const labels: string[] = []

        sortedKpiValues.forEach((v: ProjectKpiValue) => {
            values.push(v.threshold.value)
            colors.push(v.threshold.color)
            colorsWithValues.push({color: v.threshold.color, value: v.threshold.value})
            labels.push(isoToStandardString(v.date))

        })

        const returnObj = {
          ...kpi,
          orderedValues: getValues(sortedKpiValues),
          chartData: {
            labels,
            datasets: [
              {
                label: kpi.kpi.name,
                backgroundColor: colors,
                borderColor:  function(context:ContextProxy) {
                  const chart = context.chart;
                  const { ctx, chartArea } = chart;
                  if (!chartArea) {
                    return null;
                  }
                  return getGradient(ctx, chartArea, chart,colorsWithValues);
                },
                pointBackgroundColor: colors,
                data: values,
              }
            ]
          }
        }
        return returnObj
      })
})
function  selectKpi(kpi:any){
  if(!props.selectable) return;
  emit('selected',kpi);
}
</script>
<template>
  <v-container fluid>
    <v-row class="pa-1 kpis-container">
        <v-card  v-for="item in orderedProjectKpis"
                 :key="item.id" :class="`overflow-hidden kpi-card pa-4 ${props.activeKpi?.id === item.id ? 'active' : ''}`"
                  @click="selectKpi(item)">
            <div class="d-flex align-center w-100">
              <v-chip
                  variant="elevated"
                  :color="item.orderedValues.color"
                  class="score-status-chip"
              >
               <p class="text-white ma-auto">{{ thousandSeparatedFormat(item.orderedValues.value) }}</p>
              </v-chip>
              <div class="mx-4 overflow-hidden">
                <p class="font-weight-bold kpi-name" :title="item?.kpi?.name"  data-testid="preview-kpi-name">{{item?.kpi?.name}}</p>
                <p class="kpi-date" >{{item.orderedValues.date}}</p>
              </div>
            </div>
            <v-row class="mt-1 align-center px-4 mt-2">
                  <Line
                      type="line"
                      :chartId="`status-chart-${item.id}`"
                      :data="item.chartData"
                      :height="props.chartHeight"
                      :options="{...kpisCardSparkLineOptions,
                      scales: {
                        x: {
                          display:false,
                        },
                        y: {
                          display:false,
                        }
                      }}"
                  />
            </v-row>
        </v-card>
    </v-row>
  </v-container>
</template>
<style scoped lang="scss">

.kpis-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap:15px;
}

.kpi-card {
  background-color: #F3FAFE !important;
  box-shadow: none;
  outline: none;
  min-height: 140px;
  border-radius: 5px;
  &.active {
    background-color: #e7ecef !important;
  }
  p {
    color:#455A64;
    font-size: 14px;
  }
  .kpi-date {
    font-size: 12px;
  }
  .kpi-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 1;
  }
}

</style>