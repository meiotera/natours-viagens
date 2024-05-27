/* eslint-diseble */
/* eslint-env es6 */
/* eslint-disable no-unused-vars */
import '@babel/polyfill';
import { displayMap } from './openLayer.js';
import { login, logout } from './login.js';
import { updateData } from './updateSettings.js';
import { signup } from './signup.js';

// elemento do DOM
const map = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const signupForm = document.querySelector('.form--signup');
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
    const form = new FormData()

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log(form)

    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;

    await updateData(form, 'data');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('#btn--save-password ').textContent =
      'Atualizando...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateData(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    document.querySelector('#btn--save-password ').textContent =
      'Alterar Senha';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('#btn--login').textContent = 'Entrando...';
    // valores do formulário
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    await login(email, password);
    // document.querySelector('#btn--login').textContent = 'Login';
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

// FORMULÁRIO DE CADASTRO
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('#btn--signup').textContent = 'Cadastrando...';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    await signup(name, email, password, passwordConfirm);
    document.querySelector('#btn--signup').textContent = 'Cadastrar';
  })
}
