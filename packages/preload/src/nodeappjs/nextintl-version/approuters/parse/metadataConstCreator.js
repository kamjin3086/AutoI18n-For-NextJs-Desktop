import {GENERATED_PAGE_IDENTITY_BYLINE} from '../consts.ts';
import fs from 'fs';
import {areCodeBlocksEqual} from '../../handlers/codeCheckHandler.js';
import {fileExistCheckSameCode} from '../../utils/fileHandler.js';

const template = `${GENERATED_PAGE_IDENTITY_BYLINE}

export const localeItems = \${localeItems};

export const locales = localeItems.map((item) => item.code);
export const defaultLocale = '\${defaultLang}';
`;

export default function create(projectRootDir, haveSrc, defaultLang, needLangs) {
  const targetFile = projectRootDir + (haveSrc ? '/src/' : '/') + 'i18n-metadata.ts';
  const theAll = [
    {code: 'en', name: 'English'},
    {code: 'zh', name: '中文简体'},
    {code: 'zh-t', name: '中文繁體'},
    {code: 'de', name: 'Deutsch'},
    {code: 'fr', name: 'Français'},
    {code: 'ja', name: '日本語'},
    {code: 'ko', name: '한국어'},
    {code: 'es', name: 'Español'},
    {code: 'it', name: 'Italiano'},
    {code: 'ru', name: 'Русский'},
    {code: 'pt', name: 'Português'},
    {code: 'vi', name: 'Tiếng Việt'},
    {code: 'id', name: 'Bahasa Indonesia'},
    {code: 'th', name: 'ไทย'},
    {code: 'ms', name: 'Bahasa Melayu'},
    {code: 'ar', name: 'العربية'},
    {code: 'hi', name: 'हिन्दी'},
  ];

  const needToReplaceds = [];
  needToReplaceds.push('[');
  for (let item of theAll) {
    let pri = needLangs.includes(item.code) ? '' : '//';
    needToReplaceds.push(
      `${pri}{code: '${item.code}', name: '${item.name}'},`,
    );
  }

  //排序一下，让有注释的在下面
  needToReplaceds.sort((a, b) => a.localeCompare(b));

  needToReplaceds.push(']');

  let needToReplacedsStr = needToReplaceds.join('\n');

  let formatted1 = template.replace(/\$\{defaultLang}/g, defaultLang);
  let formatted2 = formatted1.replace(/\$\{localeItems}/g, needToReplacedsStr);

  if (fileExistCheckSameCode(targetFile, formatted2)) {
    return;
  }

  fs.writeFileSync(targetFile, formatted2);
  console.log('Created to new file: ', targetFile);
}

