<template>
  <div>123</div>
</template>

<script setup lang="ts">
// import 'vue-waterfall-plugin-next/dist/style.css';
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
}
const articlesData = ref<Article[]>([]);
const loading = ref(false);
const finished = ref(false);

// 数据
const onLoad = () => {
  setTimeout(() => {
    const length = articlesData.value.length;
    for (let index = length; index < length + 10; index++) {
      articlesData.value.push({
        id: index + 1,
        img: 'https://picsum.photos/300/' + random(200, 500),
        title: '一蘭拉面粉絲狂喜，竟然118就買到了！！！',
        author: {
          name: 'JESONG',
          avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        },
        viewOfViews: 621,
      });
    }
    // loading.value = false;
    if (articlesData.value.length > 30) finished.value = true;
  }, 1000);
};
onLoad();
</script>
