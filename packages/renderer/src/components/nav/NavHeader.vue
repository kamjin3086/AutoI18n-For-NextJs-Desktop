<template>
  <nav class='bg-white dark:bg-gray-800 shadow-md'>
    <div class='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div class='flex justify-between items-center h-16'>
        <div class='flex items-center'>
          <!-- Logo placeholder -->
          <div class='flex-shrink-0'>
            <img
              class='h-8 w-8'
              src='../../../assets/logo.svg'
              alt='Logo'
            >
          </div>
          <div class='ml-10 flex items-baseline space-x-4'>
            <!-- Other nav items can go here -->
          </div>
        </div>
        <div class='flex items-center'>
          <!-- Usage Notice Button -->
          <button
            class='bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 p-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-300 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
            aria-label='Usage Notice'
            @click='toggleShowPopup'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              class='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </button>

          <!-- Language Switcher -->
          <locale-switcher class='mb-8' />
        </div>
      </div>
    </div>

    <!-- Usage Notice Popup -->

    <user-agree
      v-if='showPopup'
      @close='toggleShowPopup'
    />
  </nav>
</template>

<script setup>
import UserAgree from '/@/components/home/UserAgreeTips.vue';
import LocaleSwitcher from '/@/components/widgets/LocaleSwitcher.vue';
import {ref} from 'vue';

const showPopup = ref(false);

const toggleShowPopup = () => {
  showPopup.value = !showPopup.value;
};
</script>
