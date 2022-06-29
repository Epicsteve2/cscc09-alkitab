import dotenv from "dotenv";
dotenv.config();

const MONGO_OPTIONS = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  socketTimeoutMS: 30000,
  keepAlive: true,
  poolSize: 50,
  autoIndex: false,
  retryWrites: false
};

const MONGO_PORT = parseInt(process.env.MONGO_PORT || "27017");
const MONGO_HOST = process.env.MONGO_HOST || "localhost";



const dbConfig = {};

export default dbConfig;
