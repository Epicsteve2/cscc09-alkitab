import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import multer from 'multer';

import logging from './middlewares/logging';

import config from './config/general';

import userRouter from './routes/user';
import libraryRouter from './routes/library';

import User from './models/user';

// const adminUser = new User({
// 	username: "admin",
// 	password: "123456"
// })
// adminUser.save()



const NAMESPACE: string = 'App';
const app: express.Application = express();

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

// Session
declare module 'express-session' {
	export interface SessionData {
	  user: string;
	}
  }

app.use(
	session({
	  secret: "please change this secret",
	  resave: false,
	  saveUninitialized: true,
	})
);


const upload = multer({ dest: 'uploads/' });






// API Routes
app.use('/api/users', userRouter);
app.use('/api/library/', libraryRouter)

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

console.log(config.mongo.options)
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Creating the server
app.listen(config.server.port, () => {
	logging.info(NAMESPACE, `Server running on ${config.server.hostname}:${config.server.port}`);
});
