import fs from 'fs';
import {GENERATED_PAGE_IDENTITY_BYLINE} from '../consts.ts';
import {areCodeBlocksEqual} from '../../handlers/codeCheckHandler.js';
import {fileExistCheckSameCode} from '../../utils/fileHandler.js';

const unstaticTemplate = `${GENERATED_PAGE_IDENTITY_BYLINE}

import React from "react";
import {NextIntlClientProvider, useMessages} from 'next-intl';

export default function LocaleLayout({
                                         children,
                                         params: {locale}
                                     }: {
    children: React.ReactNode; params: { locale: string };
}) {
    const messages = useMessages();
    return (
        <html lang={locale}>
        <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
`;

//静态渲染使用的模板
const staticTemplate = `${GENERATED_PAGE_IDENTITY_BYLINE}

import React from "react";
import {NextIntlClientProvider, useMessages} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import {locales} from "../../i18n-metadata";

export default function LocaleLayout({
                                         children,
                                         params: {locale}
                                     }: {
    children: React.ReactNode; params: { locale: string };
}) {
    unstable_setRequestLocale(locale);
    const messages = useMessages();
  return (
    <html lang={locale}>
      <body>
      <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
      </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
    return locales.map((locale) => ({locale}));
}
`;

export default function create(target, needLangs, isEnableStaticRendering) {
  let content;
  if (isEnableStaticRendering) {
    content = staticTemplate.replace(/\$\{locales}/g, needLangs.map(lang => `'${lang}'`).join(','));
  } else {
    content = unstaticTemplate;
  }

  if (fileExistCheckSameCode(target, content)) {
    return;
  }

  fs.writeFileSync(target, content);
  console.log('Created to new file: ', target);
}
