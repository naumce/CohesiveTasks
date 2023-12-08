<script setup lang="ts">
import { moveItemInArray } from '@/utils/array'
import type { ActivityCode, SelectedVersion } from '@/types'
import { ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array<SelectedVersion>,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['change'])
const selectedSchedules = ref<SelectedVersion[]>(JSON.parse(JSON.stringify(props.data)))
watch(
  () => props.data,
  (newVal) => {
    selectedSchedules.value = JSON.parse(JSON.stringify(newVal))
  },
  { deep: true }
)

const moveSchedule = (index: number, direction: 'up' | 'down') => {
  moveItemInArray(selectedSchedules.value, direction, index)
  emit('change', selectedSchedules.value)
}

const toggleSelect = () => {
  emit(
    'change',
    selectedSchedules.value.filter((schedule) => schedule.selected)
  )
}
const toggleActivityCodeSelect = (activityCode: ActivityCode) => {
  if (activityCode.selected) { 
    emit('change', selectedSchedules.value)
    return
  }
  activityCode.quick_filters = false
  emit('change', selectedSchedules.value)
}
const toggleQuickFilter = () => {
  emit('change', selectedSchedules.value)
}
</script>
<template>
  <v-container fluid class="pa-0">
    <v-list density="compact">
      <template v-for="(schedule, index) in selectedSchedules" :key="schedule.id">
        <v-list-group v-if="schedule?.activity_codes?.length">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props">
              <template v-slot:prepend>
                <v-list-item-action start>
                  <v-checkbox-btn
                    v-model="schedule.selected"
                    @click.stop
                    @update:model-value="toggleSelect"
                  />
                </v-list-item-action>
              </template>
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <div v-bind="props" class="w-100 d-flex align-center justify-space-between">
                    <span>{{ schedule.label }}</span>
                    <div
                      class="d-flex align-center justify-center"
                      :style="{ visibility: isHovering ? 'visible' : 'hidden' }"
                    >
                      <v-btn
                        icon
                        flat
                        :disabled="index === 0"
                        @click.stop="moveSchedule(index, 'up')"
                      >
                        <v-icon icon="mdi-arrow-up-bold" />
                      </v-btn>
                      <v-btn
                        icon
                        flat
                        :disabled="index === selectedSchedules.length - 1"
                        @click.stop="moveSchedule(index, 'down')"
                      >
                        <v-icon icon="mdi-arrow-down-bold" />
                      </v-btn>
                    </div>
                  </div>
                </template>
              </v-hover>
            </v-list-item>
          </template>
          <v-list-item>
            <div class="d-flex justify-space-between">
              <small>{{ $t('misc.activityCodes') }}</small>
              <small>{{ $t('misc.quickFilters') }}</small>
            </div>
          </v-list-item>
          <v-list-item v-for="activityCode in schedule.activity_codes" :key="activityCode.id">
            <template v-slot:prepend>
              <v-list-item-action start>
                <v-checkbox-btn
                  v-model="activityCode.selected"
                  @update:model-value="toggleActivityCodeSelect(activityCode)"
                />
              </v-list-item-action>
            </template>
            <v-container fluid class="d-flex pa-0">
              <v-row class="py-0 align-center">
                <v-col cols="6" class="py-0">
                  <span>{{ activityCode.name }}</span>
                </v-col>
                <v-col cols="6" class="py-0 d-flex justify-end">
                  <v-switch
                    v-model="activityCode.quick_filters"
                    color="secondary"
                    hide-details
                    class="flex-grow-0 me-4"
                    @update:model-value="toggleQuickFilter"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-list-item>
        </v-list-group>
        <v-list-item v-else>
          <template v-slot:prepend>
            <v-list-item-action start>
              <v-checkbox-btn v-model="schedule.selected" @update:model-value="toggleSelect" />
            </v-list-item-action>
          </template>
          <v-hover>
            <template v-slot:default="{ isHovering, props }">
              <div v-bind="props" class="w-100 d-flex align-center justify-space-between">
                <span>{{ schedule.label }}</span>
                <div :style="{ visibility: isHovering ? 'visible' : 'hidden' }">
                  <v-btn icon flat :disabled="index === 0" @click.stop="moveSchedule(index, 'up')">
                    <v-icon icon="mdi-arrow-up-bold" />
                  </v-btn>
                  <v-btn
                    icon
                    flat
                    :disabled="index === selectedSchedules.length - 1"
                    @click.stop="moveSchedule(index, 'down')"
                  >
                    <v-icon icon="mdi-arrow-down-bold" />
                  </v-btn>
                </div>
              </div>
            </template>
          </v-hover>
          <template v-slot:append>
            <div style="width: 56px" />
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-container>
</template>
