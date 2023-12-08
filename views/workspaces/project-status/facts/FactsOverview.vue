<script setup lang="ts">
import { ref, computed } from 'vue'
import { getFactValue } from '@/utils/facts'
import type { ProjectFact } from '@/types'

const props = defineProps({
  selectable: {
    type: Boolean
  },
  facts: {
    type: Array as () => ProjectFact[],
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['selected'])

const orderedProjectFacts = computed(() => {
  return JSON.parse(JSON.stringify(props.facts)).sort((a: ProjectFact, b: ProjectFact) => {
    return a.order - b.order
  })
})
const selectedFact = ref<ProjectFact>()
function selectFact(fact: ProjectFact) {
  if (selectedFact.value === fact) return
  selectedFact.value = fact
  emit('selected', fact)
}
</script>
<template>
  <v-container fluid>
    <v-row class="pa-1">
      <v-col
        cols="12"
        xs="5"
        sm="4"
        md="3"
        lg="4"
        xl="2"
        v-for="(item, index) in orderedProjectFacts"
        :key="index"
        class="pa-0 mr-0 mb-4"
      >
        <v-card
          variant="flat"
          v-on="props.selectable ? { click: () => selectFact(item) } : {}"
          :class="`h-100 pa-1 mr-1 ${selectedFact?.fact?.id === item.fact.id ? 'default-active' : ''}`"
        >
          <v-card-text class="py-1 px-2">
            <p class="font-weight-lighter section-desc" data-testid="fact-name">{{ item.fact.name }}</p>
             <h5 class="font-weight-medium section-subtitle">{{ getFactValue(item) }}</h5>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped lang="scss">

</style>
