import {ipcRenderer} from 'electron';

export function checkForUpdates() {
  ipcRenderer.send('checkUpdate');
}
