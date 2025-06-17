<template>
  <div
    :class="[
      'transition-all duration-100 ease-in-out bg-white dark:bg-gray-800 shadow-lg h-screen',
      collapsed ? 'w-20' : 'w-64'
    ]"
  >
    <div class="flex items-center justify-between h-16 rounded transition-colors  duration-150 hover:bg-blue-100 dark:hover:bg-blue-700 px-4">
      <img v-if="!collapsed" src="../../../assets/logo.svg" alt="Logo" class="h-8 w-8 dark:invert">
      <button
        @click="toggleCollapse"
        class="text-black dark:text-white focus:outline-none hover:bg-blue-200 dark:hover:bg-blue-800 p-2 rounded-full transition-colors duration-150"
      >
        <Bars3Icon
          class="h-6 w-6 transition-transform duration-300 text-black dark:text-gray-300"
          :class="{ 'rotate-90': collapsed }"
        />
      </button>
    </div>
    <nav class="mt-5">
      <ul class="space-y-2 px-2">
        <li v-for="item in navItems" :key="item.id">
          <router-link
            :id="item.id"
            :to="item.to"
            class="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-gray-50 rounded-lg transition-colors duration-200"
            :class="{ 'justify-center': collapsed }"
          >
            <component :is="item.icon" class="h-5 w-5" />
            <span v-if="!collapsed" class="ml-3">{{ $t(item.label) }}</span>
            <span
              v-else
              class="sr-only"
            >{{ $t(item.label) }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { HomeIcon, LanguageIcon, QuestionMarkCircleIcon, InformationCircleIcon, Bars3Icon } from '@heroicons/vue/24/outline';

const collapsed = ref(false);

const navItems = [
  { id: 'home', to: '/', icon: HomeIcon, label: 'sidebar.project' },
  { id: 'localeJsonEditor', to: '/localeJsonEditor', icon: LanguageIcon, label: 'sidebar.multilanguageEditor' },
  { id: 'faqs', to: '/faqs', icon: QuestionMarkCircleIcon, label: 'sidebar.faqs' },
  { id: 'about', to: '/about', icon: InformationCircleIcon, label: 'sidebar.about' },
];

onMounted(() => {
  // 默认选中首页
  document.getElementById('home').click();
});

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}

function onRouterClick(id) {
  document.getElementById(id).click();
}

defineExpose({ onRouterClick });
</script>
