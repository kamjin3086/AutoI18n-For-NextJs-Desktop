import {app, BrowserWindow, dialog, globalShortcut, ipcMain} from 'electron';
import './security-restrictions';
import {restoreOrCreateWindow, checkForUpdates} from '/@/mainWindow';
import {platform} from 'node:process';
import log from 'electron-log/main';

//===========================Store===================================
import ElectronStore from 'electron-store';
//必须初始化，才能在各种位置使用
ElectronStore.initRenderer();
import Store from 'electron-store';

const store = new Store();
//===========================Store===================================

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

// cors
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow);

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .catch(e => console.error('Failed create window:', e));

/**
 * Install Vue.js or any other extension in development mode only.
 * Note: You must install `electron-devtools-installer` manually
 */
// if (import.meta.env.DEV) {
//   app
//     .whenReady()
//     .then(() => import('electron-devtools-installer'))
//     .then(module => {
//       const {default: installExtension, VUEJS_DEVTOOLS} =
//         //@ts-expect-error Hotfix for https://github.com/cawa-93/vite-electron-builder/issues/915
//         typeof module.default === 'function' ? module : (module.default as typeof module);
//
//       return installExtension(VUEJS_DEVTOOLS, {
//         loadExtensionOptions: {
//           allowFileAccess: true,
//         },
//       });
//     })
//     .catch(e => console.error('Failed install extension:', e));
// }

/**
 * Check for app updates, install it in background and notify user that new version was installed.
 * No reason run this in non-production build.
 * @see https://www.electron.build/auto-update.html#quick-setup-guide
 *
 * Note: It may throw "ENOENT: no such file app-update.yml"
 * if you compile production app without publishing it to distribution server.
 * Like `npm run compile` does. It's ok 😅
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => {
      checkForUpdates().then(() => {
        log.info('checkForUpdates success');
        //@ts-ignore
      }).catch((e) => {
        log.error('checkForUpdates error', e);
      });
    })
    .catch(e => console.error('Failed check and install updates:', e));
}

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('CommandOrControl+Alt+Shift+h');

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();

  //删除json编辑框的store
  try {
    store.delete('localeJsonEditResult');
    store.delete('translationLevel');
    store.delete('loadFailedPage');
  } catch (e) {
    //ignore
  }
});

ipcMain.on('checkUpdate', async () => {
  checkForUpdates().then(() => {
    log.info('checkForUpdates success');
    //@ts-ignore
  }).catch((e) => {
    log.error('checkForUpdates error', e);
  });
});

// 监听渲染进程的请求，打开文件对话框
ipcMain.handle('open-directory-dialog', async () => {
  const {filePaths} = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return filePaths;
});

// 处理选择文件的请求
ipcMain.handle('open-file-dialog', async () => {
  const {filePaths} = await dialog.showOpenDialog({
    properties: ['openFile'], // 用于选择单个文件
    // 如果需要支持多选文件，添加 'multiSelections' 到 properties 数组
  });
  return filePaths;
});
