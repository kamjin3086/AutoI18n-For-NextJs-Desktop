import path from 'path';
import fs from 'fs';
import {NEXTJS} from './nodeappjs/nextintl-version/approuters/consts' ;
// @ts-expect-error "not error!"
import {run} from './nodeappjs/nextintl-version/approuters/AppVersionRouter';

// dotenv.config({path: path.join(__dirname, '.env')});

function obtainHaveSrc(projectRootDir: string) {
  const srcDir = path.join(projectRootDir, 'src');
  return fs.existsSync(srcDir);
}

function obtainProjectVersion(projectRootDir: string, haveSrc: boolean) {
  //读取项目的src文件夹
  const dirs = haveSrc ? fs.readdirSync(path.join(projectRootDir, 'src')) : fs.readdirSync(projectRootDir);
  for (const d of dirs) {
    if (d === NEXTJS.APP) {
      return NEXTJS.APP;
    } else if (d === NEXTJS.PAGES) {
      return NEXTJS.PAGES;
    }
  }

  //不是nextjs项目
  throw new Error('Not Nextjs Project.');
}

// @ts-expect-error "not have errors,params"
export async function nodeAppRun(params) {
  //判断是app版本还是pages版本
  const haveSrc: boolean = obtainHaveSrc(params['projectRootDir']);
  const projectVersion = obtainProjectVersion(params['projectRootDir'], haveSrc);

  const options = {
    reIntegrationNextIntl: params['reIntegrationNextIntl'],
    projectRootDir: params['projectRootDir'],
    translatorServerName: params['translatorServerName'],
    haveSrc: haveSrc,
    defaultLang: params['defaultLang'],
    needLangs: params['needLangs'],
    brandWords: params['brandWords'],
    unMoveToLocaleDirFiles: params['unMoveToLocaleDirFiles'],
    enableStaticRendering: params['enableStaticRendering'],
    enableSubPageRedirectToLocale: params['enableSubPageRedirectToLocale'],
    disableDefaultLangRedirect: params['disableDefaultLangRedirect'],
    translationLevel: params['translationLevel'],
    modifyJsonMetadata: params['modifyJsonMetadata'],
  };

  if (projectVersion === NEXTJS.APP) {
    return await run(options);
  } else if (projectVersion === NEXTJS.PAGES) {
    // return await new PagesVersionRouter(options).run()
    throw new Error('Not Support!');
  } else {
    throw new Error('Not Support!');
  }
}

/**
 * 参数示例：
 * const projectRootDir = "E:\\webWorkSpace\\soracool-temp"
 * let defaultLang = "en"
 * let needLangs = ['en', 'zh', 'de', "ja"]
 * const brandWords = ['SoraCool', 'soracool', "Sora", 'sora'];
 * 通过node调用示例： node app --projectRootDir='E:\\webWorkSpace\\soracool-temp' --defaultLang='en' --needLangs='en,ja,zh,de' --brandWords='Sora,SoraCool,Sora Cool'
 *
 * @returns {Promise<void>}
 */
// async function runByArgs() {
//     const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
//     const params = {
//         'projectRootDir': argv.projectRootDir,
//         'defaultLang': argv.defaultLang,
//         'needLangs': argv.needLangs.split(","),
//         'brandWords': argv.brandWords.split(","),
//         'enableStaticRendering': argv.enableStaticRendering === 'true'
//     };
//     await nodeAppRun(params)
// }


//拷贝源码到临时目录
// copyDirectory("D:\\webWorkSpace\\soracool-next","D:\\webWorkSpace\\soracool-next-temp","node_modules")
