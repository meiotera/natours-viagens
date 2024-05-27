/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
require('nodemailer/lib/xoauth2');
// const validator = require('validator');

// ### Mongoose
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // validador
      required: [true, 'O passeio deve ter um nome'],
      maxlength: [40, 'O nome deve ter no máximo 40 caracteres'],
      minlength: [10, 'O nome deve ter no mínimo 10 caracteres'],
      // Verifica se o valor contém apenas letras e espaços em branco
      validate: [
        {
          validator: function (val) {
            return /^[a-zA-Z\s-]*$/.test(val);
          },
          message: 'O nome do passeio deve conter apenas letras',
        },
      ],

      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Um passeio deve ter uma duração'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Um passeio deve ter um tamanho de grupo'],
    },
    difficulty: {
      type: String,
      required: [true, 'Informe a dificuldade'],
      // validador
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Os níveis devem ser: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // validação
      min: [1, 'Avaliação ser de no mínimo 1.0'],
      max: [5, 'Avaliação não deve ser superior a 5.0'],
      // arredondar valor ratingdAverage
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'O passeio deve ter um preço'],
    },
    // validador personalizadoprice
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this só aponta para o documento atual na criação de um novo documento
          return val < this.price;
        },
        message: `O valor de desconto de R$ {VALUE} deve ser inferior ao valor original!`,
      },
      // validate: function (val) {
      //   return val < this.price;
      // },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Um passeio deve ter uma descrição'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'O passeio deve ter uma imagem de capa'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      // coordenadas devem ser longitude e latitude
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });

// definindo indece para startLocation
tourSchema.index({ startLocation: '2dsphere' });

// Propriedades virtual
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// recuperar reviews do tour atual
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromisses = this.guides.map(
//     async (id) => await User.findById(id),
//   );
//   this.guides = await Promise.all(guidesPromisses);

//   next();
// });

// DOCUMENT Middleware: só executa antes do .save() e create(), não executa antes de insertMany
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Irei salvar o documento');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre('findOne', function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// middleware de populate
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -passwordResetExpires -passwordattmpt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query ${Date.now() - this.start} ms`);
  // console.log(docs);
  next();
});

// midleware de agragação
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
