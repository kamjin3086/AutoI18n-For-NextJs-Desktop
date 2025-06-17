<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">

    <div class="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden">
        <div v-highlight class="p-8 sm:p-12">
          <h1 class="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white">
            {{ $t('faqs.title') }}
          </h1>

          <div class="mb-8">
            <div class="relative">
              <input
                id="searchInput"
                ref="searchInput"
                type="text"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                :placeholder="$t('faqs.searchPlaceholder')"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <ol id="searchList" ref="searchList" class="space-y-10">
            <li class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 class="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                {{ $t('faqs.q1.question') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <p>{{ $t('faqs.q1.answer1') }}</p>
                <a
                  class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  href="#"
                  @click.prevent="openInBrowser(`${buildInfo.website_url}/docs`)"
                >{{ $t('faqs.q1.docs') }}</a>

<!--                <p class="font-bold">{{ $t('faqs.q1.answer2') }}</p>-->
<!--                <h3>{{ $t('faqs.q1.suitableProjects') }}</h3>-->
<!--                <p>{{ $t('faqs.q1.projectsAnswer') }}</p>-->
<!--                <h3>{{ $t('faqs.q1.suitableUsers') }}</h3>-->
<!--                <p>{{ $t('faqs.q1.usersAnswer') }}</p>-->
              </div>
            </li>

            <li class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 class="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                {{ $t('faqs.q2.question') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <p>{{ $t('faqs.q2.answer') }}</p>
              </div>
            </li>

            <li class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 class="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                {{ $t('faqs.q3.question') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <h3>{{ $t('faqs.q3.clientComponent') }}</h3>
                <pre><code class="language-js">"use client";
import {useLocale} from "next-intl";
const locale = useLocale();
console.log(locale);</code></pre>

                <h3>{{ $t('faqs.q3.serverComponent') }}</h3>
                <h4>{{ $t('faqs.q3.tsxTitle') }}</h4>
                <pre><code class="language-ts">export default function Home({params: {locale} }: {params: {locale: string;}; }) {
    return &lt;div&gt;{console.log(locale)}&lt;/div&gt;
}</code></pre>

                <h4>{{ $t('faqs.q3.jsxTitle') }}</h4>
                <pre><code class="language-js">export default function Home({params: {locale} }) {
    return &lt;div&gt;{console.log(locale)}&lt;/div&gt;
}</code></pre>

                <p>{{ $t('faqs.q3.note') }}</p>
                <h4>{{ $t('faqs.q3.additionalNote') }}</h4>
                <p>{{ $t('faqs.q3.additionalNoteContent') }}</p>
              </div>
            </li>

            <li class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 class="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                {{ $t('faqs.q4.question') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <p>{{ $t('faqs.q4.errorMessage') }}</p>
                <p>{{ $t('faqs.q4.explanation') }}</p>
                <h3>{{ $t('faqs.q4.solutions') }}</h3>
                <h4>{{ $t('faqs.q4.solution1.title') }}</h4>
                <p>{{ $t('faqs.q4.solution1.content') }}</p>
                <h4>{{ $t('faqs.q4.solution2.title') }}</h4>
                <p>{{ $t('faqs.q4.solution2.content') }}</p>
                <h4>{{ $t('faqs.q4.additionalNote') }}</h4>
                <p>{{ $t('faqs.q4.additionalNoteContent') }}</p>
              </div>
            </li>

            <li class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 class="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                {{ $t('faqs.q5.question') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <p>{{ $t('faqs.q5.method1.title') }}</p>
                <p>{{ $t('faqs.q5.method1.content') }}</p>
                <p>{{ $t('faqs.q5.method2.title') }}</p>
                <p>{{ $t('faqs.q5.method2.content') }}</p>
                <pre><code class="language-js"># can be translate
&lt;div&gt;Hello&lt;/div&gt;

# can't be translate
&lt;div&gt;{ "Hello" }&lt;/div&gt;</code></pre>
              </div>
            </li>

            <li class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 class="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                {{ $t('faqs.q6.question') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <p>{{ $t('faqs.q6.introduction') }}</p>
                <p>{{ $t('faqs.q6.constantFile') }}</p>
                <h3>{{ $t('faqs.q6.i18nMetadataTitle') }}</h3>
                <pre><code class="language-js">export const localeItems = [
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
    {code: 'hi', name: 'हिन्दी'}
];

export const locales = localeItems.map((item) => item.code);
export const defaultLocale = 'en';</code></pre>

                <h3>{{ $t('faqs.q6.method1.title') }}</h3>
                <p>{{ $t('faqs.q6.method1.description') }}</p>
                <pre><code class="language-js">// langSwitcher.tsx
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

     return (
        &lt;select
    value=&#123;locale}
    onChange=&#123;handleChange}
    className={`block appearance-none w-min dark:bg-gray-950 dark:text-gray-300 text-gray-700 text-sm border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-10 focus:ring-blue-600 focus:border-blue-600`}
&gt;
    &#123;localeItems.map((item, index) =&gt; (
        &lt;option key=&#123;index} value=&#123;item.code}
        &gt;
            &#123;item.name}
        &lt;/option&gt;
    ))}
&lt;/select&gt;
    );
}</code></pre>

                <h3>{{ $t('faqs.q6.method2.title') }}</h3>
                <p>{{ $t('faqs.q6.method2.description') }}</p>
                <pre><code class="language-js">// langExpands.tsx
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
    &lt;nav className=&quot;flex justify-center items-center py-1&quot;&gt;
        &lt;ul className=&quot;flex list-none&quot;&gt;
            {localeItems.map((locale, index) =&gt; (
                &lt;li key={index} className=&quot;mr-4&quot;&gt;
                    &lt;p data-locale={locale.code} onClick={handleClick} style=&#123;&#123;cursor: &quot;pointer&quot;}} className=&quot;hover:underline dark:text-gray-400 text-gray-800 rounded px-3 py-1 inline-block&quot;&gt;
                        {locale.name}
                    &lt;/p&gt;
                &lt;/li&gt;
            ))}
        &lt;/ul&gt;
    &lt;/nav&gt;
    );
}</code></pre>
              </div>
            </li>

            <li class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 class="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                {{ $t('faqs.q7.question') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <p>{{ $t('faqs.q7.explanation') }}</p>
                <h3>{{ $t('faqs.q7.solution1.title') }}</h3>
                <p>{{ $t('faqs.q7.solution1.content') }}</p>
                <h3>{{ $t('faqs.q7.solution2.title') }}</h3>
                <p>{{ $t('faqs.q7.solution2.content') }}</p>
                <pre><code class="language-js">&lt;Link href="/" locale="de"&gt;Switch to German&lt;/Link&gt;</code></pre>
                <p>{{ $t('faqs.q7.solution2.note') }}</p>
              </div>
            </li>

            <li class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 class="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                {{ $t('faqs.q8.question') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <p>{{ $t('faqs.q8.reason1') }}</p>
                <p>{{ $t('faqs.q8.reason2') }}</p>
                <p>{{ $t('faqs.q8.reason3') }}</p>
                <p>{{ $t('faqs.q8.example1') }}</p>
                <pre><code class="language-js">&lt;div&gt;  Hello
   &lt;div&gt;&lt;/div&gt;
&lt;/div&gt;</code></pre>
                <p>{{ $t('faqs.q8.solution') }}</p>
                <pre><code class="language-js">&lt;div&gt;
   &lt;p&gt;Hello&lt;/p&gt;
   &lt;div&gt;&lt;/div&gt;
&lt;/div&gt;</code></pre>
              </div>
            </li>

            <li class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 class="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                {{ $t('faqs.q9.question') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <p>{{ $t('faqs.q9.reason1') }}</p>
                <p>{{ $t('faqs.q9.reason2') }}</p>
                <pre><code class="language-js">import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import {locales} from "./i18n-metadata";

// Constants
const PUBLIC_ROUTES = [
    '/', '/pricing', '/sitemap', '/blog', /^\/blog\/.*$/, '/sitemap.xml',
    '/api/get-foo', '/api/get-bar',
];
const API_ROUTE_REGEX = /^\/api(?:\/|$)/;
const STATIC_FILE_REGEX = /\.(?:jpg|jpeg|gif|png|svg|ico|css|js|woff|woff2|ttf|eot)$/i;

// Middleware configurations
const intlMiddleware = createMiddleware({
    locales,
    defaultLocale: 'en',
    localePrefix: 'as-needed',
});

// Helper functions
const isPublicRoute = (pathname: string) =>
    PUBLIC_ROUTES.some(route => typeof route === 'string' ? route === pathname : route.test(pathname));

const handleAuth = (request: NextRequest, userId: string | null, isPublic: boolean, isApi: boolean) => {
    if (!userId && !isPublic) {
        return isApi
            ? NextResponse.json({code: -2, message: 'no auth'}, {status: 401})
            : NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return null;
};

// Main middleware function
export async function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;

    // Skip static files
    if (STATIC_FILE_REGEX.test(pathname)) {
        return NextResponse.next();
    }

    const isApi = API_ROUTE_REGEX.test(pathname);
    const isPublic = isPublicRoute(pathname);
    const {userId} = auth();

    // Handle API routes
    if (isApi) {
        const authResponse = handleAuth(request, userId, isPublic, true);
        return authResponse || NextResponse.next();
    }

    // Handle non-API routes
    const intlResponse = intlMiddleware(request);
    if (intlResponse) return intlResponse;

    const authResponse = handleAuth(request, userId, isPublic, false);
    return authResponse || NextResponse.next();
}</code></pre>
                <p>{{ $t('faqs.q9.reason3') }}</p>
              </div>
            </li>
          </ol>

          <div class="mt-12 text-center text-gray-600 dark:text-gray-400">
            {{ $t('faqs.additionalHelp') }}
            <a
              class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              href="#"
              @click.prevent="openInBrowser(`${buildInfo.website_url}/feedback`)"
            >{{ $t('faqs.clickHere') }}</a>
            {{ $t('faqs.submitFeedback') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { store, openInBrowser } from '#preload';
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import AccountProfile from '/@/components/widgets/AccountProfile.vue';

const buildInfo = ref({});

onMounted(() => {
  bindSearchInput();
  buildInfo.value = getBuildInfo();
});

function getBuildInfo() {
  return {
    version: store.get('version'),
    email: store.get('email'),
    website_url: store.get('website_url'),
  };
}

function bindSearchInput() {
  const searchInput = document.getElementById('searchInput');
  const searchList = document.getElementById('searchList');

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const listItems = searchList.getElementsByTagName('li');

    Array.from(listItems).forEach((item) => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
  });
}
</script>

<style>
.prose {
  @apply text-gray-800 dark:text-gray-200;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply text-gray-900 dark:text-gray-100;
}

.prose pre {
  @apply bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4;
}

.prose code {
  @apply text-sm bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200;
}

.prose pre code {
  @apply bg-transparent p-0 text-gray-800 dark:text-gray-200;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
}

.bg-gray-50 {
  @apply text-gray-800;
}

.dark .bg-gray-900 {
  @apply text-gray-200;
}

/* 添加响应式调整 */
@media (max-width: 640px) {
  .prose {
    font-size: 0.875rem;
  }

  .prose pre {
    font-size: 0.75rem;
  }
}
</style>
