import {ipcRenderer} from "electron";
<template>
  <div>
    <pseudo-popup>

      <template #title>
        Title
      </template>

      <template #body>
        <p>body</p>
      </template>

      <template #footer>
        <ui-button
          :type="1"
        >
          Save
        </ui-button>
      </template>
    </pseudo-popup>
  </div>
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

  },
};
</script>

<style scoped lang="stylus">

</style>
