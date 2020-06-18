import Store from 'electron-store';

export const heykaStore = new Store({
  name: 'app',
});

export const meStore = new Store({
  name: 'store-module-me',
});

export const codeFileStore = new Store({
  name: 'signin-code',
  encryptionKey: '1234543',
});

export const authFileStore = new Store({
  name: 'auth',
  encryptionKey: '1234543',
});