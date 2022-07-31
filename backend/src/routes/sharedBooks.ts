import { Router } from 'express';
import * as sharedBooksController from '../controllers/sharedBooks';

const sharedBooksRouter = Router();

sharedBooksRouter.post('/share', sharedBooksController.addShareRelationship);

sharedBooksRouter.get('/', sharedBooksController.getSharedBooks);


export default sharedBooksRouter;
