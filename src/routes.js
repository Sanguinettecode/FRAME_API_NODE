import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import Authentication from './middleware/Auth';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotifyController from './app/controllers/NotifyController';
import AvailableController from './app/controllers/AvailableController';

const routes = new Router();
const uploads = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(Authentication);

routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/availables', AvailableController.index);

routes.post('/files', uploads.single('file'), FileController.store);

routes.get('/appointment', AppointmentController.index);
routes.post('/appointment', AppointmentController.store);
routes.delete('/appointment/:id', AppointmentController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotifyController.index);
routes.put('/notifications/:id', NotifyController.update);
export default routes;
