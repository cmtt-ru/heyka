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
  plugins: debug ? [ createLogger() ] : [],
});

mediaDevices.on('change', (devices) => {
  store.commit('app/SET_DEVICES', devices);
});

mediaDevices.on('bluetooth-microphone', (microphone) => {
  console.log('bluetooth microphone detected', microphone);
});

export default store;
