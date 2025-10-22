# PhotoMap Docker Commands

## 🚀 Quick Start

### Development
```bash
# Copy environment file
cp env.dev .env

# Start development environment
docker compose -f docker-compose.dev.yml up --build

# Or run in background
docker compose -f docker-compose.dev.yml up --build -d
```

### Production
```bash
# Copy and edit production environment
cp env.prod .env
# Edit .env with your production values

# Start production environment
docker compose -f docker-compose.prod.yml up --build

# Or run in background
docker compose -f docker-compose.prod.yml up --build -d
```

## 📋 Available Commands

### Development Commands
```bash
# Start services
docker compose -f docker-compose.dev.yml up

# Start in background
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml logs -f db

# Rebuild and start
docker compose -f docker-compose.dev.yml up --build

# Remove everything (containers, networks, volumes)
docker compose -f docker-compose.dev.yml down -v
```

### Production Commands
```bash
# Start services
docker compose -f docker-compose.prod.yml up

# Start in background
docker compose -f docker-compose.prod.yml up -d

# Stop services
docker compose -f docker-compose.prod.yml down

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Rebuild and start
docker compose -f docker-compose.prod.yml up --build
```

## 🔧 Environment Setup

### 1. Development Setup
```bash
# Copy development environment
cp env.dev .env

# Start development
docker compose -f docker-compose.dev.yml up --build
```

**Access URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8092
- Database: localhost:5432

### 2. Production Setup
```bash
# Copy production environment
cp env.prod .env

# Edit .env with your production values
# IMPORTANT: Change passwords and JWT secret!

# Start production
docker compose -f docker-compose.prod.yml up --build
```

## 🔐 Security Notes

### JWT Secret Generation
```bash
# Generate a secure JWT secret
openssl rand -base64 64

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### Production Checklist
- [ ] Change database passwords
- [ ] Generate secure JWT secret
- [ ] Update APP_BASE_URL and BACKEND_URL
- [ ] Configure SSL certificates (if using HTTPS)
- [ ] Review and update nginx configuration

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :5173
   netstat -tulpn | grep :8092
   netstat -tulpn | grep :5432
   ```

2. **Database connection issues**
   ```bash
   # Check database logs
   docker compose -f docker-compose.dev.yml logs db
   
   # Check if database is healthy
   docker compose -f docker-compose.dev.yml ps
   ```

3. **Frontend not updating (dev mode)**
   ```bash
   # Rebuild frontend container
   docker compose -f docker-compose.dev.yml up --build frontend
   ```

4. **Clean everything and start fresh**
   ```bash
   # Stop and remove everything
   docker compose -f docker-compose.dev.yml down -v
   docker system prune -a
   
   # Start fresh
   docker compose -f docker-compose.dev.yml up --build
   ```

## 📁 File Structure
```
photomapV5/
├── docker-compose.dev.yml      # Development configuration
├── docker-compose.prod.yml     # Production configuration
├── env.example                 # Environment variables template
├── env.dev                     # Development environment
├── env.prod                    # Production environment
├── .env                        # Your actual environment file
└── docker-scripts.md          # This file
```




