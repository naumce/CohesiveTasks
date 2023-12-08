<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { GanttSchedulesActivityCodeFilter } from '@/types'

const props = defineProps({
  projects: {
    type: Array<any>,
    required: true,
    default: () => []
  },
  filters: {
    type: Array<GanttSchedulesActivityCodeFilter>,
    required: true,
    default: () => []
  },
  quickFilters: {
    type: Boolean
  },
  gantFilters: {
    type: Boolean
  },
  showProjects: {
    default: true,
    type: Boolean
  }
})

const emit = defineEmits(['change', 'more'])
const projectFilters = ref<any[]>(JSON.parse(JSON.stringify(props.projects)))

watchEffect(() => {
  const projectsCopy = JSON.parse(JSON.stringify(props.projects))
  if (props.quickFilters) {
    projectsCopy.forEach((project: any) => {
      project.filters = project.filters.filter((filter: any) => filter.quick_filter)
    })
  }
  projectFilters.value = projectsCopy
    .filter((project: any) => project.filters?.length)
    .map((project: any) => ({
      ...project,
      filters: project.filters.map((filter: any) => ({
        ...filter,
        values: filter.values.map((value: any) => ({
          ...value,
          selected: props.filters.some(
            (f) =>
              f.project_version_id === project.project_version_id &&
              f.activity_code_id === filter.unique_id &&
              f.value_id === value.unique_id
          )
        }))
      }))
    }))
})

const onChange = (filter: GanttSchedulesActivityCodeFilter) => {
  emit('change', filter)
}
</script>
<template>
  <v-list>
    <v-list-item v-if="$props.quickFilters">
      <v-btn size="xs" color="secondary" class="text-none text-subtitle-1 px-1" @click.stop="emit('more')">
        {{ $t('misc.advanced') }}
      </v-btn>
    </v-list-item>
    <template v-if="showProjects">
      <v-list-group v-for="(project, mainIndex) in projectFilters" :key="project.project_version_id"
        :value="project.project_version_id">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" @click.stop>
            <v-list-item-title :class="gantFilters ? 'text14px' : ''">{{ `${project.project_object.task.text}
                          v${project.project_version}` }}</v-list-item-title></v-list-item>
        </template>
        <v-list-group v-for="(filter, index) in project.filters" :key="index + filter.name"
          :value="filter.name + 'index' + mainIndex">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" @click.stop><v-list-item-title :class="gantFilters ? 'text14px' : ''">{{ filter.name
            }}</v-list-item-title></v-list-item>
          </template>
          <v-list-item :class="gantFilters ? 'text14px' : ''" class="filter-height" v-for="(value, index) in filter.values"
            :key="value.unique_id + index + 'value'">
            <div class="d-flex align-center">
              <v-checkbox-btn density="compact" v-model="value.selected" color="primary" @click.stop @update:model-value="
                onChange({
                  selected: value.selected,
                  project_version_id: project.project_version_id,
                  activity_code_id: filter.unique_id,
                  value_id: value.unique_id
                })
                " />
              <span :title="value.description">{{ value.description }}</span>
            </div>
          </v-list-item>
        </v-list-group>
      </v-list-group>
    </template>
  </v-list>
</template>

<style scoped lang="scss">
.text14px {
  font-size: 14px;
}
.filter-height {
  min-height: 40px;
}
</style>
