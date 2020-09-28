import MediaCapturer from '@sdk/classes/MediaCapturer';
import { desktopCapturer } from 'electron';

export default new MediaCapturer(desktopCapturer.getSources);
