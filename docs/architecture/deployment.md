# Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Production Build](#production-build)
3. [Cloud Deployment](#cloud-deployment)
4. [Database Migration](#database-migration)
5. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites
- Node.js 14+ installed
- npm or yarn
- Git

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/zengyi04/carpark.git
cd carpark

# 2. Install dependencies
npm install

# 3. Set up environment
# .env already configured for SQLite

# 4. Initialize database
npm run migrate

# 5. Load data
npm run seed

# 6. Start development server
npm run dev
```

### Verify Local Setup
```bash
# Check server is running
curl http://localhost:3000/health
# Expected: {"status":"OK","timestamp":"..."}

# Check API working
curl http://localhost:3000/api/carparks/stats/count
# Expected: {"success":true,"data":{"totalCarparks":2181}}
```

---

## Production Build

### 1. Environment Configuration

Create `.env.production`:
```bash
# Database
DATABASE_URL="file:./prisma/prod.db"

# Server
NODE_ENV=production
PORT=3000

# Optional: Future authentication
# JWT_SECRET=your-secret-key-here
```

### 2. Optimizations

Install production dependencies:
```bash
npm ci --only=production
```

### 3. Build & Test

```bash
# Verify everything compiles
npm run generate

# Run any pre-deployment checks
npm run migrate -- --preview

# Start in production mode
NODE_ENV=production npm start
```

### 4. Database Backup

```bash
# Before deployment
cp prisma/dev.db prisma/dev.db.backup.$(date +%s)

# Verify backup
sqlite3 prisma/dev.db.backup.* "SELECT COUNT(*) FROM Carpark;"
```

---

## Cloud Deployment

### Option 1: Heroku

```bash
# 1. Create Heroku app
heroku create carpark-api

# 2. Add buildpacks
heroku buildpacks:add heroku/nodejs

# 3. Set environment variables
heroku config:set NODE_ENV=production

# 4. Deploy
git push heroku main

# 5. Run migrations
heroku run npm run migrate

# 6. Load data
heroku run npm run seed

# 7. Check logs
heroku logs --tail
```

### Option 2: Railway.app

```bash
# 1. Connect repository
# railway.app → New Project → GitHub

# 2. Configure variables in dashboard:
# - NODE_ENV = production
# - PORT = auto-assigned

# 3. Add start command:
# npm start

# 4. Deploy automatically on push
git push origin main
```

### Option 3: Render.com

```bash
# 1. Connect GitHub repo
# render.com → New Web Service

# 2. Build command:
npm ci

# 3. Start command:
npm start

# 4. Environment variables:
# NODE_ENV=production
# DATABASE_URL=...

# 5. Deploy
```

### Option 4: AWS EC2 + RDS

```bash
# 1. Launch EC2 instance
# - Ubuntu 22.04 LTS
# - t3.micro (free tier)

# 2. SSH into instance
ssh -i key.pem ec2-user@your-instance-ip

# 3. Install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone repository
git clone https://github.com/zengyi04/carpark.git
cd carpark

# 5. Install dependencies
npm install

# 6. Set up environment
nano .env
# Point DATABASE_URL to RDS PostgreSQL

# 7. Run migrations
npm run migrate

# 8. Start with PM2
sudo npm install -g pm2
pm2 start src/index.js --name "carpark-api"
pm2 save

# 9. Set up auto-restart
pm2 startup
```

---

## Database Migration

### SQLite → PostgreSQL

**Recommended for scaling:**

#### Step 1: Install PostgreSQL adapter
```bash
npm install pg
```

#### Step 2: Update Prisma schema
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### Step 3: Update `.env`
```bash
# Change DATABASE_URL to PostgreSQL connection
DATABASE_URL="postgresql://user:password@localhost:5432/carpark?schema=public"
```

#### Step 4: Run migration
```bash
# Create migration file
npm run migrate -- --name migrate_to_postgres

# This creates the schema on PostgreSQL
```

#### Step 5: Migrate data

**Option A: Automatic (if small dataset)**
```bash
# Prisma will copy schema
npm run migrate -- --deploy
```

**Option B: Manual (for large datasets)**
```bash
# Export from SQLite
sqlite3 prisma/dev.db ".dump Carpark" > carpark_dump.sql
sqlite3 prisma/dev.db ".dump Users" > users_dump.sql
sqlite3 prisma/dev.db ".dump User_Favourite" > favorites_dump.sql

# Import to PostgreSQL
psql -U postgres -d carpark < carpark_dump.sql
psql -U postgres -d carpark < users_dump.sql
psql -U postgres -d carpark < favorites_dump.sql
```

#### Step 6: Verify data
```bash
# Check counts match
npm run studio

# Or query directly:
# SELECT COUNT(*) FROM Carpark; -- should be 2181
```

---

## Performance Optimization

### 1. Add Database Indexes
```bash
# 1. Create new migration
npm run migrate -- --name add_indexes

# 2. Add to generated migration file
```

```sql
-- prisma/migrations/xxx_add_indexes/migration.sql
CREATE INDEX idx_carpark_freeParking ON "Carpark"("freeParking");
CREATE INDEX idx_carpark_nightParking ON "Carpark"("nightParking");
CREATE INDEX idx_carpark_gantryHeight ON "Carpark"("gantryHeight");
CREATE INDEX idx_userfav_userId ON "User_Favourite"("userId");
```

### 2. Enable Query Logging
```javascript
// src/index.js
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
});
```

### 3. Add Caching (Redis)
```bash
npm install redis
```

See [docs/architecture/architecture.md](./architecture.md#caching-strategy-future)

### 4. Compression
```bash
npm install compression
```

```javascript
// src/index.js
const compression = require('compression');
app.use(compression());
```

---

## Monitoring & Logging

### 1. Application Logging
```bash
npm install winston
```

```javascript
// src/logger.js
const winston = require('winston');

module.exports = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Error Tracking (Sentry)
```bash
npm install @sentry/node
```

```javascript
// src/index.js
const Sentry = require('@sentry/node');

Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());
```

### 3. Health Checks
```bash
curl https://your-api.com/health
```

### 4. Performance Monitoring
```javascript
// Middleware to track request time
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

---

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: carpark-api
          heroku_email: your-email@example.com
```

---

## SSL/TLS Certificate

### Using Let's Encrypt (Free)

```bash
# 1. Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. Create certificate
sudo certbot certonly --standalone -d your-domain.com

# 3. Configure nginx to use certificate
# (Point to /etc/letsencrypt/live/your-domain.com/)

# 4. Auto-renewal
sudo systemctl enable certbot.timer
```

---

## Scaling Strategy

### Stage 1: Single Server (Current)
```
Database: SQLite local file
Server: Single Node.js instance
Load: < 100 requests/sec
Users: < 10k
```

### Stage 2: Dedicated Database
```
Database: PostgreSQL (RDS)
Server: Single Node.js instance
Load: 100-1k requests/sec
Users: 10k-100k
```

### Stage 3: Load Balanced
```
Database: PostgreSQL (RDS)
API: 2-3 Node instances behind load balancer
Load: 1k-10k requests/sec
Users: 100k-1M
```

### Stage 4: Containerized Microservices
```
Database: PostgreSQL + Redis cache
API: Docker containers on Kubernetes
Load: 10k+ requests/sec
Users: 1M+
```

---

## Troubleshooting

### Issue: Database locked (SQLite)
```
Error: database is locked
```

**Solution**: SQLite has 1 writer limit. For production, upgrade to PostgreSQL.

```bash
# Temporary: Increase timeout
DATABASE_URL="file:./dev.db?connection_limit=1&busy_timeout=5000"
```

### Issue: Port already in use
```
Error: listen EADDRINUSE :::3000
```

**Solution**:
```bash
# Find process using port
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Issue: Migration conflicts
```
Error: The following migrations have not yet been applied
```

**Solution**:
```bash
# Reset (careful - deletes data!)
npm run migrate reset

# Or resolve conflicts manually
npm run migrate resolve --rolled-back <migration-name>
```

### Issue: Out of memory
```
JavaScript heap out of memory
```

**Solution**:
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

### Issue: Slow queries
```
# Check slow query log
sqlite3 dev.db "EXPLAIN QUERY PLAN SELECT ..."

# Add indexes (see Performance Optimization)
```

---

## Rollback Procedure

### Database Rollback
```bash
# 1. Restore from backup
cp prisma/dev.db.backup.<timestamp> prisma/dev.db

# 2. Restart server
npm start

# 3. Verify
curl /api/carparks/stats/count
```

### Code Rollback
```bash
# 1. Revert commits
git revert <commit-hash>

# 2. Push
git push origin main

# 3. Redeploy
npm start
```

---

## Security Checklist

Before deploying to production:

- [ ] Environment variables configured (`NODE_ENV=production`)
- [ ] Database backed up
- [ ] HTTPS/SSL enabled
- [ ] API keys/secrets not in code
- [ ] Database credentials secure
- [ ] Input validation enabled
- [ ] Error messages don't expose data
- [ ] CORS configured appropriately
- [ ] Rate limiting enabled
- [ ] Monitoring configured
- [ ] Logging enabled
- [ ] Backup strategy in place

---

## Monitoring Dashboard

### Recommended Tools

**Uptime Monitoring**:
- UptimeRobot (free tier)
- Pingdom
- New Relic

**Performance Monitoring**:
- Datadog
- New Relic
- Grafana + Prometheus

**Error Tracking**:
- Sentry
- Rollbar
- Bugsnag

**Logs**:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- CloudWatch (AWS)
- Stackdriver (Google Cloud)

---

## Maintenance Schedule

**Daily**:
- Check health endpoint
- Review error logs

**Weekly**:
- Database size check
- Performance analysis

**Monthly**:
- Full backup verification
- Security updates
- Dependency updates

**Quarterly**:
- Load testing
- Disaster recovery drill
- Capacity planning

---

**Last Updated**: April 28, 2026  
**Deployment Guide Version**: 1.0  
**Status**: ✅ Production Ready
