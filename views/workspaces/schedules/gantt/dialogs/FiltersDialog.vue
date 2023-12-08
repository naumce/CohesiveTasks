<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import WbsItem from './WbsItem.vue'
import ActivityCodesList from './ActivityCodesList.vue'
import type {
  ProjectWbs,
  GanttSchedulesAdvancedFilters,
  GanttSchedulesActivityCodeFilter
} from '@/types'
import type { DisableDates } from '@/types/schedules'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  projects: {
    type: Array<ProjectWbs>,
    required: true,
    default: () => []
  },
  projectDefinitions: {
    type: Array<any>
  },
  disableStartDate: {
    type: Object as () => DisableDates
  },
  disableEndDate: {
    type: Object as () => DisableDates
  },
  quickFilters: {
    type: Array<GanttSchedulesActivityCodeFilter>,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const { loading } = storeToRefs(useLoaderStore())

function close() {
  emit('update:modelValue', false)
}

const filters: GanttSchedulesAdvancedFilters = reactive({
  general: {
    startDate: '',
    endDate: '',
    status: [],
    hideIfEmpty: true,
    show
  },
  wbs: [],
  activityCodes: [...props.quickFilters]
})
watch(
  () => props.quickFilters,
  (newVal) => {
    filters.activityCodes = [...newVal]
  },
  { deep: true }
)

interface TaskMapValue {
  text: string
  children: Map<string, TaskMapValue>
}
const tab = ref()
const wbsTree = ref<Map<string, TaskMapValue>>(new Map())

watch(tab, (newVal) => {
  if (newVal !== 'wbs') return
  if (wbsTree.value.size) return
  wbsTree.value = createWbsTree(props.projects)
})

const wbsArray = ref<any[]>([])

const getArrayFromMap = (tree: Map<string, TaskMapValue>): any[] => {
  if (!tree.size) return []
  return Array.from(tree, ([key, value]) => {
    return {
      id: key,
      ...value,
      children: getArrayFromMap(value.children),
      selected: !filters.wbs.includes(key)
    }
  })
}
watch(
  wbsTree,
  (newVal) => {
    wbsArray.value = getArrayFromMap(newVal)
  },
  { deep: true }
)

function createWbsTree(projects: ProjectWbs[]) {
  const root = new Map<string, TaskMapValue>()
  const outOfSort: any[] = []
  projects.forEach((project) => {
    root.set(project.id, {
      text: project.text,
      children: new Map<string, TaskMapValue>()
    })
    for (let i = 0; i < project.children.length; i++) {
      const task = project.children[i]

      const findParent = (
        parentId: string,
        tree: Map<string, TaskMapValue>
      ): TaskMapValue | undefined => {
        const parent = tree.get(parentId)
        if (parent) return parent

        for (const [, value] of tree) {
          const parent = findParent(parentId, value.children)
          if (parent) return parent
        }
      }

      const parent = findParent(task.parentId, root)
      if (!parent) {
        outOfSort.push(task)
        continue
      }
      parent.children.set(task.id, {
        text: task.text,
        children: new Map()
      })
    }
  })
  if (outOfSort.length) {
    console.warn('TASKS OUT OF SORT: ', outOfSort)
  }
  return root
}

const onSubmit = () => {
  emit('submit', JSON.parse(JSON.stringify(filters)))
}
const getChildrenIds = (item: any, children: string[] = []) => {
  item.children.forEach((child: any) => {
    children.push(child.id)
    if (!child.children.length) return
    getChildrenIds(child, children)
  })
  return children
}
const onWbsChange = (item: any) => {
  const children = getChildrenIds(item)
  if (item.selected) {
    filters.wbs = filters.wbs.filter((id) => ![item.id, ...children].includes(id))
  } else {
    filters.wbs.push(item.id, ...children)
  }
  wbsArray.value = getArrayFromMap(wbsTree.value)
}

const onActivityCodeFilterApplied = (item: any) => {
  if (item.selected) {
    filters.activityCodes.push(item)
    return
  }
  const index = filters.activityCodes.findIndex(
    (f) =>
      f.project_version_id === item.project_version_id &&
      f.activity_code_id === item.activity_code_id &&
      f.value_id === item.value_id
  )
  if (index === -1) return

  filters.activityCodes.splice(index, 1)
}

defineExpose({
  close,
  filters
})
</script>
<template>
  <v-dialog v-model="show" persistent width="700" max-height="80vh">
    <v-card>
      <v-card-title>
        {{ $t('misc.filters') }}
      </v-card-title>
      <v-tabs v-model="tab">
        <v-tab value="general" class="text-none text-subtitle-1">
          {{ $t('workspaces.schedules.gantt.filters.tabs.one') }}
        </v-tab>
        <v-tab value="wbs" class="text-none text-subtitle-1">
          {{ $t('workspaces.schedules.gantt.filters.tabs.two') }}
        </v-tab>
        <v-tab value="activityCodes" class="text-none text-subtitle-1">
          {{ $t('workspaces.schedules.gantt.filters.tabs.three') }}
        </v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="general">
            <v-container fluid class="pa-0">
              <v-row class="mt-1">
                <v-col cols="12" sm="6">
                  <v-text-field
                    variant="outlined"
                    v-model="filters.general.startDate"
                    :label="$t('misc.startDate')"
                    type="date"
                    hide-details
                    :min="disableStartDate?.min"
                    :max="disableStartDate?.max"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    variant="outlined"
                    v-model="filters.general.endDate"
                    :label="$t('misc.endDate')"
                    :min="disableEndDate?.min"
                    :max="disableEndDate?.max"
                    type="date"
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <span>{{ $t('workspaces.schedules.gantt.filters.status') }}</span>
                  <v-item-group
                    v-model="filters.general.status"
                    multiple
                    selected-class="bg-primary"
                  >
                    <v-item v-slot="{ isSelected, toggle }" value="NOT_STARTED">
                      <v-chip :color="isSelected ? 'primary' : ''" class="mr-1" @click="toggle">
                        {{ $t('PhaseStatus.NOT_STARTED') }}
                      </v-chip>
                    </v-item>
                    <v-item v-slot="{ isSelected, toggle }" value="IN_PROGRESS">
                      <v-chip :color="isSelected ? 'primary' : ''" class="mr-1" @click="toggle">
                        {{ $t('PhaseStatus.IN_PROGRESS') }}
                      </v-chip>
                    </v-item>
                    <v-item v-slot="{ isSelected, toggle }" value="COMPLETED">
                      <v-chip :color="isSelected ? 'primary' : ''" @click="toggle">
                        {{ $t('PhaseStatus.COMPLETED') }}
                      </v-chip>
                    </v-item>
                  </v-item-group>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <v-window-item value="wbs">
            <v-container fluid class="pa-0">
              <v-row>
                <v-col cols="12">
                  <v-list>
                    <template v-for="item in wbsArray" :key="item.id">
                      <v-list-group v-if="item.children.length">
                        <template v-slot:activator="{ props }">
                          <v-list-item v-bind="props" density="compact">
                            <template v-slot:prepend>
                              <v-checkbox-btn
                                v-model="item.selected"
                                color="primary"
                                hide-details
                                @click.stop
                                @update:model-value="onWbsChange(item)"
                              />
                            </template>
                            <span>{{ item.text }}</span>
                          </v-list-item>
                        </template>
                        <WbsItem
                          v-for="child in item.children"
                          :key="child.id"
                          :item="child"
                          @change="onWbsChange"
                        />
                      </v-list-group>
                      <v-list-item v-else density="compact">
                        <template v-slot:prepend>
                          <v-checkbox-btn
                            v-model="item.selected"
                            color="primary"
                            hide-details
                            @click.stop
                            @update:model-value="onWbsChange(item)"
                          />
                        </template>
                        <span>{{ item.text }}</span>
                      </v-list-item>
                    </template>
                  </v-list>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <v-window-item value="activityCodes">
            <ActivityCodesList
              :projects="props.projectDefinitions"
              :filters="filters.activityCodes"
              @change="onActivityCodeFilterApplied"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-card-actions class="d-flex justify-space-between">
        <div class="flex d-flex align-center">
          <v-checkbox-btn v-model="filters.general.hideIfEmpty" />
          <span title="Hide if empty">Hide if empty</span>
        </div>
        <div class="flex">
          <v-btn
            :disabled="loading"
            class="primary-negative-btn"
            @click="emit('update:modelValue', false)"
            data-testid="cancel"
          >
            {{ $t('misc.cancel') }}
          </v-btn>
          <v-btn
            :disabled="loading"
            class="primary-action-btn"
            @click="onSubmit"
            data-testid="confirm"
          >
            {{ $t('misc.confirm') }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
