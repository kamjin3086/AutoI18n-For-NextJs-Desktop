<template>
  <div
    class='min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-600'>

    <div class='flex-grow py-12 px-4 sm:px-6 lg:px-8'>
      <div class=''>
        <h1 class='text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center'>{{ $t('about.aboutThisTool')
          }}</h1>

        <div class='space-y-8'>
          <InfoCard :title="$t('about.introduce')">
            <p class='mb-4'>{{ $t('about.introduce1') }}</p>
            <p class='mb-4'>{{ $t('about.introduce2') }}</p>
            <p>{{ $t('about.introduce3') }}</p>
            <a
              class='text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
              href='#'
              @click.prevent='openInBrowser(`${buildInfo.website_url}/docs`)'
            >{{ $t('about.docs') }}</a>
          </InfoCard>

          <InfoCard :title="$t('about.useMustKnow')">
            <p class='mb-4'>{{ $t('about.useMustKnowContent') }}</p>
            <UserAgreeTips />
          </InfoCard>

          <InfoCard :title="$t('about.feedback')">
            <p>
              {{ $t('about.feedbackContent1') }}
              <span
                class='text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                @click='openInBrowser(`${buildInfo.website_url}/feedback`)'
              >
                {{ $t('about.feedbackLink') }}
              </span>
              {{ $t('about.feedbackContent2') }} 📧
            </p>
          </InfoCard>

          <InfoCard :title="$t('about.showcase')">
            <p>
              {{ $t('about.showcaseContent1') }}
              <span
                class='text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                @click='openInBrowser(`${buildInfo.website_url}/showcase/submit`)'
              >
                {{ $t('about.showcaseLink') }}
              </span>
              {{ $t('about.showcaseContent2') }}
            </p>
          </InfoCard>

          <InfoCard :title="$t('about.future')">
            <p class='mb-4'>{{ $t('about.futureContent') }}</p>
            <div
              class='text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
              @click='openInBrowser(`${buildInfo.website_url}`)'
            >
              {{ buildInfo.website_url }}
            </div>
          </InfoCard>

          <InfoCard :title="$t('about.contactInformation')">
            <p>{{ $t('about.author') }}</p>
            <p>
              {{ $t('about.supportEmail') }}
              <span
                class='text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                @click='openInBrowser(`mailto:${buildInfo.email}`)'
              >
                {{ buildInfo.email }}
              </span>
            </p>
          </InfoCard>

          <InfoCard :title="$t('about.sponsor')">
            <div className='flex flex-wrap gap-4 mb-6'>
            </div>
            <p className='text-lg'>{{ $t('about.supportMySoloJourney') }}</p>
            <p className='text-md'>{{ $t('about.Yoursupporthelpsmekeepde') }}</p>
            <div className='py-4'>
              <a
                href='#'
                @click.prevent="openInBrowser('https://www.buymeacoffee.com/kamjin')"
              ><img
                src='https://img.buymeacoffee.com/button-api/?text=Buy Me a Coffee&emoji=🍰&slug=kamjin&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff' /></a>

            </div>
          </InfoCard>

          <InfoCard :title="$t('about.relatedLinks')">
            <ul class='flex space-x-2 items-center'>
              <li v-for='link in relatedLinks' :key='link.name'>
                <span
                  class='text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                  @click='openInBrowser(link.url)'
                >
                  {{ link.name }}
                </span>
              </li>
            </ul>
          </InfoCard>

          <InfoCard :title="$t('about.appInfo')">
            <p>{{ $t('about.currentVersion') }} {{ buildInfo.version }}</p>
          </InfoCard>

          <div
            class='bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl'>
            <div v-show='showUpdateTips' class='mb-6 animate-pulse'>
              <div class='flex items-center space-x-3 bg-blue-100 dark:bg-blue-900 p-4 rounded-lg'>
                <ArrowPathIcon class='w-6 h-6 text-blue-500 dark:text-blue-400 animate-spin' />
                <span id='checkUpdateTips' ref='checkUpdateTips' class='text-blue-700 dark:text-blue-300 font-medium'>
                  {{ $t('about.checkingUpdate') }}
                </span>
              </div>
            </div>
            <button
              class='group relative w-full px-6 py-3 text-base font-medium text-white bg-blue-500 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
              @click='checkUpdates'
            >
              <span
                class='absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -translate-y-full bg-blue-600 group-hover:translate-y-0'></span>
              <span
                class='absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full translate-y-0 bg-blue-400 group-hover:translate-x-0'></span>
              <span class='relative flex items-center justify-center'>
                <CloudArrowDownIcon class='w-5 h-5 mr-2' />
                {{ $t('about.getLatestVersion') }}
              </span>
            </button>
          </div>

          <div class='text-center text-sm text-gray-600 dark:text-gray-400'>
            <p>{{ $t('about.copyright', {year: '2024', author: buildInfo.author}) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {store, openInBrowser, checkForUpdates, reAuthAccountLoginByOauth} from '#preload';
import UserAgreeTips from '/@/components/home/UserAgreeTips.vue';
import InfoCard from '/@/components/about/InfoCard.vue';
import {ArrowPathIcon, CloudArrowDownIcon} from '@heroicons/vue/24/outline';
import AccountProfile from '/@/components/widgets/AccountProfile.vue';

const checkUpdateTips = ref(null);
const buildInfo = ref({});
const showUpdateTips = ref(false);

const relatedLinks = [
  {name: 'Vercel', url: 'https://vercel.com/'},
  {name: 'Next.js', url: 'https://nextjs.org/'},
  {name: 'NodeJs', url: 'https://nodejs.org/'},
  {name: 'next-intl', url: 'https://next-intl-docs.vercel.app/'},
];

onMounted(() => {
  buildInfo.value = getBuildInfo();
});

function getBuildInfo() {
  return {
    nodejsVersion: '20.11.1',
    electronVersion: '29.2.0',
    author: 'KamJin, Inc.',
    version: store.get('version'),
    email: store.get('email'),
    website_url: store.get('website_url'),
  };
}

function checkUpdates() {
  showUpdateTips.value = true;
  checkForUpdates();

  setTimeout(() => {
    showUpdateTips.value = false;
  }, 5000);
}


</script>

<style scoped>
/* 如果需要额外的样式，可以在这里添加 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* 确保没有水平滚动条 */
}
</style>
