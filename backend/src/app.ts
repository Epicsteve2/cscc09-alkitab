import express from 'express';
import logging from './middlewares/logging';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import config from './config/general';
import userRouter from "./routes/user";

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

// API Routes
app.use('/api/users', userRouter);

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

// Creating the server
app.listen(config.server.port, () => {
	logging.info(NAMESPACE, `Server running on ${config.server.hostname}:${config.server.port}`);
});
