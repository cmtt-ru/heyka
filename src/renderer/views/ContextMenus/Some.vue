<template>
  <popover>
    <ui-button :type="11" icon="add">Invite members</ui-button>
    <ui-button :type="11" icon="edit">Manage workspace</ui-button>
    <ui-button :type="11" icon="settings">Settings</ui-button>
    <ui-button :type="11" icon="lock">Quit Heyka</ui-button>
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';

export default {
  components: {
    Popover,
    UiButton,
  },

  props: {

  },

  computed: {

  },

  methods: {

  },

  mounted() {
  },
};
</script>

<style lang="stylus">

</style>
