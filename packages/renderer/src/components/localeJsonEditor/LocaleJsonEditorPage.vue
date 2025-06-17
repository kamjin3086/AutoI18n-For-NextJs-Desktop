<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">

    <div class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div class="p-6 sm:p-10">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {{ $t('localeJsonEdit.title') }}
          </h1>

          <!-- Info Box -->
          <div class="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 dark:border-blue-500 p-4 mb-8 rounded-r-lg">
            <div class="flex items-start">
              <InformationCircleIcon class="h-6 w-6 text-blue-400 mr-3 flex-shrink-0" />
              <div>
                <h2 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  {{ $t('localeJsonEdit.tipTitle') }}
                </h2>
                <ul class="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>{{ $t('localeJsonEdit.tip1') }}</li>
                  <li>{{ $t('localeJsonEdit.tip2') }}</li>
                  <li>{{ $t('localeJsonEdit.tip3') }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Control Buttons and Search -->
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <div class="flex space-x-2">
              <button
                id="undoButton"
                type="button"
                class="group relative px-6 py-2 bg-indigo-600 text-white text-base font-medium rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -translate-y-full bg-indigo-700 group-hover:translate-y-0"></span>
                <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full translate-y-0 bg-indigo-500 group-hover:translate-x-0"></span>
                <span class="relative flex items-center justify-center">
    <ArrowUturnLeftIcon class="w-5 h-5 mr-2" />
    {{ $t('localeJsonEdit.undo') }}
  </span>
              </button>

              <button
                id="redoButton"
                type="button"
                class="group relative px-6 py-2 bg-green-600 text-white text-base font-medium rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -translate-y-full bg-green-700 group-hover:translate-y-0"></span>
                <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full translate-y-0 bg-green-500 group-hover:translate-x-0"></span>
                <span class="relative flex items-center justify-center">
    <ArrowUturnRightIcon class="w-5 h-5 mr-2" />
    {{ $t('localeJsonEdit.redo') }}
  </span>
              </button>

              <button
                id="resetButton"
                type="button"
                class="group relative px-6 py-2 bg-red-600 text-white text-base font-medium rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -translate-y-full bg-red-700 group-hover:translate-y-0"></span>
                <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full translate-y-0 bg-red-500 group-hover:translate-x-0"></span>
                <span class="relative flex items-center justify-center">
    <ArrowPathIcon class="w-5 h-5 mr-2" />
    {{ $t('localeJsonEdit.reset') }}
  </span>
              </button>

            </div>
            <div class="relative w-full sm:w-64">
              <input
                id="searchInput"
                ref="searchInput"
                type="text"
                :placeholder="$t('localeJsonEdit.searchPlaceholder')"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                @input="onSearchInput"
              />
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <!-- JSON Table -->
          <div class="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
            <table id="jsonTable" ref="jsonTable" class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('localeJsonEdit.selection') }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('localeJsonEdit.key') }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {{ $t('localeJsonEdit.value') }}
                </th>
              </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <!-- JavaScript will populate this section -->
              </tbody>
            </table>
          </div>

          <!-- Confirm Button -->
          <div>
            <button
              class="group relative w-full flex justify-center items-center px-4 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out overflow-hidden shadow-lg hover:shadow-xl"
              @click="sendLocaleJsonEditResult"
            >
              <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -translate-y-full bg-blue-700 group-hover:translate-y-0"></span>
              <span class="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full translate-y-0 bg-blue-500 group-hover:translate-x-0"></span>
              <span class="relative flex items-center justify-center">
    <CheckIcon class="h-5 w-5 mr-2" />
    {{ $t('localeJsonEdit.confirmButton') }}
  </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  InformationCircleIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from '@heroicons/vue/24/outline';
import { sendLocaleJsonEditResult, onLoadedLoadData } from './localeJsonEditor';

import AccountProfile from '/@/components/widgets/AccountProfile.vue';

const jsonTable = ref(null);
const searchInput = ref(null);

onMounted(() => {
  onLoadedLoadData();
});

function onSearchInput() {
  const keyword = searchInput.value.value.toLowerCase();
  const rows = jsonTable.value.getElementsByTagName('tr');

  for (let i = 1; i < rows.length; i++) { // Skip the header row
    const cells = rows[i].getElementsByTagName('td');
    const key = cells[1].textContent.toLowerCase();
    const value = cells[2].textContent.toLowerCase();

    if (key.includes(keyword) || value.includes(keyword)) {
      rows[i].style.display = '';
    } else {
      rows[i].style.display = 'none';
    }
  }
}
</script>
