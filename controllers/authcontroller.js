import user from '../models/usermodel.js';
import { promisify } from 'util';
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
      role: req.body.role,
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

export const protect = catchAsync(
  async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith(
        'Bearer'
      )
    ) {
      token =
        req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new appError(
          'You are not logged in! Please log in to get access.',
          401
        )
      );
    }

    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    const freshUser = await user.findById(
      decoded.id
    );
    if (!freshUser) {
      return next(
        new appError(
          'The user belonging to this token no longer exists.',
          401
        )
      );
    }

    if (
      freshUser.changedPasswordAfter(decoded.iat)
    ) {
      return next(
        new appError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    req.user = freshUser;
    next();
  }
);
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new appError(
          'You do not have perm,ission to perform this Action',
          403
        )
      );
    next();
  };
};
