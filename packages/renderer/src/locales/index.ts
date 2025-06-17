import {createI18n} from 'vue-i18n';

// 导入你自己创建的语言 js 文件
import zh_cn from './zh_cn';
import en from './en';

// 创建 i18n 对象
const i18n = createI18n({
  locale: localStorage.getItem('lang') || 'en',
  legacy: true,
  fallbackLocale: 'en',
  messages: {
    zh_cn,
    en,
  },
});

const locales = [
  {text: '中文', value: 'zh_cn'},
  {text: 'English', value: 'en'},
];


export {i18n, locales};
