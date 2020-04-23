<template>
  <layout>

    <template v-slot:sidebar-body>
      <img width="100%" src="https://leonardo.osnova.io/0658b525-8db3-fe95-69bd-fd64537802c6/">
    </template>

    <template v-slot:content-body>
      <div class="auth l-p-18">
        <p class="l-fs-18">Welcome to Heyka</p>

        <div class="auth__code">
          <ui-input v-model="code" placeholder="Paste invite code here"/>
          <p v-if="invalidCode" class="l-fs-12" style="color: var(--color-0)">Invalid invite code</p>
          <ui-button @click.native="signinHandler" class="l-mt-12" :type="6" wide>Login</ui-button>
        </div>

      </div>
    </template>

  </layout>
</template>

<script>
import Store from 'electron-store';
import Layout from './../Layout';
import { UiInput } from '@components/Form';
import UiButton from '@components/UiButton';
import { errorMessages } from '@api/errors/types';

/**
 * Sign in code file store
 */
const codeFileStore = new Store({
  name: 'signin-code',
  encryptionKey: '1234543',
});

export default {
  components: {
    Layout,
    UiInput,
    UiButton,
  },
  data() {
    return {
      code: codeFileStore.get('code'),
      invalidCode: false,
    };
  },
  methods: {
    async signinHandler() {
      try {
        await this.$API.auth.signinByLink(this.code);

        codeFileStore.set('code', this.code);

        this.invalidCode = false;

        await this.$router.replace({
          name: 'workspace',
        });
      } catch (err) {
        if (err.response.data.message === errorMessages.badRequest) {
          this.invalidCode = true;
        }
      }
    },
  },
};
</script>

<style scoped lang="stylus">
  .auth
    display flex
    flex-flow column
    height 100%
    box-sizing border-box

    &__code
      margin auto 0
</style>
