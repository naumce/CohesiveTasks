<script setup lang="ts">
import {ref, computed, reactive} from 'vue'
import KpisOverview from '../KpisOverview.vue'
import { useCustomizerStore } from '@/stores/customizer'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { ProjectKpi } from '@/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'remove','move'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const { loading } = storeToRefs(useLoaderStore())
const { project} = storeToRefs(useCustomizerStore())

const selected = reactive({
  kpi: {} as ProjectKpi
})
function onSelected(kpi: any) {
  selected.kpi = kpi
}
const orderedKpis = computed(() => {
  const kpis = JSON.parse(JSON.stringify(project.value?.kpis_in_card))
  return kpis
    .filter((kpi: ProjectKpi) => kpi.shown_in_card)
    .sort((a: ProjectKpi, b: ProjectKpi) => {
      return (a.order || 0) - (b.order || 0)
    })
})

function remove() {
  emit('remove', selected.kpi)
}
function move(direction: 'up' | 'down') {
  emit('move', direction)
}
function close() {
  emit('update:modelValue', false)
}
function unSelect() {
  selected.kpi = {} as ProjectKpi;
}
defineExpose({
  close,
  selected,
  unSelect,
})
</script>
<template>
  <v-dialog v-model="show" persistent width="1024">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="8">
            <span class="text-h5">
          {{ $t(`projectStatus.kpi.previewTitle`) }}
            </span>
          </v-col>
          <v-col class="d-flex justify-end">
            <v-btn
                icon
                :disabled="!selected || selected.kpi.order === orderedKpis[0].order"
                size="sm"
                class="rounded me-2"
                @click="move('up')"
            >
              <v-icon icon="mdi-arrow-up-bold" size="25px" color="#455A64"/>
            </v-btn>
            <v-btn
                icon
                :disabled="
                  !selected ||
                  selected.kpi.order === orderedKpis[orderedKpis.length - 1].order
                "
                size="sm"
                class="rounded me-2"
                @click="move('down')"
            >
              <v-icon icon="mdi-arrow-down-bold" size="25px" color="#455A64"/>
            </v-btn>
            <v-btn icon :disabled="!selected"  size="sm" class="rounded ml-1" @click="remove">
              <v-icon icon="mdi-trash-can" size="25px" color="#455A64"/>
            </v-btn>
          </v-col>
        </v-row>

      </v-card-title>
      <v-card-text>
        <v-container fluid>
          <KpisOverview :kpis="orderedKpis" selectable :activeKpi="selected.kpi" :chart-height="48" @selected="onSelected" />
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close" data-testid="close">
          {{ $t('misc.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
