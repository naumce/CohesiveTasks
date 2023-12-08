<script setup lang="ts">
import {computed, reactive, ref} from 'vue'
import SearchInput from '@/components/SearchInput.vue'
import ManageDialog from '@/components/dialogs/ManageDialog.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'
import useApis from '@/composables/api'
import type {HttpRequest} from '@/types'
import {useRouter} from "vue-router";

const router  = useRouter();

const props = defineProps({
  url: {
    type: String,
    required: true,
    default: ''
  },
  per_page: {
    type: Number,
    default: 50
  },
  searchParam: {
    type: String,
    default: 'name'
  },
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'mdi-folder-outline'
  },
  deleteText: {
    type: String,
    default: ''
  },
  deleteDetailField: {
    type: String,
    default: ''
  },
  searchText: {
    type: String,
    default: ''
  },
  form: {
    type: Object,
    default: null
  },
  newTitle: {
    type: String,
    default: ''
  },
  editTitle: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'primary'
  },
  canCreate: {
    type: Boolean
  },
  canModify: {
    type: Boolean
  },
  createText: {
    type: String,
    default: ''
  },
})

const emit = defineEmits(['select', 'submit', 'edit', 'delete','getData'])

const items = ref<any[]>([])
const total = ref<number>(0)
const page = ref(1)
const lastPage = ref(1)
const routeName = computed(() => {
  return router?.currentRoute?.value?.name
})
const { sendRequest } = useApis()
const getData = () => {
  const getData: HttpRequest = {
    method: 'get',
    url: `${props.url}/?page=${page.value}&per_page=${props.per_page}&sort=["name"]`,
    onSuccess: {
      callback: (response) => {
        items.value = response.data.items
        total.value = response.data.total;
        emit('getData',response.data);
        const totalElements = response.data?.total || 0
        const addition = totalElements % props.per_page > 0 ? 1 : 0
        lastPage.value = Math.floor(totalElements / props.per_page) + addition
      }
    }
  }
  sendRequest(getData)
}

getData()

const onPageChange = () => {
  getData()
}

const dialogs = reactive({
  add: false,
  edit: false,
  delete: false
})

const selected = ref<any>()
function openEditDialog(item: any) {
  selected.value = item
  dialogs.edit = true
}
function openDeleteDialog(item: any) {
  selected.value = item
  dialogs.delete = true
}

let controller: AbortController | null
function onSearchInput(event: InputEvent) {
  const value = (event.target as HTMLInputElement).value || ''
  // abort request
  controller && controller.abort()
  controller = new AbortController()

  const filterItems: HttpRequest = {
    method: 'get',
    url: `${props.url}/?page=1&per_page=20&sort=["${props.searchParam}"]&filter={"${
      props.searchParam
    }__ilike":"%${encodeURIComponent(value)}%"}`,
    onSuccess: {
      callback: (response) => {
        items.value = response.data.items
        total.value = response.data.total;
      }
    }
  }

  sendRequest(filterItems)
}

const onSubmit = (data: any) => {
  dialogs.add = false
  emit('submit', data)
}

const onEdit = (data: any) => {
  if (!selected.value) return
  dialogs.edit = false
  emit('edit', { formObject: data, id: selected.value.id })
}

const onDelete = () => {
  if (!selected.value) return
  dialogs.delete = false
  emit('delete', selected.value.id)
}

const refresh = () => {
  page.value = 1
  getData()
}
defineExpose({
  refresh,
  getData
})
</script>
<template>
  <v-container fluid>
    <portal to="search">
      <SearchInput :placeholder="props.searchText" @input="onSearchInput" />
    </portal>
    <portal v-if="routeName !== 'tenants'" to="header-actions">
      <v-btn
          v-if="props.canCreate"
          :color="props.color"
          class="primary-action-btn"
          @click="dialogs.add = true"
          data-testid="create"
      >
        {{ props.createText }}
      </v-btn>
    </portal>
    <v-row>
      <v-col cols="8" class="d-flex justify-start">
        <h2 class="title">{{ props.title }}</h2>
      </v-col>
      <v-col v-if="routeName === 'tenants'" cols="4" class="d-flex justify-end">
        <v-btn
          v-if="props.canCreate"
          :color="props.color"
          class="primary-action-btn"
          @click="dialogs.add = true"
          data-testid="create"
        >
          {{ props.createText }}
        </v-btn>
      </v-col>

    </v-row>
    <v-row v-if="items.length > 0" class="flex pa-2 pt-10">
        <v-card
          v-for="(item, index) in items"
          :key="index"
          class="list-item-container ma-2"
          :class="`bg-${props.color}`"
          @click.prevent="emit('select', item)"
        >
          <div class="d-flex justify-space-between align-center">
            <v-icon v-if="!$slots.icon" :icon="props.icon" color="white" class="ma-2" />
            <slot v-else name="icon" />
            <v-menu v-if="props.canModify">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon flat :color="color">
                  <v-icon icon="mdi-dots-vertical" data-testid="three-dots"/>
                </v-btn>
              </template>
              <v-list >
                <v-list-item class="pa-0">
                  <v-btn
                    flat
                    variant="text"
                    block
                    class="text-none text-subtitle-1 justify-start"
                    @click="openEditDialog(item)"
                  >
                    {{ $t('misc.edit') }}
                  </v-btn>
                </v-list-item>
                <v-list-item class="pa-0">
                  <v-btn
                    flat
                    variant="text"
                    block
                    class="text-none text-subtitle-1 justify-start"
                    @click="openDeleteDialog(item)"
                  >
                    {{ $t('misc.delete') }}
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
          <v-card-title
            class="text-white title-card d-block font-weight-bold text-wrap"
            style="font-size: 16px; line-height: 1.3"
          >
            <text-clamp :max-lines="2" :text="item.name" class="title" ellipsis="..."/>
            <br />
          </v-card-title>
        </v-card>

      <v-col cols="12">
        <v-pagination
            v-if="items.length < total"
            v-model="page"
            class="my-4"
            :length="lastPage"
            :total-visible="4"
            @update:model-value="onPageChange"
        />
      </v-col>

    </v-row>
  </v-container>
  <ManageDialog
    v-if="dialogs.add"
    v-model="dialogs.add"
    :form="props.form"
    :title="props.newTitle"
    @submit="onSubmit"
  />
  <ManageDialog
    v-if="dialogs.edit"
    v-model="dialogs.edit"
    type="edit"
    :form="props.form"
    :value="selected"
    :title="props.editTitle"
    @submit="onEdit"
  />
  <DeleteDialog
    v-if="dialogs.delete"
    v-model="dialogs.delete"
    :text="props.deleteText"
    :title="$t('workspaces.deleteWorkspace')"
    @submit="onDelete"
  >
    <strong v-if="selected && props.deleteDetailField" class="mt-4">
      {{ selected[props.deleteDetailField] || '' }}
    </strong>
  </DeleteDialog>
</template>
<style scoped lang="scss">
.list-item-container {
  height: 132px;
  width: 167px;
  min-width: 167px;
}
h2 {
  font-size: 30px;
  font-weight: 600;
  line-height: 45px;
}
</style>
