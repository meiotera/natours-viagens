/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* eslint-disable node/no-unsupported-features/es-syntax */
// const fs = require('fs');

const sharp = require('sharp');
const multer = require('multer');
const Tour = require('../models/tourModel');
// const APIFeatures = require('../ultils/apiFeatures');
const AppError = require('../ultils/appError');
const catchAsync = require('../ultils/catchAsync');

const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

// funcao para filtrar arquivos
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Não é uma imagem! Por favor, envie apenas imagens.', 400),
      false,
    );
  }
};

// upload de imagem
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

// upload.array('images', 5);

// lendo os dados e armazenando na variavel
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// middleware evita repetição de código, verificando se existe um parametro na URL
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }

//   next();
// };
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // executando query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   // enviando resposta
//   res.status(200).json({
//     status: 'success',
//     // não é preciso, mas estamos verificando a quantidade de passeios

//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // convertendo o id para number para podermos comparar no método find
//   // também podemos usar req.params * 1 esse truque também converte para number
//   // const tour = tours.find((el) => el.id === id);

//   //   if (!tour) {
//   //     return res.status(404).json({
//   //       status: 'fail',
//   //       message: 'Invalid ID',
//   //     });
//   //   }

//   // const id = Number(req.params.id);
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(
//       new AppError('Passeio não foi encontraro! verifique o ID informado', 404),
//     );
//   }

//   res.status(200).json({
//     stauts: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     stauts: 'success',
//     data: {
//       tour: newTour,
//     },
//   });

//   // console.log(req.body);
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(
//       new AppError('Passeio não foi encontraro! verifique o ID informado', 404),
//     );
//   }

//   res.status(204).json({
//     status: 'success',
//     message: 'Passeio excluido',
//   });
// });

// AGGREGATION
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        duration: { $push: '$duration' },
        tours: { $push: '$name' },
      },
    },
    {
      $sort: { numRatings: -1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31 `),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

/* router.route(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  tourController.getToursWithin,
);
*/

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  // pegando a latitude e longitude
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Por favor, informe a latitude e longitude no formato lat,lng',
        400,
      ),
    );
  }

  // Procurar um Tour por proximidade com recurso de pesquisa geoespacial do Mongo
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });

  // console.log(distance, lat, lng, unit);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  // pegando a latitude e longitude
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Por favor, informe a latitude e longitude no formato lat,lng',
        400,
      ),
    );
  }

  /**
   * Array of distances.
   * @type {Array}
   */
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',

    data: {
      data: distances,
    },
  });
});
