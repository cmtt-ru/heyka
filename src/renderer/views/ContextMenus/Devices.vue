<template>
  <popover class="device-popover-wrapper">
    <devices
      :style="$themes.getColors('content')"
      class="device-popover"
    />
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import Devices from '@views/MainWindow/Settings/Devices';

export default {
  components: {
    Popover,
    Devices,
  },
};
</script>

<style lang="stylus" scoped>

.device-popover
  width 300px
  height 235px
  margin-right 12px
</style>
