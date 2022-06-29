import dotenv from 'dotenv';

dotenv.config();

const HOST_NAME = process.env.HOST_NAME || 'localhost';
const PORT = parseInt(process.env.PORT || '8080');

const SERVER = {
    hostname: HOST_NAME,
    port: PORT
};

export default SERVER;