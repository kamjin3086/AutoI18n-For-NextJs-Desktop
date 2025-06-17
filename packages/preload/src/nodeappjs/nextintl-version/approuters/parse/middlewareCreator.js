import fs from 'fs';
import {GENERATED_PAGE_IDENTITY_BYLINE} from '../consts.ts';
import {areCodeBlocksEqual} from '../../handlers/codeCheckHandler.js';
import {fileExistCheckSameCode} from '../../utils/fileHandler.js';

const disableRedirect = `${GENERATED_PAGE_IDENTITY_BYLINE}

import createMiddleware from 'next-intl/middleware';
import {locales} from "./i18n-metadata";

export default createMiddleware({
    // A list of all locales that are supported
    locales: locales,

    // Used when no locale matches
    defaultLocale: '\${defaultLang}',

    // 'always': This is the default, The home page will also be redirected to the default language, such as www.abc.com to www.abc.com/en
    // 'as-needed': The default page is not redirected. For example, if you open www.abc.com, it is still www.abc.com
    localePrefix: '\${localPrefixD}',
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(\${localeByI})/:path*']
};
`;

const enableRedirect = `${GENERATED_PAGE_IDENTITY_BYLINE}

import createMiddleware from 'next-intl/middleware';
import {locales} from "./i18n-metadata";

export default createMiddleware({
    // A list of all locales that are supported
    locales: locales,

    // Used when no locale matches
    defaultLocale: '\${defaultLang}',

    // 'always': This is the default, The home page will also be redirected to the default language, such as www.abc.com to www.abc.com/en
    // 'as-needed': The default page is not redirected. For example, if you open www.abc.com, it is still www.abc.com
    localePrefix: '\${localPrefixD}',
});

export const config = {
    // Match only internationalized pathnames
    // matcher: ['/', '/(en|de)/:path*']

    matcher: [
        // Match all pathnames except for
        // - … if they start with \`/api\`, \`/_next\` or \`/_vercel\`
        // - … the ones containing a dot (e.g. \`favicon.ico\`)
        '/((?!api|_next|_vercel|.*\\\\..*).*)',
        // '/(en|de)/:path*'
        // However, match all pathnames within \`/users\`, optionally with a locale prefix
        //'/([\\\\w-]+)?/users/(.+)'
    ]
};
`;

export default function create(projectRootDir, haveSrc, defaultLang, needLangs, enableSubPageRedirectToLocale, isEnableStaticRendering, disableDefaultLangRedirect) {
  const targetFile = projectRootDir + (haveSrc ? '/src/' : '/') + 'middleware.ts';
  const template = enableSubPageRedirectToLocale ? enableRedirect : disableRedirect;
  let formatted = template.replace(/\$\{locale}/g, needLangs.map(lang => `'${lang}'`).join(','));
  let formatted1 = formatted.replace(/\$\{localeByI}/g, needLangs.join('|'));
  let formatted2 = formatted1.replace(/\$\{defaultLang}/g, defaultLang);

  const localPrefixD = disableDefaultLangRedirect ? 'as-needed' : 'always';
  let formatted3 = formatted2.replace(/\$\{localPrefixD}/g, localPrefixD);

  if (fileExistCheckSameCode(targetFile, formatted3)) {
    return;
  }

  fs.writeFileSync(targetFile, formatted3);
  console.log('Created to new file: ', targetFile);
}
