<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'
import type { SelectedVersion } from '@/types'
import UploadedSchedulesTable from '../UploadedSchedulesTable.vue'
import DeleteDialog from '@/components/dialogs/DeleteDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  selected: {
    type: Array<SelectedVersion>,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'close'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const updatedSchedules = ref([...props.selected])
const { loading } = storeToRefs(useLoaderStore())
const saveMsgDialog = ref(false)

const onUploadChange = (selected: SelectedVersion[]) => {
  updatedSchedules.value = selected
}

const onSubmit = () => {
  emit('submit', updatedSchedules.value)
}
console.log('assigne schedule modal')
function close() {
  emit('close', false)
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent min-width="600" max-width="1000">
    <v-card>
      <v-card-title>
        <span class="text-h5">
          {{ $t('workspaces.schedules.navigationTitle') }}
        </span>
      </v-card-title>
      <v-card-subtitle>
        {{ $t('workspaces.schedules.management.assignToGroup') }}
      </v-card-subtitle>
      <v-col cols="12">
        <UploadedSchedulesTable
          :selectionVisible="true"
          ref="uploadedTable"
          :selected="updatedSchedules"
          @change="onUploadChange"
          @delete=""
        />
      </v-col>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="loading" class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn :disabled="loading" class="primary-action-btn" @click="saveMsgDialog = true">
          {{ $t('misc.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
    <DeleteDialog
      v-if="saveMsgDialog"
      v-model="saveMsgDialog"
      :title="$t('workspaces.schedules.management.save.title')"
      :text="$t(`workspaces.schedules.management.save.text`)"
      @submit="onSubmit"
      no-question-mark
    >
    </DeleteDialog>
  </v-dialog>
</template>
