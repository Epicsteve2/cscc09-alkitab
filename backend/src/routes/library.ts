import { Router } from 'express';
import multer from 'multer';
import * as libraryController from '../controllers/library';

const libraryRouter = Router();
const upload = multer({ dest: "tempstore/" });

libraryRouter.post('/book', upload.fields([{ name: "book", maxCount: 1 }]), libraryController.upload);

libraryRouter.post('/book2', upload.fields([{ name: "book", maxCount: 1 }]), libraryController.upload2);

libraryRouter.get('/book/:id', libraryController.getBook);

libraryRouter.get('/book/:id/details', libraryController.getBookDetails);

libraryRouter.get('/book/:id/cover', libraryController.getCoverImage);

libraryRouter.get('/book/:bookId/page/:page/highlights', libraryController.getPageHighlights);

libraryRouter.post('/book/:bookId/page/:page/updatehighlights', libraryController.handleUpdateHighlight);



libraryRouter.post('/test', upload.fields([{ name: "book", maxCount: 1 }]), libraryController.test);

libraryRouter.get('/', libraryController.getLibrary);

export default libraryRouter;