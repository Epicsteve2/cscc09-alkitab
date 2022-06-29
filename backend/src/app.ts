import generalConfig from './config/general.config';
import express from 'express';
import logging from './middlewares/logging';
import bodyParser from 'body-parser';
import sampleRouter from './routes/car';
import mongoose from "mongoose";
import config from "./config/general.config";

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

// Routes
app.use('/car', sampleRouter);

// Error Handling
app.use((req, res, next) => {
	const error = new Error('not found');
	return res.status(404).json({ message: error.message });
});

// Connect to MongoDB
mongoose
	.connect(config.mongo.url, config.mongo.options)
	.then(r => logging.info(NAMESPACE, "Connected to MongoDB Database!"))
	.catch(error => logging.error(NAMESPACE, error.message, error));


// Creating the server
app.listen(generalConfig.server.port, () => {
	logging.info(NAMESPACE, `Server running on ${generalConfig.server.hostname}:${generalConfig.server.port}`);
});
