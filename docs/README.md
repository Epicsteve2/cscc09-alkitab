# General

## Backend Setup
1. Install Node and NPM
2. ``cd`` into the backend directory and install all dependencies
```
$ cd backend/
$ npm install
```

3. Create a `.env` file in the `backend/` directory and add the following to it:
```
HOST_NAME=localhost
PORT=8080
```

4. To run the development server:
```
$ npm run dev
```

## Contributing
* Use Git Flow:
  * Main branch for releases (Beta + Final Versions)
  * Development branch
    * Create branches off development for each new feature
      * Naming structure: `feature/feature-name`
    * Merge feature branch to development