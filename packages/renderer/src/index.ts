import {createApp} from 'vue';
import {createRouter, createWebHistory} from 'vue-router';
import App from './App.vue';

import hljs from 'highlight.js'; //导入代码高亮文件
// import 'highlight.js/styles/gradient-light.css';  //导入代码高亮样式
// import 'highlight.js/styles/gradient-dark.css';  //导入代码高亮样式
import 'highlight.js/styles/base16/solar-flare.css';  //导入代码高亮样式

import Home from './components/home/HomePage.vue';
import About from './components/about/AboutPage.vue';
import Faqs from './components/faqs/FaqsPage.vue';
import LocaleJsonEditor from './components/localeJsonEditor/LocaleJsonEditorPage.vue';
import ProjectView from './components/projectView/ProjectViewPage.vue';

// 导入国际化配置
import {i18n} from '/@/locales';

// 定义路由配置
const routes = [
  {path: '/', component: Home},
  {path: '/about', component: About},
  {path: '/faqs', component: Faqs},
  {path: '/localeJsonEditor', component: LocaleJsonEditor},
  {path: '/projectView', component: ProjectView},
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 创建Vue应用
const app = createApp(App);

//自定义一个代码高亮指令
app.directive('highlight', function(el) {
  const blocks = el.querySelectorAll('pre code');
  //@ts-ignore
  blocks.forEach((block) => {
    hljs.highlightBlock(block);
  });
});

// 使用路由实例
app.use(router);

// 使用国际化配置
app.use(i18n);

// 挂载应用
app.mount('#app');
