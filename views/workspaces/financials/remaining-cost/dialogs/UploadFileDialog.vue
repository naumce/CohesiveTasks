<script setup lang="ts">
import { computed } from 'vue'
import FileDropzone from '@/components/FileDropzone.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function close() {
  emit('update:modelValue', false)
}
defineExpose({
  close
})

function onFileChange(formData: FormData) {
  emit('submit', formData)
}
</script>
<template>
  <v-dialog v-model="show" persistent width="500">
    <v-card>
      <v-card-title>
        {{ $t('misc.uploadFile') }}
      </v-card-title>
      <v-card-text>
        <FileDropzone
          @change="onFileChange"
          :name="'file'"
          :supported-format="['csv']"
          :format="'.csv'"
          :accept="'.csv'"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
