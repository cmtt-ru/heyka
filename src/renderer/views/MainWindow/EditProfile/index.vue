<template>
  <layout>
    <template #header>
      <div class="settings-title l-pl-12 l-fw-m">
        {{ texts.pageName }}
      </div>
      <div
        class="settings-close"
        @click="__backOrRedirect()"
      >
        {{ $t('techTexts.close') }}
      </div>
    </template>

    <template #sidebar>
      <div class="l-p-8">
        <router-link
          class="editprofile-link"
          :to="{name: 'edit-profile-main'}"
          replace
        >
          {{ texts.mainSettings }}
        </router-link>
        <router-link
          class="editprofile-link"
          :to="{name: 'edit-profile-social'}"
          replace
        >
          {{ texts.loginSettings }}
        </router-link>
        <div
          v-if="IS_DEV"
          class="editprofile-link editprofile-link--delete"
          @click="deleteModalHandler"
        >
          Delete account
        </div>
      </div>
    </template>

    <template #content>
      <div>
        <div class="l-p-8">
          <router-view />
        </div>
      </div>
    </template>
  </layout>
</template>

<script>
import Layout from '../Settings/SettingsLayout';
import { mapGetters } from 'vuex';

import Modal from '@sdk/classes/Modal';

export default {
  components: {
    Layout,
  },
  data() {
    return {
      IS_DEV,
    };
  },
  computed: {
    ...mapGetters({
      myInfo: 'myInfo',
    }),
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace.userSettings');
    },
  },

  methods: {
    deleteModalHandler() {
      Modal.show({
        name: 'ConfirmDelete',
        data: {
          header: 'Удаление аккаунта',
          body: 'Введите своё имя для подтверждения',
          confirmString: this.myInfo.user.name,
        },
        onClose: async (status) => {
          if (status === 'confirm') {
            console.log('DELETE ACCOUNT LOL');
            await this.$API.user.deleteAccount();

            //! обработать ошибку, когда не получается удалить акк, если админ
          }
        },
      });
    },
  },
};
</script>

<style lang="stylus" scoped>
.settings-close
  color var(--UI-active)
  margin-right 10px
  cursor pointer

  &:hover
    color var(--UI-active-hover)
  &:active
    color var(--UI-active-active)

.editprofile-link
  display block
  padding 6px 8px
  border-radius 6px
  font-size 14px
  line-height 16px
  text-decoration none
  margin 2px 4px 4px
  cursor pointer

  &--delete
    color var(--UI-error)

  &.router-link-exact-active
    background var(--Background-darkgrey)
  &:hover
    background var(--Background-darkgrey-hover)
  &:active
    background var(--Background-darkgrey-active)
</style>
