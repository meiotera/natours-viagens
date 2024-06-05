/* eslint-disable no-lonely-if */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../ultils/catchAsync');
const AppError = require('../ultils/appError');
const Email = require('../ultils/email');

// função de criar token  - 1º argumento é o payload, 2º é a chave secreta, 3º é o tempo de expiração
const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// função de criar token  - 1º argumento é o payload, 2º é a chave secreta, 3º é o tempo de expiração
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // enviando o token via cookie
  res.cookie('jwt', token, cookieOptions);

  // removendo a senha da saida
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

// ### SIGNUP
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = 0;
  new Email(newUser, url).sendWelcome();

  // Token JWT para sessões
  createSendToken(newUser, 201, res);
});

// ### LOGIN
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1 - checar se o email e o password existem
  if (!email || !password) {
    return next(new AppError('Por favor informe o E-mail e a Senha', 400));
  }
  // 2 - checar se o usuário existe e o password está correto
  const user = await User.findOne({ email: email }).select('+password');

  if (!user) {
    return next(new AppError('E-mail ou Senha estão incorretos', 401));
  }

  // console.log(user.passwordattmpTime);

  // se user existe e o password estiver incorreto adicionar 1 a user.passwordattmpt
  // se o usuário tentar logar 5 vezes com a senha errada, bloquear por 1 minuto
  if (
    user.passwordattmpTime &&
    user.passwordattmpTime.getTime() + 3600000 > new Date().getTime()
  ) {
    return next(new AppError('Senha bloqueada por 1 hora', 401));
  }

  if (user && !(await user.correctPassword(password, user.password))) {
    user.passwordattmpt += 1;
    await user.save({ validateBeforeSave: false });

    // console.log(user.passwordattmpTime);

    if (user.passwordattmpt >= 5) {
      // verificar se passwordattmpTime esta vazio, se vazio atribuir valor
      if (!user.passwordattmpTime) {
        user.passwordattmpTime = new Date();
        await user.save({ validateBeforeSave: false });
      } else {
        // se nao, verificar se o tempo de bloqueio ja passou
        if (user.passwordattmpTime.getTime() + 3600000 < new Date().getTime()) {
          user.passwordattmpt = 0;
          user.passwordattmpTime = undefined;
          await user.save({ validateBeforeSave: false });
        }
      }

      return next(
        new AppError(
          'Você tentou inserir a senha errada 5 vezes, volte em 1 hora para tentar novamente',
          401,
        ),
      );
    }
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('E-mail ou Senha estão incorretos', 401));
  }

  // se a senha estiver correta, zerar user.passwordattmpt
  user.passwordattmpt = 0;
  user.passwordattmpTime = undefined;
  await user.save({ validateBeforeSave: false });

  // 3 - se tudo estiver ok, enviar o token para o cliente
  createSendToken(user, 200, res);
});

// Logout
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// Middleware para proteger rotas
exports.protect = catchAsync(async (req, res, next) => {
  // 1 - pegar o token e verificar se ele existe
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // console.log(token);

  if (!token) {
    return next(
      new AppError(
        'Você não está logado! Por favor, faça o login para ter acesso.',
        401,
      ),
    );
  }
  // 2 - verificar se o token é válido
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3 - verificar se o usuário ainda existe
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('O usuário que pertence a este token não existe mais.', 401),
    );
  }

  // 4 - verificar se o usuário mudou a senha após o token ter sido emitido
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Usuário recentemente mudou a senha! Por favor, faça o login novamente.',
        401,
      ),
    );
  }

  // // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Somente para paginas renderizadas, nao existira erros
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1 - verificar token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2 - verificar se o usuário ainda existe
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3 - verificar se o usuário mudou a senha após o token ter sido emitido
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // existe um usuario conectado
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

// implementando o middleware de restrição de acesso
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles é um array ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Você não tem permissão para executar essa ação!', 403),
      );
    }

    next();
  };

// recuperação de senha
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 - pegar o usuário com o email fornecido
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError(
        'Não foi encontrado nenhum usuário com essas informações.',
        404,
      ),
    );
  }

  // 2 - gerar o token aleatório
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3 - enviar o token para o email do usuário
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Esqueceu sua senha? Submeta uma nova senha com PATCH com sua nova senha e a confirmação para: ${resetURL}.
  \nSe você não esqueceu sua senha, por favor, ignore esse email!`;

  try {
    // await sendMail({
    //   email: user.email,
    //   subject: 'Seu token de redefinição de senha (válido por 10 minutos)',
    //   message,
    // });

    res.status(200).json({
      status: `success`,
      message: 'Token enviado para o e-mail!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Houve um erro ao enviar o email. Tente novamente mais tarde!',
        500,
      ),
    );
  }
});

// resetar a senha
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1 - pegar o usuário com o token fornecido
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // obtendo usuario com base no token e que o token nao tenha expirado
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2 - se o token não tiver expirado e o usuário existir, defina a nova senha
  if (!user) {
    return next(new AppError('Token inválido ou expirado!', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // pegar usuario conectado
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Senha atual incorreta!', 401));
  }

  // atualizar senha
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // logar user, enviando JWT

  await user.save();
  createSendToken(user, 200, res);
});
