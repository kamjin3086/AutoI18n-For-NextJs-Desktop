<template>
  <div ref="container" class="relative inline-block">
    <div v-if="accountInfoWrap.accountInfo.email" class="relative">
      <img
        @click="toggleDetailProfile"
        :src="accountInfoWrap.accountInfo.avatar"
        :alt="accountInfoWrap.accountInfo.name"
        class="w-8 h-8 rounded-full cursor-pointer object-cover transition-transform duration-200 hover:scale-110"
      />

      <div
        v-if="showDetailProfile"
        class="absolute z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mt-2 w-64 right-0 top-full"
      >
        <div class="flex items-center mb-4">
          <img
            :src="accountInfoWrap.accountInfo.avatar"
            :alt="accountInfoWrap.accountInfo.name"
            class="w-12 h-12 rounded-full mr-4"
          />
          <div>
            <div class="font-semibold text-gray-800 dark:text-white">
              {{ accountInfoWrap.accountInfo.name }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-300">
              {{ accountInfoWrap.accountInfo.email }}
            </div>
          </div>
        </div>
        <button
          @click="signOut"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>

    <div v-else>
      <button
        @click="authStart"
        class="bg-gray-300 rounded-full flex items-center"
      ><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 p-0.5 text-gray-700 scale-110 transition duration-200" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
      </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { reAuthAccountLoginByOauth, store } from '#preload';
import { onMounted, reactive, ref } from 'vue';

const container = ref(null);
const showDetailProfile = ref(false);

function toggleDetailProfile() {
  showDetailProfile.value = !showDetailProfile.value;
}

const handleClickOutside = (event) => {
  if (container.value && !container.value.contains(event.target)) {
    showDetailProfile.value = false;
  }
};

const accountInfoWrap = reactive({
  accountInfo: {},
});

onMounted(() => {
  accountInfoWrap.accountInfo = store.get('account_info') ? { ...JSON.parse(store.get('account_info')) } : {};
  document.addEventListener('click', handleClickOutside);
});

function authStart() {
  reAuthAccountLoginByOauth().then((data) => {
    accountInfoWrap.accountInfo = { ...data };
  });
}

function signOut() {
  let userResponse = confirm('Are you sure you want to log out?');
  if (userResponse) {
    console.log('User confirmed signOut');

    accountInfoWrap.accountInfo = {};

    try {
      store.del('access_token');
      store.del('account_info');
    } catch (e) {
      //ignore
    }
  } else {
    console.log('User cancelled signOut');
  }
}
</script>
