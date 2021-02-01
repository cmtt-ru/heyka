import MediaCapturer from '@sdk/classes/MediaCapturer';

export default new MediaCapturer(window.desktopCapturer.getSources);
