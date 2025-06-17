<script lang='js' setup>
import {fileApi, store, bizHelper, getAllLanguages, openInBrowser} from '#preload';
import {ref, onMounted} from 'vue';
import {ChevronDownIcon, PaperAirplaneIcon, EyeIcon, FolderIcon, FolderOpenIcon} from '@heroicons/vue/24/outline';
import {submitForm, openProjectViewInBrowser} from './home.js';
import {queryConfigs, reShowConfigDataOnHtml, notNeedReIntegrationNextIntl} from '/@/manage/configManager.js';
import ToolTips from '/@/components/widgets/ToolTips.vue';
import LocaleSwitcher from '/@/components/widgets/LocaleSwitcher.vue';
import UserAgreeTips from '/@/components/home/UserAgreeTips.vue';
import {useSharedState} from '../../manage/sharedState.js';
import AccountProfile from '/@/components/widgets/AccountProfile.vue';

const state = useSharedState();

const languageContainerRef = ref(null);
const defaultLangRef = ref(null);

const reIntegrationNextIntlCheckboxRef = ref(false);

const showTips = ref(false);

/**
 * 检查该按钮的反选，当反选时，检查是否确实需要集成，需要的话就弹窗
 */
async function handleChangeReIntegrationNextIntl(event) {
  const newValue = event.target.checked;
  //用户反选了该选项，检查是否确实需要集成，需要的话就提示用户
  if (!newValue) {
    const projectPath = store.get('selectedProjectPath');
    if (!notNeedReIntegrationNextIntl(projectPath)) {
      alert('发现当前项目没有集成next-intl或集成无效，如果需要则请勾选此选项。');
    }
  }

}

onMounted(() => {
  load().then(() => {
    //console.log('reload');
  });
});

async function load() {
  const allLanguages = getAllLanguages();

  // 注意顺序
  // 先加载控件
  await updateCheckboxList(allLanguages);

  await updateDropdownMenu(allLanguages);

  // 再回显配置
  await loadConfiguration();
}

async function updateCheckboxList(allLanguages) {
  const container = languageContainerRef.value;
  allLanguages.forEach((lang, index) => {
    const div = document.createElement('div');
    const checkbox = document.createElement('input');
    const label = document.createElement('label');

    checkbox.type = 'checkbox';
    checkbox.id = 'lang' + (index + 1);
    checkbox.name = 'langs';
    checkbox.value = lang.common;
    checkbox.className = 'mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500 bg-gray-200 focus:outline-none';

    label.htmlFor = checkbox.id;
    label.textContent = lang.title;
    label.className = 'text-gray-700 dark:text-gray-300';

    div.appendChild(checkbox);
    div.appendChild(label);
    container.appendChild(div);
  });
}

async function updateDropdownMenu(allLanguages) {
  const select = defaultLangRef.value;
  allLanguages.forEach((lang) => {
    const option = document.createElement('option');
    option.value = lang.common;
    option.textContent = lang.title;
    select.appendChild(option);
  });
}

const emit = defineEmits(['sidebarClick']);

function selectNeedTransLabels() {
  //检查是否已经选择了项目目录
  const selectedProjectPath = store.get('selectedProjectPath');
  if (!selectedProjectPath) {
    alert('请先选择项目目录');
    return;
  }

  //将标签选中到选择翻译上
  document.getElementById('selectLabels').checked = true;

  console.log('Open localeJsonEditor.');

  //发送事件，跳转路由
  emit('sidebarClick', 'localeJsonEditor');
}


function openFaqs() {
  console.log('Open faqs.');
  //发送事件，跳转路由
  emit('sidebarClick', 'faqs');
}

async function loadConfiguration() {
  const projectPath = store.get('selectedProjectPath');
  if (projectPath) {
    console.debug('Found last project: ', projectPath);
    document.getElementById('selectedDirectoryPath').textContent = projectPath;

    //将内容回显至主界面
    const existConfig = queryConfigs(projectPath);
    //console.log("configs:" + JSON.stringify(existConfig))
    reShowConfigDataOnHtml(existConfig, projectPath);

    //将初始的localeJsonData数据放入store
    if (existConfig.defaultLang) {
      const defaultLang = existConfig.defaultLang;
      const defaultLocaleFilePath = fileApi.pathJoin([projectPath, 'messages', `${defaultLang}.json`]);

      if (fileApi.fileExist(defaultLocaleFilePath)) {
        const localeJsonData = fileApi.fileRead(defaultLocaleFilePath);
        if (localeJsonData.length > 0) {
          store.set('localeJsonData', localeJsonData);
        }
      }
    }
  }
  console.debug('Loaded configuration.');
}

async function selectProjectDir() {
  if (!bizHelper.checkIsAgreedUserTipsOrAlert()) {
    return;
  }

  const filePaths = await fileApi.openDirectoryDialog();
  if (filePaths.length > 0) {
    const projectPath = filePaths[0];
    document.getElementById('selectedDirectoryPath').textContent = projectPath; // 处理并显示文件路径

    //将内容回显至主界面
    const existConfig = await queryConfigs(projectPath);
    try {
      console.debug('Configs: ' + JSON.stringify(existConfig));
    } catch (e) {
      console.error(e);
    }
    reShowConfigDataOnHtml(existConfig, projectPath);

    //保存或更新当前使用的项目
    store.set('selectedProjectPath', projectPath);
  } else {
    document.getElementById('selectedDirectoryPath').textContent = '没有选择项目目录。';
  }
}

</script>

<template>
  <div class='min-h-screen flex flex-col'>
    <div class='flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900'>

      <div class='flex justify-end mr-8 mt-6'>
        <account-profile></account-profile>
      </div>

      <div class='py-10 px-4 sm:px-6 lg:px-8'>

        <form id='commandForm'
              class='bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden'>
          <div class='bg-blue-500 dark:bg-indigo-800 p-2 text-white'>
            <div class='flex justify-end'>
              <locale-switcher class='mr-2' />

              <UserAgreeTips />
            </div>
            <h2 class='text-3xl font-bold'>{{ $t('home.title') }}</h2>
            <p class='mt-2 text-blue-100 dark:text-indigo-200'>{{ $t('home.subtitle') }}</p>
          </div>

          <div class='p-8 space-y-8'>
            <!-- 选择项目根路径 -->
            <div class='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg'>
              <h4 class='text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center'>
                <FolderIcon class='w-6 h-6 mr-2 text-blue-500' />
                {{ $t('home.selectProjectRootPath') }}
              </h4>
              <div class='space-y-4'>
                <div
                  id='selectedDirectoryPath'
                  class='p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 italic transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                >
                  {{ $t('home.noSelection') }}
                </div>
                <div class='flex justify-end'>
                  <button
                    id='selectDirectoryButton'
                    type='button'
                    class='group relative px-6 py-2 bg-blue-500 text-white text-base font-medium rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                    @click='selectProjectDir'
                  >
                    <span
                      class='absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -translate-y-full bg-blue-600 group-hover:translate-y-0'></span>
                    <span
                      class='absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full translate-y-0 bg-blue-400 group-hover:translate-x-0'></span>
                    <span class='relative flex items-center justify-center'>
            <FolderOpenIcon class='w-5 h-5 mr-2' />
            {{ $t('home.selectFolder') }}
          </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 默认语言 -->
            <div>
              <label for='defaultLang' class='block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3'>
                {{ $t('home.defaultLanguage') }}
              </label>
              <select
                id='defaultLang'
                ref='defaultLangRef'
                name='defaultLang'
                class='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              ></select>
            </div>

            <!-- 配置多语言 -->
            <div>
              <div class='flex items-center mb-3'>
                <h4 class='text-lg font-semibold text-gray-800 dark:text-gray-200'>
                  {{ $t('home.configureMultilingual') }}
                </h4>
                <tool-tips class='ml-2 text-blue-500 hover:text-blue-600 transition duration-300'
                           :content="$t('home.multilingualTip')" />
              </div>
              <div
                id='languageContainer'
                ref='languageContainerRef'
                class='flex flex-wrap gap-3'
              ></div>
            </div>

            <!-- 品牌词 -->
            <div>
              <div class='flex items-center mb-3'>
                <label for='brandWords' class='text-lg font-semibold text-gray-800 dark:text-gray-200'>
                  {{ $t('home.brandWords') }}
                </label>
                <tool-tips class='ml-2 text-blue-500 hover:text-blue-600 transition duration-300'
                           :content="$t('home.brandWordsTip')" />
              </div>
              <textarea
                id='brandWords'
                rows='4'
                class='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none'
                :placeholder="$t('home.brandWordsPlaceholder')"
              ></textarea>
            </div>

            <!-- 不移动到语言目录的文件 -->
            <div>
              <div class='flex items-center mb-3'>
                <label for='unMoveToLocaleDirFiles' class='text-lg font-semibold text-gray-800 dark:text-gray-200'>
                  {{ $t('home.unmovedFiles') }}
                </label>
                <tool-tips class='ml-2 text-blue-500 hover:text-blue-600 transition duration-300'
                           :content="$t('home.unmovedFilesTip')" />
              </div>
              <textarea
                id='unMoveToLocaleDirFiles'
                rows='4'
                class='w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none'
                :placeholder="$t('home.unmovedFilesPlaceholder')"
              ></textarea>
            </div>

            <!-- 翻译选项 -->
            <div class='bg-blue-50 dark:bg-gray-700 p-6 rounded-xl'>
              <h4 class='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4'>
                {{ $t('home.translationOptions') }}
              </h4>
              <div class='space-y-3'>
                <div class='flex items-center'>
                  <input
                    id='selectLabels'
                    type='radio'
                    name='translationLevel'
                    value='selectLabels'
                    class='w-4 h-4 text-blue-600 focus:ring-blue-500 bg-gray-200 focus:outline-none'
                  >
                  <label for='selectLabels' class='ml-3 text-gray-700 dark:text-gray-300'>
                    {{ $t('home.select') }}
                  </label>
                  <tool-tips class='ml-2 text-blue-500 hover:text-blue-600 transition duration-300'
                             :content="$t('home.selectLabelsTip')" />
                  <a
                    id='selectNeedTransLabels'
                    class='ml-4 text-blue-600 hover:underline cursor-pointer'
                    @click='selectNeedTransLabels'
                  >
                    {{ $t('home.openEditor') }}
                  </a>
                </div>
                <div class='flex items-center'>
                  <input
                    id='incremental'
                    type='radio'
                    checked
                    name='translationLevel'
                    value='incremental'
                    class='w-4 h-4 text-blue-600 focus:ring-blue-500 bg-gray-200 focus:outline-none'
                  >
                  <label for='incremental' class='ml-3 text-gray-700 dark:text-gray-300'>
                    {{ $t('home.incremental') }}
                  </label>
                  <tool-tips class='ml-2 text-blue-500 hover:text-blue-600 transition duration-300'
                             :content="$t('home.incrementalTip')" />
                </div>
                <div class='flex items-center'>
                  <input
                    id='full'
                    type='radio'
                    name='translationLevel'
                    value='full'
                    class='w-4 h-4 text-blue-600 focus:ring-blue-500 bg-gray-200 focus:outline-none'
                  >
                  <label for='full' class='ml-3 text-gray-700 dark:text-gray-300'>
                    {{ $t('home.full') }}
                  </label>
                  <tool-tips class='ml-2 text-blue-500 hover:text-blue-600 transition duration-300'
                             :content="$t('home.fullTip')" />
                </div>
              </div>
            </div>

            <!-- 集成选项 -->
            <div class='bg-blue-50 dark:bg-gray-700 p-6 rounded-xl'>
              <h4 class='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4'>
                {{ $t('home.integrationOptions') }}
              </h4>
              <div class='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div class='flex items-center space-x-3'>
                  <input
                    id='reIntegrationNextIntl'
                    v-model='reIntegrationNextIntlCheckboxRef'
                    type='checkbox'
                    name='reIntegrationNextIntl'
                    :value='false'
                    class='w-5 h-5 text-blue-600 focus:ring-blue-500 bg-gray-200 focus:outline-none rounded'
                    @change='handleChangeReIntegrationNextIntl'
                  >
                  <label for='reIntegrationNextIntl' class='text-gray-700 dark:text-gray-300'>
                    {{ $t('home.reIntegrateNextIntl') }}
                  </label>
                  <tool-tips
                    class='text-blue-500 hover:text-blue-600 transition duration-300'
                    :content="$t('home.reIntegrateNextIntlTip')"
                  />
                </div>
                <div class='flex items-center space-x-3'>
                  <input
                    id='enableStaticRendering'
                    type='checkbox'
                    name='enableStaticRendering'
                    :value='false'
                    :disabled='!reIntegrationNextIntlCheckboxRef'
                    class='w-5 h-5 text-blue-600 focus:ring-blue-500 bg-gray-200 focus:outline-none rounded
                 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                  <label for='enableStaticRendering' class='text-gray-700 dark:text-gray-300'>
                    {{ $t('home.enableStaticRendering') }}
                  </label>
                  <tool-tips
                    class='text-blue-500 hover:text-blue-600 transition duration-300'
                    :content="$t('home.enableStaticRenderingTip')"
                  />
                </div>
                <div class='flex items-center space-x-3'>
                  <input
                    id='enableSubPageRedirectToLocale'
                    type='checkbox'
                    name='enableSubPageRedirectToLocale'
                    :disabled='!reIntegrationNextIntlCheckboxRef'
                    :checked='true'
                    :value='true'
                    class='w-5 h-5 text-blue-600 focus:ring-blue-500 bg-gray-200 focus:outline-none rounded
                 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                  <label for='enableSubPageRedirectToLocale' class='text-gray-700 dark:text-gray-300'>
                    {{ $t('home.enableSubPageRedirect') }}
                  </label>
                  <tool-tips
                    class='text-blue-500 hover:text-blue-600 transition duration-300'
                    :content="$t('home.enableSubPageRedirectTip')"
                  />
                </div>
                <div class='flex items-center space-x-3'>
                  <input
                    id='disableDefaultLangRedirect'
                    type='checkbox'
                    name='disableDefaultLangRedirect'
                    :disabled='!reIntegrationNextIntlCheckboxRef'
                    :checked='true'
                    :value='true'
                    class='w-5 h-5 text-blue-600 focus:ring-blue-500 bg-gray-200 focus:outline-none rounded
                 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                  <label for='disableDefaultLangRedirect' class='text-gray-700 dark:text-gray-300'>
                    {{ $t('home.disableDefaultLangRedirect') }}
                  </label>
                  <tool-tips
                    class='text-blue-500 hover:text-blue-600 transition duration-300'
                    :content="$t('home.disableDefaultLangRedirectTip')"
                  />
                </div>
              </div>
            </div>

          </div>

          <!-- 提交和预览按钮 -->
          <div
            class='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl shadow-inner flex justify-center space-x-6'>
            <button
              id='submitButton'
              type='button'
              class='group relative px-8 py-4 bg-blue-500 text-white text-base font-medium rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
              @click='submitForm'
            >
              <span
                class='absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -translate-y-full bg-blue-600 group-hover:translate-y-0'></span>
              <span
                class='absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full translate-y-0 bg-blue-400 group-hover:translate-x-0'></span>
              <span class='relative flex items-center justify-center'>
        <PaperAirplaneIcon class='w-5 h-5 mr-2' />
        {{ $t('home.submit') }}
      </span>
            </button>
            <button
              id='showResultButton'
              type='button'
              class='group relative px-8 py-4 bg-emerald-500 text-white text-base font-medium rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
              @click='openProjectViewInBrowser'
            >
              <span
                class='absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -translate-y-full bg-emerald-600 group-hover:translate-y-0'></span>
              <span
                class='absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full translate-y-0 bg-emerald-400 group-hover:translate-x-0'></span>
              <span class='relative flex items-center justify-center'>
        <EyeIcon class='w-5 h-5 mr-2' />
        {{ $t('home.preview') }}
      </span>
            </button>
          </div>

          <!-- 提示信息 -->
          <div
            class='bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-gray-700 dark:to-gray-600 rounded-xl shadow-md overflow-hidden transition-all duration-300'>
            <div
              class='flex justify-between items-center p-4 cursor-pointer'
              @click='showTips = !showTips'
            >
        <span class='font-semibold text-yellow-800 dark:text-yellow-200'>
          {{ $t('home.tipTitle') }}
        </span>
              <ChevronDownIcon
                class='h-6 w-6 text-yellow-600 dark:text-yellow-400 transition-transform duration-300'
                :class="{ 'rotate-180': !showTips }"
              />
            </div>
            <transition
              enter-active-class='transition-all duration-300 ease-out'
              leave-active-class='transition-all duration-300 ease-in'
              enter-from-class='opacity-0 max-h-0'
              enter-to-class='opacity-100 max-h-96'
              leave-from-class='opacity-100 max-h-96'
              leave-to-class='opacity-0 max-h-0'
            >
              <div v-if='showTips' class='p-4 text-sm text-yellow-800 dark:text-yellow-200'>
                {{ $t('home.tip') }}
                <a
                  class='ml-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                  @click.stop='openFaqs'
                >
                  {{ $t('home.faqsLink') }}
                </a>
                {{ $t('home.tipEnd') }}
              </div>
            </transition>
          </div>
        </form>

        <!-- 加载动画和结果日志 -->
        <div class='max-w-4xl mx-auto space-y-6'>
          <div
            v-show='state.isLoading'
            class='flex justify-center items-center space-x-3'
          >
            <div class='w-3 h-3 bg-blue-500 rounded-full animate-bounce'></div>
            <div class='w-3 h-3 bg-blue-500 rounded-full animate-bounce' style='animation-delay: 0.1s'></div>
            <div class='w-3 h-3 bg-blue-500 rounded-full animate-bounce' style='animation-delay: 0.2s'></div>
          </div>

          <div v-show='!state.isLoading' class='space-y-4'>
            <h3
              id='resultLog'
              class='text-xl font-semibold text-center text-gray-800 dark:text-gray-200'
            >
              {{ $t('home.resultPlaceholder') }}
            </h3>

            <div hidden='hidden' id='bugFeedback'
                 class='text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                 href='#'>Oops... Click Here To Report Errors
            </div>

            <div
              id='appendedLog'
              v-html='state.appendedLogHtml'
              class='p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto max-h-96 text-gray-700 dark:text-gray-300'
            ></div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<style scoped>
/* 你可以在这里添加任何额外的样式 */
.tool-tips {
  @apply inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full cursor-help;
}
</style>
