import axios from 'axios';
import { showAlert } from './alert';

export const updateData = async (data, type) => {

    console.log(data)
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updateMyPassword/'
        : 'http://localhost:3000/api/v1/users/updateMe/';

    const res = await axios({
      method: 'PATCH',
      url,
      data: {
        data,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} atualizado com sucesso!`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
