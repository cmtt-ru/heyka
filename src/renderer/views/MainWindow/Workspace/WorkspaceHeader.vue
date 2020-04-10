<template>
  <div class="l-p-8">
        <div v-if="user" class="user">

            <ui-button :type="7" class="user__status" size="small" icon="cast"/>
            <ui-button :type="7" class="user__status" size="small" icon="headphones"/>
            <ui-button :type="7" class="user__status" size="small" icon="mic"/>

            <avatar class="user__avatar" :image="user.avatar" :status="user.onlineStatus" :size="24"/>

        </div>

  </div>

</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';

export default {
  components: {
    UiButton,
    Avatar,
  },

  data() {
    return {

    };
  },

  computed: {
    user() {
      const myId = this.$store.getters['me/getMyId'];

      console.log(this.$store.getters['users/getUserById'](myId));

      return this.$store.getters['users/getUserById'](myId);
    },
  },

  methods: {

  },

};
</script>

<style lang="stylus" scoped>

.user
    display flex
    flex-direction row
    justify-content flex-end
    align-items center

    &__status
        margin-left 16px

    &__avatar
        margin-left 16px
        cursor pointer

</style>
