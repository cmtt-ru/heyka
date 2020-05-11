<template>
  <div>
    <h1 class="l-mt-12">
      Notifications
    </h1>

    <ui-button
      :type="1"
      class="l-mt-12"
      @click="simpleNotif()"
    >
      Обычное уведомление
    </ui-button>

    <ui-button
      :type="1"
      class="l-mt-12"
      @click="shortNotif()"
    >
      Уведомление на 5 секунд
    </ui-button>

    <ui-button
      :type="2"
      class="l-mt-12"
      @click="infiniteNotif()"
    >
      Бесконечное уведомление
    </ui-button>

    <ui-button
      :type="3"
      class="l-mt-12"
      @click="notSwipableNotif()"
    >
      Нельзя смахнуть
    </ui-button>

    <ui-button
      :type="12"
      class="l-mt-12"
      @click="modalNotif()"
    >
      Модальное уведомление
    </ui-button>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
export default {
  components: {
    UiButton,
  },

  data() {
    return {
    };
  },
  methods: {
    async simpleNotif() {
      const notification = {
        data: {
          text: `Do you want to connect to channel №${Math.random()}?`,
          buttons: [
            {
              text: 'Connect',
              type: 1,
              action: this.alert,
            },
            {
              text: 'Cancel',
              close: true,
              action: this.close,
            },
          ],
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
    },

    async shortNotif() {
      const notification = {
        lifespan: 5000,
        data: {
          text: 'I will live 5 seconds.',
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
    },

    async infiniteNotif() {
      const notification = {
        infinite: true,
        data: {
          text: 'I will stay forever till action, № ' + Math.random(),
          buttons: [
            {
              text: 'Connect',
              type: 1,
              action: this.alert,
            },
            {
              text: 'Cancel',
              close: true,
              action: this.close,
            },
          ],
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
    },

    async notSwipableNotif() {
      const notification = {
        preventSwipe: true,
        data: {
          text: 'I cannot be swiped out № ' + Math.random(),
          buttons: [
            {
              text: 'Connect',
              type: 1,
              action: this.alert,
            },
            {
              text: 'Cancel',
              close: true,
              action: this.close,
            },
          ],
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
    },

    async modalNotif() {
      const notification = {
        modal: true,
        data: {
          text: 'I prevent any app clicks till handled with, № ' + Math.random(),
          buttons: [
            {
              text: 'DESTROY',
              type: 12,
              action: this.alert,
            },
            {
              text: 'Cancel',
              close: true,
              action: this.close,
            },
          ],
        },
      };

      await this.$store.dispatch('app/addNotification', notification);
    },

    alert() {
      console.log('Action');
    },

    close() {
      console.log('Cancel');
    },
  },

};
</script>

<style lang="stylus" scoped>
  .ui-button
    margin 12px auto 12px 12px
    display block
    width max-content
</style>
