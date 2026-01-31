import express from 'express';
import morgan from 'morgan';
import connectDB from './db.js';

import tourRouter from './Routes/tourRoutes.js';
import userRouter from './Routes/userRoutes.js';

import { globalErrorHandler } from './controllers/errorController.js';
import appError from './utils/appError.js';
const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

connectDB();

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} on this Server !!`,
  // });

  // const err = new Error(
  //   `can't find ${req.originalUrl} on this Server !!`
  // );
  // err.status = 'fail';
  // err.statusCode = '400';

  next(
    new appError(
      `can't find ${req.originalUrl} on this Server !!`,
      404
    )
  );
});

app.use(globalErrorHandler);

export default app;
