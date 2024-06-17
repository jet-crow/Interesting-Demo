<template>
  <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad" class="bg-gray-100">
    <Waterfall :items="articlesData">
      <template #default="{ item }">
        <div class="w-full pb-2 bg-white rounded-md overflow-hidden shadow-md"
          @click="$router.push(`/article/${item.id}`)">
          <van-image class="w-full !mb-0" :src="item.img" />
          <van-text-ellipsis :content="item?.title" rows="2" class="text-sm mx-2" />
          <div class="mx-2 mt-1 flex items-center gap-2">
            <van-image round width="1.5rem" height="1.5rem" :src="item?.author?.avatar" fit="cover" />
            <p class="flex -1 text-xs text-gray-600">{{ item?.author?.name }}{{ item?.id }}</p>
            <p class="text-xs text-gray-500 flex items-center gap-[1px]">
              {{ item?.viewOfViews }}
            </p>
          </div>
        </div>
      </template>
    </Waterfall>
  </van-list>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
interface Article {
  id: number;
  img: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  viewOfViews: number;
};
const articlesData = ref<Article[]>([]);
const loading = ref(false);
const finished = ref(false);
const onLoad = () => {
  setTimeout(() => {
    const length = articlesData.value.length;
    for (let index = length; index < length + 10; index++) {
      articlesData.value.push({
        id: index + 1,
        img: "https://picsum.photos/300/" + random(200, 500),
        title: "一蘭拉面粉絲狂喜，竟然118就買到了！！！",
        author: {
          name: "JESONG",
          avatar: "https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
        },
        viewOfViews: 621,
      })
    }
    loading.value = false;
    if (articlesData.value.length > 50) finished.value = true;
  }, 1000);
}
onLoad();

</script>

<style scoped>
img {
  width: 100%;
  display: block;
}
</style>