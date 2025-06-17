'use client'
import {useLocale} from "next-intl";
import {localeItems} from "./i18n-metadata";
import {useRouter, usePathname} from 'next/navigation';

export default function LangExpands() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleClick = (e: any) => {
        const newLocale = e.target.getAttribute("data-locale");

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

    return (
        <nav className="flex justify-center items-center py-1">
            <ul className="flex list-none">
                {localeItems.map((locale, index) => (
                    <li key={index} className="mr-4">
                        <p data-locale={locale.code} onClick={handleClick} style={{cursor: "pointer"}}
                           className="hover:underline dark:text-gray-400 text-gray-800 rounded px-3 py-1 inline-block">
                            {locale.name}
                        </p>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
