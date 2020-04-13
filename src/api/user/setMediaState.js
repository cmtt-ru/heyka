import axios from 'axios';
import { client } from '@api/socket/client';

export default function (mediaState) {
  return axios.post(`/user/media-state?socketId=${client.id}`, mediaState);
}
