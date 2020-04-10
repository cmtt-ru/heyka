import axios from 'axios';

const socketId = '3442344';

export default function (mediaState) {
  return axios.post(`/user/media-state?socketId=${socketId}`, mediaState);
}
