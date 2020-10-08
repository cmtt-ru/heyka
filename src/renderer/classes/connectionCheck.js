import ConnectionCheck from '@sdk/classes/ConnectionCheck';
import isMainWindow from '@shared/WindowManager/isMainWindow';

export default new ConnectionCheck(isMainWindow);