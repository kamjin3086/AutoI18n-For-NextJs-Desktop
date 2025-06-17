'use client'
import {useLocale} from "next-intl";
import {localeItems} from "./i18n-metadata";
import {useRouter, usePathname} from 'next/navigation';

export default function LangSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleChange = (e: any) => {
        const newLocale = e.target.value;

        const rootPath = '/';
        const currentLocalePath = `/${locale}`;
        const newLocalePath = `/${newLocale}`;

        // Function to construct new path with locale prefix
        const constructLocalePath = (path: string, newLocale: string) => {
            if (path.startsWith(currentLocalePath)) {
                return path.replace(currentLocalePath, `/${newLocale}`);
            } else {
                return `/${newLocale}${path}`;
            }
        };

        if (pathname === rootPath || !pathname) {
            router.push(newLocalePath);
        } else if (pathname === currentLocalePath || pathname === `${currentLocalePath}/`) {
            router.replace(newLocalePath);
        } else {
            const newPath = constructLocalePath(pathname, newLocale);
            router.replace(newPath);
        }
        router.refresh()
    };

    //const isHomePage = pathname === "/" || pathname === `/${locale}`

    return (
        <select
            value={locale}
            onChange={handleChange}
            className={`block appearance-none w-min dark:bg-gray-950 dark:text-gray-300 text-gray-700 text-sm border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-10 focus:ring-blue-600 focus:border-blue-600`}
        >
            {localeItems.map((item, index) => (
                <option key={index} value={item.code}
                >
                    {item.name}
                </option>
            ))}
        </select>
    );
}