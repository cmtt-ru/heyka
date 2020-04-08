import axios from 'axios';

const socketId = '3442344';

export default function (id) {
  return axios.post(`/channels/${id}/unselect?socketId=${socketId}`);
}