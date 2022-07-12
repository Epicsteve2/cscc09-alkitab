import { Router } from 'express';
import multer from 'multer';
import * as libraryController from '../controllers/library';

const libraryRouter = Router();
const upload = multer({ dest: "tempstore/" });

libraryRouter.post('/book', upload.fields([{ name: "book", maxCount: 1 }]), libraryController.upload);


export default libraryRouter;