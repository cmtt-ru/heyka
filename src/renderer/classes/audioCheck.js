import AudioCheck from '@sdk/classes/AudioCheck';

export default new AudioCheck(window.ipcRenderer.invoke, window.shutdown);
