import axios from 'axios';

const socketId = '3442344';

export default function (id, mediaState) {
  return axios.post(`/channels/${id}/select?socketId=${socketId}`, mediaState);
}