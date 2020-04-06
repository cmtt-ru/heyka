<template>
  <div class="l-p-8">

      <div>Канал {{ $route.params.id }}</div>
      <br>

 <list :filterBy="''">
      <list-item
        @click.native="clickUserHandler(user)"
        v-for="user in sortedUsers"
        :key="user.name"
        :filterKey="user.name"
        button
      >
      <user-item :user="user"></user-item>
      </list-item>

    </list>
  </div>

</template>

<script>
import { List, ListItem } from '@components/List';
import UserItem from '@components/UserItem';

export default {
  components: {
    List,
    ListItem,
    UserItem,
  },
  // props: {
  // channel: Object,
  // },
  data() {
    return {
      channel:
        {
          name: 'heyka-dev',
          type: 'public',
          online: [
            {
              id: '12332554754',
              name: 'Ivan Bushmin',
              avatar: '',
              mic: false,
              headphones: false,
              onair: false,
              sharing: false,
              admin: false,
            },
            {
              id: '346427437',
              name: 'Grzegorz Brzęczyszczykiewicz',
              avatar: '',
              mic: true,
              headphones: true,
              onair: true,
              sharing: false,
              admin: false,
            },
            {
              id: '5789079636',
              name: 'Yanus Poluectivich',
              avatar: '',
              mic: true,
              headphones: false,
              onair: false,
              sharing: false,
              admin: true,
            },
            {
              id: '4895483568',
              name: 'Nozomu Itoshiki',
              avatar: '',
              mic: true,
              headphones: false,
              onair: true,
              sharing: true,
              admin: false,
            },
          ],
        },
    };
  },

  computed: {

    /**
     * Sort users by name
     * @returns {Array} array of sorted users
     */
    sortedUsers() {
      const users = [ ...this.channel.online ];

      return users.sort((a, b) => {
        if (a.name.toLowerCase().trim() < b.name.toLowerCase().trim()) {
          return -1;
        }
        if (a.name.toLowerCase().trim() > b.name.toLowerCase().trim()) {
          return 1;
        }

        return 0;
      });
    },

  },

  methods: {
    /**
     * Dummy click handler
     * @param {Object} user user
     * @returns {void}
     */
    clickUserHandler(user) {
      console.log(user.name);
    },
  },

};
</script>

<style lang="stylus" scoped>

</style>