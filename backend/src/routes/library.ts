import { Router } from 'express';
import multer from 'multer';
import * as libraryController from '../controllers/library';

const libraryRouter = Router();
const upload = multer({ dest: "tempstore/" });

libraryRouter.post('/book', upload.fields([{ name: "book", maxCount: 1 }]), libraryController.upload);

libraryRouter.get('/book/:id', libraryController.getBook);

libraryRouter.post('/test', upload.fields([{ name: "book", maxCount: 1 }]), libraryController.test);

export default libraryRouter;