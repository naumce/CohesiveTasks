<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import useApis from '@/composables/api'
import router from '@/router'
import { useRoute } from 'vue-router'
import { useCustomizerStore } from '@/stores/customizer'
import { apiUrls } from '@/plugins/axios'
import type { HttpRequest, ViewRaw, ViewRawV2, SelectedVersion, SchedulesGroup } from '@/types'
import { useI18n } from 'vue-i18n'
import SchedulesTables from './SchedulesTables.vue'
import AssigneScheduleModal from './dialogs/AssigneScheduleModal.vue'
import ManageGroupUsers from '../management/dialogs/ManageGroupUsers.vue'
const { t } = useI18n()

const { sendRequest } = useApis()
const route = useRoute()
const selectedGroup = ref<SchedulesGroup>()
const scheduleView = ref<ViewRawV2>()
const selectedUploads = ref<any[]>([])
const workspaceId = route.params.workspaceId as string
const tenantId = route.params.tenantId as string
const activeTab = ref('0')
const schedulesTables = ref()
const getSchedules = ref<any[]>([])
const dialogs = reactive({
  assigne: false
})

const { schedulesSelectedGroup, setScheduleViewTable } = useCustomizerStore()

interface ProjectsPost {
  [key: string]: number
}

const openDialogAddUser = ref(false)
const openAssigneScheduleModal = () => {
  dialogs.assigne = true
}
const globalSchedules = ref<any>([])

onMounted(() => {
  setScheduleViewTable([])
  getGlobalSchedules()
  //   loadView(schedulesSelectedGroup)
  console.log('setScheduleViewTable', setScheduleViewTable)
  loadViewV2(schedulesSelectedGroup)
})

const closeAssigneSchedulesModal = (closeAssigne: boolean) => {
  dialogs.assigne = closeAssigne
}

const getGlobalSchedules = () => {
  const getSchedules: HttpRequest = {
    method: 'get',
    url: apiUrls.schedulesVersionsV2.replace(/%workspaceId/, workspaceId),
    onSuccess: {
      callback: async (response) => {
        globalSchedules.value = response.data as any
        console.log('globalSchedules.value', globalSchedules.value)
      }
    }
  }
  sendRequest(getSchedules)
}
const getLatestProjects = (view: ViewRaw) => {
  console.log('data', view)

  return view.latest_projects.map((project) => {
    const latestProject = project.project.project_versions?.length
      ? project.project.project_versions.sort((a, b) => b.version_id - a.version_id)[0]
      : null
    return {
      id: project.project.id,
      name: project.project.name,
      label: `${project.project.name} (${t('misc.latest').toLowerCase()})`,
      created: '',
      selected: true,
      latestProjectId: latestProject?.id || null,
      order: project.project.order,
      activity_codes: latestProject
        ? latestProject.activity_codes.map((code) => {
            const filter = view.filters.find((filter) => filter.activity_code.id === code.id)
            return {
              ...code,
              selected: !!filter,
              quick_filters: !!filter?.quick_filter
            }
          })
        : []
    }
  })
}

const getLatestProjectsV2 = (data: any) => {
  return data.view_items
    .filter((item: any) => item.type === 'Schedule')
    .map((schedule: any) => {
      const scheduleRef = globalSchedules.value.items.find(
        (item: any) => item.id === schedule.schedule_id
      )
      return {
        id: schedule.schedule_id,
        name: scheduleRef.name,
        label: `${scheduleRef.name} (${t('misc.latest').toLowerCase()})`,
        created: '',
        selected: true,
        latestProjectId: null,
        order: 1,
        activity_codes: []
      }
    })
}

const getProjectVersions = (view: ViewRaw): SelectedVersion[] => {
  const versions = view.project_versions.map(
    (version) =>
      ({
        ...version,
        activity_codes: version.activity_codes.map((code) => {
          const filter = view.filters.find((filter) => filter.activity_code.id === code.id)
          return {
            ...code,
            selected: !!filter,
            quick_filters: !!filter?.quick_filter
          }
        }),
        name: version.project?.name || '',
        label: version.project?.name ? `${version.project.name} v${version.version_id}` : '',
        selected: true
      } as SelectedVersion)
  )
  return versions
}

// function loadView(group: any) {
//   selectedGroup.value = group
//   const getView: HttpRequest = {
//     method: 'get',
//     url: apiUrls.scheduleView
//       .replace(/%workspaceId/, workspaceId)
//       .replace(/%groupId/, group.id.toString()),
//     onSuccess: {
//       callback: async (response) => {
//         const data = response.data as ViewRaw
//         const latestProjects = getLatestProjects(data)
//         const projectVersions = getProjectVersions(data)
//         const sortedProjects: SelectedVersion[] = [...latestProjects, ...projectVersions].sort(
//           (a, b) => (a.order || 0) - (b.order || 0)
//         )
//         selectedUploads.value = sortedProjects
//         scheduleView.value = data
//         await setScheduleViewTable(sortedProjects)
//         schedulesTables?.value?.loadTable()
//       }
//     }
//   }
//   sendRequest(getView)
// }

function loadViewV2(group: any) {
  selectedGroup.value = group
  const getView: HttpRequest = {
    method: 'get',
    url: apiUrls.scheduleViewV2
      .replace(/%workspaceId/, workspaceId)
      .replace(/%groupId/, group.id.toString()),
    onSuccess: {
      callback: async (response) => {
        const data = response.data as ViewRawV2
        // data is object with view_items []

        //latestprojects = scheduleVersions?
        const latestProjects = data.view_items.length ? getLatestProjectsV2(data) : []
        // const projectVersions = getProjectVersions(data)
        // const sortedProjects: SelectedVersion[] = [...latestProjects, ...projectVersions].sort(
        //   (a, b) => (a.order || 0) - (b.order || 0)
        // )
        console.log('view_items in ManageGroup', data)
        selectedUploads.value = latestProjects
        scheduleView.value = data
        await setScheduleViewTable(latestProjects)
        schedulesTables?.value?.loadTable()
      }
    }
  }
  console.log('HERE')
  sendRequest(getView)
}
const onSelectedSchedulesUpdate = (selected: SelectedVersion[]) => {
  selectedUploads.value = selected
  setScheduleViewTable(selectedUploads.value)
  schedulesTables?.value?.loadTable()
  dialogs.assigne = false
}
// const publishView = async () => {
//   if (!selectedGroup.value) return
//   const activityCodes: number[] = []
//   const quickFilters: number[] = []
//   const latestProjects: ProjectsPost[] = []
//   const projectVersions: ProjectsPost[] = []

//   selectedUploads.value.forEach((schedule, index) => {
//     // handle latest projects, project versions
//     const projects = schedule.latestProjectId ? latestProjects : projectVersions
//     const idField = schedule.latestProjectId ? 'latest_project_id' : 'project_version_id'
//     projects.push({
//       [idField]: schedule.id,
//       order: schedulesTables?.value?.getScheduleOrder(schedule.id)
//     })
//     // handle activity codes, quick filters
//     const selected = schedulesTables?.value?.showCodes.activity_codes.filter(
//       (code: any) => code.selected
//     )
//     if (!selected.length) return
//     selected.forEach((code: any) => {
//       activityCodes.push(code.id)
//       if (!code.quick_filters) return
//       quickFilters.push(code.id)
//     })
//   })

//   const data = {
//     group_id: selectedGroup.value.id,
//     activity_code_ids: activityCodes,
//     quick_filter_code_ids: quickFilters,
//     latest_projects: latestProjects,
//     project_versions: projectVersions
//   }

//   const publish: HttpRequest = {
//     method: 'post',
//     url: apiUrls.publishView.replace(/%workspaceId/, workspaceId),
//     data: data,
//     onSuccess: {
//       message: t('workspaces.schedules.management.publish.success')
//     }
//   }
//   await sendRequest(publish)
//   //   loadView(schedulesSelectedGroup)
//   loadViewV2(schedulesSelectedGroup)
// }
const publishViewV2 = async () => {
  if (!selectedGroup.value) return
  const activityCodes: number[] = []
  const quickFilters: number[] = []
  const latestProjects: ProjectsPost[] = []
  const projectVersions: ProjectsPost[] = []

  selectedUploads.value.forEach((schedule, index) => {
    // handle latest projects, project versions
    const projects = schedule.latestProjectId ? latestProjects : projectVersions
    const idField = schedule.latestProjectId ? 'latest_project_id' : 'project_version_id'
    projects.push({
      [idField]: schedule.id,
      order: schedulesTables?.value?.getScheduleOrder(schedule.id)
    })
    // handle activity codes, quick filters
    const selected = schedulesTables?.value?.showCodes.activity_codes.filter(
      (code: any) => code.selected
    )
    if (!selected.length) return
    selected.forEach((code: any) => {
      activityCodes.push(code.id)
      if (!code.quick_filters) return
      quickFilters.push(code.id)
    })
  })

  const data = {
    group_id: selectedGroup.value.id,
    activity_code_ids: activityCodes,
    quick_filter_code_ids: quickFilters,
    latest_projects: latestProjects,
    project_versions: projectVersions
  }

  const dataV2 = {
    type: 'Schedule',
    schedule_id: '2599', //27?
    schedule_version_id: '1'
    // filters: [
    //   {
    //     type: 'ScheduleMetadataType',
    //     quick_filter: true
    //   }
    // ],
    // groups: [
    //   {
    //     type: 'MetadataType'
    //   }
    // ]
  }

  console.log('here a')
  const publish: HttpRequest = {
    method: 'post',
    url: apiUrls.publishViewV2
      .replace(/%workspaceId/, workspaceId)
      .replace(/%groupId/, selectedGroup.value.id.toString()),
    data: dataV2,
    onSuccess: {
      message: t('workspaces.schedules.management.publish.success')
    }
  }
  await sendRequest(publish)
  //   loadView(schedulesSelectedGroup)
  loadViewV2(schedulesSelectedGroup)
}
// const openPreviewGant = () => {
//   router.push({
//     name: 'schedules-gantt',
//     params: { tenantId: tenantId, workspaceId: workspaceId },
//     query: { groupId: schedulesSelectedGroup?.id }
//   })
// }

const openPreviewGantV2 = () => {
  router.push({
    name: 'schedules-gantt',
    params: { tenantId: tenantId, workspaceId: workspaceId },
    query: { groupId: schedulesSelectedGroup.id }
  })
}
const addUserDialog = () => {
  openDialogAddUser.value = true
}
const closeAddUserDialog = () => {
  openDialogAddUser.value = false
}

const handleRemoveSelectedUploads = (arg: any) => {
  selectedUploads.value = selectedUploads.value.filter((item) => item.id !== arg.id)
  setScheduleViewTable(selectedUploads.value)
  schedulesTables.value.loadTable()
}
</script>
<template>
  <v-container fluid>
    <v-col cols="12" class="d-flex flex-row-reverse mb-10" style="margin-top: -100px">
      <!-- <v-btn v-show="activeTab === 'schedules'" class="primary-action-btn" @click="openPreviewGant">
        {{ $t('misc.preview') }}
      </v-btn>
      <v-btn -->
      <v-btn
        v-show="activeTab === 'schedules'"
        class="primary-action-btn"
        @click="openPreviewGantV2"
      >
        {{ 'Preview V2 Manage' }}
      </v-btn>
      <!-- <v-btn
        v-show="activeTab === 'schedules'"
        class="primary-action-btn mr-4"
        @click="publishView"
      >
        {{ $t('misc.publish') }}
      </v-btn> -->
      <v-btn
        v-show="activeTab === 'schedules'"
        class="primary-action-btn mr-4"
        @click="publishViewV2"
      >
        {{ 'Publish View V2' }}
      </v-btn>
      <v-btn v-show="activeTab === 'users'" class="primary-action-btn" @click="addUserDialog">
        {{ $t('misc.add') }}
      </v-btn>
    </v-col>

    <v-tabs style="width: 400px" align-tabs="start" v-model="activeTab">
      <v-tab style="width: 200px" value="schedules">{{
        $t('workspaces.schedules.manageSchedule')
      }}</v-tab>
      <v-tab style="width: 200px" value="users">{{
        $t('workspaces.schedules.groups.users.title')
      }}</v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
      <v-window-item value="schedules">
        <div style="display: flex; flex-direction: row; justify-content: end">
          <v-btn class="primary-action-btn mr-4 mt-1 mb-n10" @click="openAssigneScheduleModal">
            {{ $t('workspaces.schedules.management.assignSchedule') }}
          </v-btn>
        </div>
        <v-col cols="12">
          <v-row dense>
            <v-col cols="12">
              <SchedulesTables ref="schedulesTables" @remove="handleRemoveSelectedUploads" />
            </v-col>
          </v-row>
        </v-col>
      </v-window-item>
      <v-window-item value="users">
        <v-col cols="12">
          <v-row dense>
            <v-col cols="12">
              <ManageGroupUsers :openAddUser="openDialogAddUser" @close="closeAddUserDialog" />
            </v-col>
          </v-row>
        </v-col>
      </v-window-item>
    </v-window>
    <AssigneScheduleModal
      v-if="dialogs.assigne"
      v-model="dialogs.assigne"
      @close="closeAssigneSchedulesModal"
      @submit="onSelectedSchedulesUpdate"
      :selected="selectedUploads"
    />
  </v-container>
</template>
