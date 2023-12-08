<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { statusCardChartOptions } from './chart-options'
import dayjs from 'dayjs'
import { isoToStandardString } from '@/utils/date'
import type { ProjectKpi } from '@/types'

const props = defineProps({
  kpis: {
    type: Array as () => ProjectKpi[],
    required: true,
    default: () => []
  }
})

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const chartData = computed(() => {
  if (!props.kpis) return { labels: [], datasets: [] }

  const labels: string[] = []
  const datasets: any[] = JSON.parse(JSON.stringify(props.kpis))
    .sort((a: ProjectKpi, b: ProjectKpi) => {
      return (a.order || 0) - (b.order || 0)
    })
    .reduce((acc: any[], kpi: ProjectKpi) => {
      if (!kpi.values?.length) return acc
      const sortedKpiValues = [...(kpi.values || [])].sort(
        (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()
      )
      const values: number[] = []
      const colors: string[] = []

      sortedKpiValues.forEach((v) => {
        values.push(v.threshold.value)
        colors.push(v.threshold.color)
        labels.push(isoToStandardString(v.date))
      })
      acc.push({
        label: kpi.kpi.name,
        backgroundColor: 'transparent',
        borderColor: '#8A9DDC',
        pointBackgroundColor: colors,
        data: values,
        tension: 0.4
      })
      return acc
    }, [])
  labels.sort((a: string, b: string) => {
    return a.localeCompare(b)
  })
  const uniqueLabels = [...new Set(labels)]
  return { labels: uniqueLabels, datasets }
})
</script>
<template>
  <Line
    :data="chartData"
    :options="statusCardChartOptions"
    chartId="kpis-chart"
  />
</template>
