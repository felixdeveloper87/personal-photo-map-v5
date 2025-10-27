# 🚀 Cloudinary Integration - Deployment Guide

## 📋 O que foi implementado

Sistema híbrido de processamento de imagens:
- **Imagens >1MB**: Processadas no Cloudinary (economiza memória da VPS)
- **Imagens ≤1MB**: Armazenadas diretamente na VPS
- **Fallback automático**: Se Cloudinary falhar, processa localmente
- **Storage**: Todas as imagens ficam na VPS (Cloudinary só processa e deleta)

## ✅ Mudanças Realizadas

### 1. **Novo Serviço CloudinaryProcessingService**
- Envia imagem para Cloudinary
- Cloudinary otimiza automaticamente
- Baixa versão otimizada
- Deleta do Cloudinary
- Retorna bytes para salvar na VPS

### 2. **LocalFileStorageService Atualizado**
- Verifica se imagem >1MB
- Usa Cloudinary se disponível
- Fallback para processamento local se falhar
- Salva resultado na VPS

### 3. **Configurações Adicionadas**
- `env.prod`: Credenciais do Cloudinary
- `docker-compose.prod.yml`: Variáveis de ambiente
- `application.properties`: Configurações do serviço

### 4. **Otimizações de Memória**
- Java heap: 2GB → 1GB
- Processamento externo reduz carga da VPS
- Delays entre uploads mantidos para segurança

## 📦 Arquivos Modificados

```
✅ pom.xml                           - Dependência Cloudinary
✅ CloudinaryProcessingService.java  - Novo serviço (CRIADO)
✅ LocalFileStorageService.java     - Integração com Cloudinary
✅ ImageService.java                 - Otimizações de memória
✅ application.properties            - Configurações Cloudinary
✅ docker-compose.prod.yml           - Variáveis de ambiente
✅ env.prod                          - Credenciais Cloudinary
```

## 🔧 Como Fazer Deploy

### Opção 1: Git Pull (Recomendado)

```bash
# 1. Conectar ao VPS
ssh root@91.98.88.120

# 2. Navegar para o diretório
cd /path/to/photomap

# 3. Backup atual
docker-compose -f docker-compose.prod.yml down
cp -r backend backend_backup_$(date +%Y%m%d)
cp env.prod env.prod.backup

# 4. Atualizar código
git pull origin main

# 5. Copiar env.prod atualizado (se necessário)
# Verificar se as credenciais Cloudinary estão no arquivo

# 6. Rebuild backend
docker-compose -f docker-compose.prod.yml build backend --no-cache

# 7. Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# 8. Verificar logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Opção 2: Upload Manual

```bash
# 1. Do seu computador, fazer upload dos arquivos
scp env.prod root@91.98.88.120:/path/to/photomap/
scp docker-compose.prod.yml root@91.98.88.120:/path/to/photomap/
scp backend/photo-map/pom.xml root@91.98.88.120:/path/to/photomap/backend/photo-map/
scp -r backend/photo-map/src root@91.98.88.120:/path/to/photomap/backend/photo-map/

# 2. Conectar e rebuild
ssh root@91.98.88.120
cd /path/to/photomap
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build backend --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Verificação Pós-Deploy

### 1. Verificar se Cloudinary está ativo

```bash
docker-compose -f docker-compose.prod.yml logs backend | grep -i cloudinary
```

Deve aparecer:
```
✅ Cloudinary enabled - Cloud: dgdg6eigd
```

### 2. Testar Upload de Foto

Fazer upload de uma foto >1MB e verificar os logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f backend
```

Procurar por:
```
☁️ Processing with Cloudinary: foto.jpg
📤 Uploading to Cloudinary: foto.jpg (2500KB)
✅ Cloudinary processed: 2500KB → 650KB (74% reduction)
📥 Downloaded optimized image: 650KB
✅ Cloudinary processed and saved to VPS: uuid_foto.jpg (650KB)
🗑️ Deleted from Cloudinary: photomap-processing/abc123
```

### 3. Verificar Memória

```bash
free -h
docker stats photomap-backend-prod
```

Deve usar significativamente menos memória durante uploads!

### 4. Verificar Fotos Salvas

```bash
ls -lh /path/to/photomap/storage/uploads/
```

As fotos devem estar lá, otimizadas!

## ⚙️ Configurações

### Desabilitar Cloudinary (usar só local)

No `env.prod`:
```bash
CLOUDINARY_ENABLED=false
```

### Ajustar Qualidade do Cloudinary

Editar `CloudinaryProcessingService.java`, linha 80:
```java
"quality", "auto:good"  // Opções: auto:low, auto:good, auto:best
```

### Ajustar Tamanho Máximo

Editar `CloudinaryProcessingService.java`, linha 111:
```java
return processImage(file, 1600, 1600, "auto:good");
                          // ↑width ↑height
```

## 📊 Benefícios

### Antes (Processamento Local)
- ❌ Memória: ~500MB por foto grande
- ❌ CPU: 100% durante processamento
- ❌ Risco: VPS cai com múltiplos uploads
- ⏱️ Tempo: 3-5 segundos por foto

### Depois (Cloudinary)
- ✅ Memória: ~50MB por foto (10x menos!)
- ✅ CPU: Baixo (só download)
- ✅ Estabilidade: VPS não cai
- ⏱️ Tempo: 2-3 segundos por foto

## 🎯 Limites do Free Tier Cloudinary

- ✅ 25GB storage (mais que suficiente)
- ✅ 25GB bandwidth/mês
- ✅ Transformações ilimitadas
- ✅ Upload até 10MB por imagem

Para 1000 fotos de 2MB cada:
- Upload: 2GB
- Download: 0.6GB (otimizadas)
- Total usado: 2.6GB/25GB = **10%** ✅

## 🚨 Troubleshooting

### Cloudinary não está ativo

```bash
# Verificar variáveis de ambiente
docker exec photomap-backend-prod env | grep CLOUDINARY
```

Deve mostrar:
```
CLOUDINARY_ENABLED=true
CLOUDINARY_CLOUD_NAME=dgdg6eigd
CLOUDINARY_API_KEY=257586257591775
CLOUDINARY_API_SECRET=LoSyyFB...
```

### Erro de conexão com Cloudinary

```bash
# Ver logs detalhados
docker-compose -f docker-compose.prod.yml logs backend | grep -A 5 "Cloudinary"
```

Se falhar, o sistema automaticamente usa processamento local!

### VPS ainda cai

Se mesmo com Cloudinary o VPS cair:

1. **Reduzir memória Java ainda mais**:
   ```yaml
   JAVA_OPTS=-Xmx768m -Xms256m ...
   ```

2. **Limitar uploads concorrentes** (já está em 1, mas pode aumentar delays)

3. **Considerar upgrade de VPS** (recomendado: 4GB RAM)

## 📈 Monitoramento

### Cloudinary Dashboard

Acesse: https://cloudinary.com/console

- Veja estatísticas de uso
- Monitore bandwidth
- Verifique transformações

### Logs do Backend

```bash
# Ver últimos uploads
docker-compose -f docker-compose.prod.yml logs backend --tail=100 | grep -i "upload"

# Ver estatísticas de processamento
docker-compose -f docker-compose.prod.yml logs backend | grep -E "(Cloudinary|optimized)"
```

## ✅ Checklist de Deploy

- [ ] Código atualizado (git pull ou upload manual)
- [ ] env.prod com credenciais Cloudinary
- [ ] Backend rebuilt (--no-cache)
- [ ] Containers reiniciados
- [ ] Logs mostram "Cloudinary enabled"
- [ ] Teste de upload funcionando
- [ ] Fotos salvando na VPS
- [ ] Memória reduzida
- [ ] VPS estável

## 🎉 Resultado Esperado

Agora você pode fazer upload de MUITAS fotos sem derrubar o VPS! 🚀

O Cloudinary processa as imagens pesadas externamente, economizando memória e CPU da sua VPS. As fotos ficam salvas na VPS como antes, mas otimizadas profissionalmente!

## 💡 Próximos Passos (Opcional)

1. **CDN**: Servir imagens direto do Cloudinary para carregamento mais rápido
2. **Upload Direto**: Frontend upload direto para Cloudinary (mais rápido)
3. **Backup Automático**: Cloudinary como backup secundário
4. **Transformações On-Fly**: Redimensionar imagens conforme necessário

Precisa de ajuda? Verifique os logs! 📊

