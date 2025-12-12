import user from '../models/usermodel.js';
import appError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

export const signup = catchAsync(
  async (req, res, next) => {
    // const newUser = await user.create(req.body);

    const newUser = await user.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordconfirm: req.body.passwordconfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  }
);

export const login = catchAsync(
  async (req, res, next) => {
    const { email, password } = req.body;

    // 1)check if email and password exist or not
    if (!email || !password) {
      return next(
        new appError(
          'please enter the email and password',
          400
        )
      );
    }

    // 2) check if user exists and password is correct !
    const currentuser = await user
      .findOne({
        email,
      })
      .select('+password');

    if (
      !currentuser ||
      !(await currentuser.correctpassword(
        password,
        currentuser.password
      ))
    ) {
      return next(
        new appError(
          'Incoorect password or email',
          401
        )
      );
    }
    // 3) is everythimng ok send token to client
    const token = signToken(currentuser._id);

    res.status(200).json({
      status: 'success',
      token,
    });
  }
);
