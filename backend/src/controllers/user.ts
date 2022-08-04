import { NextFunction, Request, Response } from 'express';
import User from '../models/user';
import { RequestHandler } from 'express/ts4.0';

// import session from "express-session"
import bcrypt from 'bcrypt';
import { updateLanguageServiceSourceFile } from 'typescript';
import { userExists } from '../util/user';

const NAMESPACE = 'User Controller';

export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const { username, password } = req.body;

	if (!(await userExists(username))) return res.status(401).json('Invalid Credentials');

	const user = await User.findOne({ username: username });
	if (user)
		bcrypt.compare(password, user.password, function (err, result) {
			if (err) res.status(500).end(err);
			if (!result) return res.status(401).end('Invalid Credentials');
			else {
				req.session.user = username;
				res.status(200).json({ username: username, msg: 'logged in' });
			}
		});
};

export const logout: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.session.user) return res.status(200).json('Not logged in');
	else {
		req.session.user = undefined;
		res.status(200).json('logged out');
	}
};

export const register: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const { username, password } = req.body;
	console.log(req.body);

	if (await userExists(username)) return res.status(400).json('Username exists');

	const newUser = new User(req.body);

	const saltRounds = 10;
	await new Promise<void>((resolve, reject) => {
		bcrypt.hash(password, saltRounds, function (err, hash) {
			if (err) res.status(500).end(err);
			if (hash) {
				newUser.password = hash;
				resolve();
			}
		});
	});

	const savedUser = await newUser.save();
	req.session.user = username;
	res.status(200).json(savedUser);
};

export const whoami: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.session.user) return res.status(200).json('Not logged in');
	else return res.status(200).json({ user: req.session.user });
};

export const getUsers: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
	const limit = req.query.limit ? Number(req.query.limit) : 1;

	const users = await User.find({}).sort({ username: 'asc' }).limit(limit);
	const usernames = users.map((user) => user.username);

	res.status(200).json({ users: usernames });
};
