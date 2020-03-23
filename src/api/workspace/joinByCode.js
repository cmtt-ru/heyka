import axios from 'axios';

export default function (CODE) {
  return axios.post('/join/' + CODE);
}