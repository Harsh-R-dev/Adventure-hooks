import express from 'express';
import {
  aliastoptours,
  getalltour,
  createtour,
  updatetour,
  deletetour,
  gettour,
  getTourStats,
  getMonthPlan,
} from '../controllers/tourcontroller.js';

const Router = express.Router();

// Router.param('id', checkId);
Router.route('/top-5-cheap').get(
  aliastoptours,
  getalltour
);

Router.route('/tour-stats').get(getTourStats);
Router.route('/monthly-plan/:year').get(
  getMonthPlan
);
Router.route('/')
  .get(getalltour)
  .post(createtour);

Router.route('/:id')
  .get(gettour)
  .patch(updatetour)
  .delete(deletetour);

export default Router;
