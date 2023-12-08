<script setup lang="ts">
import { ref } from 'vue'
import CardSelection from '@/components/card-selection/CardSelection.vue'
import WorkspaceForm from './components/WorkspaceForm.vue'
import useApis from '@/composables/api'
import { apiUrls } from '@/plugins/axios'
import { useAuthStore } from '@/stores/authorization'
import { useCustomizerStore } from '@/stores/customizer'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { navigationGuard } from '@/router/navigation-guard'
import type { HttpRequest, Workspace, RequestWorkspace, IndexedWorkspace } from '@/types'

const card = ref()
const { t } = useI18n()
const { user } = useAuthStore()
const title = user ? `${t('workspaces.welcomeMsg')}, ${user.firstName}!` : ''

const route = useRoute()
const tenantId = route.params.tenantId.toString()
const url = `${apiUrls.workspaces}/tenant/${tenantId}`

const { canModify, setWorkspace, setWorkspaceRole, getUserPermissions } = useCustomizerStore()
const modifyEnabled = canModify(['TENANT_ADMIN'])

const router = useRouter()
const { sendRequest } = useApis()

const selectWorkspace = async (item: Workspace) => {
  console.log('workspace selected', item)
  setWorkspace(item)
  const getWorkspaceRoleRequest: HttpRequest = {
    method: 'get',
    url: apiUrls.workspaceRole.replace(/%workspaceId/, `${item.id}`),
    onSuccess: {
      callback: (response) => {
        setWorkspaceRole(response.data)
      }
    }
  }
  await sendRequest(getWorkspaceRoleRequest)
  const userPermissions = getUserPermissions()

  const canViewProjectStatus = navigationGuard['project-status'].some((permission: string) =>
    userPermissions.includes(permission)
  )
  const redirectRoute = canViewProjectStatus
    ? {
        name: 'project-status',
        params: { tenantId: tenantId, workspaceId: item.id, projectId: item.project_card?.id }
      }
    : userPermissions.includes('SPACE_ADMINISTRATION')
    ? {
        name: 'schedules-management',
        params: { tenantId: tenantId, workspaceId: item.id, projectId: item.project_card?.id }
      }
    : userPermissions.includes('PROJECT_FINANCE_VIEW')
    ? {
        name: 'dashboard',
        params: { tenantId: tenantId, workspaceId: item.id, projectId: item.project_card?.id }
      }
    : {
        name: 'schedules-overview',
        params: { tenantId: tenantId, workspaceId: item.id, projectId: item.project_card?.id }
      }

  router.push(redirectRoute)
}

const newWorkspace = (formObject: RequestWorkspace) => {
  const createNewWorkspace: HttpRequest = {
    method: 'post',
    url: `${apiUrls.workspaces}/create?tenant_id=${tenantId}`,
    data: formObject,
    onSuccess: {
      callback: () => {
        card.value.getData()
      },
      message: t('workspaces.new.success')
    }
  }

  sendRequest(createNewWorkspace)
}

const editWorkspace = (item: IndexedWorkspace) => {
  const editReq: HttpRequest = {
    method: 'patch',
    url: `${apiUrls.workspaces}/?space_id=${item.id}`,
    data: item.formObject,
    onSuccess: {
      callback: () => {
        card.value.getData()
      },
      message: t('workspaces.edit.success')
    }
  }

  sendRequest(editReq)
}

const deleteWorkspace = (id: number) => {
  const deleteReq: HttpRequest = {
    method: 'delete',
    url: `${apiUrls.workspaces}/${id}/`,
    onSuccess: {
      callback: () => {
        card.value.refresh()
      },
      message: t('workspaces.delete.success')
    }
  }

  sendRequest(deleteReq)
}
</script>
<template>
  <CardSelection
    ref="card"
    :url="url"
    :title="title"
    icon="mdi-gamepad-circle-right"
    :searchText="$t('workspaces.searchLabel')"
    :form="WorkspaceForm"
    :can-create="modifyEnabled"
    :can-modify="modifyEnabled"
    :createText="$t('workspaces.create')"
    :newTitle="$t('workspaces.new.title')"
    :editTitle="$t('workspaces.edit.title')"
    delete-detail-field="name"
    @submit="newWorkspace"
    @edit="editWorkspace"
    @delete="deleteWorkspace"
    @select="selectWorkspace"
  />
</template>
