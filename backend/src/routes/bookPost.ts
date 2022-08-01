import { Router } from 'express';
import multer from 'multer';
import * as bookPostController from '../controllers/bookPost';

const bookPostRouter = Router();
bookPostRouter.post('/create', bookPostController.makeNewPost);


bookPostRouter.post('/:id/incrmentReaders', bookPostController.incrOwners);

bookPostRouter.get('/', bookPostController.getBookPosts);


export default bookPostRouter;