import {store, openInBrowser, nodeAppRun, bizHelper, queryTodayLogTextForLines} from '#preload';
import {saveOrUpdateConfigs} from '../../manage/configManager.js';
import {
  disableButton, enableButton, hideLoader, showError, showLoader, showSuccess,
} from '../../manage/renderHelper.js';
import {setAppendedLogHtml} from '/@/manage/sharedState.js';

// 修改或添加submitForm函数以适应新的逻辑
export async function submitForm() {
  try {
    if (!bizHelper.checkIsAgreedUserTipsOrAlert()) {
      return;
    }
    console.info('User Submit.');
    await doRunApp();
    console.info('Run Finish.');
  } catch (error) {
    // 显示错误消息
    console.error('Run error: ', error);
    showError(error.message);
    alert(`run error: ${error.message}`);
  }
}

function resultLogToHtml(logList) {
  //const now = nowDateTime(); // 获取当前日期和时间
  // 替换换行符为HTML换行标签
  if (logList) {
    const theHtmlLog = logList.map((log) => {
      if (log) {
        let logMessage;
        if (log.toLowerCase().startsWith('info:')) {
          logMessage = `<div style='color: #1890ff'>${log}</div>`;
        } else if (log.toLowerCase().startsWith('warning:')) {
          logMessage = `<div  style='color: #faad14'>${log}</div>`;
        } else if (log.toLowerCase().startsWith('error:')) {
          logMessage = `<div  style='color: #ff4d4f'>${log}</div>`;
        } else {
          logMessage = `<div style='color: #52c41a'>${log}</div>`;
        }
        log = logMessage;
      }
      return log;
    }).join('');

    console.debug('theHtmlLog: ' + theHtmlLog);
    return '<strong>日志信息：</strong><br/>' + theHtmlLog;
  }
  return '';
}

function checkAndShowResult(resultLogList) {
  showSuccess('Success.');

  setAppendedLogHtml(resultLogToHtml(resultLogList));
  if (!resultLogList || resultLogList.length < 1) {
    console.error('resultLogList is null or empty.');
  }
}

async function checkAndGetTranslationLevel() {
  const translationLevelRadios = document.getElementsByName('translationLevel');

  // 遍历所有 radio 输入元素
  let translationLevel;
  for (let i = 0; i < translationLevelRadios.length; i++) {
    // 检查哪个 radio 被选中
    if (translationLevelRadios[i].checked) {
      // 输出被选中的 radio 的值
      translationLevel = translationLevelRadios[i].value;
      console.debug('Selected translationLevel: ' + translationLevel);
      break; // 找到被选中的值后，停止遍历
    }
  }
  if (!translationLevel) {
    alert('请选择翻译级别');
    return null;
  }

  //判定ModifiedJsonMetadata元素是否有值
  if (translationLevel === 'selectLabels') {
    const modifyJsonMetadata = store.get('localeJsonEditResult.modifyJsonMetadata');
    if (bizHelper.isBlank(modifyJsonMetadata)) {
      alert('没有选择或要修改的内容，请打开JSON编辑框进行选择或编辑');
      return null;
    }
  }
  return translationLevel;
}

async function doRunApp() {
  const projectPath = document.getElementById('selectedDirectoryPath').textContent;
  if (projectPath === '未选择，选择后将读取历史配置') {
    alert('请选择一个文件夹！');
    return;
  }

  console.debug('current projectPath:', projectPath);

  //获取将要使用的翻译服务名称
  const translatorServerName = localStorage.getItem('translatorServerName') || 'azure';
  console.debug('current translatorServerName:', translatorServerName);

  //解析过滤词
  const textArea = document.getElementById('brandWords');
  const brandWords = textArea.value.split('\n').map(word => word.trim()).filter(word => word.length > 0);

  const textArea2 = document.getElementById('unMoveToLocaleDirFiles');
  const unMoveToLocaleDirFiles = textArea2.value.split('\n').map(word => word.trim()).filter(word => word.length > 0);

  // 解析其他参数
  let defaultLang = document.getElementById('defaultLang').value;
  const langs = Array.from(document.querySelectorAll('input[name="langs"]:checked')).map(el => el.value) || [];
  if (langs.length === 0) {
    alert('请至少选择一个需要i18n的语言！');
    return;
  }

  //是否重新集成，集成就意味着需要覆盖各种相关文件，这不适合已经集成或者手动集成的项目。适合没有集成过的新项目，或者自己不改动配置的项目，或者修改错误的集成的项目。
  const reIntegrationNextIntl = document.getElementById('reIntegrationNextIntl').checked;

  // 获取复选框元素
  const enableStaticRendering = document.getElementById('enableStaticRendering').checked;
  const enableSubPageRedirectToLocale = document.getElementById('enableSubPageRedirectToLocale').checked;
  const disableDefaultLangRedirect = document.getElementById('disableDefaultLangRedirect').checked;

  //获取翻译的级别
  const translationLevel = await checkAndGetTranslationLevel();
  if (!translationLevel) {
    return;
  }

  //获取需要翻译的内容及标签/值的更改
  const modifyJsonMetadata = store.get('localeJsonEditResult.modifyJsonMetadata');

  // 确认弹出框
  let userResponse = confirm('确保您已经提交或保存本地代码，确认提交任务？');
  if (userResponse) {
    // 用户点击了确认按钮
    console.debug('Confirmed submit');
  } else {
    // 用户点击了取消按钮
    console.debug('Canceled submit');
    return;
  }

  //禁用按钮，防止重复点击
  disableButton('submitButton');

  //显示一个loader
  showLoader();

  // 显示成功消息
  showSuccess(`任务已提交，正在处理中... 当前翻译源：${translatorServerName}`);

  // 合并并更新参数到项目文件夹中
  const newConfigs = {
    defaultLang: defaultLang,
    translatorServerName: translatorServerName,
    needLangs: langs,
    brandWords: brandWords,
    unMoveToLocaleDirFiles: unMoveToLocaleDirFiles,
    enableStaticRendering: enableStaticRendering,
    enableSubPageRedirectToLocale: enableSubPageRedirectToLocale,
    disableDefaultLangRedirect: disableDefaultLangRedirect, // translationLevel: translationLevel,
  };
  saveOrUpdateConfigs(projectPath, newConfigs);

  const params = {
    'reIntegrationNextIntl': reIntegrationNextIntl,
    'projectRootDir': projectPath,
    'translatorServerName': translatorServerName,
    'defaultLang': defaultLang,
    'needLangs': langs,
    'brandWords': brandWords,
    'unMoveToLocaleDirFiles': unMoveToLocaleDirFiles,
    'enableStaticRendering': enableStaticRendering,
    'enableSubPageRedirectToLocale': enableSubPageRedirectToLocale,
    'disableDefaultLangRedirect': disableDefaultLangRedirect,
    'translationLevel': translationLevel,
    'modifyJsonMetadata': modifyJsonMetadata,
  };

  const bugFeedback = document.getElementById('bugFeedback');

  try {
    bugFeedback.hidden = true;

    try {
      console.debug('Submit Params: ' + JSON.stringify(params)); //参数
    } catch (e) {
      console.error(e.stack);
    }
    //const startTime = performance.now(); // 使用performanceApi可以得到执行时长
    nodeAppRun(params).then(resultLogList => {
      console.log('result:' + resultLogList); // 函数返回结果，非日志

      //检查结果并展示内容
      checkAndShowResult(resultLogList);

      //启用按钮
      enableButton('submitButton');
      //隐藏载入圈
      hideLoader();
      //成功后清除编辑器的数据
      try {
        store.del('localeJsonEditResult.modifyJsonMetadata');
      } catch (e) {
        //ignore
      }
    }).catch(error => {
      //启用按钮
      enableButton('submitButton');
      //隐藏载入圈
      hideLoader();

      // error handle
      showError(error);

      //query today log
      let todayLogText = queryTodayLogTextForLines();
      if (todayLogText.length <= 1) {
        todayLogText = 'No log collection.';
      } else {
        todayLogText = encodeURIComponent(todayLogText);
      }

      //日志长度截取
      const maxLength = 8000;
      let truncatedLogText = todayLogText.length > maxLength ?
        todayLogText.slice(0, maxLength / 2) + '...[TRUNCATED]...' + todayLogText.slice(-maxLength / 2)
        : todayLogText;

      bugFeedback.hidden = false;
      bugFeedback.addEventListener('click', () => {
        let url = `${getBuildInfo().website_url}/feedback?submit=auto&feedbackType=bug&feedback=${truncatedLogText + '=>' + error}`;

        //查询用户信息，如果已存在用户信息，则携带该信息
        const accountInfo = store.get('account_info');
        if (accountInfo) {
          url = url + `&name=${accountInfo.name}&email=${accountInfo.email}`;
        }
        openInBrowser(url);
      });


    });
  } catch (e) {
    console.error(e.stack);
  }
}

function getBuildInfo() {
  return {
    version: store.get('version'),
    email: store.get('email'),
    website_url: store.get('website_url'),
  };
}


export function openProjectViewInBrowser() {
  openInBrowser('http://localhost:3000');
}

