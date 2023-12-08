<script setup lang="ts">
import { ref } from 'vue'
import { useAlertsStore } from '@/stores/alerts'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['change'])
const { t } = useI18n()

const props = defineProps({
  supportedFormat: {
    type: Array,
    default: () => ['xer', 'mpp']
  },
  name: {
    type: String,
    default: 'project_file'
  },
  format: {
    type: String,
    default: '.xer, .mpp'
  },
  accept: {
    type: String,
    default: '.xer'
  }
})

const fileInput = ref()

const { showAlert } = useAlertsStore()
function handleFileInput(e: Event) {
  const fileInput = e.target as HTMLInputElement
  if (!(fileInput.files && fileInput.files.length)) return
  const file = fileInput.files[0]
  if (!validate(file)) return
  handleFile(file)
}
function handleFileDrop(e: DragEvent) {
  const droppedFile = e.dataTransfer?.files[0]
  if (!droppedFile) return
  if (!validate(droppedFile)) return
  handleFile(droppedFile)
}
function validate(file: File) {
  const nameArr = file.name.split('.')
  const extension = nameArr[nameArr.length - 1]
  if (`${props.supportedFormat}`.includes(extension)) return true
  showAlert({
    type: 'error', message: t('messages.error.schedulesWrongFormat').replace(
      /%format/,
      props.format
    )
  })
  return false
}
function handleFile(file: File) {
  if (!file) return
  const formdata = new FormData()
  formdata.append(props.name, file, file.name)
  emit('change', formdata)
}
</script>
<template>
  <v-container fluid @dragover.prevent @drop.prevent>
    <div @drop="handleFileDrop" class="d-flex flex-column w-100 align-center justify-center cursor-pointer"
      @click="fileInput.click()">
      <input type="file" name="file-input" ref="fileInput" :accept="`${props.accept}`" class="d-none" @change="handleFileInput" />
      <v-icon icon="mdi-upload" color="primary" class="text-h1" />
      <h4>Drag and Drop files</h4>
      <span class="gray">or</span>
      <h4 class="browse-button">Click to Browse</h4>
    </div>
  </v-container>
</template>

