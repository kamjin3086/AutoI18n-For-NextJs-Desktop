import {app, BrowserWindow, globalShortcut, ipcMain, screen} from 'electron';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

//客户端使用electron-updater 的autoUpdater来处理自动升级（而非Electron自带的autoUpdater）
import pkg from 'electron-updater';

const {autoUpdater} = pkg;

autoUpdater.logger = log;
//展示所有的更新日志
autoUpdater.fullChangelog = true;

import Store from 'electron-store';

const store = new Store();

//===========================LOG config===================================
import log from './logger';

log.initialize({spyRendererConsole: true});
//===========================LOG config===================================

//===========================INFO ===================================
const version = app.getVersion();
log.info('App Version:', version);
log.info('CrashDumps Path:', app.getPath('crashDumps'));
log.info('Logs Path:', app.getPath('logs'));

//===========================INFO===================================

async function createWindow() {
  const browserWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    width: 1600,
    height: 900,
    icon: join(app.getAppPath(), 'packages/main/assets/256x256_compressed.png'),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.mjs'),
    },
  });

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });

  /**
   * Load the main page of the main window.
   */
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined) {
    /**
     * Load from the Vite dev server for development.
     */
    await browserWindow.loadURL(import.meta.env.VITE_DEV_SERVER_URL);
  } else {
    /**
     * Load from the local file system for production and test.
     *
     * Use BrowserWindow.loadFile() instead of BrowserWindow.loadURL() for WhatWG URL API limitations
     * when path contains special characters like `#`.
     * Let electron handle the path quirks.
     * @see https://github.com/nodejs/node/issues/12682
     * @see https://github.com/electron/electron/issues/6869
     */
    await browserWindow.loadFile(
      fileURLToPath(new URL('./../../renderer/dist/index.html', import.meta.url)),
    );
  }

  //菜单设置
  browserWindow.menuBarVisible = false;

  return browserWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();

  //注册钩子
  globalShortcut.register('CommandOrControl+Alt+Shift+h', function() {
    window.webContents.openDevTools();
  });

  //监听窗口拖拽，记住窗口大小
  // window.on('resize', () => {
  //   const size = window.getSize();
  //   store.set('windowSize', size);
  // });
//
//   function isPositionVisible(position: number[]) {
//     const displays = screen.getAllDisplays();
//     // @ts-ignore
//     return displays.some(display => {
//       const bounds = display.bounds;
//       return position[0] >= bounds.x &&
//         position[1] >= bounds.y &&
//         position[0] < bounds.x + bounds.width &&
//         position[1] < bounds.y + bounds.height;
//     });
//   }
//
// // 监听窗口关闭事件，保存窗口位置
//   window.on('close', () => {
//     const position = window.getPosition();
//     if (isPositionVisible(position)) {
//       store.set('windowPosition', position);
//     }
//   });
//
// // 启动时恢复窗口位置
//   const position = store.get('windowPosition') as number[];
//   if (position && isPositionVisible(position)) {
//     window.setPosition(position[0], position[1]);
//   } else {
//     window.center(); // 如果保存的位置不可见，默认居中窗口
//   }

  //读取窗口大小
  // const size = store.get('windowSize') as number[];
  // if (size) {
  //   window.setSize(size[0], size[1]);
  // }

  //监听页面加载和失败
  window.webContents.on('did-finish-load', () => {
    log.info('Page loaded successfully');
  });

  window.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    log.info(`Failed to load ${validatedURL}, with error code: ${errorCode} - ${errorDescription}`);
    //发送加载页面失败的信息
    window.webContents.send('page-load', 'failed load page...');

    //保存失败地址
    store.set('loadFailedPage', validatedURL);
  });

  //初始化一些数据
  try {
    store.set('app_home', path.dirname(process.execPath));
    store.set('app_logs_dir',  app.getPath('logs'));
    store.set('version', version);
    // store.set("releaseDate",)
    store.set('email', 'support@autoi18n.dev');
    store.set('website_url', 'https://autoi18n.dev');
    log.debug('build info save success.');
  } catch (e) {
    log.error('build info save failed.', e);
  }
}


import * as marked from 'marked';
import * as path from 'path';

let updateWindow: Electron.CrossProcessExports.BrowserWindow | null;

export async function checkForUpdates() {
  const mainWindow = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  log.debug('Set up event listeners...');
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
  });
  autoUpdater.on('update-available', (info) => {
    log.info('Update available.');
  });
  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available.');
  });
  autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater.' + err);
  });
  autoUpdater.on('download-progress', (progressObj) => {
    let msg = 'Download speed: ' + progressObj.bytesPerSecond;
    msg = msg + ' - Downloaded ' + progressObj.percent + '%';
    msg = msg + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
    log.info(msg);
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded.');
    log.info('Version:', info.version);
    log.info('Release Date:', info.releaseDate);
    log.info('ReleaseNotes:', info.releaseNotes);

    let releaseNotesHtml = null;
    try {
      releaseNotesHtml = marked.parse(info.releaseNotes as string);
    } catch (e) {
      log.error(e);
    }

    if (!updateWindow) {
      updateWindow = new BrowserWindow({
        width: 600,
        height: 500,
        parent: mainWindow,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });

      const htmlContent = `
            <html>
                <head>
                    <title>Update Available</title>
                    <style>
                         body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                        }
                        .content {
                            max-height: 400px;
                            overflow-y: auto;
                            border: 1px solid #ccc;
                            padding: 10px;
                        }
                        .button-container {
                            margin-top: 20px;
                            text-align: center;
                        }
                        .button {
                            background-color: #007bff;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            text-align: center;
                            text-decoration: none;
                            display: inline-block;
                            font-size: 16px;
                            margin: 10px 5px;
                            cursor: pointer;
                            border-radius: 5px;
                            transition: background-color 0.3s ease;
                        }
                        .button:hover {
                            background-color: #0056b3;
                        }
                    </style>
                </head>
                <body>
                    <h1>Update Available</h1>
                    <div class='content'>${releaseNotesHtml}</div>
                    <div class='button-container'>
                        <button id='restart-btn' class='button'>Restart</button>
                        <button id='later-btn' class='button'>Later</button>
                    </div>
                    <script>
                        const { ipcRenderer } = require('electron');
                        document.getElementById('restart-btn').addEventListener('click', () => {
                            ipcRenderer.send('update-restart-app');
                        });
                    </script>
                </body>
            </html>`;

      updateWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      updateWindow.on('closed', () => {
        updateWindow = null;
      });
    }

  });

  // More properties on autoUpdater, see https://www.electron.build/auto-update#AppUpdater
  //autoUpdater.autoDownload = true
  //autoUpdater.autoInstallOnAppQuit = true

  // No debugging! Check main.log for details.
  // Ready? Go!
  log.info('checkForUpdates -- begin');
  try {
    await autoUpdater.checkForUpdates();
    //autoUpdater.checkForUpdatesAndNotify()
  } catch (error) {
    log.error(error);
  }
  log.info('checkForUpdates -- end');
}

ipcMain.on('update-restart-app', () => {
  autoUpdater.quitAndInstall();
});
