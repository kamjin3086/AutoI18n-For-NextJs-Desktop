<template>
  <div class="inline-flex items-center">
    <div
      class="relative"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
      @focus="showTooltip"
      @blur="hideTooltip"
    >
      <button
        type="button"
        class="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        aria-label="More information"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-1 opacity-0"
      >
        <div
          v-show="visible"
          class="absolute z-50 w-64 px-4 py-3 mt-2 text-sm text-gray-600 bg-white dark:text-gray-300 dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          :class="tooltipPosition"
        >
          <div class="relative">
            {{ content }}
            <div
              class="absolute w-3 h-3 bg-white dark:bg-gray-800 border-t border-l border-gray-200 dark:border-gray-700 transform rotate-45"
              :class="arrowPosition"
            ></div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: 'bottom',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value),
  },
});

const visible = ref(false);
let timeoutId = null;

const tooltipPosition = computed(() => {
  switch (props.position) {
    case 'top': return '-top-2 -translate-y-full left-1/2 -translate-x-1/2';
    case 'bottom': return 'top-full left-1/2 -translate-x-1/2';
    case 'left': return 'top-1/2 -translate-y-1/2 right-full mr-2';
    case 'right': return 'top-1/2 -translate-y-1/2 left-full ml-2';
    default: return 'top-full left-1/2 -translate-x-1/2';
  }
});

const arrowPosition = computed(() => {
  switch (props.position) {
    case 'top': return '-bottom-1.5 left-1/2 -translate-x-1/2';
    case 'bottom': return '-top-1.5 left-1/2 -translate-x-1/2';
    case 'left': return 'top-1/2 -translate-y-1/2 -right-1.5';
    case 'right': return 'top-1/2 -translate-y-1/2 -left-1.5';
    default: return '-top-1.5 left-1/2 -translate-x-1/2';
  }
});

function showTooltip() {
  clearTimeout(timeoutId);
  visible.value = true;
}

function hideTooltip() {
  timeoutId = setTimeout(() => {
    visible.value = false;
  }, 200);
}
</script>
