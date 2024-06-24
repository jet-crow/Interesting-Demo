<template>
  {{ loadCount }}
  <div class="waterfall" :style="{ gap: gap + 'px' }">
    <div v-for="(col, index) in columnItems" :key="index" class="column" ref="columns">
      <div v-for="(item, index) in col" :key="index">
        <slot :item="item"></slot>
      </div>
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

//如果有img标签则等待上一排加载完图片,并返回最小列的高度和索引
const columns = ref();
const lastRowImgsLoaded = async () => {
  await nextTick(); // 等待DOM更新
  console.log(1);

  // 获取所有列中最后一个图片元素
  const lastChildren = columns.value.map((el: HTMLElement) => {
    return el.lastElementChild as HTMLImageElement;
  });
  const imageLoadPromises = [] as any[];

  lastChildren.map((el: HTMLElement) => {
    const img = el?.querySelector('img');
    if (img) {
      imageLoadPromises.push(
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          else {
            img.onerror = () => resolve();
            img.onload = () => resolve();
          }
        })
      );
    }
  });

  // console.log('⬇️');
  // console.log('开始加载图片');
  // console.log(imageLoadPromises);

  await Promise.all(imageLoadPromises);
  // console.log('图片加载完毕');
  
  // 获取每列的高度
  const columnHeights = columns.value.map((el: HTMLElement) => el.clientHeight);
  // 找到最小高度的列
  let minColumnIndex = 0;
  let minHeight = columnHeights[0];
  for (let i = 1; i < columnHeights.length; i++) {
    if (columnHeights[i] < minHeight) {
      minHeight = columnHeights[i];
      minColumnIndex = i;
    }
  }
  return { minHeight, minColumnIndex };
};

let lastCount = 0;
const distributeItems = async (newValue: any) => {
  for (let index = lastCount; index < props.items.length; index++) {
    if (index < props.columns) {
      columnItems.value[index].push(props.items[index]);
    } else {
      const { minColumnIndex } = await lastRowImgsLoaded();

      columnItems.value[minColumnIndex].push(props.items[index]);
    }
  }
};
onMounted(() => {
  columnItems.value = Array.from({ length: props.columns }, () => []);
  lastCount = 0;
  distributeItems(props.items);
});

watch(props.items, (newValue) => {
  distributeItems(newValue);
});

const emit = defineEmits(['load']);
const loadCount = computed(() => {
  let itemCount = 0;
  for (const col of columnItems.value) {
    itemCount += col.length;
  }
  return itemCount;
});
watch(loadCount, () => {
  if (loadCount.value <= 0) return;
  if (loadCount.value === props.items.length) {
    lastCount = props.items.length;
    emit('load');
  }
});
</script>

<style scoped>
.waterfall {
  display: flex;
  align-items: flex-start;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--gap, 10px);
}
</style>
