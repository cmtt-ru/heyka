import axios from 'axios';

export default function (ID, params) {
  return axios.post('/workspaces/' + ID + '/invites', params);
}