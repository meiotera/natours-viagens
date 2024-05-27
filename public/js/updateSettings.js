import axios from 'axios';
import { showAlert } from './alert';

export const updateData = async (data, type) => {
  try {
    const caminho = type === 'password' ? 'updateMyPassword' : 'updateMe';

    // const config = {
    //   method: 'PATCH',
    //   url: `http://localhost:3000/api/v1/users/${caminho}/`,
    // };

    // if (type === 'password') {
    //   config.data = {
    //     passwordCurrent: data.get('passwordCurrent'),
    //     password: data.get('password'),
    //     passwordConfirm: data.get('passwordConfirm'),
    //   };
    // } else {
    //   config.data = {
    //     name: data.get('name'),
    //     email: data.get('email'),
    //   };
    // }

    const res = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/${caminho}/`,
      data,
    });

    // const res = await axios(config);

    if (res.data.status === 'success') {
      const message =
        type === 'password'
          ? 'Senha atualizada com sucesso!'
          : 'Dados atualizados com sucesso!';
      showAlert('success', message);
    }
  } catch (error) {
    console.log(error.response.data);
    showAlert('error', error.response.data.message);
  }
};
