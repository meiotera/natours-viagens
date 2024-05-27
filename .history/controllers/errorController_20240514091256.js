const AppError = require('../ultils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;

  // console.log(message);

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;

  const message = `Esse passeio já existe: '${value}', Altere o nome!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Entrada inválida: ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError(
    'Token inválido ou Expirou! Por favor, faça login novamente.',
    401,
  );

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Website rendering
    res.status(err.statusCode).render('error', {
      title: 'Algo deu errado!',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    // Operatinal, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // Programming or other unknown error: don't leak error details
    } else {
      // 1) log error
      console.error('ERROR ', err);

      // 2) Send generic message
      res.status(500).json({
        status: 'error',
        // stack: err.stack,
        message: 'Algo deu errado!',
      });
    }
  }
  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Algo deu errado!',
      msg: err.message,
    });
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) log error
    console.error('ERROR ', err);

    // 2) Send generic message
    res.status(err.statusCode).render('error', {
      title: 'Algo deu errado!',
      msg: 'Por favor, tente novamente mais tarde.',
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log('estou impr', { err });

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err, name: err.name };
    // console.log('ERROR doido: ', error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    // Token inválido chama função handleJWTError || Token expirado chama função handleJWTExpiredError
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    )
      error = handleJWTError(error);

    // if (error.code === 11000) {
    //   console.log('entrei');
    //   handleDuplicateFieldsDB(error);
    // }

    sendErrorProd(error, req, res);
  }
};
