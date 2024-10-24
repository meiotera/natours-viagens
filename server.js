const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  // console.error('Exception! Desligando...');
  // console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({
  path: './config.env',
});
const app = require('./app');

// vemos onde está sendo executado o aplicativo
// console.log(app.get('env'))
// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connections success'));

// ### START SERVER
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`App running on port ${port}...`);
});

//const server = app.listen(port, () => {
  //console.log(`App running on port ${port}`);
//});

process.on('unhandledRejection', (err) => {
  console.error('Rejection! Desligando...');
  console.log(err, err.message);
  server.close(() => {
    // 0 representa sucesso, 1 representa uma exceção não detectada
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Desligando o servidor...');
  server.close(() => {
    console.log('Process terminated!');
  });
});
