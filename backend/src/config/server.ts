import dotenv from 'dotenv';

dotenv.config();

const HOST_NAME = process.env.HOST_NAME || 'localhost';
const PORT = parseInt(process.env.PORT || '3000');
export const SESSION_SECRET = process.env.SESSION_SECRET || '2FLBxeUZsx';

const SERVER = {
	hostname: HOST_NAME,
	port: PORT
};

export default SERVER;
