const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review não pode ser vazia !'],
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review deve pertencer a um passeio'],
    },

    user: {
      type: mongoose.ObjectId,
      ref: 'User',
      required: [true, 'Review deve pertencer a um usuário'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// evitar duplicação de reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// evitar duplicação de reviews
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   })

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Metodo de criar estatisticas
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      // calcular estatisticas
      $group: {
        // nessa parte a primeira coisa é passar o ID
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
    {
      $sort: { avgRating: -1 },
    },
  ]);

  // persistir estatistica para o tour
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// calcular estatisticas após salvar
reviewSchema.post('save', function () {
  // this aponta para o documento atual
  this.constructor.calcAverageRatings(this.tour);
});

// atualizar estatisticas após atualizar ou excluir
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

// excluir reviews e atualizar estatisticas
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
