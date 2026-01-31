import express from 'express';
import {
  alluser,
  getuser,
  createuser,
  deleteuser,
  updateuser,
} from '../controllers/usercontroller.js';
import {
  signup,
  login,
} from '../controllers/authcontroller.js';
const Router = express.Router();

Router.post('/signup', signup);
Router.post('/login', login);

Router.route('/').get(alluser).post(createuser);

Router.route('/:id')
  .get(getuser)
  .patch(updateuser)
  .delete(deleteuser);

export default Router;
