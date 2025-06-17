import fs from 'fs';
import lodash from 'lodash';
// import tencent from './sdks/tencent';
import azure from './sdks/microsoft_azure';
import {writeLangJsonFile} from '../utils/sourceLangJsonFileUpdater';
import {isBlank} from '../utils/ObjectUtil';

import {getAllLanguages} from '../../../languages';

// Generate a unique placeholder for each brand word
const placeHoldersFunction = (brandWords) => {
  return brandWords.map((word, index) => `#${index}#`);
};

function collectValues(obj, brandWords, placeHolders) {
  let values = [];
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      let value = obj[key];
      // Replace each brand word with its corresponding placeholder
      brandWords.forEach((brandWord, index) => {
        value = value.split(brandWord).join(placeHolders[index]);
      });
      values.push(value);
    } else if (typeof obj[key] === 'object') {
      values = values.concat(collectValues(obj[key], brandWords, placeHolders));
    }
  }
  return values;
}

function replaceValues(obj, translations, brandWords, placeHolders) {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      let translation = translations.shift();
      // Replace each placeholder with its corresponding brand word
      placeHolders.forEach((p, index) => {
        translation = translation.split(p).join(brandWords[index]);
      });
      obj[key] = translation;
    } else if (typeof obj[key] === 'object') {
      replaceValues(obj[key], translations, brandWords, placeHolders);
    }
  }
}

const Servers = {
  // 'tencent': tencent,
  'azure': azure,
};

function obtainLangTagByTranslatorServerName(commonLangTag, translatorServerName) {
  const theLangData = getAllLanguages().find(item => item.common === commonLangTag);
  return theLangData.alias[translatorServerName] || commonLangTag;
}

async function doTranslate(translatorServerName, sourceLang, sourceLangJson, targetLang, langDir, brandWords) {
  if (sourceLang === targetLang) {
    console.log(`targetLang:${sourceLang} eq sourceLang, skip...`);
    return;
  }
  if (!sourceLangJson || sourceLangJson === '' || sourceLangJson === {}) {
    console.log(`sourceLangJson is empty, not to translate ${sourceLang}to ${targetLang}`);
    return;
  }
  const inputSource = obtainLangTagByTranslatorServerName(sourceLang, translatorServerName);
  const inputTarget = obtainLangTagByTranslatorServerName(targetLang, translatorServerName);

  const placeHolders = placeHoldersFunction(brandWords);
  const values = collectValues(sourceLangJson, brandWords, placeHolders);
  if (values.length === 0) {
    console.log(`no values to translate ${sourceLang}to ${targetLang}`);
    return;
  }

  //将tag处理为不同平台的标识，但是文件仍然使用统一的名称
  console.log(`begin translating ${sourceLang} to ${targetLang}... values:` + values);
  let translations;
  try {
    //FIXME 需要按照分钟级的文本限制量，切分文本并处理
    translations = await Servers[translatorServerName](values, inputSource, inputTarget);
  } catch (e) {
    console.log('translate server error:', e);
    return `ERROR: ${targetLang}.json file translate failed.
    Too much text, translation service rate limit, please try again later.
    `;
  }
  console.log(`translate ${sourceLang} to ${targetLang} done.`);

  //拷贝后再替换，避免原数据被修改
  replaceValues(sourceLangJson, translations, brandWords, placeHolders);
  // Ensure the directory exists
  writeLangJsonFile(`${langDir}/${targetLang}.json`, JSON.stringify(sourceLangJson, null, 2));
  console.log(`${targetLang}.json file translate done.`);

  return `INFO: ${targetLang}.json file translate done.
    Number of translations: ${values.length}
    `;
}

/**
 *
 * @param translatorServerName
 * @param interval
 * @param sourceLang
 * @param fullSourceLangJson
 * @param needTranslateSourceLangJson
 * @param targetLangs
 * @param langDir
 * @param brandWords
 * @returns {Promise<[]>}
 */
export async function doTranslateWithRateLimit(translatorServerName, interval, sourceLang, fullSourceLangJson, needTranslateSourceLangJson,
                                               targetLangs, langDir, brandWords) {
  const translateResults = [];
  for (let lang of targetLangs) {
    //检查如果具体语言的json文件不存在时，则全量翻译对应的语言
    const langJsonAlreadyExist = fs.existsSync(`${langDir}/${lang}.json`);
    if (!langJsonAlreadyExist) {
      //需要全量翻译
      console.log(`lang :${lang} json not exist, begin full translate.`);
    }

    //每次都复制一份新的sourceLangJson，避免修改原数据
    let needTranslateSourceLangJsonCopy = lodash.cloneDeep(langJsonAlreadyExist ? needTranslateSourceLangJson : fullSourceLangJson);
    if (isBlank(needTranslateSourceLangJsonCopy)) {
      console.debug(`Not need to translate ${sourceLang} to ${lang} return.`);
      continue;
    }
    //转为正确的json格式
    const translateResult = await doTranslate(translatorServerName, sourceLang, needTranslateSourceLangJsonCopy, lang, langDir, brandWords);
    translateResults.push(translateResult);
    await new Promise(resolve => setTimeout(resolve, interval)); // 等待n ms
  }
  return translateResults;
}
