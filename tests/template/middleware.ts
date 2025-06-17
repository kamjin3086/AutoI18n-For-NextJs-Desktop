// @auto-i18n-check. Please do not delete the line.

import createMiddleware from 'next-intl/middleware';
import {locales} from "./i18n-metadata";

export default createMiddleware({
    // A list of all locales that are supported
    locales: locales,

    // Used when no locale matches
    defaultLocale: 'en',
    
    // 'always': This is the default, The home page will also be redirected to the default language, such as www.abc.com to www.abc.com/en
    // 'as-needed': The default page is not redirected. For example, if you open www.abc.com, it is still www.abc.com
    localePrefix: 'as-needed',
});

export const config = {
    // Match only internationalized pathnames
    // matcher: ['/', '/(en|de)/:path*']

    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next` or `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        '/((?!api|_next|_vercel|.*\\..*).*)',
        // '/(en|de)/:path*'
        // However, match all pathnames within `/users`, optionally with a locale prefix
        //'/([\\w-]+)?/users/(.+)'
    ]
};
