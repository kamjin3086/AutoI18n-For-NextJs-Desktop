import {createDirectories} from '../utils/fileHandler';
import {
  updateNextConfig, moveAppDirPagesToLocaleDir, installNextIntlIfNeeded, // installGlobalTruckerIfNeeded,
  // installGlobalTrucker,
} from './operationImpl';
import i18nCreator from './parse/i18nCreator';
import middlewareCreator from './parse/middlewareCreator';
import metadataConstCreator from './parse/metadataConstCreator';
import layoutTsxCreator from './parse/layoutTsxCreator';
// import pageTsxCreator from './parse/pageTsxCreator';
import {replaceAllJsxPages} from './parse/allJsxPagesReplacer';
import path from 'path';
import {doTranslateWithRateLimit} from '../translator/messageJsonTranslator';
import fs from 'fs';
import {replaceLocaleLabelOrContent} from './parse/withLocaleJsonHandler';
import {diffJson, transformMetadataByLocaleJson} from '../utils/jsonHandler';
import {isBlank} from '../utils/ObjectUtil';

/**
 * 拿到messages目录下的json列表，对比用户勾选的，如果不包含在用户勾选的文件中，则删除。避免后续引发其他问题，next-intl在多出来的多语言json时（也未设置matcher时），会发生乱跳问题。
 *
 * @param messageDir
 * @param sourceLang
 * @param needLangs
 */
function clearMessageDir(messageDir, sourceLang, needLangs) {
  fs.readdirSync(messageDir).forEach(file => {
    if (file === `${sourceLang}.json`) {
      return;
    }
    if (!needLangs.includes(file.replace('.json', ''))) {
      const theLangFilePath = path.join(messageDir, file);
      try {
        fs.rmSync(theLangFilePath, {force: true});
        console.info('json file cleared:', file);
      } catch (e) {
        console.error(`"delete file: ${theLangFilePath} failed.`, e);
      }
    }
  });
}


/**
 * 处理next-intl的文件摆放
 * https://next-intl-docs.vercel.app/docs/getting-started/app-router
 * @param resultLogList 结果日志列表
 * @param reIntegrationNextIntl 重新集成nextintl相关的配置和框架
 * @param projectRootDir 项目根目录
 * @param translatorServerName 翻译服务名称
 * @param sourceLang 默认语言
 * @param needLangs 需要的语言
 * @param haveSrc 是否有src目录
 * @param brandWords 品牌词
 * @param unMoveToLocaleDirFiles 不移动到Locale的文件
 * @param enableSubPageRedirectToLocale 是否启用子页面跳转到locale
 * @param isEnableStaticRendering 是否启用静态渲染
 * @param disableDefaultLangRedirect 是否禁用默认语言重定向
 * @param translationLevel 翻译级别
 * @param modifyJsonMetadata 需要修改的json元数据
 */
async function placeFileToNextIntl(resultLogList, reIntegrationNextIntl, projectRootDir, translatorServerName, haveSrc, sourceLang, needLangs, brandWords, unMoveToLocaleDirFiles, enableSubPageRedirectToLocale, isEnableStaticRendering, disableDefaultLangRedirect, translationLevel, modifyJsonMetadata) {

  //1.创建messages文件夹
  console.info('Processing project start.');
  const messageDir = path.join(projectRootDir, 'messages');
  createDirectories(messageDir);

  //如果有的话，获取默认语言json文件
  let existDefaultLangJson = {};
  const defaultLangFilePath = path.join(messageDir, `${sourceLang}.json`);
  if (fs.existsSync(defaultLangFilePath)) {
    console.debug('DefaultLangJson already exist.');
    existDefaultLangJson = JSON.parse(fs.readFileSync(defaultLangFilePath, 'utf8'));
  } else {
    console.debug('DefaultLangJson not exist.');
  }

  //移动app下所有页面文件（排除page,layout,robots.ts/js,sitemap.ts/js,favicon.ico,globals.css,error.ts,error.js）到[locale]
  const appDir = haveSrc ? path.join(projectRootDir, 'src', 'app') : path.join(projectRootDir, 'app');
  const localeDir = path.join(appDir, '[locale]');

  //如果需要重新集成，则替换跟配置有关的选项，否则只做标签处理和翻译
  if (reIntegrationNextIntl) {
    //2.修改next.config.js/mjs
    updateNextConfig(projectRootDir);

    //3.放入i18n.ts和middleware.ts和i8n-metadata.ts
    i18nCreator(projectRootDir, haveSrc, needLangs, isEnableStaticRendering);
    middlewareCreator(projectRootDir, haveSrc, sourceLang, needLangs, enableSubPageRedirectToLocale, isEnableStaticRendering, disableDefaultLangRedirect);

    //!!! 这个需要根据语言变化，不应该根据是否重新安装选项来决定
    // metadataConstCreator(projectRootDir, haveSrc, sourceLang, needLangs);

    // 创建[locale]目录
    createDirectories(localeDir);

    //4.移动app目录下的内容到[locale]目录下，排除指定文件
    moveAppDirPagesToLocaleDir(projectRootDir, haveSrc, unMoveToLocaleDirFiles);
    console.log('Pages moved done.');
  }

  metadataConstCreator(projectRootDir, haveSrc, sourceLang, needLangs);

  //5.处理移动后的所有页面，并追加生成en.json
  const ignorePageFiles = [
    path.join(localeDir, 'layout.tsx'), //排除localeLayout本身
  ];
  replaceAllJsxPages(messageDir, ignorePageFiles, localeDir, sourceLang, isEnableStaticRendering);
  console.log('JsxFiles parse done.');

  if (reIntegrationNextIntl) {
    //6.创建layout文件
    layoutTsxCreator(path.join(localeDir, 'layout.tsx'), needLangs, isEnableStaticRendering);
    //创建page文件
    // pageTsxCreator.create(path.join(appDir, "page.tsx"), sourceLang, isEnableStaticRendering)
  }

  //7.翻译指定的语言，生成对应的json文件
  const sourceLangFilePath = path.join(messageDir, `${sourceLang}.json`);

  if (!fs.existsSync(sourceLangFilePath)) {
    //!!!说明默认json生成失败了，需要抛出异常提示
    resultLogList.push('ERROR: sourceLangJson generate failed, No copy found in any default language, you can contact the developer.');
    return resultLogList;
  }

  let sourceLangJson = JSON.parse(fs.readFileSync(sourceLangFilePath, 'utf8'));
  if (isBlank(sourceLangJson)) {
    resultLogList.push('WARNING: sourceLangJson is blank.');
  }

  //8.判断或修改标签或内容
  console.info('translationLevel: ', translationLevel);
  if (translationLevel === 'selectLabels') {
    sourceLangJson = await replaceLocaleLabelOrContent(localeDir, modifyJsonMetadata, sourceLangFilePath, sourceLangJson);
  }

  //9.翻译
  //根据不同翻译等级，决定需要翻译哪些标签的内容
  let needTranslateSourceLangJson = {};
  switch (translationLevel) {
    case 'selectLabels': {
      //选择标签是指需要关注的是modifyJsonMetadata中的modifiedMetadataList中所包含的所有值，都需要翻译
      needTranslateSourceLangJson = transformMetadataByLocaleJson(modifyJsonMetadata.modifiedMetadataList);
      break;
    }
    case 'incremental': {
      //增量是指在原有基础上增加的翻译，不对在生成前就已经存在的标签做翻译，需要先读取历史的文件在此处与本次运行生成结束的做对比
      needTranslateSourceLangJson = diffJson(sourceLangJson, existDefaultLangJson);
      break;
    }
    case 'full': {
      //需要翻译全部
      needTranslateSourceLangJson = sourceLangJson;
      break;
    }
    default:
      throw new Error(`Not Support TranslationLevel: ${translationLevel}`);
  }

  await doTranslateWithRateLimit(translatorServerName, 400, sourceLang, sourceLangJson, needTranslateSourceLangJson, needLangs, messageDir, brandWords).then((translateResults) => {
    console.log('All translate done.');

    //将翻译的内容形成文本，返回
    if (translateResults.length > 0) {
      translateResults.forEach((log) => (resultLogList.push(log)));
    }
  });

  //安装放在后面
  if (reIntegrationNextIntl) {
    // 安装next-intl
    const intlInstallResult = await installNextIntlIfNeeded(projectRootDir);
    if (!intlInstallResult) {
      resultLogList.push('WARNING: ' + 'next-intl的安装未成功，但集成和更新的过程已经完成，如果稍后需要运行项目，则在项目根目录中手动安装: npm install next-intl 更多详情查看：https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing');
    } else {
      resultLogList.push('INFO: ' + 'next-intl安装完成。更多详情查看：https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing');
    }
  }

  //清理工作，用来清理用户不需要的配置或文件等
  clearMessageDir(messageDir, sourceLang, needLangs);

  console.info('Processing project finish.');

  resultLogList.push('INFO: ' + 'Update Done.');
  return resultLogList;
}


async function operation(options) {
  const resultLogList = [];
  return await placeFileToNextIntl(resultLogList, options.reIntegrationNextIntl, options.projectRootDir, options.translatorServerName, options.haveSrc, options.defaultLang, options.needLangs, options.brandWords, options.unMoveToLocaleDirFiles, options.enableSubPageRedirectToLocale, options.enableStaticRendering, options.disableDefaultLangRedirect, options.translationLevel, options.modifyJsonMetadata);
}

export async function run(options) {
  try {
    return await operation(options);
  } catch (e) {
    console.error(e.stack);
    throw e;
  }
}
