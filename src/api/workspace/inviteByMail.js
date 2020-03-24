import axios from 'axios';

export default function (id, params) {
  return axios.post(`/workspaces/${id}/invite/email`, params);
}