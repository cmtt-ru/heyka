<template>
  <popover>
    <div class="buttons">
      <router-link :to="{ name: 'user', params: { id: myId }}">
        <ui-button
          data-popover-close
          :type="11"
          icon="user"
        >
          Profile
        </ui-button>
      </router-link>

      <div class="delimiter" />

      <ui-button
        data-popover-close
        :type="11"
        icon="user-online"
        @click="changeStatus('online')"
      >
        Online
      </ui-button>

      <ui-button
        data-popover-close
        :type="11"
        icon="user-idle"
        @click="changeStatus('idle')"
      >
        Idle
      </ui-button>

      <ui-button
        data-popover-close
        :type="11"
        icon="user-offline"
        @click="changeStatus('offline')"
      >
        Offline
      </ui-button>
    </div>
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

  computed: {
    myId() {
      return this.$store.getters['me/getMyId'];
    },
  },

  methods: {
    changeStatus(status) {
      console.log('change status', status);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
