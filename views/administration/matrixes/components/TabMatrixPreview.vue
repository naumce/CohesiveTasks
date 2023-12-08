<script setup lang="ts">
import type { RiskMatrixRaw, MatrixParameter } from '@/types'
const props = defineProps({
  matrix: {
    type: Object as () => RiskMatrixRaw,
    default: () => {
      return {}
    }
  }
})

const sortedProbabilities = JSON.parse(JSON.stringify(props.matrix.probabilities)).sort(
  (a: MatrixParameter, b: MatrixParameter) => {
    return b.score - a.score
  }
)

const sortedSevereties = JSON.parse(JSON.stringify(props.matrix.severities)).sort(
  (a: MatrixParameter, b: MatrixParameter) => {
    return a.score - b.score
  }
)

const sortedThresholds = JSON.parse(JSON.stringify(props.matrix.thresholds)).sort(
  (a: any, b: any) => {
    return a.high - b.high
  }
)

const getColor = (score: number) => {
  let color = 'grey'
  if (!sortedThresholds?.length) return color
  for (const threshold of sortedThresholds) {
    if (score > threshold.high) color = threshold.color
  }
  if (color === '#ffffff') return 'grey'
  return color
}
</script>
<template>
  <v-container fluid>
    <v-table style="background-color: transparent">
      <tbody>
        <tr v-for="probability in sortedProbabilities" :key="probability.id">
          <td v-for="severity in sortedSevereties" :key="severity.id" style="min-width: 115px">
            <v-btn
              block
              variant="elevated"
              size="large"
              :color="getColor(probability.score * severity.score)"
              rounded="lg"
            >
              {{ probability.score * severity.score }}
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>
