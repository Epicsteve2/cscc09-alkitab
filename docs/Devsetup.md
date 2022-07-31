1. Bring up nginx-proxy
    >  docker run   --network host   --volume "$(pwd)/nginx/cors-proxy.conf:/etc/nginx/nginx.conf:ro" nginx:1.23-alpine

2. Bring up mongodb 
    > docker compose up mongodb

3. Run backend
   > cd backend/
   
   > nodemon src/app.ts

4. Run frontend
    > cd frontend/
    
    > npm run dev


* Use mutiple terminals