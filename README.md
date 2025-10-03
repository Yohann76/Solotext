# Solotext 

# Technologies

- NodeJS/ExpressJS 
- VueJS
- Artifical inteligence 

## Run project 

### Makefile run 

```
make dev-build 
make dev-run 
make dev-kill   

make dev-logs 
make dev-status 
make dev-clean  
make dev-restart 

make help  
```

### Docker run 

```
docker-compose up -d --build
docker-compose down
docker-compose ps

http://localhost:3000/  # backend 
http://localhost:8080/  # frontend
http://localhost:8081/  # adminer
```

### Manual run

Backend 

```
cd backend
npm run dev

http://localhost:3000/    # endpoint base 
http://localhost:3000/api/health  # endpoint santé
```

Frontend

```
cd frontend
npm install
npm run dev

http://localhost:8080/ 
```
