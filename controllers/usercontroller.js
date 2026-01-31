import user from '../models/usermodel.js';
import { catchAsync } from '../utils/catchAsync.js';
export const alluser = catchAsync(
  async (req, res) => {
    const users = await user.find();

    res.status(200).json({
      status: ' succes',

      result: users.length,
      data: {
        users,
      },
    });
  }
);

export const createuser = (req, res) => {
  res.status(500).json({
    status: ' error',
    message: 'this route is not defined yet',
  });
};

export const updateuser = (req, res) => {
  res.status(500).json({
    status: ' error',
    message: 'this route is not defined yet',
  });
};

export const deleteuser = (req, res) => {
  res.status(500).json({
    status: ' error',
    message: 'this route is not defined yet',
  });
};

export const getuser = (req, res) => {
  res.status(500).json({
    status: ' error',
    message: 'this route is not defined yet',
  });
};
