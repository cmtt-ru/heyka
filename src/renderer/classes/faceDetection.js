import EventEmitter from 'events';
import { FaceDetection } from '@mediapipe/face_detection';

const INTERVAL_TIMEOUT = 1000;
const MAX_NO_FACE_COUNT = 120;
let noFaceCounter = 0;

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

      if (detections > 0) {
        noFaceCounter = 0;
      } else {
        noFaceCounter++;
        // console.log(`FaceDetection --> no face ${noFaceCounter}/${MAX_NO_FACE_COUNT}`);
      }

      if (noFaceCounter >= MAX_NO_FACE_COUNT) {
        this.emit('no-face-too-long');
        this.stop();
      }
    });
  }

  async start(stream) {
    // console.log('FaceDetection --> start');
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
    // console.log('FaceDetection --> stop');
    clearInterval(this.interval);
    this.video.srcObject = null;
    noFaceCounter = 0;
  }
}

export default new Face();
