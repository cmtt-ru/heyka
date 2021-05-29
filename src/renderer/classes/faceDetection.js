import EventEmitter from 'events';
import { FaceDetection } from '@mediapipe/face_detection';

const INTERVAL_TIMEOUT = 1000;

class Face extends EventEmitter {
  constructor() {
    super();

    this.video = document.createElement('video');
    this.video.autoplay = true;

    this.interval = 0;
    this.detections = 0;

    this.faceDetection = new FaceDetection({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.3/${file}`;
      },
    });

    this.faceDetection.setOptions({
      minDetectionConfidence: 0.5,
    });

    this.faceDetection.onResults(results => {
      const detections = results.detections.length;

      if (this.detections !== detections) {
        this.detections = detections;
        this.emit('change', detections);
      }

      console.log('results', results.detections.length > 0);
    });
  }

  async start(stream) {
    this.video.srcObject = stream;

    clearInterval(this.interval);

    this.video.onplaying = async () => {
      await this.faceDetection.send({
        image: this.video,
      });

      this.interval = setInterval(async () => {
        await this.faceDetection.send({
          image: this.video,
        });
      }, INTERVAL_TIMEOUT);
    };
  }

  stop() {
    clearInterval(this.interval);
    this.video.srcObject = null;
  }
}

export default new Face();
