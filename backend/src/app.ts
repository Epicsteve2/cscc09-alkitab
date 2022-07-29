import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import multer from 'multer';
import socketio from 'socket.io';
import { Server } from 'socket.io';
// import cors from 'cors';

import logging from './middlewares/logging';

import config from './config/general';

import userRouter from './routes/user';
import libraryRouter from './routes/library';

import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from './interfaces/socketio';

import User from './models/user';
import { truncate } from 'fs';

// const adminUser = new User({
// 	username: "admin",
// 	password: "123456"
// })
// adminUser.save()

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
		secret: 'please change this secret',
		resave: false,
		saveUninitialized: true
	})
);

// CORS
// const options: cors.CorsOptions = {
// 	allowedHeaders: [
// 	  'Origin',
// 	  'X-Requested-With',
// 	  'Content-Type',
// 	  'Accept',
// 	  'X-Access-Token',
// 	],
// 	credentials: true,
// 	methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
// 	origin: '*',
// 	preflightContinue: false,
// };

// app.use(cors());
// app.options('*', cors)

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
const usersInBookRoom = new Map();
const bookRoomOfUser = new Map();

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>();
io.on('connection', (socket) => {
	console.log('connected');

	// socket.emit("noArg");
	// socket.emit("basicEmit", 1, "2", Buffer.from([3]));
	// socket.emit("withAck", "4", (e) => {
	//   // e is inferred as number
	// });
	// socket.on("details", () => {
	// 	// if (usersInBookRoom.get(bookRoomId)) {
	// 	// 	const curUsers = usersInBookRoom.get(bookRoomId);
	// 	// 	curUsers.push(socket.id);
	// 	// 	usersInBookRoom.set(bookRoomId, curUsers);
	// 	// } else {
	// 	// 	usersInBookRoom.set(bookRoomId, [socket.id])
	// 	// }
	// 	// bookRoomOfUser.set(socket.id, bookRoomId);

	// 	// socket.emit("all users", "ljdsak")
	// 	// ...
	// });

	// works when broadcast to all
	// io.emit("noArg");

	// works when broadcasting to a room
});

// API Routes
app.use('/api/users', userRouter);
app.use('/api/library/', libraryRouter);
app.use('/api/bookpost/', libraryRouter);

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
app.listen(config.server.port, () => {
	logging.info(NAMESPACE, `Server running on ${config.server.hostname}:${config.server.port}`);
});
