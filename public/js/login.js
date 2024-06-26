/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login/',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'login realizado com sucesso');
      // window.setTimeout(() => {
      location.assign('/');
      // }, 1000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout/',
    });

    // ao fazer logout, redirecionar para a home
    if (res.data.status === 'success') location.assign('/');

    // if (res.data.status === 'success') location.reload(true);
  } catch (error) {
    showAlert('error', 'Erro ao sair! Tente novamente.');
  }
};
