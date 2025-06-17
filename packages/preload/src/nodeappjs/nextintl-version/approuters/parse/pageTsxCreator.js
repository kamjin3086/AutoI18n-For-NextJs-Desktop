import fs from 'fs';
import {GENERATED_PAGE_IDENTITY_BYLINE} from '../consts.ts';

const template = `${GENERATED_PAGE_IDENTITY_BYLINE}

import {redirect} from 'next/navigation';

// This page only renders when the app is built statically (output: 'export')
export default function RootPage() {
  redirect('/\${defaultLang}');
}
`;

export default function create(target, defaultLang, _) {
    let formatted = template.replace(/\$\{defaultLang}/g, defaultLang);
    fs.writeFileSync(target, formatted);
    console.log(`${target} created to new file.`);
}

