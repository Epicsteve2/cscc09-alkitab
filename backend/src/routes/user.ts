import { Router } from 'express';
import * as userController from '../controllers/user';

const userRouter = Router();

userRouter.post('/login', userController.login);

userRouter.post('/register', userController.register);

userRouter.get('/logout', userController.logout);

userRouter.get('/whoami', userController.whoami);

userRouter.get('/', userController.getUsers);

export default userRouter;
