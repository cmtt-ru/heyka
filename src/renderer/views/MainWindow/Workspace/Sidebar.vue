<template>
  <div class="l-p-8">
    <router-link :to="{ name: 'settings'}">Settings</router-link>
    <br><br>

    <div class="menu-body-title">
      <div class="menu-body-title__label">Channels</div>
      <svg-icon
        class="menu-body-title__add"
        @click.native="addRandomChannel"
        name="add"
        size="medium"
        stroke="var(--icon-1)"
      ></svg-icon>
    </div>

    <list :filterBy="''">
      <list-item
        @click.native="clickChannel(index)"
        @dblclick.native="dbclickChannel(index)"
        v-for="(channel, index) in channels"
        :key="channel.name"
        :active="channel.active"
        :filterKey="channel.name"
        button
      >
       <channel-item :channel="channel"></channel-item>
      </list-item>

    </list>
  </div>

</template>

<script>
import ChannelItem from '@components/ChannelItem';
import { List, ListItem } from '@components/List';

export default {
  components: {
    List,
    ListItem,
    ChannelItem,
  },
  data() {
    return {
      channels: [
        {
          name: 'Heyka-dev',
          type: 'public',
          talking: true,
          active: false,
          online: [
            { name: 'Ivan' },
            { name: 'Mika' },
            { name: 'Eugene' },
          ],
        },
        {
          name: 'Designers',
          type: 'public',
          active: false,
          online: [],
        },
        {
          name: 'Chit-chat with long name',
          type: 'private',
          active: false,
          online: [
            { name: 'Ivan' },
            { name: 'Mika' },
            { name: 'Eugene' },
            { name: 'Ivan2' },
            { name: 'Mika2' },
            { name: 'Eugene2' },
            { name: 'Ivan3' },
            { name: 'Mika3' },
            { name: 'Eugene3' },
          ],
        },
      ],

    };
  },

  methods: {
    clickFirstAvatar() {
      console.log('нажали на аватарку');
    },
    clickFirstElement() {
      console.log('нажали на элемент');
    },
    clickChannel(index) {
      for (const ch of this.channels) {
        ch.active = false;
      }
      this.$set(this.channels[index], 'active', true);
    },
    dbclickChannel(index) {
      console.log('double click');
      this.$set(this.channels[index], 'connected', !this.channels[index].connected);
    },
    addRandomChannel() {
      // eslint-disable-next-line no-magic-numbers
      const length = Math.floor(Math.random() * (17)) + 8;
      let channelName = '';
      const characters = 'aaaabcddeeeeeefgihhhiiikllmnnnooooprrrssstttttuwy     ';

      for (let i = 0; i < length; i++) {
        channelName += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      const chtypes = ['public', 'private'];
      const channelType = chtypes[Math.floor(Math.random() * chtypes.length)];

      this.channels.push({
        name: channelName,
        type: channelType,
        active: false,
        online: [],
      });
    },

  },

  mounted() {

  },
};
</script>
