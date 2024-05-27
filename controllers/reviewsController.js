// const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');
// const catchAsync = require('../ultils/catchAsync');
const factory = require('./handlerFactory');
// const AppError = require('../ultils/appError');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     length: reviews.length,
//     data: {
//       reveiw: reviews,
//     },
//   });
// });

exports.setTourUserIds = (req, res, next) => {
  // se o tour nao existe, então não pode criar review
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

// criar controller de reviews
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
