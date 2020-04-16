import axios from 'axios';

export default function (params) {
  return axios.post('/refresh-token', params).then(res => res.data);
}
