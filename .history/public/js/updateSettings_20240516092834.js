import axios from 'axios';
import { showAlert } from './alert';

export const updateData = async (data, type) => {
  try {
    const caminho = type === 'password' ? 'updateMyPassword' : 'updateMe';

    const config = {
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/${caminho}/`,
    };

    if (type === 'passwor') {
      config.data = {
        passwordCurrent: data.get('passwordCurrent'),
        password: data.get('password'),
        passwordConfirm: data.get('passwordConfirm'),
      };
    } else {
      config.data = {
        name: data.get('name'),
        email: data.get('email'),
      };
    }

    const res = await axios(config);

    if (res.data.status === 'success') {
      const message =
        type === 'password'
          ? 'Senha atualizada com sucesso!'
          : 'Dados atualizados com sucesso!';
      showAlert('error', error.response.data.message);
    }

    // if (type === 'password') {
    //   const res = await axios({
    //     method: 'PATCH',
    //     url: `http://localhost:3000/api/v1/users/${caminho}/`,
    //     data: {
    //       passwordCurrent: data.get('passwordCurrent'),
    //       password: data.get('password'),
    //       passwordConfirm: data.get('passwordConfirm'),
    //     },
    //   });

    //   if (res.data.status === 'success') {
    //     showAlert('success', `Senha atualizada com sucesso!`);
    //   }
    // }

    // const res = await axios({
    //   method: 'PATCH',
    //   url: `http://localhost:3000/api/v1/users/${caminho}/`,
    //   data: {
    //     name: data.get('name'),
    //     email: data.get('email'),
    //   },
    // });

    // console.log(data.get('name'));
    // if (res.data.status === 'success') {
    //   showAlert('success', `Dados atualizados com sucesso!`);
    // }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
