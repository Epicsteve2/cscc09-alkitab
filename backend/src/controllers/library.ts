import { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express/ts4.0';
import multer from 'multer';

const NAMESPACE = 'Library Controller';

export const upload: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    
};

