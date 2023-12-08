<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLoaderStore } from '@/stores/loader'
import { storeToRefs } from 'pinia'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  value: {
    type: Object,
    default: () => {
      return {}
    }
  },
  type: {
    type: String,
    default: 'new'
  },
  form: {
    type: Object,
    required: true,
    default: null
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '400'
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const form = ref()

const { loading } = storeToRefs(useLoaderStore())

function onSubmit(data: any) {
  emit('submit', data)
}

function close() {
  form.value.reset()
  emit('update:modelValue', false)
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent :width="props.width">
    <v-card>
      <v-card-title>
        <span class="text-h5">
          {{ props.title }}
        </span>
      </v-card-title>
      <v-form @submit.prevent="form.touch()">
        <v-card-text>
          <component :is="props.form" ref="form" :value="props.value" @submit="onSubmit" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn class="primary-negative-btn" :disabled="loading" @click="close" data-testid="button-close">
            {{ $t('misc.cancel') }}
          </v-btn>
          <v-btn class="primary-action-btn" type="submit" :disabled="loading" data-testid="submit">
            {{ $t('misc.submit') }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
