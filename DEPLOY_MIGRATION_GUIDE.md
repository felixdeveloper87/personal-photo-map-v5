# 🚀 Guia de Deploy - Migration Premium

Este guia explica como aplicar a migration da coluna `premium` na VPS de produção.

## 📋 Pré-requisitos

- Acesso SSH à VPS
- Docker e Docker Compose instalados na VPS
- Arquivo `backend/migrations/add_premium_column.sql` disponível

---

## 🔧 Passo a Passo

### 1️⃣ Conectar na VPS via SSH

```bash
ssh usuario@seu-servidor.com
```

### 2️⃣ Navegar até o diretório do projeto

```bash
cd /caminho/do/seu/projeto/photomapV5
```

### 3️⃣ Verificar os containers em execução

```bash
docker compose -f docker-compose.prod.yml ps
```

Você deve ver algo como:
```
NAME                    STATUS
photomap-db-prod       Up
photomap-backend-prod   Up
```

### 4️⃣ Executar a Migration no Banco de Dados

Existem **duas formas** de executar a migration:

#### **Opção A: Via Docker Exec (Recomendado)**

```bash
# Copiar o arquivo SQL para o container (se ainda não estiver lá)
docker cp backend/migrations/add_premium_column.sql photomap-db-prod:/tmp/add_premium_column.sql

# Executar a migration dentro do container PostgreSQL
docker exec -i photomap-db-prod psql -U ${DB_USER} -d ${DB_NAME} < backend/migrations/add_premium_column.sql
```

**OU** executar diretamente:

```bash
docker exec -i photomap-db-prod psql -U ${DB_USER} -d ${DB_NAME} << EOF
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'premium'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN premium BOOLEAN NOT NULL DEFAULT false;
        
        RAISE NOTICE 'Premium column added successfully to users table';
    ELSE
        RAISE NOTICE 'Premium column already exists in users table';
    END IF;
END $$;
EOF
```

#### **Opção B: Via psql direto (se tiver acesso direto ao PostgreSQL)**

```bash
# Conectar ao PostgreSQL
psql -h localhost -p 5434 -U ${DB_USER} -d ${DB_NAME}

# Dentro do psql, executar:
\i backend/migrations/add_premium_column.sql

# Ou colar o conteúdo diretamente
```

### 5️⃣ Verificar se a Migration foi Aplicada

```bash
docker exec -i photomap-db-prod psql -U ${DB_USER} -d ${DB_NAME} -c "\d users"
```

Você deve ver a coluna `premium` na lista de colunas da tabela `users`.

Ou verificar diretamente:

```bash
docker exec -i photomap-db-prod psql -U ${DB_USER} -d ${DB_NAME} -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'premium';"
```

### 6️⃣ Rebuild e Restart do Backend (Opcional mas Recomendado)

Para garantir que o backend está usando o código mais recente:

```bash
# Parar o backend
docker compose -f docker-compose.prod.yml stop backend

# Rebuild com as mudanças do código
docker compose -f docker-compose.prod.yml build backend

# Iniciar novamente
docker compose -f docker-compose.prod.yml up -d backend

# Verificar logs para garantir que iniciou corretamente
docker compose -f docker-compose.prod.yml logs -f backend
```

### 7️⃣ Rebuild do Frontend (se necessário)

Se você fez mudanças no frontend também:

```bash
# Rebuild do frontend
docker compose -f docker-compose.prod.yml build frontend

# Restart
docker compose -f docker-compose.prod.yml restart frontend
```

---

## ✅ Verificação Final

### Testar se está funcionando:

1. **Verificar no banco:**
   ```bash
   docker exec -i photomap-db-prod psql -U ${DB_USER} -d ${DB_NAME} -c "SELECT id, email, premium FROM users LIMIT 5;"
   ```

2. **Testar a API:**
   ```bash
   # Fazer login e verificar se o campo premium está no response
   curl -X POST http://seu-backend-url/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"seu-email@exemplo.com","password":"sua-senha"}'
   ```

3. **Testar no frontend:**
   - Fazer login
   - Verificar se o botão Premium aparece
   - Tentar criar um álbum (premium feature)

---

## 🛡️ Segurança

⚠️ **IMPORTANTE**: 

- A migration é **idempotente** (pode ser executada múltiplas vezes sem problemas)
- Ela verifica se a coluna já existe antes de criar
- Não há risco de perda de dados
- Todos os usuários existentes receberão `premium = false` por padrão

---

## 🐛 Troubleshooting

### Erro: "could not connect to server"

```bash
# Verificar se o container do banco está rodando
docker compose -f docker-compose.prod.yml ps db

# Verificar logs do banco
docker compose -f docker-compose.prod.yml logs db
```

### Erro: "permission denied"

```bash
# Verificar se você tem acesso ao container
docker exec photomap-db-prod whoami

# Se necessário, usar root
docker exec -u root -i photomap-db-prod psql -U ${DB_USER} -d ${DB_NAME}
```

### Erro: "column already exists"

Isso é **normal**! Significa que a migration já foi aplicada. A migration verifica isso antes de criar.

---

## 📝 Notas Adicionais

- A migration é **segura** e não causa downtime
- Você pode executar durante o horário de funcionamento da aplicação
- Não é necessário fazer backup antes (mas sempre é recomendado!)
- A coluna será criada com valor padrão `false` para todos os usuários existentes

---

## 🎯 Resumo Rápido (TL;DR)

```bash
# 1. Conectar na VPS
ssh usuario@servidor

# 2. Ir para o projeto
cd /caminho/photomapV5

# 3. Executar migration
docker exec -i photomap-db-prod psql -U ${DB_USER} -d ${DB_NAME} < backend/migrations/add_premium_column.sql

# 4. Verificar
docker exec -i photomap-db-prod psql -U ${DB_USER} -d ${DB_NAME} -c "\d users"

# 5. Rebuild backend (opcional)
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml restart backend
```

Pronto! 🎉

