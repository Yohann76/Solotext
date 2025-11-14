# Solotext 

# Technologies

- NodeJS/ExpressJS 
- VueJS
- Artifical inteligence 

## Infrastructure

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

yohanndurand76@gmail.com & devdev (test user)

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

Database

```
docker-compose exec backend npm run db:undo:all (delete all table)
docker-compose exec backend npm run db:migrate (apply all migration)
docker-compose exec backend npm run db:seed:all (add fixtures)

http://51.178.80.14:8081/

```
