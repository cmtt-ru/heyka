import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';
import modules from './modules';

const debug = process.env.NODE_ENV !== 'production';

console.log(modules);

Vue.use(Vuex);
const store = new Vuex.Store({
  modules,
  strict: debug,
  plugins: debug ? [ createLogger() ] : [],
});

export default store;
