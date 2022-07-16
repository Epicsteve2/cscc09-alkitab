import { Router } from 'express';
import multer from 'multer';
import * as bookPostController from '../controllers/bookPost';

const bookPostRouter = Router();
bookPostRouter.post('/add', bookPostController.makeNewPost);


export default bookPostRouter;