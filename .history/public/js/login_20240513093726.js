/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login/',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'login realizado com sucesso');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = () => {
  try {
    const res = axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout/',
    });
  } catch (error) {
    showAlert('error', 'Erro ao sair! Tente novamente.');
  }
};
