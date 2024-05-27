import axios from 'axios';
import { showAlert } from './alert';

export const updateData = async (data, type) => {
  try {
    const caminho = type === 'password' ? 'updateMyPassword' : 'updateMe';

    console.log('t', type)

    const res = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/${caminho}/`,
      data: {
        name: data.get('name'),
        email: data.get('email'),
      },
    });

    console.log(data.get('name'))
    if (res.data.status === 'success') {
      showAlert('success', `Dados atualizados com sucesso!`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
