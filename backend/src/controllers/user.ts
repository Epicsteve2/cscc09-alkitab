import { NextFunction, Request, Response } from 'express';
import User from '../models/user';
import { RequestHandler } from 'express/ts4.0';

// import session from "express-session"
import bcrypt from "bcrypt"

const NAMESPACE = 'User Controller';

export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
};

export const logout: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {};

export const register: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const {username, password } = req.body
    const newUser = new User(req.body);
    const saltRounds = 10;

    await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err)  res.status(500).end(err);
            if (hash){
                newUser.password = hash;
            }
         });
    })

    const savedUser = await newUser.save();
    res.status(200).json(savedUser)

};
