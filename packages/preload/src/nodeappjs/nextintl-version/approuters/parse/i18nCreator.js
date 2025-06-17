import fs from 'fs';
import {GENERATED_PAGE_IDENTITY_BYLINE} from '../consts.ts';
import {areCodeBlocksEqual} from '../../handlers/codeCheckHandler.js';
import {fileExistCheckSameCode} from '../../utils/fileHandler.js';

const template = `${GENERATED_PAGE_IDENTITY_BYLINE}

import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales} from "./i18n-metadata";

export default getRequestConfig(async ({locale}) => {
    // Validate that the incoming \`locale\` parameter is valid
    if (!locales.includes(locale as any)) notFound();

    return {
        messages: (await import(\`\${dotBySrc}/messages/\${locale}.json\`)).default
    };
});
`;

export default function create(projectRootdir, haveSrc, needLangs, _) {
  const targetFile = projectRootdir + (haveSrc ? '/src/' : '/') + 'i18n.ts';
  let dotBySrcNeedReplace = haveSrc ? '..' : '.';
  let formatted = template.replace(/\$\{dotBySrc}/g, dotBySrcNeedReplace);
  let formatted1 = formatted.replace(/\$\{localeList}/g, needLangs.map(lang => `'${lang}'`).join(','));

  if (fileExistCheckSameCode(targetFile, formatted1)) {
    return;
  }

  fs.writeFileSync(targetFile, formatted1);
  console.log('Created to new file: ', targetFile);
}


