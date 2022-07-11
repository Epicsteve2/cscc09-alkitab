import { NextFunction, Request, Response } from 'express';
import User from '../models/user';
import { RequestHandler } from 'express/ts4.0';

const NAMESPACE = 'User Middleware';


export const checkExistence: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    console.log("HREJ")
    const user = await User.findOne({
        username: req.body.username
    });
    if (user) res.status(400).json({user: "already exists"});
    else next();
};
