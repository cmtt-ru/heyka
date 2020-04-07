export default {

  getUserById: state => id => {
    const user = state.collection[id] || null;

    return user;
  },
};
