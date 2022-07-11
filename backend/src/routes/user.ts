import { Router } from 'express';
import * as userController from '../controllers/user';
import * as userMiddleware from '../middlewares/user';

const userRouter = Router();

userRouter.post('/login', userController.login);

userRouter.post('/register', userMiddleware.checkExistence);
userRouter.post('/register', userController.register);


userRouter.get('/logout', userController.logout);

export default userRouter;
