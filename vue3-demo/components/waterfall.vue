<template>
  <div class="waterfall" :style="{ gap: gap + 'px' }">
    <div v-for="(col, index) in columnItems" :key="index" class="column">
      <slot v-for="(item, index) in col" :item="item" :key="index"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

const props = defineProps({
  items: { type: Array as () => any[], required: true },
  columns: { type: Number, default: 2 },
  gap: { type: Number, default: 10 },
});

const columnItems = ref<Array<any[]>>(Array.from({ length: props.columns }, () => []));

const distributeItems = () => {
  columnItems.value = Array.from({ length: props.columns }, () => []);
  props.items.forEach((item, index) => {
    columnItems.value[index % props.columns].push(item);
  });
};

watchEffect(distributeItems);
</script>

<style scoped>
.waterfall {
  display: flex;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--gap, 10px);
}
</style>