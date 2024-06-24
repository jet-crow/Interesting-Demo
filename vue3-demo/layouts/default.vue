<template>
  <n-config-provider :theme="theme == Theme.dark ? darkTheme : undefined">
    <nav
      class="border-b dark:border-dark-line flex items-center px-8 py-4 relative text-font-color dark:bg-dark-background-50 dark:text-white h-14">
      <div class="flex items-center justify-center gap-2">
        <img src="/favicon.svg" class="w-7" />
        <span class="text-lg">Vue Demo</span>
      </div>

      <div class="w-56 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <n-input v-model="work" type="text" placeholder="搜索" />
      </div>

      <div class="flex-1 flex gap-3 justify-end items-center">
        <Icon
          :name="theme == Theme.light ? 'i-carbon:sun' : 'i-carbon-moon'"
          size="20"
          class="cursor-pointer"
          @click="switchTheme" />
      </div>
    </nav>
    <n-space vertical>
      <n-layout has-sider style="height: calc(100vh - 3.5rem)">
        <n-layout-sider
          bordered
          collapse-mode="width"
          :width="240"
          :collapsed-width="0"
          :collapsed="collapsed"
          :class="{ '[&_.n-layout-toggle-button]:-right-5': collapsed }"
          show-trigger
          @collapse="collapsed = true"
          @expand="collapsed = false">
          <n-menu
            :collapsed="collapsed"
            :options="menuOptions"
            :collapsed-width="0"
            :collapsed-icon-size="0" />
        </n-layout-sider>
        <n-layout>
          <slot />
        </n-layout>
      </n-layout>
    </n-space>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui';
const work = ref('');
enum Theme {
  light = 'light',
  dark = 'dark',
}
const theme = ref(Theme.dark);

onMounted(() => {
  if (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
    theme.value = Theme.dark;
  } else {
    document.documentElement.classList.remove('dark');
    theme.value = Theme.light;
  }
});

const switchTheme = () => {
  if (theme.value === Theme.dark) {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
    theme.value = Theme.light;
  } else {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
    theme.value = Theme.dark;
  }
};

//菜单
import type { MenuOption } from 'naive-ui';
const collapsed = ref(false);
const menuOptions: MenuOption[] = [
  {
    label: '瀑布流',
    key: 'hear-the-wind-sing',
    href: 'https://baike.baidu.com/item/%E4%B8%94%E5%90%AC%E9%A3%8E%E5%90%9F/3199',
  },
];
</script>
