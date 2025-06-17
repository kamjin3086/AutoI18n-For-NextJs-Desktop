import {shell} from 'electron';

export function openInBrowser(url: string) {
  try {
    shell.openExternal(url);
  } catch (e) {
    // @ts-ignore
    console.error(e.stack);
  }
}
