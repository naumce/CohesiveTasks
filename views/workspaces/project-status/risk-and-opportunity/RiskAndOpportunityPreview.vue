<script setup lang="ts">
import { thousandSeparatedFormat } from '@/utils/number'

const props = defineProps({
  project: {
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  }
})

</script>
<template>
  <v-container fluid>
    <v-table v-if="props.project?.event_characterization?.length">
      <thead>
        <tr>
          <th class="text-left">{{ $t('misc.type') }}</th>
          <th class="text-left">{{ $t('misc.description') }}</th>
          <th class="text-left">{{ $t('misc.probability') }}</th>
          <th class="text-left">{{ $t('misc.severity') }}</th>
          <th class="text-left">{{ $t('misc.score') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in props.project.event_characterization" :key="item.id">
          <td class="nowrap">
            {{ item.type.includes('RISK') ? $t('misc.risk') : $t('misc.opportunity') }}
          </td>
          <td class="">{{ item.description }}</td>
          <td class="nowrap">{{ item.full_probability.name }} ({{ item.full_probability.score }})</td>
          <td class="nowrap">{{ item.full_severity.name }} ({{ item.full_severity.score }})</td>
          <td>
            <v-chip
              variant="elevated"
              :color="item.color === '#000000' ? '#d9d9d9' : item.color || undefined"
              class="justify-center text-white score-status-chip text-center"
            >
              {{ thousandSeparatedFormat(item.score) }}
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>

<style scoped lang="scss">

td {
 color: #455A64;
}
</style>