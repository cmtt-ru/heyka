import axios from 'axios';

export default function (CODE) {
  return axios.get('/check/' + CODE);
}