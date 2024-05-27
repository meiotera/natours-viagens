/* eslint-diseble */
/* eslint-env es6 */
/* eslint-disable no-unused-vars */
import '@babel/polyfill';
import { displayMap } from './openLayer.js';
import { login } from './login.js';

const coordinate = JSON.parse(document.getElementById('map').dataset.locations);

displayMap(coordinate);

document.querySelector('.form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});
