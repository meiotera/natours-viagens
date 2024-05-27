const Tour = require('../models/tourModel');
const catchAsync = require('../ultils/catchAsync');
const AppError = require('../ultils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1 - pegar dados do tour da coleção Tour
  const tours = await Tour.find();

  // 2 - construir template
  // 3 - Renderizar template usando os dados da parte 1

  // console.log(tours)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1 - pegar dados do tour da coleção Tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // tratamento de erro caso nao exista um tour
  if (!tour) {
    return next(new AppError('Não há Tour com esse nome.', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Sua Conta',
  });
});

exports.getSignup = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Signup',
  });
});

// exports.updateUserData = catchAsync(async (req, res, next) => {
//   console.log('Atualizando dados do usuário...');
//   res.status(200).json({
//     status: 'success',
//   });
// });
