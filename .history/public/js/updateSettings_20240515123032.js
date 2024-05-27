import axios from 'axios';
import { showAlert } from './alert';

export const updateData = async (name, email) => {
  console.log(name, email);

  try {
    // const url = 'http://localhost:3000/api/v1/users/updateMe/';

    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:3000/api/v1/users/updateMe/',
      // data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} atualizado com sucesso!`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
