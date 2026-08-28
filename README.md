# balloon-comics
Projeto de plataforma de leitura e autopublicação de quadrinhos digitais


### Docker

#### Desenvolvimento local

Rode os seguintes comandos para rodar o ambiente de forma local com docker:
```bash
docker compose --env-file .env -f docker/docker-compose.dev.yml up -d
```

Pra derrubar os containeres, rode o seguinte comando:
```bash
docker compose -f docker/docker-compose.dev.yml down
```

Para rodar as migrations, execute o seguinte comando:
```bash
docker compose --env-file .env -f docker/docker-compose.dev.yml exec auth-service npm run migration:container

docker compose --env-file .env -f docker/docker-compose.dev.yml exec core-service npm run migration:container
```
