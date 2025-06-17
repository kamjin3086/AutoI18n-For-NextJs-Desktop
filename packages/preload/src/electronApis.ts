import ConfigStore from 'electron-store';
import path from 'path';
import fs from 'fs';
import {ipcRenderer} from 'electron';
import type {ArrayBufferView} from 'fs-extra';

const configStore = new ConfigStore();

export const store = {
  get: (key: string, def?: string) => configStore.get(key, def),
  set: (key: string, val?: string) => configStore.set(key, val),
  clear: () => configStore.clear(),
  del: (key: string) => configStore.delete(key),
  has: (key: string) => configStore.has(key),
} as const;

export const fileApi = {
  getFilePath: (file: string) => path.join(__dirname, file),
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),

  fileExist: (filePath: string) => fs.existsSync(filePath),
  pathJoin: (filePaths: string[]) => {
    // console.log(filePaths)
    return path.join(...filePaths);
  },
  fileRead: (filePath: string) => fs.readFileSync(filePath, 'utf8'),
  fileWrite: (filePath: string, data: object | string) => fs.writeFileSync(filePath, data as ArrayBufferView, 'utf8'),
} as const;
