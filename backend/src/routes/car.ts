import { getAllCars } from '../controllers/car';
import { Router } from 'express';

const carRouter = Router();

carRouter.get('/get', getAllCars);

export default carRouter;
