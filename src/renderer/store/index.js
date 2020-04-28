import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';
import modules from './modules';
import actions from './actions';
import getters from './getters';
import state from './state';
import mutations from './mutations';
import createMutationsSharer from "vuex-shared-mutations";

const debug = process.env.NODE_ENV !== 'production';

const plugins = [
  createMutationsSharer({
    predicate: [ 'app/SET_TEST' ],
  }),
];

if (debug) {
  plugins.push(createLogger());
}

Vue.use(Vuex);

const store = new Vuex.Store({
  modules,
  state,
  mutations,
  actions,
  getters,
  strict: debug,
  plugins,
});

export default store;
