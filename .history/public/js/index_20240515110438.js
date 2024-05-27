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
const updateUserDataForm = document.querySelector('.form. form-user-data');


// coordenadas do mapa
if (map) {
  const coordinate = JSON.parse(map.dataset.locations);
  displayMap(coordinate);
}

if (updateUserDataForm) {
  console.log('updateUserDataForm');
  return
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
