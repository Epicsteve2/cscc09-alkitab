import { Request, Response, NextFunction } from 'express';
import logging from '../middlewares/logging';

const NAMESPACE = 'Sample Controller';

export const getAllCars = (req: Request, res: Response, next: NextFunction) => {
	logging.info(NAMESPACE, 'Sample function called');

	return res.status(200).json({ message: 'hello world' });
};
