import axios from 'axios';

export default function (id) {
  return axios.get(`/channels/${id}/active-users`);
}