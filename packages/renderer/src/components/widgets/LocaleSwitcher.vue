<template>
  <div class="relative inline-block text-right">
    <button
      @click="toggleDropdown"
      type="button"
      class="inline-flex items-center justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
    >
      <GlobeAltIcon class="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
      {{ options.find(option => option.value === selectedLang)?.text }}
      <ChevronDownIcon class="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-600 focus:outline-none"
      >
        <div class="py-1">
          <a
            v-for="option in options"
            :key="option.value"
            href="#"
            @click.prevent="selectLang(option.value)"
            :class="[
              option.value === selectedLang ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200',
              'block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-500'
            ]"
          >
            {{ option.text }}
          </a>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import { i18n, locales } from '../../locales/index';
import { GlobeAltIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';

const options = ref(locales);
const selectedLang = ref(localStorage.getItem('lang') || 'en');
const isOpen = ref(false);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function selectLang(lang) {
  selectedLang.value = lang;
  localStorage.setItem('lang',lang);
  i18n.global.locale = lang;
  isOpen.value = false;
}

// 点击外部关闭下拉菜单
function closeDropdown(e) {
  if (!e.target.closest('.relative')) {
    isOpen.value = false;
  }
}

// 挂载时添加点击事件监听器
onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

// 卸载时移除点击事件监听器
onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>
