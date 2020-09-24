import AudioCheck from '@sdk/classes/AudioCheck';
import { ipcRenderer } from 'electron';
import shutdown from 'electron-shutdown-command';

export default new AudioCheck(ipcRenderer.sendSync, shutdown);
