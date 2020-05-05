import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';
import modules from './modules';
import actions from './actions';
import getters from './getters';
import state from './state';
import mutations from './mutations';
import mediaDevices from '@classes/mediaDevices';

const debug = process.env.NODE_ENV !== 'production';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules,
  state,
  mutations,
  actions,
  getters,
  strict: debug,
  plugins: debug ? [
    createLogger({
      /**
       * Filter mutations to be logged
       * @param {object} mutation Mutation type and payload
       * @returns {void}
       */
      filter(mutation) {
        const ignoreList = [
          'app/SET_MICROPHONE_VOLUME',
        ];

        return !ignoreList.includes(mutation.type);
      },
    }),
  ] : [],
});

mediaDevices.on('change', (devices) => {
  store.commit('app/SET_DEVICES', devices);
});

mediaDevices.on('bluetooth-microphone', (microphone) => {
  console.log('bluetooth microphone detected', microphone);
});

export default store;
