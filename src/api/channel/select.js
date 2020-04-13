import axios from 'axios';
import { client } from '@api/socket/client';

export default function (id, mediaState) {
  return axios.post(`/channels/${id}/select?socketId=${client.id}`, mediaState);
}
