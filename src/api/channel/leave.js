import axios from 'axios';

export default function (id) {
  return axios.post(`/channels/${id}/leave`);
}