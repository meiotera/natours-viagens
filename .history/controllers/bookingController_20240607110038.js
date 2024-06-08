const catchAsync = require('../ultils/catchAsync');
const Tour = require('../models/tourModel');
const AppError = require('../ultils/appError');
const factory = require('./handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRETE_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1 - capturando o tour
  const tour = await Tour.findById(req.params.tourId);

  console.log(tour);
  // 2 - criando a sessão de checkout
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // url de sucesso
    success_url: `${req.protocol}://${req.get('host')}`,
    // url de cancelamento
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  });

  // 3 - enviando a sessão para o cliente
  res.status(200).json({
    status: 'success',
    session,
  });
});
