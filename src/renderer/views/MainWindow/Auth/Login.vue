<template>
  <layout>
    <template #sidebar-body>
      <img
        width="100%"
        class="sidebar-image"
        src="https://leonardo.osnova.io/0658b525-8db3-fe95-69bd-fd64537802c6/"
      >
    </template>

    <template #content-body>
      <div class="page l-p-18">
        <p class="l-fs-18">
          Welcome to Heyka
        </p>
        <div class="page__content">
          <ui-button
            :type="6"
            wide
            class="login-button"
            @click="_notImplemented"
          >
            Slack
            <svg-icon
              slot="right"
              color="var(--icon-1)"
              name="close"
              size="medium"
            />
          </ui-button>

          <ui-button
            :type="3"
            wide
            class="login-button"
            @click="_notImplemented"
          >
            Facebook
          </ui-button>
          <ui-button
            :type="3"
            wide
            class="login-button"
            @click="_notImplemented"
          >
            Google
          </ui-button>

          <div class="or-delimiter">
            <span>or</span>
          </div>

          <ui-input
            v-model="login.email"
            class="user__input"
            placeholder="example@mail.com"
            email
          />
          <ui-input
            v-model="login.pass"
            class="user__input"
            placeholder="******"
          />
        </div>
      </div>
    </template>
  </layout>
</template>

<script>
import Layout from './../Layout';
import UiButton from '@components/UiButton';
import { UiInput } from '@components/Form';

export default {
  components: {
    Layout,
    UiButton,
    UiInput,
  },

  data() {
    return {
      login: {
        email: '',
        pass: '',
      },
    };
  },

};
</script>

<style scoped lang="stylus">
.sidebar-image
    width 100%
    height 100%
    object-fit cover
    object-position 0 0

.page
    height 100%
    box-sizing border-box
    display flex
    flex-direction column

    &__content
        display flex
        flex-direction column
        justify-content center
        flex-grow 2

.or-delimiter
    width 100%
    text-align center
    box-shadow 0 1px 0 0 var(--stroke-3)
    line-height 0.1em
    margin 10px 0 20px

    & span
        background var(--app-bg)
        padding 0 10px

.login-button
    margin-bottom 12px

.user__input
    margin 6px 0

    &:first-of-type
        margin-bottom 12px
</style>
