const User = require('../models/userModel');
const AppError = require('../ultils/appError');
const catchAsync = require('../ultils/catchAsync');
const factory = require('./handlerFactory');
const sharp = require('sharp');
const multer = require('multer');

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

// middleware para upload de imagem
exports.uploadUserPhoto = upload.single('photo');

// redimensionar imagem do usuario
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// função para filtrar os campos que não devem ser atualizados
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// função para atualizar usuário autenticado
exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  // 1) Criar erro se o usuário tentar atualizar a senha
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('Não é possível atualizar a senha por aqui!', 400),
    );
  }

  // 2) filtrar os campos que não devem ser atualizados
  const filteredBody = filterObj(req.body, 'name', 'email');

  // atualizar a imagem do usuário
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) atualizar o usuário
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined, por favor use /signup',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// Nao atualizar senha com essa rota
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
