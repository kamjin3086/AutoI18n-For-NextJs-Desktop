<script setup>
import {onMounted, ref} from 'vue';
import {openInBrowser, store} from '#preload';
import {ChevronDownIcon} from '@heroicons/vue/24/outline';
import LocaleSwitcher from '/@/components/widgets/LocaleSwitcher.vue';

const showPopup = ref(false);

onMounted(() => {
  showPopup.value = store.get('isAgreedUserTips', null) !== 'true';
});

function acceptUserTips() {
  store.set('isAgreedUserTips', 'true');
  showPopup.value = false;
}

function rejectUserTips() {
  store.set('isAgreedUserTips', 'false');
  showPopup.value = false;
}

</script>

<template>
  <div>
    <button @click='showPopup = true'
            class='inline-flex items-center justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500'>
      <span class='flex'>{{ $t('userAgreeTips.usageNotice') }}<ChevronDownIcon class='ml-2 h-5 w-5 text-gray-400'
                                                                               aria-hidden='true' /></span>
    </button>

    <div v-if='showPopup'
         class='fixed inset-0 bg-glass backdrop-blur bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div class='bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl max-h-[90vh] overflow-y-auto'>

        <div>
          <locale-switcher class='mr-2' />
        </div>

        <div class='p-8'>
          <h2 class='text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white'>
            {{ $t('userAgreeTips.viewAndAgree') }}</h2>
          <section class='text-base leading-7 font-roboto text-gray-700 dark:text-gray-300 space-y-6'>
            <div>
              <h3 class='text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400'>{{ $t('userAgreeTips.welcome')
                }}</h3>
              <p>{{ $t('userAgreeTips.toolIntro') }}</p>
              <ol class='list-decimal ml-6 mt-2 space-y-2'>
                <li>{{ $t('userAgreeTips.feature1') }}</li>
                <li>{{ $t('userAgreeTips.feature2') }}</li>
                <li>{{ $t('userAgreeTips.feature3') }}</li>
              </ol>
              <p class='mt-2'>{{ $t('userAgreeTips.mainPurpose') }}</p>
            </div>

            <div>
              <h3 class='text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400'>
                {{ $t('userAgreeTips.systemRequirements') }}</h3>
              <ol class='list-decimal ml-6 space-y-2'>
                <li>
                  <p>
                    {{ $t('userAgreeTips.requirement1') }}
                    <a
                      href='https://nextjs.org'
                      target='_blank'
                      rel='noopener noreferrer'
                      class='text-blue-600 dark:text-blue-400 hover:underline'
                    >https://nextjs.org</a>
                  </p>
                </li>
                <li>
                  <p>{{ $t('userAgreeTips.requirement2') }}</p>
                </li>
              </ol>
            </div>

            <div>
              <h3 class='text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400'>
                {{ $t('userAgreeTips.developerSuggestions') }}</h3>
              <ol class='list-decimal ml-6 space-y-2'>
                <li>{{ $t('userAgreeTips.suggestion1') }}</li>
                <li>
                  {{ $t('userAgreeTips.suggestion2') }}
                  <a
                    href='https://next-intl-docs.vercel.app'
                    class='text-blue-600 dark:text-blue-400 hover:underline'
                  >https://next-intl-docs.vercel.app</a>
                </li>
                <li>
                  {{ $t('userAgreeTips.suggestion3') }}
                  <a
                    href='https://next-intl-docs.vercel.app/docs/getting-started/app-router'
                    class='text-blue-600 dark:text-blue-400 hover:underline'
                  >https://next-intl-docs.vercel.app/docs/getting-started/app-router</a>
                  {{ $t('userAgreeTips.suggestion3Cont') }}
                </li>
              </ol>
            </div>

            <div>
              <h3 class='text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400'>
                {{ $t('userAgreeTips.developerStatement') }}</h3>
              <ol class='list-decimal ml-6 space-y-2'>
                <li>{{ $t('userAgreeTips.statement1') }}</li>
                <li>
                  {{ $t('userAgreeTips.statement2') }}
                  <span
                    class='text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                    @click='openInBrowser(`mailto:support@autoi18n.dev`)'
                  >
                    support@autoi18n.dev
                  </span>
                </li>
                <li>{{ $t('userAgreeTips.statement3') }}</li>
                <li>{{ $t('userAgreeTips.statement4') }}</li>
                <li>
                  {{ $t('userAgreeTips.statement5') }}
                  <a
                    href='mailto:support@autoi18n.dev'
                    class='text-blue-600 dark:text-blue-400 hover:underline'
                  >support@autoi18n.dev</a>
                  {{ $t('userAgreeTips.statement5Cont') }}
                </li>
                <li>{{ $t('userAgreeTips.statement6') }}</li>
                <li>{{ $t('userAgreeTips.statement7') }}</li>
              </ol>
            </div>

            <p class='italic'>{{ $t('userAgreeTips.finalNote') }}</p>
          </section>

          <div class='mt-8 flex justify-center space-x-4'>
            <button
              id='agree-button'
              class='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md'
              @click='acceptUserTips'
            >
              {{ $t('userAgreeTips.agree') }}
            </button>
            <button
              id='reject-button'
              class='bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-md'
              @click='rejectUserTips'
            >
              {{ $t('userAgreeTips.reject') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
