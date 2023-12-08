import { allPermissionsObject } from '@/constants/permissions';
export const administration_access = [
    {
        name: allPermissionsObject.PROJECT_ADMINISTRATION.text, value: allPermissionsObject.PROJECT_ADMINISTRATION.value
    },
    {
        name: allPermissionsObject.PROJECT_CARD_USER_MANAGEMENT.text, value: allPermissionsObject.PROJECT_CARD_USER_MANAGEMENT.value
    },
    {
        name: allPermissionsObject.PROJECT_CARD_ROLE_MANAGEMENT.text, value: allPermissionsObject.PROJECT_CARD_ROLE_MANAGEMENT.value
    }
]

export const schedule_access = [
    {
        name: allPermissionsObject.PROJECT_VIEW.text, value: allPermissionsObject.PROJECT_VIEW.value
    },
    {
        name: allPermissionsObject.SPACE_ADMINISTRATION.text, value: allPermissionsObject.SPACE_ADMINISTRATION.value
    },
]

export const cost_module_access = [
    {
        name: allPermissionsObject.PROJECT_FINANCE_VIEW.text, value: allPermissionsObject.PROJECT_FINANCE_VIEW.value
    },
    {
        name: allPermissionsObject.PROJECT_FINANCE_EDIT.text, value: allPermissionsObject.PROJECT_FINANCE_EDIT.value
    },
]

export const workspace_access = [
    {
        name: allPermissionsObject.PROJECT_CARD_VIEW.text, value: allPermissionsObject.PROJECT_CARD_VIEW.value
    },
    {
        name: allPermissionsObject.PROJECT_FACTS_MODIFY.text, value: allPermissionsObject.PROJECT_FACTS_MODIFY.value
    },
    {
        name: allPermissionsObject.PROJECT_KPI_MODIFY.text, value: allPermissionsObject.PROJECT_KPI_MODIFY.value
    },
    {
        name: allPermissionsObject.PROJECT_INFORMATION_MODIFY.text, value: allPermissionsObject.PROJECT_INFORMATION_MODIFY.value
    },
    {
        name: allPermissionsObject.PROJECT_EVENT_CHARACTERIZATION_MODIFY.text, value: allPermissionsObject.PROJECT_EVENT_CHARACTERIZATION_MODIFY.value
    },
    {
        name: allPermissionsObject.PROJECT_MODEL_MODIFY.text, value: allPermissionsObject.PROJECT_MODEL_MODIFY.value
    }
]

export const allPermissionsKeysArray = [
    ...administration_access,
    ...schedule_access,
    ...cost_module_access,
    ...workspace_access,
]