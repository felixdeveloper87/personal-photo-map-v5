# Como Limpar Curiosidades do Cache

## Opção 1: Do Host (Fora do Docker) - RECOMENDADO

### Para Development:
```bash
curl -X DELETE http://localhost:8092/api/countries/curiosities/all
```

### Para Production:
```bash
curl -X DELETE http://localhost:8092/api/countries/curiosities/all
```

## Opção 2: Dentro do Container Backend

### Para Development:
```bash
# Entrar no container
docker exec -it photomap-backend-dev sh

# Dentro do container, executar:
curl -X DELETE http://localhost:8092/api/countries/curiosities/all
# ou se o curl não estiver disponível:
wget --method=DELETE http://localhost:8092/api/countries/curiosities/all
```

### Para Production:
```bash
# Entrar no container
docker exec -it photomap-backend-prod sh

# Dentro do container, executar:
curl -X DELETE http://localhost:8080/api/countries/curiosities/all
```

## Opção 3: Executar Diretamente sem Entrar no Container

### Para Development:
```bash
docker exec photomap-backend-dev curl -X DELETE http://localhost:8092/api/countries/curiosities/all
```

### Para Production:
```bash
docker exec photomap-backend-prod curl -X DELETE http://localhost:8080/api/countries/curiosities/all
```

## Outros Comandos Úteis

### Limpar curiosidades de um país específico:
```bash
# Development
curl -X DELETE http://localhost:8092/api/countries/cz/curiosities

# Production
curl -X DELETE http://localhost:8092/api/countries/cz/curiosities
```

### Limpar cache Caffeine (memória):
```bash
# Development
curl -X DELETE http://localhost:8092/api/countries/cache/caffeine/all

# Production
curl -X DELETE http://localhost:8092/api/countries/cache/caffeine/all
```

### Limpar cache completo de um país:
```bash
# Development
curl -X DELETE http://localhost:8092/api/countries/cz/cache

# Production
curl -X DELETE http://localhost:8092/api/countries/cz/cache
```

## Verificar Resposta

Para ver a resposta do servidor, adicione `-v` (verbose) ou `-i` (headers):
```bash
curl -X DELETE -i http://localhost:8092/api/countries/curiosities/all
```

## Windows PowerShell

Se estiver usando Windows PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:8092/api/countries/curiosities/all" -Method DELETE
```

Ou usando curl (se disponível no PowerShell):
```powershell
curl.exe -X DELETE http://localhost:8092/api/countries/curiosities/all
```

