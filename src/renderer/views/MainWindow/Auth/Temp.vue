<template>
  <layout>
    <template #sidebar-body>
      <img
        width="100%"
        src="https://leonardo.osnova.io/0658b525-8db3-fe95-69bd-fd64537802c6/"
      >
    </template>

    <template #content-body>
      <div class="auth l-p-18">
        <p class="l-fs-18">
          Welcome to Heyka
        </p>

        <div class="auth__code">
          <ui-input
            v-model="code"
            placeholder="Paste invite code here"
          />
          <p
            v-if="invalidCode"
            class="l-fs-12"
            style="color: var(--color-0)"
          >
            Invalid invite code
          </p>
          <ui-button
            class="l-mt-12"
            :type="6"
            wide
            @click.native="signinHandler"
          >
            Login
          </ui-button>
        </div>
      </div>
    </template>
  </layout>
</template>

<script>
import Layout from './../Layout';
import { UiInput } from '@components/Form';
import UiButton from '@components/UiButton';
import { errorMessages } from '@api/errors/types';
import { ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';
import mapUsers from './mapUsers.json';
import { codeFileStore } from '@/store/localStore';
import Logger from '@classes/logger';
const cnsl = new Logger('Temp.vue', '#138D75');

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
  mounted() {
    this.useOldAppData();
  },
  methods: {
    async signinHandler() {
      try {
        await this.$API.auth.signinByLink(this.code);

        codeFileStore.set('code', this.code);

        this.invalidCode = false;

        await this.$store.dispatch('initial');

        await this.$router.replace({
          name: 'workspace',
        });
      } catch (err) {
        if (err.response.data.message === errorMessages.badRequest) {
          this.invalidCode = true;
        }
      }
    },
    useOldAppData() {
      const appDataPath = ipcRenderer.sendSync('remote-getPath', 'appData');
      let oldAppData = null;

      try {
        oldAppData = fs.readFileSync(path.join(appDataPath, '🖐 Heyka', 'config.json'), 'utf8');
        oldAppData = JSON.parse(oldAppData);
      } catch (e) {
        // do nothing
        // file is not found or there are problems to open and parse it
        cnsl.error('Error on open old app data: ', e);
        cnsl.log(path.join(appDataPath, '🖐 Heyka', 'config.json'));

        return;
      }

      const authLink = mapUsers[`${oldAppData.userId}`];

      if (authLink) {
        cnsl.log('Old user id is: ', oldAppData.userId);
        this.code = authLink;
        this.signinHandler();
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
