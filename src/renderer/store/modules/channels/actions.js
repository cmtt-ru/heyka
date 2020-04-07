import API from '@api';

export default {

  async selectChannel({ commit }, id, mediaState) {
    const channel = await API.channel.select(id, mediaState/* {
      microphone: false,
      speakers: false,
      screen: true,
      camera: true,
      speaking: false,
    } */);

    return channel;
  },

};
