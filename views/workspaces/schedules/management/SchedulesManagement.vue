<script setup lang="ts">
import { ref, reactive } from 'vue'
import useApis from '@/composables/api'
import type {
  HttpRequest,
  RawFact,
  ViewRaw,
  ListItem,
  SelectedVersion,
  SchedulesGroup
} from '@/types'
import { useI18n } from 'vue-i18n'
import { apiUrls } from '@/plugins/axios'
import { useRoute } from 'vue-router'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import router from '@/router'
import { useCustomizerStore } from '@/stores/customizer'
import SchedulesGroups from './SchedulesGroups.vue'
import UploadedSchedulesTable from './UploadedSchedulesTable.vue'
import CreateGroupDialog from './dialogs/CreateGroupDialog.vue'
import UploadFileDialog from './dialogs/UploadFileDialog.vue'
import UploadFileDialogV2 from './dialogs/UploadFileDialogV2.vue'

const { setScheduleViewTable } = useCustomizerStore()

const route = useRoute()
const tenantId = route.params.tenantId as string
const workspaceId = route.params.workspaceId as string

const { sendRequest } = useApis()
const { loading } = storeToRefs(useLoaderStore())

const groups = ref<ListItem[]>([])

const getGroups: HttpRequest = {
  method: 'get',
  url: apiUrls.scheduleGroups.replace(/%workspaceId/, workspaceId),
  onSuccess: {
    callback: (response) => {
      groups.value = response.data.items.map((group: RawFact) => ({
        value: group.id,
        title: group.name
      }))
    }
  }
}
sendRequest(getGroups)

const selectedGroup = ref<SchedulesGroup>()
const scheduleView = ref<ViewRaw>()
const selectedUploads = ref<SelectedVersion[]>([])

const { t } = useI18n()

const getLatestProjects = (view: ViewRaw) => {
  return view.latest_projects.map((project: any) => {
    const latestProject = project.project.project_versions?.length
      ? project.project.project_versions.sort((a: any, b: any) => b.version_id - a.version_id)[0]
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
        ? latestProject.activity_codes.map((code: any) => {
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
const getProjectVersions = (view: ViewRaw): SelectedVersion[] => {
  const versions = view.project_versions.map(
    (version) =>
      ({
        ...version,
        activity_codes: version.activity_codes.map((code: any) => {
          const filter = view.filters.find((filter: any) => filter.activity_code.id === code.id)
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
function loadView(group: SchedulesGroup) {
  selectedGroup.value = group
  const getView: HttpRequest = {
    method: 'get',
    url: apiUrls.scheduleView
      .replace(/%workspaceId/, workspaceId)
      .replace(/%viewId/, group.id.toString()),
    onSuccess: {
      callback: (response) => {
        const data = response.data as ViewRaw
        const latestProjects = getLatestProjects(data)
        const projectVersions = getProjectVersions(data)
        const sortedProjects: SelectedVersion[] = [...latestProjects, ...projectVersions].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        )
        selectedUploads.value = sortedProjects
        setScheduleViewTable(selectedUploads.value)
        scheduleView.value = data
      }
    }
  }
  sendRequest(getView)
}

const onUploadChange = (selected: SelectedVersion[]) => {
  selectedUploads.value = selected
}

const onVersionDelete = () => {
  if (!selectedGroup.value) return
  loadView(selectedGroup.value)
}
const dialogs = reactive({
  uploadFile: false,
  newGroup: false
})
const openUploadFileDialog = () => {
  dialogs.uploadFile = true
}
const openCreateGroupDialog = () => {
  dialogs.newGroup = true
}
const previewSelectedGroup = () => {
  let quickFiltersIds = scheduleView.value?.filters?.map((i: any) => i.activity_code.id)
  router.push({
    name: 'schedules-gantt',
    params: { tenantId: tenantId, workspaceId: workspaceId },
    query: {
      groupId: selectedGroup?.value?.id,
      quickFilters: quickFiltersIds ? JSON.stringify(quickFiltersIds) : ''
    }
  })
}
const previewSelectedGroupV2 = () => {
  let quickFiltersIds = scheduleView.value?.filters?.map((i: any) => i.activity_code.id)
  router.push({
    name: 'schedules-gantt',
    params: { tenantId: tenantId, workspaceId: workspaceId },
    query: {
      groupId: selectedGroup?.value?.id,
      quickFilters: quickFiltersIds ? JSON.stringify(quickFiltersIds) : ''
    }
  })
}

const selectedGroupTable = ref()
const createGroup = (name: string) => {
  const createRequest: HttpRequest = {
    method: 'post',
    url: apiUrls.scheduleGroups.replace(/%workspaceId/, workspaceId),
    data: { name: name },
    onSuccess: {
      callback: () => {
        selectedGroupTable.value?.refresh()
      },
      message: t('workspaces.schedules.groups.new.success')
    },
    finally: () => {
      dialogs.newGroup = false
    }
  }
  sendRequest(createRequest)
}
const uploadedTable = ref()
// const onFileUpload = (formData: FormData) => {
//   const uploadFile: HttpRequest = {
//     method: 'post',
//     url: apiUrls.schedulesFileUpload.replace(/%workspaceId/, workspaceId),
//     data: formData,
//     onSuccess: {
//       callback: () => {
//         dialogs.uploadFile = false
//         uploadedTable.value?.refresh()
//       },
//       message: t('workspaces.schedules.management.upload.success')
//     }
//   }
//   sendRequest(uploadFile)
// }

const onFileUploadV2 = (formData: FormData) => {
  const uploadFile: HttpRequest = {
    method: 'post',
    url: apiUrls.schedulesFileUploadV2.replace(/%workspaceId/, workspaceId),
    data: formData,
    onSuccess: {
      callback: () => {
        dialogs.uploadFile = false
        uploadedTable.value?.refresh()
      },
      message: t('workspaces.schedules.management.upload.success')
    }
  }
  sendRequest(uploadFile)
}

interface ProjectsPost {
  [key: string]: number
}
const activeTab = ref('0')
</script>
<template>
  <v-container fluid>
    <v-col cols="12" class="d-flex flex-row-reverse mb-10" style="margin-top: -100px">
      <!-- <v-btn
        v-show="activeTab === 'groups'"
        :disabled="loading || !selectedGroup"
        class="primary-action-btn"
        @click="previewSelectedGroup"
      >
        {{ $t('misc.preview') }}
      </v-btn> -->
      <v-btn
        v-show="activeTab === 'groups'"
        :disabled="loading || !selectedGroup"
        class="primary-action-btn"
        @click="previewSelectedGroupV2"
      >
        {{ 'Preview V2' }}
      </v-btn>
      <v-btn
        v-show="activeTab === 'groups'"
        :disabled="loading"
        class="primary-action-btn mr-4"
        @click="openCreateGroupDialog"
      >
        {{ $t('misc.add') }}
      </v-btn>
      <!-- <v-btn
        v-show="activeTab === 'schedules'"
        class="primary-action-btn mr-4"
        @click="openUploadFileDialog"
      >
        {{ $t('misc.uploadFile') }}
      </v-btn> -->
      <v-btn
        v-show="activeTab === 'schedules'"
        class="primary-action-btn mr-4"
        @click="openUploadFileDialog"
      >
        {{ 'Upload file v2' }}
      </v-btn>
    </v-col>
    <v-tabs style="width: 400px" align-tabs="start" v-model="activeTab">
      <v-tab style="width: 200px" value="groups">{{
        $t('workspaces.schedules.groups.navigationTitle')
      }}</v-tab>
      <v-tab style="width: 200px" value="schedules">{{
        $t('workspaces.schedules.navigationTitle')
      }}</v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
      <v-window-item value="groups">
        <v-col cols="12">
          <v-row dense>
            <v-col cols="12">
              <SchedulesGroups
                ref="selectedGroupTable"
                @change="loadView"
                :data="selectedUploads"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-window-item>
      <v-window-item value="schedules">
        <v-col cols="12">
          <v-row dense>
            <v-col cols="12">
              <UploadedSchedulesTable
                ref="uploadedTable"
                :selected="selectedUploads"
                @change="onUploadChange"
                @delete="onVersionDelete"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-window-item>
    </v-window>
    <!-- <UploadFileDialog v-if="dialogs.uploadFile" v-model="dialogs.uploadFile" @submit="onFileUpload" /> -->
    <UploadFileDialogV2
      v-if="dialogs.uploadFile"
      v-model="dialogs.uploadFile"
      @submit="onFileUploadV2"
    />
    <CreateGroupDialog v-if="dialogs.newGroup" v-model="dialogs.newGroup" @submit="createGroup" />
  </v-container>
</template>
