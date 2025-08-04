# FitNest Docker Setup

This document explains how to run the FitNest application using Docker and Docker Compose.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system
- Git (to clone the repository)

## Architecture

The FitNest application consists of 4 services:

1. **Frontend** (Next.js) - Port 3010
2. **API Gateway** (Express.js) - Port 3000
3. **Auth Service** (Express.js) - Port 3001
4. **Gym Service** (Express.js) - Port 3002

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd FitNest
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Build and Run with Docker Compose

**For Development (with live reload):**
```bash
# Build and start all services in development mode with volume binding
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Or run in detached mode (background)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

**For Production:**
```bash
# Build and start all services in production mode
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

### 4. Access the Application

- **Frontend**: http://localhost:3010
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Gym Service**: http://localhost:3002

## Docker Commands

### Build Services

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build api-gateway
docker-compose build auth-service
docker-compose build gym-service
```

### Start/Stop Services

```bash
# Start all services
docker-compose up

# Start specific service
docker-compose up frontend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs frontend
docker-compose logs api-gateway
docker-compose logs auth-service
docker-compose logs gym-service

# Follow logs in real-time
docker-compose logs -f
```

### Health Checks

All services include health checks. You can verify the health status:

```bash
# Check health status
docker-compose ps

# Check specific service health
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Gym Service
curl http://localhost:3010         # Frontend
```

## Development vs Production

### Development Mode

For development with live reload and volume binding:

```bash
# Start in development mode with file watching
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Build and start in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Stop development services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

**Development Features:**
- ✅ **Live Reload**: Code changes automatically restart services
- ✅ **Volume Binding**: Local files are mounted into containers
- ✅ **Development Dependencies**: All npm packages including dev dependencies
- ✅ **Environment**: `NODE_ENV=development`
- ✅ **Hot Reload**: Next.js frontend updates without container restart

### Production Mode

The current setup is configured for production. Ensure you:

1. Set `NODE_ENV=production` in your environment
2. Configure proper SSL certificates
3. Use a reverse proxy (nginx) for production deployment
4. Set up proper logging and monitoring

```bash
# Production commands
docker-compose up --build
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Make sure ports 3000, 3001, 3002, and 3010 are not in use
2. **Environment Variables**: Ensure all required environment variables are set
3. **Supabase Connection**: Verify your Supabase credentials are correct

### Debug Commands

```bash
# Check container status
docker ps

# Enter container shell
docker exec -it fitnest-frontend sh
docker exec -it fitnest-api-gateway sh
docker exec -it fitnest-auth-service sh
docker exec -it fitnest-gym-service sh

# View container logs
docker logs fitnest-frontend
docker logs fitnest-api-gateway
docker logs fitnest-auth-service
docker logs fitnest-gym-service
```

### Cleanup

```bash
# Remove all containers and images
docker-compose down --rmi all

# Remove all volumes (WARNING: This will delete data)
docker-compose down -v --rmi all

# Clean up Docker system
docker system prune -a
```

## Network

All services communicate through a custom Docker network called `fitnest-network`. This allows services to communicate using service names instead of IP addresses.

## Volumes

The setup includes a volume for caching node_modules to improve build performance during development.

## Security Notes

- Never commit your `.env` file with real credentials
- Use Docker secrets for production deployments
- Regularly update your Docker images for security patches
- Consider using non-root users in production containers
