import { Router } from 'express';
import UserController from './app/controllers/UserController';
import Authentication from './middleware/Auth';
import SessionController from './app/controllers/SessionController';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(Authentication);

routes.put('/users', UserController.update);

export default routes;
