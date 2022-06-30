# Backend Setup
1. Install Node and NPM
2. ``cd`` into the backend directory and install all dependencies
```bash
$ cd backend/
$ npm install
```

3. Create a `.env` file in the `backend/` directory and add the following to it:
```dotenv
# General
HOST_NAME=localhost
PORT=8080

# DB
MONGO_PORT=27017
MONGO_HOST=localhost
MONGO_DB_NAME=AlkitabDB
```

4. To run the development server:
```bash
$ npm run dev
```

## Database Setup

1. [Install MongoDB](https://www.youtube.com/watch?v=WH5GgHaEy7E)
2. Open your terminal and make sure MongoDB is running
    * To make sure it is running, run the following commands:
```bash
$ sudo pkill -f mongod
$ mongod  # or 'mongod &' to run it in the background
```