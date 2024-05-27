/* eslint-diseble */
/* eslint-env es6 */
/* eslint-disable no-unused-vars */
import '@babel/polyfill';
import { displayMap } from './openLayer.js';
import { login } from './login.js';

// elemento do DOM
const map = document.getElementById('map');
const loginForm = document.querySelector('.form');

// valores do formulário
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

// coordenadas do mapa
if (map) {
  const coordinate = JSON.parse(map.dataset.locations);
  displayMap(coordinate);
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    login(email, password);
  });
}
