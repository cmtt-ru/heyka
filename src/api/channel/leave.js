import axios from 'axios';

export default function (ID) {
  return axios.post('/channels/' + ID + '/leave');
}