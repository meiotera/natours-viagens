const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Reserva deve pertencer a um passeio!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Reserva deve pertencer a um usuário!'],
    },
    price: {
      type: Number,
      required: [true, 'Reserva deve ter um preço!'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },

  // apenas para teste
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

// apenas para teste - virtual populate
// bookingSchema.virtual('tours', {
//   ref: 'Tour',
//   localField: '_id',
//   foreignField: 'user',
//   justOne: true,
// });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
