export default {

  action({ commit }) {
    return new Promise((resolve, reject) => {
      commit('SET_SOME', 1);
      resolve();
    });
  },

};
