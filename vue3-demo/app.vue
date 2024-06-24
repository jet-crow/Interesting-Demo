<template>
  <NuxtLayout>
    <NuxtPage keepalive />
  </NuxtLayout>
</template>

<script setup>
useHead({
  title: 'Vue-Demo', //网站标题
});
</script>

<style>
* {
  transition: all 0.1s;
}
</style>
