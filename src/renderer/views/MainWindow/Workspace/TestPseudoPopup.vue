import {ipcRenderer} from "electron";
<template>
  <pseudo-popup @close="closeHandler">

    <template #header>
      Edit channel
    </template>

    <template #body>
      <p>body</p>
    </template>

    <template #footer>
      <ui-button
        :type="1"
      >
        Save changes
      </ui-button>

      <ui-button
        :type="2"
      >
        Cancel
      </ui-button>
    </template>6
  </pseudo-popup>
</template>

<script>
import UiButton from '@components/UiButton';
import PseudoPopup from '@components/PseudoPopup';

export default {
  components: {
    UiButton,
    PseudoPopup,
  },
  data() {
    return {

    };
  },
  created() {

  },
  methods: {
    closeHandler() {
      console.log('close handler');
    },
  },
};
</script>

<style scoped lang="stylus">

</style>
