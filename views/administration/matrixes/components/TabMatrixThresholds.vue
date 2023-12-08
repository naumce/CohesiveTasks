<script setup lang="ts">
import { ref } from 'vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import MatrixFact from './MatrixFact.vue'
import MatrixRiskScores from './MatrixRiskScores.vue'
import type { RiskMatrixRaw } from '@/types'

const props = defineProps({
  matrix: {
    type: Object as () => RiskMatrixRaw,
    default: () => {
      return {}
    }
  }
})

const emit = defineEmits(['change'])

const { loading } = storeToRefs(useLoaderStore())

const severitiesRef = ref()
const probabilitiesRef = ref()
const riskRef = ref()
</script>
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="6" lg="4">
        <v-row no-gutters>
          <v-col cols="12">
            <v-btn
              icon
              color="warning"
              size="xs"
              :title="$t('administration.matrixes.severities.new.title')"
              :disabled="loading"
              class="rounded mr-2"
              @click="severitiesRef.dialogs.new = true"
              data-testid="add-severity"
            >
              <v-icon icon="mdi-plus" />
            </v-btn>
            <strong>{{ $t('administration.matrixes.severities.title') }}</strong>
          </v-col>
          <v-col cols="12">
            <MatrixFact
              ref="severitiesRef"
              :value="props.matrix.severities"
              type="severities"
              :matrix-id="matrix.id"
              @change="emit('change')"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-row no-gutters>
          <v-col cols="12">
            <v-btn
              icon
              color="warning"
              size="xs"
              :title="$t('administration.matrixes.probabilities.new.title')"
              :disabled="loading"
              class="rounded mr-2"
              @click="probabilitiesRef.dialogs.new = true"
              data-testid="add-probability"
            >
              <v-icon icon="mdi-plus"/>
            </v-btn>
            <strong>{{ $t('administration.matrixes.probabilities.title') }}</strong>
          </v-col>
          <v-col cols="12">
            <MatrixFact
              ref="probabilitiesRef"
              :value="props.matrix.probabilities"
              type="probabilities"
              :matrix-id="matrix.id"
              @change="emit('change')"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-row no-gutters>
          <v-col cols="12">
            <v-btn
              icon
              color="warning"
              size="xs"
              :title="$t('administration.matrixes.risk.new.title')"
              :disabled="loading"
              class="rounded mr-2"
              @click="riskRef.dialogs.new = true"
              data-testid="add-risk"
            >
              <v-icon icon="mdi-plus" />
            </v-btn>
            <strong>{{ $t('administration.matrixes.risk.title') }}</strong>
          </v-col>
          <v-col cols="12">
            <MatrixRiskScores
              ref="riskRef"
              :matrix-id="matrix.id"
              :value="props.matrix.thresholds"
              @change="emit('change')"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
