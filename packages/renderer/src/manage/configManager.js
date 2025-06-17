import {showSuccess} from './renderHelper.js';

const AUTO_I18N_CONFIG_FILENAME = 'auto-i18n-config.json';
import {fileApi, store, bizHelper} from '#preload';

export function queryConfigs(projectRootPath) {
  let configs = {};
  //根据项目路径读取配置文件
  const configPath = fileApi.pathJoin([projectRootPath, AUTO_I18N_CONFIG_FILENAME]);
  //console.log("configPath:" + configPath)
  const configFileExist = fileApi.fileExist(configPath);
  if (configFileExist) {
    const configsContent = fileApi.fileRead(configPath);
    if (configsContent.length > 0) {
      configs = JSON.parse(configsContent);
      return configs;
    }
  }
  return {};
}

export function saveOrUpdateConfigs(projectRootPath, configs) {
  const configsContent = JSON.stringify(configs, null, 4);
  const configPath = fileApi.pathJoin([projectRootPath, AUTO_I18N_CONFIG_FILENAME]);
  fileApi.fileWrite(configPath, configsContent);
}

/**
 * 判断是否集成过了，目前判断配置文件是否存在，或者i18n.ts是否存在，以及[locale]文件夹必须存在
 * @param projectPath
 * @returns {boolean}
 */
export function notNeedReIntegrationNextIntl(projectPath) {
  const configPath = fileApi.pathJoin([projectPath, AUTO_I18N_CONFIG_FILENAME]);
  return (fileApi.fileExist(configPath) || fileApi.fileExist(projectPath + '/i18n.ts') || fileApi.fileExist(projectPath + '/src/i18n.ts'))
    && (fileApi.fileExist(projectPath + '/app/[locale]') || fileApi.fileExist(projectPath + '/src/app/[locale]'));
}

export function reShowConfigDataOnHtml(data, projectPath) {
  if (notNeedReIntegrationNextIntl(projectPath)) {
    document.getElementById('reIntegrationNextIntl').checked = false;
  } else {
    document.getElementById('reIntegrationNextIntl').checked = true;
  }

  const translatorServerName = data.translatorServerName || localStorage.getItem('translatorServerName') || 'azure';
  localStorage.setItem('translatorServerName', translatorServerName);
  showSuccess(`Translator Powered by ${translatorServerName}.`);

  if (data.enableStaticRendering) {
    document.getElementById('enableStaticRendering').checked = data.enableStaticRendering;
  } else {
    document.getElementById('enableStaticRendering').checked = false;
  }

  if (data.enableSubPageRedirectToLocale) {
    document.getElementById('enableSubPageRedirectToLocale').checked = data.enableSubPageRedirectToLocale;
  } else {
    document.getElementById('enableSubPageRedirectToLocale').checked = false;
  }

  // 更新HTML元素以回显配置
  if (data.defaultLang) {
    document.getElementById('defaultLang').value = data.defaultLang;
  }

  if (data.needLangs) {
    data.needLangs.forEach(lang => {
      try {
        document.querySelector(`input[name="langs"][value="${lang}"]`).checked = true;
      } catch (e) {
        //可能因为api或bug的原因，tag变更了，但不能影响主流程，此处忽略即可
        //ignore
      }
    });
  } else {
    //重置为默认未选中状态
    const element = document.getElementById('languageContainer');
    const checkboxInputs = element.querySelectorAll('input[type="checkbox"]');
    checkboxInputs.forEach(input => {
      input.checked = input.defaultChecked;
    });
  }

  if (data.brandWords) {
    document.getElementById('brandWords').value = data.brandWords.join('\n');
  } else {
    document.getElementById('brandWords').value = '';
  }

  const savedData = store.get('localeJsonEditResult.modifyJsonMetadata');
  if (savedData) {
    //选中选择翻译标签
    const translationLevelRadios = document.getElementsByName('translationLevel');
    for (let i = 0; i < translationLevelRadios.length; i++) {
      const current = translationLevelRadios[i];
      if (current.value === 'selectLabels') {
        current.checked = true;
        break;
      }
    }
  }

  // if (localStorage.getItem("translationLevel")) {
  //     const translationLevelRadios = document.getElementsByName('translationLevel');
  //     for (let i = 0; i < translationLevelRadios.length; i++) {
  //         const current = translationLevelRadios[i]
  //         if (current.value === localStorage.getItem("translationLevel")) {
  //             current.checked = true
  //             break;
  //         }
  //     }
  // }

}
