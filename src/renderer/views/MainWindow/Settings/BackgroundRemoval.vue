import {ipcRenderer} from "electron";
<template>
  <div>
    <div>
      <ui-button
        :type="1"
        size="large"
        @click="start"
      >
        Start webcam
      </ui-button>
    </div>
    <div>
      <label>Mask blur</label>
      <input
        v-model="blur"
        type="range"
        min="0"
        max="30"
      >

      <label>Threshold</label>
      <input
        v-model="threshold"
        type="range"
        min="0"
        max="100"
      >

      <label>Refine Steps</label>
      <input
        v-model="refineSteps"
        type="range"
        min="0"
        max="1000"
      >
    </div>

    <div class="videos">
      <video
        ref="source"
        hidden
        autoplay
      />
      <canvas
        ref="mask"
      />
      <canvas ref="composite" />
      <video
        ref="output"
        hidden
        autoplay
      />
      <img
        ref="image"
        crossOrigin="anonymous"
        src="https://picsum.photos/640/480"
      >
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import mediaCapturer from '@classes/mediaCapturer';
// eslint-disable-next-line no-unused-vars
import * as tfjs from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix';

let net = null;

export default {
  components: {
    UiButton,
  },

  data() {
    return {
      blur: 5,
      threshold: 70,
      refineSteps: 10,
    };
  },

  created() {

  },

  mounted() {
    this.loadBodyPix();
  },

  methods: {
    async start() {
      const stream = await mediaCapturer.getCameraStream();
      const source = this.$refs['source'];

      source.srcObject = stream;

      // eslint-disable-next-line no-unused-vars
      const doSomethingWithTheFrame = (now, metadata) => {
        this.startNet();
        source.requestVideoFrameCallback(doSomethingWithTheFrame);
      };

      doSomethingWithTheFrame();

      setTimeout(() => {
        // eslint-disable-next-line no-magic-numbers
        // this.$refs['output'].srcObject = this.$refs['composite'].captureStream(25);
        // eslint-disable-next-line no-magic-numbers
      }, 10000);
    },

    async loadBodyPix() {
      net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2,
      });
    },

    async startNet() {
      const segmentation = await net.segmentPerson(this.$refs['source'], {
        flipHorizontal: false,
        internalResolution: 'medium',
        // eslint-disable-next-line no-magic-numbers
        segmentationThreshold: this.threshold / 100,
        refineSteps: this.refineSteps,
      });

      const foregroundColor = {
        r: 0,
        g: 0,
        b: 0,
        a: 255,
      };
      const backgroundColor = {
        r: 255,
        g: 255,
        b: 255,
        a: 0,
      };
      const coloredPartImage = bodyPix.toMask(segmentation, foregroundColor, backgroundColor, false);
      const opacity = 1;
      const flipHorizontal = false;
      const maskBlurAmount = this.blur;

      // Draw the mask image on top of the original image onto a canvas.
      // The colored part image will be drawn semi-transparent, with an opacity of
      // 0.7, allowing for the original image to be visible under.
      bodyPix.drawMask(
        this.$refs['mask'], this.$refs['mask'], coloredPartImage, opacity, maskBlurAmount,
        flipHorizontal);

      this.compositeFrame(coloredPartImage);
    },

    async compositeFrame(backgroundDarkeningMask) {
      if (!backgroundDarkeningMask) {
        return;
      }

      const maskCtx = this.$refs['mask'].getContext('2d');

      maskCtx.globalCompositeOperation = 'destination-over';
      maskCtx.drawImage(this.$refs['mask'], 0, 0, backgroundDarkeningMask.width, backgroundDarkeningMask.height);
      // composite the video frame
      maskCtx.globalCompositeOperation = 'source-in';
      maskCtx.drawImage(this.$refs['source'], 0, 0, backgroundDarkeningMask.width, backgroundDarkeningMask.height);

      const compositeCtx = this.$refs['composite'].getContext('2d');

      this.$refs['composite'].width = backgroundDarkeningMask.width;
      this.$refs['composite'].height = backgroundDarkeningMask.height;
      compositeCtx.drawImage(this.$refs['image'], 0, 0, backgroundDarkeningMask.width, backgroundDarkeningMask.height);
      compositeCtx.drawImage(this.$refs['mask'], 0, 0, backgroundDarkeningMask.width, backgroundDarkeningMask.height);
    },
  },
};
</script>

<style scoped lang="stylus">

/deep/.ui-button
  margin-right 8px

.videos
  //display flex
  //height 200px

  video,
  canvas,
  img
    display block
    flex 1
    width 640px
    height 480px
    margin-bottom 20px
    background #ccc

[hidden]
  display none !important

</style>
