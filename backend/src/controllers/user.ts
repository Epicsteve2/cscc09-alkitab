import { NextFunction, Request, Response } from 'express';
import User from '../models/user';
import { RequestHandler } from 'express/ts4.0';

const NAMESPACE = 'User Controller';

export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {};

export const logout: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {};

export const register: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {};
