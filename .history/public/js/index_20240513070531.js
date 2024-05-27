/* eslint-diseble */
/* eslint-env es6 */
/* eslint-disable no-unused-vars */
import '@babel/polyfill';
import { login } from './login.js';

document.querySelector('.form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});
