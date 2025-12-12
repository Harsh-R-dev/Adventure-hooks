import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
const userschema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, ' A user must have a name '],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'User must have an email'],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Please enter a valid email',
    ],
  },
  photo: String,

  password: {
    type: String,
    required: [
      true,
      'A user must have a password',
    ],
    minlength: 8,
    validate: [
      validator.isStrongPassword,
      'please use a strong password ',
    ],
    select: false,
  },
  passwordconfirm: {
    type: String,
    required: [
      true,
      'Please confirm your password',
    ],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not the same ',
    },
  },
});

userschema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(
    this.password,
    12
  );
  this.passwordconfirm = undefined;

  next();
});

userschema.methods.correctpassword =
  async function (
    candidatepassword,
    userpassword
  ) {
    return await bcrypt.compare(
      candidatepassword,
      userpassword
    );
  };
const user = mongoose.model('user', userschema);
export default user;
