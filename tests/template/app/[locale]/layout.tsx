// @auto-i18n-check. Please do not delete the line.

import React from "react";
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales } from "../../i18n-metadata";
export default function LocaleLayout({
  children,
  params: {
    locale
  }
}: {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}) {
  unstable_setRequestLocale(locale);
  const messages = useMessages();
  return <html lang={locale}>
      <body>
      <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
      </NextIntlClientProvider>
      </body>
    </html>;
}
export function generateStaticParams() {
  return locales.map(locale => ({
    locale
  }));
}