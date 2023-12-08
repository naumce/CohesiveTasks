<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  selectedData: {
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  },
  title: {
    type: String,
    default: 'test'
  }
})
const emit = defineEmits(['update:modelValue', 'submit', 'close'])
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function close() {
  emit('close')
}
function onSubmit() {
  emit('submit')
}
defineExpose({
  close
})
</script>
<template>
  <v-dialog v-model="show" persistent width="420">
    <v-card>
      <v-card-title class="bg-default mt-4 mb-n5 flex">
        <v-icon color="orange" class="pl-6 mb-2">mdi-information-outline</v-icon>
        <span class="ml-6">{{ props.title }}?</span>
      </v-card-title>
      <v-card-text class="questiontext">
        <span>{{
          $t(`workspaces.financials.transactions.updateMultipleStatusConfirmation`).replace(
            /%selected_transactions/,
            props.selectedData?.length
          )
        }}</span>
      </v-card-text>
      <v-card-actions class="d-flex pt-9 cardactions">
        <v-spacer></v-spacer>
        <v-btn class="primary-negative-btn" @click="close">
          {{ $t('misc.cancel') }}
        </v-btn>
        <v-btn class="primary-action-btn" @click="onSubmit" data-testid="confirm">
          {{ $t('misc.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style scoped lang="scss">
.cardactions {
  width: auto;
  display: flex;
  justify-content: end;
}

.questiontext {
  width: 70%;
  text-align: left;
  margin-left: 30px;
  margin-top: 20px;
}
</style>
