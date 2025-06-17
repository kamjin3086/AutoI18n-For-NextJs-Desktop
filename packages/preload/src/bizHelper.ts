import {store} from './electronApis';

export const bizHelper = {
  checkIsAgreedUserTipsOrAlert: () => {
    const isAgreedUserTips = store.get('isAgreedUserTips');
    if (isAgreedUserTips !== 'true') {
      alert('请先阅读并同意使用须知');
      return false;
    }
    return true;
  },
  //@ts-ignore
  isBlank: (value: any) => {
    // 判断undefined或null
    if (value === undefined || value === null) {
      return true;
    }

    // 判断空字符串
    if (typeof value === 'string' && value.trim() === '') {
      return true;
    }

    // 判断空对象字符串
    if (typeof value === 'string' && value.trim() === '{}') {
      return true;
    }

    // 判断空对象或空数组
    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }

    // 其他情况返回false，即不是空值
    return false;
  },

};

