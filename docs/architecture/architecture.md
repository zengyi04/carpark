# Project Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Browser)                       │
│              React / Vue / Angular Application               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express.js)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Routes (carparks.js, favorites.js)            │  │
│  │  - Handle HTTP requests                               │  │
│  │  - Validate input parameters                          │  │
│  │  - Format responses                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      Service Layer (carparkService, favoriteService) │  │
│  │  - Business logic                                     │  │
│  │  - Database queries                                   │  │
│  │  - Data transformations                               │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma ORM
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer (SQLite)                    │
│  ┌───────────┐ ┌───────────┐ ┌────────────────────┐         │
│  │ Carpark   │ │  Users    │ │ User_Favourite     │         │
│  │ (2181)    │ │ (auto)    │ │ (many-to-many)     │         │
│  └───────────┘ └───────────┘ └────────────────────┘         │
│                   File: dev.db (368KB)                        │
└────────────────────────────────────────────────────────────┘
```

## Layered Architecture

### 1. **Presentation Layer** (Frontend)
- User interfaces for search, filtering, favorites
- Calls REST API endpoints
- Handles user interactions

### 2. **API/Route Layer** (Express)
```
src/routes/
├── carparks.js    - 6 endpoints for carpark operations
└── favorites.js   - 5 endpoints for favorites management
```

**Responsibilities**:
- Receive HTTP requests
- Validate request parameters
- Call appropriate service
- Return formatted JSON responses
- Handle HTTP status codes

### 3. **Service/Business Logic Layer**
```
src/services/
├── carparkService.js      - Carpark business logic
└── favoriteService.js     - Favorite management logic
```

**Responsibilities**:
- Implement business rules
- Execute database queries
- Data validation and transformation
- Error handling
- Transaction management

### 4. **Data Access Layer** (Prisma ORM)
**Handles**:
- Database connection
- Schema definition
- Type-safe queries
- Migrations
- Transaction support

### 5. **Database Layer** (SQLite)
```
prisma/
├── schema.prisma         - Schema definition
├── dev.db               - Actual SQLite file
└── migrations/          - Schema change history
```

---

## Data Flow

### Example: User adds favorite carpark

```
1. Frontend (React)
   └─→ POST /api/favorites
       { userId: "user123", carParkNo: "ACB" }

2. Express Route (routes/favorites.js)
   └─→ Validate input
   └─→ Check required fields
   └─→ Call favoriteService.addFavorite()

3. Service Layer (services/favoriteService.js)
   └─→ Check if carpark exists
   └─→ Check if user exists (create if needed)
   └─→ Check for duplicate favorite
   └─→ Create favorite record
   └─→ Return result to route

4. Prisma ORM
   └─→ Generate SQL
   └─→ Execute on SQLite
   └─→ Return typed result

5. Database
   └─→ INSERT into User_Favourite table
   └─→ Enforce UNIQUE constraint
   └─→ CASCADE delete if needed

6. Response Back to Frontend
   ┌─ Success response
   │  {
   │    "success": true,
   │    "data": { id: 1, userId: "user123", carParkNo: "ACB" }
   │  }
   └─ 201 Created status
```

---

## File Organization

```
carpark/
│
├── src/                          # Application source code
│   ├── index.js                 # Express app setup + server
│   ├── seed.js                  # CSV data loader
│   ├── swagger.js               # Swagger/OpenAPI config
│   │
│   ├── routes/                  # HTTP route handlers
│   │   ├── carparks.js         # GET/POST carpark endpoints
│   │   └── favorites.js        # GET/POST/DELETE favorite endpoints
│   │
│   └── services/                # Business logic layer
│       ├── carparkService.js   # Carpark queries + logic
│       └── favoriteService.js  # Favorite queries + logic
│
├── prisma/                      # Database setup
│   ├── schema.prisma           # Prisma data model
│   ├── dev.db                  # SQLite database file
│   └── migrations/             # Schema migration history
│       └── 20260428103133_init/
│           └── migration.sql   # Initial schema
│
├── docs/                        # Documentation
│   ├── diagrams/               # ER diagrams and visuals
│   │   ├── erd-carpark-system.png  # SAVE YOUR IMAGE HERE
│   │   └── README.md
│   │
│   └── architecture/           # System design docs
│       ├── database-design.md  # Database schema details
│       ├── architecture.md     # This file
│       └── deployment.md       # Deployment guide
│
├── node_modules/               # Dependencies (npm packages)
├── package.json                # Project manifest + scripts
├── package-lock.json           # Dependency lock file
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
│
├── API_DOCUMENTATION.md        # API endpoint reference (500+ lines)
├── FRONTEND_GUIDE.md           # Frontend integration guide (400+ lines)
├── IMPLEMENTATION_SUMMARY.md   # Project completion summary
├── README.md                   # Main project README
│
└── hdb-carpark-information-*.csv  # Source dataset (2181 records)
```

---

## Component Interactions

### Express Server Setup (index.js)
```
1. Load environment variables
2. Create Express app
3. Add middleware (JSON parser, etc)
4. Register Swagger UI
5. Register routes:
   - /api/carparks → carparkRoutes
   - /api/favorites → favoriteRoutes
   - /api-docs → Swagger documentation
6. Start listening on port 3000
```

### Route → Service Pattern

```javascript
// routes/carparks.js
router.get('/', async (req, res) => {
  try {
    // 1. Extract filters from query params
    const filters = req.query;
    
    // 2. Call service
    const carparks = await carparkService.getAllCarparks(filters);
    
    // 3. Format and return response
    res.json({
      success: true,
      count: carparks.length,
      data: carparks
    });
  } catch (error) {
    // 4. Handle errors
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// services/carparkService.js
async getAllCarparks(filters = {}) {
  // 1. Build database query
  const where = {};
  if (filters.freeParking === 'true') {
    where.freeParking = { not: 'NO' };
  }
  
  // 2. Execute Prisma query
  return await prisma.carpark.findMany({
    where,
    orderBy: { carParkNo: 'asc' }
  });
}
```

---

## Request/Response Cycle

### Success Response
```
HTTP 200 OK
{
  "success": true,
  "count": 100,
  "data": [
    { carParkNo: "ACB", address: "...", ... },
    { carParkNo: "ACM", address: "...", ... }
  ]
}
```

### Error Response
```
HTTP 500 Internal Server Error
{
  "success": false,
  "error": "Failed to fetch carparks: Database connection failed"
}
```

### Data Types Flow

```
String Input                Number Input
(Query params)              (Path params)
    ↓                           ↓
Express                Express
validates          validates
    ↓                           ↓
Service                 Service
casts to          casts to
Prisma type      Prisma type
    ↓                           ↓
database           Database
stores,            stores,
queries            queries
```

---

## Authentication & Authorization (Future)

**Current**: No authentication (public API)

**Recommended Future Implementation**:
```
1. JWT Tokens (JSON Web Tokens)
   - User receives token on login
   - Token included in Authorization header
   - Server validates token on each request

2. Middleware**:
   ```javascript
   // middleware/auth.js
   async function validateToken(req, res, next) {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) return res.status(401).json({ error: 'No token' });
     
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.userId = decoded.userId;
       next();
     } catch {
       res.status(401).json({ error: 'Invalid token' });
     }
   }
   ```

3. Apply to routes:
   ```javascript
   router.post('/favorites', validateToken, async (req, res) => {
     // req.userId already available
   });
   ```
```

---

## Database Connection Management

**Prisma Client Pattern:**
```javascript
// src/services/carparkService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Use throughout service:
await prisma.carpark.findMany(...)
await prisma.userFavourite.create(...)

// Graceful shutdown:
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

---

## Caching Strategy (Future)

```
Client Request
    ↓
Check Redis Cache ← (1) Cache hit? Return immediately
    ↓
Query Database ← (2) Cache miss? Query DB
    ↓
Store in Cache ← (3) Store for future requests
    ↓
Return to Client
```

**Implementation**:
```bash
npm install redis
```

```javascript
const redis = require('redis');
const client = redis.createClient();

// Get with cache
async function getCarparkCached(carParkNo) {
  // Check cache
  const cached = await client.get(`carpark:${carParkNo}`);
  if (cached) return JSON.parse(cached);
  
  // Query database
  const carpark = await prisma.carpark.findUnique({
    where: { carParkNo }
  });
  
  // Cache for 1 hour
  await client.setex(
    `carpark:${carParkNo}`,
    3600,
    JSON.stringify(carpark)
  );
  
  return carpark;
}
```

---

## Error Handling Strategy

### Global Error Handler
```javascript
// In index.js
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    // Don't expose error details in production
    ...(process.env.NODE_ENV !== 'production' && {
      details: err.message
    })
  });
});
```

### Service Layer Error Handling
```javascript
// In service
try {
  const result = await prisma.carpark.findUnique(...);
  if (!result) throw new Error('Carpark not found');
  return result;
} catch (error) {
  // Log error
  logger.error('Query failed:', error);
  
  // Throw with context
  throw new Error(`Failed to fetch carpark: ${error.message}`);
}
```

---

## Testing Architecture (Recommended)

```
tests/
├── unit/
│   ├── carparkService.test.js
│   └── favoriteService.test.js
│
├── integration/
│   ├── carparks.test.js
│   └── favorites.test.js
│
└── e2e/
    └── user-workflows.test.js
```

---

## Deployment Architecture

**Development**:
```
Local Machine
└─ npm start
└─ http://localhost:3000
```

**Production** (Recommended):
```
Docker Container
├─ Node.js runtime
├─ Express app
└─ SQLite database

Or use managed services:
├─ Heroku / Railway / Render (hosting)
├─ AWS RDS (PostgreSQL as upgrade)
└─ CloudFlare (CDN for static assets)
```

---

## Security Considerations

✅ **Input Validation**:
- All query parameters validated
- Type checking on numbers
- SQL injection prevented (Prisma)

✅ **Error Handling**:
- Generic error messages to clients
- Detailed logs for debugging

⚠️ **Future Improvements**:
- Rate limiting
- HTTPS/TLS
- CORS configuration
- Request logging
- Data encryption
- Secrets management (API keys)

---

**Last Updated**: April 28, 2026  
**Architecture Version**: 1.0  
**Status**: ✅ Production Ready
