import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import multer from 'multer';
import socketio from 'socket.io';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { SESSION_SECRET } from './config/server';

import socket from './socket';

import logging from './middlewares/logging';

import config from './config/general';

import userRouter from './routes/user';
import libraryRouter from './routes/library';
import sharedBooksRouter from './routes/sharedBooks';

import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from './interfaces/socketio';

import { checkLoggedIn } from './middlewares/auth';

const NAMESPACE: string = 'App';
const app: express.Application = express();

// Session
declare module 'express-session' {
	export interface SessionData {
		user: string;
	}
}

app.use(
	session({
		secret: SESSION_SECRET,
		resave: false,
		saveUninitialized: true
	})
);

// Logging
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`);

	res.on('finish', () => {
		// Event listener for response finishing event
		logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`);
	});

	next();
});

// Request parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

// Sockets
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
	cors: {
		origin: '*',
		credentials: true
	}
});

// API Routes

app.use('/api/users', userRouter);

app.use('/api/library', checkLoggedIn);
app.use('/api/library/', libraryRouter);

app.use('/api/sharedbooks', checkLoggedIn);
app.use('/api/sharedbooks/', sharedBooksRouter);

// Error Handling
app.use((req, res, next) => {
	const error = new Error('not found');
	return res.status(404).json({ message: error.message });
});

// Connect to MongoDB
mongoose
	.connect(config.mongo.url, config.mongo.options)
	.then((r) => logging.info(NAMESPACE, 'Connected to MongoDB Database!'))
	.catch((error) => logging.error(NAMESPACE, error.message, error));

console.log('Mongo URL: ', config.mongo.url);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

// Creating the server
httpServer.listen(config.server.port, () => {
	logging.info(NAMESPACE, `Server running on ${config.server.hostname}:${config.server.port}`);
	socket({ io });
});
