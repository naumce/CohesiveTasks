<script setup lang="ts">
import { ref, computed } from 'vue'
import FactsOverview from '../FactsOverview.vue'
import useApis from '@/composables/api'
import { useRoute } from 'vue-router'
import { apiUrls } from '@/plugins/axios'
import { useCustomizerStore } from '@/stores/customizer'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { HttpRequest, ProjectFact } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const { loading } = storeToRefs(useLoaderStore())

const route = useRoute()
const { project } = storeToRefs(useCustomizerStore())
const facts = ref<ProjectFact[]>(
  JSON.parse(JSON.stringify(project.value?.tenant_level_facts_in_card))
)

const tenantId = `${route.params.tenantId}`
const projectId = `${route.params.projectId}`
// const factId = `${props.fact.fact.id}`

const { sendRequest } = useApis()
function submit() {
  const url = `${apiUrls.factsOrder
    .replace(/%tenantId/, tenantId)
    .replace(/%projectId/, projectId)}`

  const data = facts.value.map((fact: ProjectFact) => ({
    order: fact.order,
    shown_in_card: fact.shown_in_card,
    tenant_fact_id: fact.fact.id
  }))
  const orderFacts: HttpRequest = {
    method: 'patch',
    url: url,
    data: data,
    onSuccess: {
      callback: () => {
        emit('submit', facts.value)
      }
    }
  }
  sendRequest(orderFacts)
}

const selectedFact = ref<ProjectFact>()
function onSelected(fact: ProjectFact) {
  selectedFact.value = fact
}
const orderedFacts = computed(() => {
  return JSON.parse(JSON.stringify(facts.value))
    .filter((fact: ProjectFact) => fact.shown_in_card)
    .sort((a: ProjectFact, b: ProjectFact) => {
      return a.order - b.order
    })
})
function move(direction: 'up' | 'down') {
  if (!selectedFact.value) return
  const sortedFacts = JSON.parse(JSON.stringify(facts.value)).sort(
    (a: ProjectFact, b: ProjectFact) => {
      return a.order - b.order
    }
  )
  if (direction === 'up' && selectedFact.value.order === sortedFacts[0].order) return
  if (
    direction === 'down' &&
    selectedFact.value.order === sortedFacts[sortedFacts.length - 1].order
  )
    return
  const index = sortedFacts.findIndex(
    (fact: ProjectFact) => fact.order === selectedFact.value?.order
  )
  const nextIndex = direction === 'up' ? index - 1 : index + 1
  sortedFacts[index].order = sortedFacts[nextIndex].order
  sortedFacts[nextIndex].order = selectedFact.value.order
  selectedFact.value.order = sortedFacts[index].order
  facts.value = sortedFacts
}
function remove() {
  const index = facts.value.findIndex((fact) => fact.fact.id === selectedFact.value?.fact.id)
  if (index === -1) return
  facts.value[index].shown_in_card = false
  selectedFact.value = undefined
}
function close() {
  emit('update:modelValue', false)
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent width="700">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="8">
            <span class="text-h5">
          {{ $t(`projectStatus.facts.previewTitle`) }}
            </span>
          </v-col>
          <v-col cols="4" class="d-flex justify-end mb-2">
            <v-btn
                icon
                :disabled="!selectedFact || selectedFact.order === orderedFacts[0].order"
                size="sm"
                class="rounded me-2"
                @click="move('up')"
            >
              <v-icon icon="mdi-arrow-up-bold" size="25px" color="#455A64"/>
            </v-btn>
            <v-btn
                icon
                :disabled="
                  !selectedFact ||
                  selectedFact.order === orderedFacts[orderedFacts.length - 1].order
                "
                size="sm"
                class="rounded me-2"
                @click="move('down')"
            >
              <v-icon icon="mdi-arrow-down-bold" size="25px"  color="#455A64"/>
            </v-btn>
            <v-btn icon :disabled="!selectedFact" size="sm" class="rounded" @click="remove">
              <v-icon icon="mdi-trash-can" size="25px" color="#455A64"/>
            </v-btn>
          </v-col>
        </v-row>

      </v-card-title>
      <v-card-text>
        <v-container fluid>
          <FactsOverview :facts="orderedFacts" selectable @selected="onSelected" />
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn :disabled="loading" class="primary-action-btn" @click="submit">
          {{ $t('misc.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
