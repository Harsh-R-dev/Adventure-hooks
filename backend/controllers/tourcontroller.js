import fs from 'fs';
import Tour from '../models/tourmodel.js';
import APIfeatures from '../utils/apiFeatures.js';
import { catchAsync } from '../utils/catchAsync.js';
import appError from '../utils/appError.js';
export const aliastoptours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingaverage,price';
  req.query.fields = 'name,price,difficulty';
  next();
};
export const getalltour = catchAsync(
  async (req, res, next) => {
    const features = new APIfeatures(
      Tour.find(),
      req.query
    )
      .filter()
      .sort()
      .paginate()
      .limit();
    const tours = await features.query;

    res.status(200).json({
      status: ' succes',
      RequestedAt: req.requestTime,
      result: tours.length,
      data: {
        tours,
      },
    });
  }
);

export const gettour = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findById(
      req.params.id
    );

    if (!tour) {
      return next(
        new appError(
          'no tour found with that ID',
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  }
);

export const createtour = catchAsync(
  async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  }
);

export const updatetour = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tour) {
      return next(
        new appError(
          'no tour found with that ID',
          404
        )
      );
    }
    res.status(200).json({
      status: ' sucess',
      data: { tour: tour },
    });
  }
);

export const deletetour = catchAsync(
  async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(
      req.params.id,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!tour) {
      return next(
        new appError(
          'no tour found with that ID',
          404
        )
      );
    }
    res.status(204).json({
      status: ' sucess',
      data: { tour: 'deleted' },
    });
  }
);

export const getTourStats = catchAsync(
  async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: -1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  }
);

export const getMonthPlan = catchAsync(
  async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTours: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: { plan },
    });
  }
);
