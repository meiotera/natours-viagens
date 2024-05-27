/* eslint-diseble */
/* eslint-env es6 */
/* eslint-disable no-unused-vars */
import '@babel/polyfill';
import { displayMap } from './openLayer.js';
import { login, logout } from './login.js';
import { updateData } from './updateSettings.js';

// elemento do DOM
const map = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateUserDataForm = document.querySelector('.form-user-data');

const updatePasswordForm = document.querySelector('.form-user-settings');

// coordenadas do mapa
if (map) {
  const coordinate = JSON.parse(map.dataset.locations);
  displayMap(coordinate);
}

// atualizar dados do usuário
if (updateUserDataForm) {
  updateUserDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    // // form.append('photo', document.getElementById('photo').files[0]);
    await updateData(form, 'data');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--small.btn--green').textContent =
      'Atualizando...';

    const form = new FormData();
    form.append(
      'passwordCurrent',
      document.getElementById('password-current').value,
    );
    form.append('password', document.getElementById('password').value);
    form.append(
      'passwordConfirm',
      document.getElementById('password-confirm').value,
    );

    await updateData(form, 'password');

    document.querySelector('.btn--small.btn--green').textContent = 'Salvar Senha';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // valores do formulário
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);
