const catchAsync = require('../ultils/catchAsync');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
// const AppError = require('../ultils/appError');
const factory = require('./handlerFactory');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1 - capturando o tour
  const tour = await Tour.findById(req.params.tourId);

  // 2 - criando a sessão de checkout
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // url de sucesso
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    // url de cancelamento
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'brl',
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

// Isto é apenas para simular uma reserva de um tour sem a necessidade de um pagamento real
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
