const mongoose = require('mongoose');
// usando para verificar se o email é válido
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Insira o seu nome para realizar o cadastro'],
    minlength: [5, 'O nome deve ter no mínimo 8 caracteres'],
    maxlength: [40, 'O nome deve ter no máximo 40 caracteres'],
    validate: [
      {
        validator: function (val) {
          return /^[a-zA-Z\s-]*$/.test(val);
        },
        message: 'O nome de usuário deve ter apenas letras.',
      },
    ],
    trim: true,
  },

  email: {
    type: String,
    required: [true, 'Você deve inserir seu email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Por favor insira um e-mail válido'],
  },

  photo: {
    type: String,
  },
  // restringir o papel do usuário
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'Insira o seu Password'],
    minlength: [5, 'O Password deve ter no mínimo 5 caracteres'],
    // excluindo o password da saída do postman
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Confirme sua senha'],
    validate: {
      // Só funciona ao criar ou salvar
      validator: function (el) {
        return el === this.password;
      },
      message: 'As senhas devem ser iguais!',
    },
  },
  // data em que a senha foi alterada
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  passwordattmpt: {
    type: Number,
    default: 0,
    max: 5,
  },

  // horario que atingiu 5 tentativas
  passwordattmpTime: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 14);

  // deletando confirmpassword
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// função para verificar a senha
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// middleware de consulta para usuarios ativos
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
