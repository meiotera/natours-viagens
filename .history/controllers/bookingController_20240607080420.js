const catchAsync = require('../ultils/catchAsync');
const Tour = require('../models/tourModel');
const AppError = require('../ultils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1 - capturando o tour
  const tour = await Tour.findById(req.params.tourId);
});
