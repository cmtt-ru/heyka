<template>
  <div class="l-p-8">

      <div>Канал {{ $route.params.id }}</div>
      <br>

 <list :filterBy="''">
      <list-item
        @click.native="clickUserHandler(user)"
        v-for="user in users"
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

  computed: {

    /**
     * Get users array
     * @returns {Array} array of users
     */
    users() {
      return this.$store.getters.getUsersByChannel(this.$route.params.id);
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

  created() {

  },

};
</script>

<style lang="stylus" scoped>

</style>