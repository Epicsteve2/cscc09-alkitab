import { NextFunction, Request, Response } from 'express';
import User from '../models/user';
import { RequestHandler } from 'express/ts4.0';

// import session from "express-session"
import bcrypt from 'bcrypt';
import { updateLanguageServiceSourceFile } from 'typescript';
import { userExists } from '../util/user';

export const checkLoggedIn: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	console.log('CHECJED Login');
	if (!req.session.user) return res.status(404).json({ msg: 'Must be logged In' });
	else next();
};
