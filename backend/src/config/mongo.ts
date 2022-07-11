import dotenv from 'dotenv';
dotenv.config();

const MONGO_OPTIONS = {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	socketTimeoutMS: 10000,
	keepAlive: true,
	autoIndex: false,
	retryWrites: false,

	user: "root",
	pass: process.env.PASS
};

const MONGO_PORT = parseInt(process.env.MONGO_PORT || '27017');
const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'AlkitabDB';
const MONGO_USER = "root"
const MONGO_PASS = 123456
const MONGO = {
	host: MONGO_HOST,
	options: MONGO_OPTIONS,
	url: `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}`
};

export default MONGO;
