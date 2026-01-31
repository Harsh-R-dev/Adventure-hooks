import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { type } from 'os';
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
  role: {
    type: String,
    Enum: [
      'admin',
      'user',
      'guide',
      'lead-guide',
    ],
    default: 'user',
  },
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
  passwordChangedAt: Date,
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

userschema.methods.changedPasswordAfter =
  function (JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = Math.floor(
        this.passwordChangedAt.getTime() / 1000
      );

      return JWTTimestamp < changedTimestamp;
    }

    // false means password NOT changed after token
    return false;
  };

const user = mongoose.model('user', userschema);
export default user;
