<template>
  <layout>
    <template #appbar-body>
      <div
        class="appbar"
        :class="{'appbar--mac': IS_MAC}"
      >
        <div
          class="workspace"
        >
          <svg-icon
            name="wired-workspace"
            width="170"
            height="32"
          />
        </div>

        <div v-if="!IS_MAC">
          <ui-button
            :type="7"
            class="control__button"
            size="medium"
            icon="collapse"
            header
            @click="minimizeWindowHandler"
          />
          <ui-button
            :type="7"
            class="control__button control__button--win-close"
            size="medium"
            icon="close"
            header
            @click="closeWindowHandler"
          />
        </div>

        <div
          v-if="IS_MAC"
          class="mac-controls-wrapper"
        >
          <div class="mac-controls" />
          <div class="mac-controls" />
        </div>

        <div
          class="user"
          :class="{'user--mac': IS_MAC}"
        >
          <svg-icon
            name="wired-user"
            width="104"
            height="32"
          />
        </div>
      </div>
    </template>

    <template #sidebar-body>
      <svg-icon
        name="wired-sidebar"
        class="sidebar-svg"
        width="196"
        height="360"
      />
    </template>

    <template #content-body>
      <svg-icon
        class="content-svg"
        name="wired-content"
        width="180"
        height="114"
      />
    </template>
  </layout>
</template>

<script>
import Layout from './Layout';
import WindowManager from '@shared/WindowManager/WindowManagerRenderer';
import UiButton from '@components/UiButton';

export default {
  components: {
    Layout,
    UiButton,
  },
  data() {
    return {
      IS_MAC,
    };
  },

  methods: {
    closeWindowHandler() {
      WindowManager.getCurrentWindow().action('hide');
    },

    minimizeWindowHandler() {
      WindowManager.getCurrentWindow().action('minimize');
    },
  },
};
</script>

<style lang="stylus" scoped>
.appbar
  width 100%
  padding 8px
  display flex
  flex-direction row-reverse
  justify-content space-between
  align-items center
  position relative

  &--mac
    flex-direction row

.workspace
  position absolute
  left 0
  right 0
  margin 0 auto
  height 32px
  width fit-content

.user
  display flex
  flex-direction row
  align-items center
  transform scaleX(-1)
  margin 0 4px

  &--mac
    transform initial

.control__button
  margin-left 4px

  &--win-close

    &:hover, &:active
      mix-blend-mode initial
      background var(--UI-error-hover)
      color var(--Text-white)

     &:active
      background var(--UI-error-active)

.mac-controls-wrapper
  margin-left 10px

.mac-controls
  margin-right 8px
  width 12px
  height 12px
  border-radius 50%
  box-sizing border-box
  display inline-flex
  flex-direction row
  justify-content center
  align-items center
  background var(--Background-darkgrey)

  &__icon
    opacity 0

  &:hover .mac-controls__icon
    opacity 1

  &:active
    opacity 0.5

.sidebar-svg
  padding 12px

.content-svg
  position absolute
  left 0
  right 0
  margin 0 auto
  height 100%
  transform translateY(-44px)

/deep/ .icon
  animation loading 2s ease-in-out infinite

@keyframes loading {
   0% {
        opacity: 1;
      }
      30% {
        opacity: 1;
      }
    50%{
      opacity: 0.6;
    }
    60% {
        opacity: 1;
      }
      100% {
        opacity: 1;
      }
}

</style>
