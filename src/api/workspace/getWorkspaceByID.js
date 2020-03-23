import axios from 'axios';

export default function (ID) {
  return axios.get('/workspaces/' + ID);
}